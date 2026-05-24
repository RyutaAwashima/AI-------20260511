/**
 * renderer.js
 * 背景・立ち絵・テキスト・選択肢の描画を担当
 * v2: 3スロット対応・スライドイン/アウトアニメ・シーントランジション
 */

const Renderer = (() => {
  // DOM refs
  const elBg        = document.getElementById('background');
  const elSpriteL   = document.getElementById('sprite-left');
  const elSpriteC   = document.getElementById('sprite-center');
  const elSpriteR   = document.getElementById('sprite-right');
  const elBodyL     = document.getElementById('sprite-left-body');
  const elBodyC     = document.getElementById('sprite-center-body');
  const elBodyR     = document.getElementById('sprite-right-body');
  const elCharName  = document.getElementById('char-name');
  const elText      = document.getElementById('text-content');
  const elIndicator = document.getElementById('click-indicator');
  const elChoices   = document.getElementById('choices');
  const elPrompt    = document.getElementById('choice-prompt');
  const elTrans     = document.getElementById('scene-transition');

  // スロット → DOM マッピング
  function _slotEl(slot) {
    return slot === 'left' ? elSpriteL : slot === 'center' ? elSpriteC : elSpriteR;
  }
  function _slotBody(slot) {
    return slot === 'left' ? elBodyL : slot === 'center' ? elBodyC : elBodyR;
  }
  const ALL_SLOTS = ['left', 'center', 'right'];

  // タイプライター
  let typeTimer = null;
  let isTyping  = false;
  let fullText  = '';

  function typewrite(text, onDone, speed = 38) {
    clearTimeout(typeTimer);
    isTyping = true;
    fullText = text;
    elText.textContent = '';
    let i = 0;
    function tick() {
      if (i < text.length) {
        elText.textContent += text[i++];
        typeTimer = setTimeout(tick, speed);
      } else {
        isTyping = false;
        if (onDone) onDone();
      }
    }
    tick();
  }

  function skipType() {
    if (!isTyping) return false;
    clearTimeout(typeTimer);
    isTyping = false;
    elText.textContent = fullText;
    return true;
  }

  // 背景
  function setBackground(bgKey, bgData) {
    if (!bgData) return;
    const color = bgData.color || '#111';
    const accent = bgData.accent || '#222';
    const imageUrl = String(bgData.imageUrl || bgData.url || '').trim();
    if (imageUrl) {
      elBg.style.background =
        `linear-gradient(135deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.48) 100%), url("${imageUrl}") center / cover no-repeat`;
    } else {
      elBg.style.background =
        `linear-gradient(135deg, ${color} 0%, ${accent} 100%)`;
    }
  }

  // 立ち絵（プレースホルダー SVG）
  const EXPRESSION_FACES = {
    normal:    '😐', happy:     '😊', sad:       '😢',
    surprised: '😲', angry:     '😤', tired:     '😑',
    confused:  '😕', smile:     '🙂', blank:     '😶',
    serious:   '😠', shocked:   '😱', alert:     '😧',
    concerned: '😟', neutral:   '😑', smirk:     '😏'
  };

  function makeSpriteSVG(charData, expression) {
    const face = EXPRESSION_FACES[expression] || '😐';
    const color = charData.color || '#888';
    return `
      <svg width="100%" height="100%" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g_${charData.name}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0.3"/>
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="32" ry="36" fill="url(#g_${charData.name})"/>
        <rect x="15" y="82" width="70" height="110" rx="10" fill="url(#g_${charData.name})"/>
        <text x="50" y="62" text-anchor="middle" font-size="30">${face}</text>
      </svg>
      <div class="spr-bubble">${face}</div>
      <span class="sprite-name" style="color:${color}">${charData.name}</span>
    `;
  }

  function resolveSpriteUrl(charData, expression) {
    if (!charData || typeof charData !== 'object') return '';
    if (charData.sprites && typeof charData.sprites === 'object') {
      const byExpr = String(charData.sprites[expression] || '').trim();
      if (byExpr) return byExpr;
      const normal = String(charData.sprites.normal || '').trim();
      if (normal) return normal;
    }
    return String(charData.imageUrl || '').trim();
  }

  function makeSpriteHTML(charData, expression) {
    const spriteUrl = resolveSpriteUrl(charData, expression);
    const face = EXPRESSION_FACES[expression] || '😐';
    if (spriteUrl) {
      return `
        <div class="spr-bubble">${face}</div>
        <img class="sprite-illustration" src="${spriteUrl}" alt="${charData.name}" />
        <span class="sprite-name" style="color:${charData.color || '#ddd'}">${charData.name}</span>
      `;
    }
    return makeSpriteSVG(charData, expression);
  }

  function showSprite(slot, charData, expression) {
    const el   = _slotEl(slot);
    const body = _slotBody(slot);
    body.innerHTML = makeSpriteHTML(charData, expression);
    el.classList.remove('hidden', 'inactive');
  }

  // スライドイン（初登場用）
  function enterSprite(slot, charData, expression) {
    const el   = _slotEl(slot);
    const body = _slotBody(slot);
    body.innerHTML = makeSpriteHTML(charData, expression);
    // アニメクラスをリセット→再付与
    el.classList.remove('hidden', 'inactive', 'spr-anim-left', 'spr-anim-right', 'spr-anim-center');
    void el.offsetWidth; // reflow でアニメ再スタート
    const animClass = slot === 'left' ? 'spr-anim-left' : 'spr-anim-right';
    el.classList.add(animClass);
    el.addEventListener('animationend', () => el.classList.remove(animClass), { once: true });
  }

  // 右スロット → 中央スロットへクロスディゾルブ
  function moveRightToCenter() {
    elBodyC.innerHTML = elBodyR.innerHTML; // 右の内容をコピー
    elSpriteC.classList.remove('hidden', 'inactive', 'spr-anim-left', 'spr-anim-right', 'spr-anim-center');
    void elSpriteC.offsetWidth;
    elSpriteC.classList.add('spr-anim-center');
    elSpriteC.addEventListener('animationend', () => elSpriteC.classList.remove('spr-anim-center'), { once: true });
    elSpriteR.classList.add('hidden');
    elSpriteR.classList.remove('spr-anim-left', 'spr-anim-right', 'spr-anim-center');
  }

  function hideSprite(slot) {
    const el = _slotEl(slot);
    el.classList.add('hidden');
    el.classList.remove('spr-anim-left', 'spr-anim-right', 'spr-anim-center');
  }

  function setActive(slot) {
    ALL_SLOTS.forEach(s => {
      const el = _slotEl(s);
      if (el.classList.contains('hidden')) return;
      if (s === slot) {
        el.classList.remove('inactive');
      } else {
        el.classList.add('inactive');
      }
    });
  }

  // シーントランジション（フェードアウト→callback→フェードイン）
  function playSceneTransition(callback) {
    elTrans.style.opacity = '1';
    setTimeout(() => {
      callback();
      setTimeout(() => { elTrans.style.opacity = '0'; }, 80);
    }, 380);
  }

  // ナレーション
  function showNarration(text, onTyped) {
    elCharName.classList.add('hidden');
    elText.className = 'narration';
    ALL_SLOTS.forEach(s => {
      const el = _slotEl(s);
      if (!el.classList.contains('hidden')) el.classList.add('inactive');
    });
    elIndicator.classList.remove('visible');
    typewrite(text, () => {
      elIndicator.classList.add('visible');
      if (onTyped) onTyped();
    });
  }

  // セリフ（slot: 'left'|'center'|'right'）
  function showDialogue(charData, slot, expression, text, onTyped) {
    elCharName.textContent = charData.name;
    elCharName.classList.remove('hidden');
    elText.className = '';
    showSprite(slot, charData, expression);
    setActive(slot);
    elIndicator.classList.remove('visible');
    typewrite(text, () => {
      elIndicator.classList.add('visible');
      if (onTyped) onTyped();
    });
  }

  // 選択肢
  function showChoices(promptText, options, onSelect) {
    elIndicator.classList.remove('visible');
    elChoices.innerHTML = '';
    elChoices.classList.add('visible');

    const p = document.createElement('div');
    p.id = 'choice-prompt';
    p.textContent = promptText;
    elChoices.appendChild(p);

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        hideChoices();
        onSelect(opt.next);
      });
      elChoices.appendChild(btn);
    });
  }

  function hideChoices() {
    elChoices.classList.remove('visible');
    elChoices.innerHTML = '';
  }

  function clearSprites() {
    ALL_SLOTS.forEach(s => {
      const el = _slotEl(s);
      el.classList.add('hidden');
      el.classList.remove('inactive', 'spr-anim-left', 'spr-anim-right', 'spr-anim-center');
      _slotBody(s).innerHTML = '';
    });
  }

  return {
    setBackground,
    showNarration,
    showDialogue,
    enterSprite,
    moveRightToCenter,
    playSceneTransition,
    showChoices,
    hideChoices,
    clearSprites,
    skipType,
    isTyping: () => isTyping
  };
})();
