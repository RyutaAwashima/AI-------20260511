/**
 * engine.js
 * ストーリー進行の制御（スクリプト読み込み・シーン遷移・入力受付）
 */

const Engine = (() => {
  // ── 状態 ──
  let story       = null;   // 現在のストーリーオブジェクト
  let sceneMap    = {};     // { scene_id: sceneObject }
  let currentScene = null;
  let lineIndex   = 0;
  let waitingClick = false;
  let inChoice     = false;

  // ── DOM refs ──
  const elOverlay    = document.getElementById('overlay');
  const elDevStory   = document.getElementById('dev-story');
  const elDevScene   = document.getElementById('dev-scene');
  const elDevLine    = document.getElementById('dev-line');
  const elDevBgm     = document.getElementById('dev-bgm');

  // ── 初期化 ──
  function init() {
    returnToTitle();
    document.getElementById('game').addEventListener('click', onGameClick);
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'Enter') onGameClick();
    });
  }

  // ── タイトルへ戻る（状態フルリセット） ──
  function returnToTitle() {
    story        = null;
    sceneMap     = {};
    currentScene = null;
    lineIndex    = 0;
    waitingClick = false;
    inChoice     = false;
    Audio.stop();
    Renderer.clearSprites();
    Renderer.hideChoices();

    elOverlay.innerHTML = `
      <div id="overlay-title">Sound Novel Engine</div>
      <div id="overlay-sub">prototype v0.1</div>
      <div id="overlay-message">ストーリーを選んでください</div>
      <div id="story-list"></div>
    `;
    buildTitleScreen();
  }

  // ── タイトル画面 ──
  function buildTitleScreen() {
    // innerHTML 書き換え後の新しい要素を毎回取得する
    const list = document.getElementById('story-list');
    if (!list) return;
    list.innerHTML = '';
    STORIES.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'story-btn';
      btn.innerHTML = `<span>${s.meta.title}</span><span class="s-genre">${s.meta.genre}</span>`;
      btn.addEventListener('click', () => loadStory(s));
      list.appendChild(btn);
    });
    elOverlay.classList.remove('hidden');
  }

  // ── ストーリーロード ──
  function loadStory(s) {
    story = s;
    sceneMap = {};
    s.scenes.forEach(sc => { sceneMap[sc.id] = sc; });

    elOverlay.classList.add('hidden');
    devUpdate({ story: s.meta.title });

    gotoScene(s.scenes[0].id);
  }

  // ── シーン遷移 ──
  function gotoScene(sceneId) {
    const scene = sceneMap[sceneId];
    if (!scene) { showEnd(); return; }

    currentScene = scene;
    lineIndex    = 0;
    waitingClick = false;
    inChoice     = false;

    // 背景・BGM適用
    const bgData = story.meta.assets.backgrounds[scene.background];
    Renderer.setBackground(scene.background, bgData);
    if (scene.bgm) Audio.play(scene.bgm);

    devUpdate({ scene: scene.id, bgm: scene.bgm || '—' });
    processLine();
  }

  // ── ライン処理 ──
  function processLine() {
    if (!currentScene || lineIndex >= currentScene.lines.length) return;

    const line = currentScene.lines[lineIndex];
    devUpdate({ line: `${lineIndex} / ${line.type}` });

    switch (line.type) {

      case 'narration':
        waitingClick = false;
        Renderer.showNarration(line.text, () => { waitingClick = true; });
        break;

      case 'dialogue': {
        const charData = story.meta.assets.characters[line.character];
        if (!charData) break;
        waitingClick = false;
        Renderer.showDialogue(charData, line.position, line.expression, line.text, () => {
          waitingClick = true;
        });
        break;
      }

      case 'bg_change': {
        const bgData = story.meta.assets.backgrounds[line.background];
        Renderer.setBackground(line.background, bgData);
        lineIndex++;
        processLine();
        break;
      }

      case 'bgm_change':
        Audio.play(line.bgm);
        devUpdate({ bgm: line.bgm });
        lineIndex++;
        processLine();
        break;

      case 'choice':
        inChoice = true;
        waitingClick = false;
        Renderer.showChoices(line.text, line.options, (nextId) => {
          inChoice = false;
          gotoScene(nextId);
        });
        break;

      case 'scene_end':
        waitingClick = false;
        if (line.next) {
          gotoScene(line.next);
        } else {
          showEnd();
        }
        break;

      default:
        lineIndex++;
        processLine();
    }
  }

  // ── クリック処理 ──
  function onGameClick() {
    if (inChoice) return;

    // タイプライター中ならスキップ
    if (Renderer.isTyping()) {
      Renderer.skipType();
      waitingClick = true;
      return;
    }

    if (!waitingClick) return;

    waitingClick = false;
    lineIndex++;
    processLine();
  }

  // ── END 画面 ──
  function showEnd() {
    Audio.stop();
    Renderer.clearSprites();

    elOverlay.innerHTML = `
      <div id="overlay-title">${story.meta.title}</div>
      <div id="overlay-sub">END</div>
      <div id="overlay-message" style="margin-top:8px;font-size:13px;color:#556;">
        ストーリーが終わりました
      </div>
      <div style="display:flex;gap:12px;margin-top:12px;">
        <button class="story-btn" id="btn-retry">もう一度</button>
        <button class="story-btn" id="btn-title">タイトルへ</button>
      </div>
    `;
    elOverlay.classList.remove('hidden');

    document.getElementById('btn-retry').addEventListener('click', () => {
      elOverlay.classList.add('hidden');
      loadStory(story);
    });
    document.getElementById('btn-title').addEventListener('click', () => {
      story = null;
      returnToTitle();
    });
  }

  // ── DEV バー更新 ──
  function devUpdate({ story: s, scene, line, bgm } = {}) {
    if (s    !== undefined) { elDevStory.textContent = `story: ${s}`;  elDevStory.classList.add('active'); }
    if (scene !== undefined) { elDevScene.textContent = `scene: ${scene}`; elDevScene.classList.add('active'); }
    if (line  !== undefined) { elDevLine.textContent  = `line: ${line}`;   elDevLine.classList.add('active'); }
    if (bgm   !== undefined) { elDevBgm.textContent   = `bgm: ${bgm}`;     elDevBgm.classList.add('active'); }
  }

  return { init };
})();

// 起動
window.addEventListener('DOMContentLoaded', () => Engine.init());
