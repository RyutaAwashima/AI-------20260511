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
      // Aria: フルストーリー生成（長め・単発）
      return handleWeave(body);
    }
    if (action === 'weave_chapters') {
      // Aria: 章立て分割生成（4章＋伏線TODO管理）
      return handleWeaveChapters(body);
    }
    if (action === 'regenerate_chapter') {
      // Aria: 章を1つだけ再生成
      return handleRegenerateChapter(body);
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

/**
 * Gemini を呼び出してテキスト文字列を返す（内部ヘルパー）
 */
function callGeminiRaw(prompt, opts) {
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
  return text;
}

/**
 * Gemini を呼び出して JSON ContentOutput を返す（doPost 用）
 */
function callGemini(prompt, opts) {
  const text = callGeminiRaw(prompt, opts);
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

// ── Weave: フルストーリー生成（長め・単発） ──────────
function handleWeave(body) {
  const prompt = (body.prompt || '').trim();
  if (!prompt) throw new Error('prompt が空です');
  return callGemini(prompt, { maxOutputTokens: 8192, temperature: 0.9 });
}

const CHAPTER_DEFS = [
  { index: 1, title: '第1章：導入', length: '1000〜1400', goal: '世界観・人物・最初の謎を提示する。最低2つの伏線を置く。' },
  { index: 2, title: '第2章：拡張', length: '1000〜1400', goal: '謎を増やしつつ因果を整理する。新規伏線は最大2つまで。' },
  { index: 3, title: '第3章：回収前半', length: '1000〜1400', goal: '主要伏線の半分以上を回収し、核心に迫る。' },
  { index: 4, title: '第4章：回収後半', length: '1000〜1400', goal: '未回収伏線を全回収して明確な結末にする。含みを残しすぎない。' },
];

// ── WeaveChapters: 章立て分割生成（4章＋伏線TODO管理） ─
function handleWeaveChapters(body) {
  const synopsis  = (body.synopsis  || '').trim();
  const charasArr = (body.charas    || []);
  const hint      = (body.hint      || '').trim();
  if (!synopsis) throw new Error('synopsis が空です');

  const ctx = buildChapterContext(synopsis, charasArr, hint);
  let checklist = buildForeshadowChecklist(ctx);
  const chapterTexts = [];

  for (let i = 1; i <= CHAPTER_DEFS.length; i++) {
    const prompt = buildChapterPrompt(i, ctx, chapterTexts, checklist);
    const chapterText = callGeminiRaw(prompt, { maxOutputTokens: 3072, temperature: 0.9 });
    chapterTexts.push(chapterText);
    checklist = updateChecklistAfterChapter(checklist, chapterText, i);
  }

  // 最終チェックで未回収が残っていた場合は第4章だけ再生成して強制回収
  const unresolved = checklist.filter(x => x.status !== 'resolved');
  if (unresolved.length > 0) {
    const preFinal = chapterTexts.slice(0, 3);
    const retryPrompt = buildFinalRecoveryPrompt(ctx, preFinal, checklist);
    const finalChapter = callGeminiRaw(retryPrompt, { maxOutputTokens: 3072, temperature: 0.8 });
    chapterTexts[3] = finalChapter;
    checklist = updateChecklistAfterChapter(checklist, finalChapter, 4);
  }

  const fullStory = buildFullStoryFromChapters(chapterTexts);

  return ContentService.createTextOutput(
    JSON.stringify({
      text: fullStory,
      chapterTexts,
      chapters: CHAPTER_DEFS.length,
      checklist,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function handleRegenerateChapter(body) {
  const synopsis = (body.synopsis || '').trim();
  const charasArr = (body.charas || []);
  const hint = (body.hint || '').trim();
  const chapterIndex = parseInt(body.chapterIndex, 10);
  const currentChapters = Array.isArray(body.currentChapters) ? body.currentChapters : [];
  const rebuildFollowing = body.rebuildFollowing !== false;

  if (!synopsis) throw new Error('synopsis が空です');
  if (!(chapterIndex >= 1 && chapterIndex <= CHAPTER_DEFS.length)) {
    throw new Error('chapterIndex は 1〜' + CHAPTER_DEFS.length + ' で指定してください');
  }

  const chapterTexts = CHAPTER_DEFS.map((_, i) => String(currentChapters[i] || '').trim());
  for (let i = 0; i < chapterIndex - 1; i++) {
    if (!chapterTexts[i]) {
      throw new Error('第' + (i + 1) + '章が空のため再生成できません');
    }
  }

  const ctx = buildChapterContext(synopsis, charasArr, hint);

  // 先行章からチェックリスト進捗を再構築
  let checklist = buildForeshadowChecklist(ctx);
  for (let i = 0; i < chapterIndex - 1; i++) {
    checklist = updateChecklistAfterChapter(checklist, chapterTexts[i], i + 1);
  }

  let newChapterText = '';
  if (rebuildFollowing) {
    for (let i = chapterIndex; i <= CHAPTER_DEFS.length; i++) {
      const prompt = (i === CHAPTER_DEFS.length)
        ? buildFinalRecoveryPrompt(ctx, chapterTexts.slice(0, i - 1), checklist)
        : buildChapterPrompt(i, ctx, chapterTexts.slice(0, i - 1), checklist);
      const regenerated = callGeminiRaw(prompt, { maxOutputTokens: 3072, temperature: 0.88 });
      chapterTexts[i - 1] = regenerated;
      checklist = updateChecklistAfterChapter(checklist, regenerated, i);
      if (i === chapterIndex) newChapterText = regenerated;
    }
  } else {
    newChapterText = callGeminiRaw(
      buildChapterPrompt(chapterIndex, ctx, chapterTexts.slice(0, chapterIndex - 1), checklist),
      { maxOutputTokens: 3072, temperature: 0.9 }
    );
    chapterTexts[chapterIndex - 1] = newChapterText;
    checklist = updateChecklistAfterChapter(checklist, newChapterText, chapterIndex);
  }

  return ContentService.createTextOutput(
    JSON.stringify({
      chapterIndex,
      chapterText: newChapterText,
      chapterTexts,
      rebuildFollowing,
      checklist,
      text: buildFullStoryFromChapters(chapterTexts),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function buildChapterContext(synopsis, charasArr, hint) {
  const charaLines = charasArr
    .map(c => `・${c.name}（${c.role}）：${c.desc}`)
    .join('\n');
  const hintPart = hint ? `\n《追加してほしい要素》\n${hint}\n` : '';

  return {
    base:
      '以下のあらすじと登場人物をもとに、中学生向けサウンドノベル用のストーリーを書いてください。\n\n' +
      '《あらすじ》\n' + synopsis + '\n\n' +
      '《登場人物》\n' + charaLines + '\n' + hintPart,
    rules:
      '《執筆ルール》\n' +
      '・セリフ（「　」）を豊富に使い、会話劇として楽しめるようにする\n' +
      '・中学生でも読みやすい文体で書く\n' +
      '・地の文とセリフを交互に入れ、テンポよく読めるようにする\n' +
      '・感情表現を豊かに書く\n' +
      '・「---」などの区切り記号は使わず、連続した文章として書く\n' +
      '・含みを残しすぎず、設置した謎には必ず答えを出す',
    chapterDefs: CHAPTER_DEFS,
  };
}

function chapterDigest(text) {
  const s = String(text || '');
  if (s.length <= 600) return s;
  return s.slice(0, 200) + '\n…（中略）…\n' + s.slice(-400);
}

function buildChapterPrompt(chapterIndex, ctx, prevChapters, checklist) {
  const def = ctx.chapterDefs[chapterIndex - 1];
  const unresolved = checklist.filter(x => x.status !== 'resolved').map(x => `${x.id}. ${x.item}`);
  const resolved = checklist.filter(x => x.status === 'resolved').map(x => `${x.id}. ${x.item}`);
  const prevSummary = prevChapters.map((ch, i) => `第${i + 1}章の内容:\n${chapterDigest(ch)}`).join('\n\n');

  let resolveRule = '';
  if (chapterIndex === 1) {
    resolveRule = 'この章で置く伏線は最大3つ。「なぜ？」「どうなる？」と読者が気になる謎を仕込み、第3・4章で必ず答えられる内容にすること。';
  }
  if (chapterIndex === 2) {
    resolveRule = 'この章で新たに置く伏線は最大2つ。第1章の伏線をすべて引き継ぎ、謎を深めること。新しく置いた伏線には必ず第3・4章で明確な回答を出すこと。曖昧なまま終わらせてはならない。';
  }
  if (chapterIndex === 3) {
    resolveRule = 'この章で未回収伏線の半分以上に答えを出してください。第1・2章で置いた伏線を具体的に名指しして回収すること。';
  }
  if (chapterIndex === 4) {
    resolveRule = 'この章で未回収伏線をすべて回収し、読者の疑問を残さず終了してください。';
  }

  return [
    ctx.base,
    '',
    ctx.rules,
    '',
    `【${def.title}】${def.length}文字で書いてください。`,
    `目的: ${def.goal}`,
    resolveRule,
    '',
    '《既に回収済みの伏線》',
    resolved.length ? resolved.join('\n') : 'なし',
    '',
    '《未回収の伏線（この先で必ず回収）》',
    unresolved.length ? unresolved.join('\n') : 'なし',
    '',
    '《各章の内容（前章の末尾の展開から自然に続くこと）》',
    prevSummary || '（まだなし）',
    '',
    '⚠．前章で済みのシーン（初めての出会い・芸名・目覚めの場面など）は絶対に繰り返さない。',
    '出力は本文のみ。箇条書き・注釈・区切り線は禁止。',
  ].filter(Boolean).join('\n');
}

function buildFinalRecoveryPrompt(ctx, prevChapters, checklist) {
  const unresolved = checklist.filter(x => x.status !== 'resolved').map(x => `${x.id}. ${x.item}`);
  const prevSummary = prevChapters.map((ch, i) => `第${i + 1}章の内容:\n${chapterDigest(ch)}`).join('\n\n');

  return [
    ctx.base,
    '',
    ctx.rules,
    '',
    '【第4章：回収後半】1200〜1600文字で書いてください。',
    '以下の未回収伏線を本文中で必ず明確に回収し、疑問を残さず完結させること。',
    unresolved.length ? unresolved.join('\n') : '未回収なし（それでも結末を明確に書く）',
    '',
    '《各章の内容（前章の末尾の展開から自然に続くこと）》',
    prevSummary,
    '',
    '⚠．前章で済みのシーン（初めての出会い・芸名・目覚めの場面など）は絶対に繰り返さない。',
    '出力は本文のみ。あとがき・解説・箇条書きは禁止。',
  ].join('\n');
}

function buildForeshadowChecklist(ctx) {
  const prompt = [
    ctx.base,
    '',
    '上記の物語で、読者が「答えを知りたい」と感じる伏線TODOを4〜6個抽出してください。',
    'JSONのみで回答してください。形式は次の通り:',
    '{"todos":["...","...","..."]}',
  ].join('\n');

  const raw = callGeminiRaw(prompt, { maxOutputTokens: 768, temperature: 0.4 });
  const parsed = parseJsonFromText(raw);
  const todos = Array.isArray(parsed?.todos) ? parsed.todos : [];
  const normalized = todos
    .map(s => String(s || '').trim())
    .filter(Boolean)
    .slice(0, 6);

  const fallback = [
    '事件の発端の真相',
    '主人公が抱える秘密の正体',
    '対立相手の本当の目的',
    '終盤で下す決断の意味',
  ];
  const base = normalized.length ? normalized : fallback;

  return base.map((item, i) => ({
    id: i + 1,
    item,
    status: 'pending',
    note: '',
  }));
}

function updateChecklistAfterChapter(checklist, chapterText, chapterIndex) {
  if (!Array.isArray(checklist) || checklist.length === 0) return checklist;
  const listText = checklist.map(x => `${x.id}. ${x.item} [${x.status}]`).join('\n');

  // 第1・2章では、この章で新たに置かれた伏線も抽出してチェックリストに追加する
  const extractNew = chapterIndex <= 2;
  const newForeshadowInstruction = extractNew
    ? '\nまた、この章本文の中で新たに読者に提示された謎・伏線があれば "new_foreshadows" に列挙してください（最大2個、既存TODOと重複しないもの）。なければ空配列。'
    : '';
  const newForeshadowFormat = extractNew ? ',"new_foreshadows":["..."]' : '';

  const prompt = [
    '次の章本文を読んで、伏線TODOの状態を更新してください。',
    '状態は pending / partial / resolved のいずれか。',
    `JSONのみで回答してください。形式: {"updates":[{"id":1,"status":"resolved","note":"理由"}]${newForeshadowFormat}}`,
    newForeshadowInstruction,
    '',
    `章番号: ${chapterIndex}`,
    'TODO一覧:',
    listText,
    '',
    '章本文:',
    String(chapterText || '').slice(0, 5000),
  ].join('\n');

  const raw = callGeminiRaw(prompt, { maxOutputTokens: 1200, temperature: 0.2 });
  const parsed = parseJsonFromText(raw);
  const updates = Array.isArray(parsed?.updates) ? parsed.updates : [];

  const next = checklist.map(x => ({ ...x }));
  for (const u of updates) {
    const id = parseInt(u?.id, 10);
    const st = String(u?.status || '').trim();
    const note = String(u?.note || '').trim();
    const row = next.find(x => x.id === id);
    if (!row) continue;
    if (st === 'pending' || st === 'partial' || st === 'resolved') {
      row.status = st;
      row.note = note;
    }
  }

  // 新規伏線をチェックリストに追加（第1・2章のみ）
  if (extractNew && Array.isArray(parsed?.new_foreshadows)) {
    const newItems = parsed.new_foreshadows
      .map(s => String(s || '').trim())
      .filter(Boolean)
      .slice(0, 2);
    let nextId = next.length > 0 ? Math.max(...next.map(x => x.id)) + 1 : 1;
    for (const item of newItems) {
      next.push({ id: nextId++, item, status: 'pending', note: '第' + chapterIndex + '章で追加' });
    }
  }

  return next;
}

function parseJsonFromText(text) {
  const t = String(text || '').trim();
  try {
    return JSON.parse(t);
  } catch (_) {
    // no-op
  }

  const fenced = t.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch (_) { /* no-op */ }
  }

  const obj = t.match(/\{[\s\S]*\}/);
  if (obj) {
    try { return JSON.parse(obj[0]); } catch (_) { /* no-op */ }
  }
  return null;
}

function buildFullStoryFromChapters(chapterTexts) {
  const titles = CHAPTER_DEFS.map(def => `【${def.title}】`);
  const lines = [];
  for (let i = 0; i < titles.length; i++) {
    lines.push(titles[i]);
    lines.push(String(chapterTexts[i] || '').trim());
    if (i < titles.length - 1) lines.push('');
  }
  return lines.join('\n');
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
