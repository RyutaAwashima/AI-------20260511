/**
 * AIで物語を作ろう — GAS プロキシ + Sheets 保存
 *
 * 【デプロイ手順】
 *  1. このファイルを新しい Google Apps Script プロジェクトに貼る
 *  2. GEMINI_API_KEY にキーを設定（スクリプトプロパティ推奨）
 *  3. スプレッドシートのIDを SPREADSHEET_ID に設定
 *  4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
 *     アクセスできるユーザー：「全員」
 *  5. デプロイ後の URL を aria/index.html および canon/index.html の CONFIG.GAS_URL に貼る
 */

// ── 設定 ──────────────────────────────────────────────
const GEMINI_API_KEY  = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
const SPREADSHEET_ID  = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
const SHEET_NAME      = 'stories';

// ── CORS ヘッダー ─────────────────────────────────────
function corsHeaders() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

function addCors(output) {
  // GAS では Access-Control-Allow-Origin を直接設定できないため
  // ブラウザ側は fetch の mode を 'no-cors' にするか、
  // 同一オリジン（デプロイ済みWebApp）から呼ぶ構成にする。
  // ここでは JSON を返すだけで十分。
  return output;
}

// ── GET（疎通確認 + モデル一覧） ──────────────────────
function doGet(e) {
  const q = (e && e.parameter && e.parameter.q) || '';

  // ?q=models のとき Gemini の利用可能モデル一覧を返す
  if (q === 'models') {
    if (!GEMINI_API_KEY) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'GEMINI_API_KEY が未設定です' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    const resp = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + GEMINI_API_KEY,
      { muteHttpExceptions: true }
    );
    const data = JSON.parse(resp.getContentText());
    const names = (data.models || []).map(m => m.name);
    return ContentService.createTextOutput(
      JSON.stringify({ models: names })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'GAS proxy is running' })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ── POST ─────────────────────────────────────────────
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'generate') {
      return handleGenerate(body);
    }
    if (action === 'save') {
      return handleSave(body);
    }
    if (action === 'extract') {
      // Canon: テキストから登場人物を抽出
      return handleExtract(body);
    }
    if (action === 'convert') {
      // Canon: テキスト＋確定キャラ＋背景候補からノベルJSONへ変換
      return handleConvert(body);
    }
    if (action === 'weave') {
      // Aria: フルストーリー生成（長め）
      return handleWeave(body);
    }
    if (action === 'list_aria_stories') {
      // Canon連携: Ariaが紡いだストーリー一覧（H列あり）
      return handleListAriaStories(body);
    }
    if (action === 'load_aria_story') {
      // Canon連携: Aria行の中身を取得
      return handleLoadAriaStory(body);
    }
    if (action === 'save_canon_json') {
      // Canon連携: ノベルJSONをI/J/K列に書き込む（rowNumあり=更新、なし=新規行）
      return handleSaveCanonJson(body);
    }
    if (action === 'list_stories') {
      // Sonnet連携: ノベルJSONがある行の一覧
      return handleListStories(body);
    }
    if (action === 'load_story') {
      // Sonnet連携: ノベルJSONを取得
      return handleLoadStory(body);
    }
    // 下位互換（旧story_storeシート）
    if (action === 'save_story') {
      return handleSaveCanonJson(body);
    }
    throw new Error('不明な action: ' + action);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Gemini 呼び出し ───────────────────────────────────
function handleGenerate(body) {
  const prompt = (body.prompt || '').trim();
  if (!prompt) throw new Error('prompt が空です');
  return callGemini(prompt, { maxOutputTokens: 1024, temperature: 1.0 });
}

// ── Canon: キャラ抽出（軽量） ─────────────────────────
function handleExtract(body) {
  const prompt = (body.prompt || '').trim();
  if (!prompt) throw new Error('prompt が空です');
  return callGemini(prompt, { maxOutputTokens: 1024, temperature: 0.4 });
}

// ── Canon: ノベル化変換（重め） ───────────────────────
function handleConvert(body) {
  const prompt = (body.prompt || '').trim();
  if (!prompt) throw new Error('prompt が空です');
  return callGemini(prompt, { maxOutputTokens: 4096, temperature: 0.7 });
}

// ── 共通 Gemini クライアント ──────────────────────────
function callGemini(prompt, opts) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY が設定されていません');

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature:     opts.temperature     ?? 1.0,
      maxOutputTokens: opts.maxOutputTokens ?? 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT',  threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT',         threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const resp = UrlFetchApp.fetch(
    GEMINI_ENDPOINT + '?key=' + GEMINI_API_KEY,
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    }
  );

  const code = resp.getResponseCode();
  if (code !== 200) {
    throw new Error('Gemini API エラー (HTTP ' + code + '): ' + resp.getContentText().slice(0, 200));
  }

  const geminiData = JSON.parse(resp.getContentText());
  const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini からテキストが返りませんでした');

  return ContentService.createTextOutput(
    JSON.stringify({ text })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ── Sheets 保存 ───────────────────────────────────────
function handleSave(body) {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID が設定されていません');

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss);

  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  // キャラ情報を文字列に整形
  const charasText = (body.charas || [])
    .map(c => `${c.name}（${c.role}）：${c.desc}`)
    .join('\n');

  const row = [
    now,                              // A: 日時
    (body.userName   || '').trim(),   // B: 名前
    (body.keywords   || '').trim(),   // C: 選んだキーワード
    (body.synopsis   || '').trim(),   // D: あらすじ
    charasText,                       // E: キャラクター
    (body.promptSent || '').trim(),   // F: 送ったプロンプト（全文）
    (body.storyRaw   || '').trim(),   // G: Gemini 生出力（あらすじ）
    (body.fullStory  || '').trim(),   // H: フルストーリー
  ];

  sheet.appendRow(row);
  const lastRow = sheet.getLastRow();

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, row: lastRow })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ── シートがなければ作ってヘッダーを付ける ─────────────
//   A日時 / B名前 / Cキーワード / Dあらすじ / Eキャラ /
//   Fプロンプト / G生出力 / Hフルストーリー  ← Aria
//   IノベルJSON / J表示タイトル / K表示ジャンル ← Canon→Sonnet
function getOrCreateSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      '日時', '名前', 'キーワード', 'あらすじ',
      'キャラクター', 'プロンプト(全文)', 'Gemini生出力(あらすじ)', 'フルストーリー',
      'ノベルJSON', '表示タイトル', '表示ジャンル',
    ]);
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 130);
    sheet.setColumnWidth(2, 80);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(4, 300);
    sheet.setColumnWidth(5, 300);
    sheet.setColumnWidth(6, 400);
    sheet.setColumnWidth(7, 400);
    sheet.setColumnWidth(8, 600);
    sheet.setColumnWidth(9, 600);
    sheet.setColumnWidth(10, 200);
    sheet.setColumnWidth(11, 140);
  } else {
    const lastCol = sheet.getLastColumn();
    if (lastCol < 11) {
      const allHeaders = ['ノベルJSON', '表示タイトル', '表示ジャンル'];
      const need = 11 - lastCol;
      sheet.getRange(1, lastCol + 1, 1, need)
           .setValues([allHeaders.slice(allHeaders.length - need)]);
      sheet.setColumnWidth(9, 600);
      sheet.setColumnWidth(10, 200);
      sheet.setColumnWidth(11, 140);
    }
  }
  return sheet;
}

// ── Weave: フルストーリー生成（長め） ─────────────────
function handleWeave(body) {
  const prompt = (body.prompt || '').trim();
  if (!prompt) throw new Error('prompt が空です');
  return callGemini(prompt, { maxOutputTokens: 2048, temperature: 0.9 });
}

// ═════════════════════════════════════════════════════
//  Canon / Sonnet 連携：同じ stories シートを使う統一スキーマ
// ═════════════════════════════════════════════════════

// ── Aria行一覧（H列ありの行を返す） ───────────────────
function handleListAriaStories() {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID が設定されていません');

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss);
  const rows  = sheet.getDataRange().getValues();

  const stories = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const fullStory = String(r[7] || '').trim();
    if (!fullStory) continue;
    const hasJson = !!String(r[8] || '').trim();
    stories.push({
      rowNum:   i + 1,
      savedAt:  r[0],
      userName: r[1],
      keywords: r[2],
      synopsis: r[3],
      preview:  fullStory.slice(0, 60),
      hasJson:  hasJson,
    });
  }
  stories.reverse();

  return ContentService.createTextOutput(
    JSON.stringify({ stories })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ── Aria行詳細取得 ───────────────────────────────────
function handleLoadAriaStory(body) {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID が設定されていません');
  const rowNum = parseInt(body.rowNum, 10);
  if (!rowNum || rowNum < 2) throw new Error('rowNum が不正です');

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss);
  if (rowNum > sheet.getLastRow()) throw new Error('行が見つかりません: ' + rowNum);

  const r = sheet.getRange(rowNum, 1, 1, 11).getValues()[0];
  return ContentService.createTextOutput(JSON.stringify({
    story: {
      rowNum:    rowNum,
      savedAt:   r[0],
      userName:  r[1],
      keywords:  r[2],
      synopsis:  r[3],
      charas:    r[4],
      fullStory: r[7],
      title:     r[9] || '',
      genre:     r[10] || '',
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

// ── Canon→JSON保存：rowNumあり=更新／なし=新規行 ──
function handleSaveCanonJson(body) {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID が設定されていません');

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss);
  const title = (body.title || '無題').trim();
  const genre = (body.genre || '').trim();
  const json  = JSON.stringify(body.storyData || {});

  let rowNum = parseInt(body.rowNum, 10);
  if (rowNum && rowNum >= 2 && rowNum <= sheet.getLastRow()) {
    sheet.getRange(rowNum, 9, 1, 3).setValues([[json, title, genre]]);
  } else {
    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    sheet.appendRow([now, '', '', '', '', '', '', '', json, title, genre]);
    rowNum = sheet.getLastRow();
  }

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, rowNum, id: String(rowNum) })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ── Sonnet用：JSONあり行一覧 ────────────────────────
function handleListStories() {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID が設定されていません');

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss);
  const rows  = sheet.getDataRange().getValues();

  const stories = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const json = String(r[8] || '').trim();
    if (!json) continue;
    stories.push({
      id:      String(i + 1),
      rowNum:  i + 1,
      savedAt: r[0],
      title:   r[9] || '無題',
      genre:   r[10] || '',
    });
  }
  stories.reverse();

  return ContentService.createTextOutput(
    JSON.stringify({ stories })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ── Sonnet用：JSON取得 ─────────────────────────────
function handleLoadStory(body) {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID が設定されていません');

  const rowNum = parseInt(body.id || body.rowNum, 10);
  if (!rowNum || rowNum < 2) throw new Error('id (rowNum) が不正です');

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss);
  if (rowNum > sheet.getLastRow()) throw new Error('行が見つかりません: ' + rowNum);

  const json = sheet.getRange(rowNum, 9).getValue();
  if (!json) throw new Error('この行にノベルJSONがありません: ' + rowNum);

  let storyData;
  try { storyData = JSON.parse(json); }
  catch { throw new Error('ストーリーデータの解析に失敗しました'); }

  return ContentService.createTextOutput(
    JSON.stringify({ storyData })
  ).setMimeType(ContentService.MimeType.JSON);
}
