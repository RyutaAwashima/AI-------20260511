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
    (body.storyRaw   || '').trim(),   // G: Gemini の生出力
  ];

  sheet.appendRow(row);
  const lastRow = sheet.getLastRow();

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, row: lastRow })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ── シートがなければ作ってヘッダーを付ける ─────────────
function getOrCreateSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      '日時', '名前', 'キーワード', 'あらすじ',
      'キャラクター', 'プロンプト(全文)', 'Gemini生出力',
    ]);
    // ヘッダー行を固定
    sheet.setFrozenRows(1);
    // 幅を調整
    sheet.setColumnWidth(1, 130);
    sheet.setColumnWidth(2, 80);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(4, 300);
    sheet.setColumnWidth(5, 300);
    sheet.setColumnWidth(6, 400);
    sheet.setColumnWidth(7, 400);
  }
  return sheet;
}
