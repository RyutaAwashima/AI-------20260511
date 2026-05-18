/**
 * renderer.js
 * 背景・立ち絵・テキスト・選択肢の描画を担当
 */

const Renderer = (() => {
  // DOM refs
  const elBg        = document.getElementById('background');
  const elSpriteL   = document.getElementById('sprite-left');
  const elSpriteR   = document.getElementById('sprite-right');
  const elBodyL     = document.getElementById('sprite-left-body');
  const elBodyR     = document.getElementById('sprite-right-body');
  const elCharName  = document.getElementById('char-name');
  const elText      = document.getElementById('text-content');
  const elIndicator = document.getElementById('click-indicator');
  const elChoices   = document.getElementById('choices');
  const elPrompt    = document.getElementById('choice-prompt');

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
      <span class="sprite-name" style="color:${color}">${charData.name}</span>
      <span class="sprite-expression">${expression}</span>
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
    if (spriteUrl) {
      return `
        <img class="sprite-illustration" src="${spriteUrl}" alt="${charData.name}" />
        <span class="sprite-name" style="color:${charData.color || '#ddd'}">${charData.name}</span>
        <span class="sprite-expression">${expression}</span>
      `;
    }
    return makeSpriteSVG(charData, expression);
  }

  function showSprite(position, charData, expression) {
    const el   = position === 'left' ? elSpriteL : elSpriteR;
    const body = position === 'left' ? elBodyL   : elBodyR;
    body.innerHTML = makeSpriteHTML(charData, expression);
    el.classList.remove('hidden', 'inactive');
  }

  function hideSprite(position) {
    const el = position === 'left' ? elSpriteL : elSpriteR;
    el.classList.add('hidden');
  }

  function setActive(position) {
    if (position === 'left') {
      elSpriteL.classList.remove('inactive');
      elSpriteR.classList.add('inactive');
    } else if (position === 'right') {
      elSpriteR.classList.remove('inactive');
      elSpriteL.classList.add('inactive');
    } else {
      elSpriteL.classList.add('inactive');
      elSpriteR.classList.add('inactive');
    }
  }

  // ナレーション
  function showNarration(text, onTyped) {
    elCharName.classList.add('hidden');
    elText.className = 'narration';
    setActive(null);
    elIndicator.classList.remove('visible');
    typewrite(text, () => {
      elIndicator.classList.add('visible');
      if (onTyped) onTyped();
    });
  }

  // セリフ
  function showDialogue(charData, position, expression, text, onTyped) {
    elCharName.textContent = charData.name;
    elCharName.classList.remove('hidden');
    elText.className = '';
    showSprite(position, charData, expression);
    setActive(position);
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
    hideSprite('left');
    hideSprite('right');
  }

  return {
    setBackground,
    showNarration,
    showDialogue,
    showChoices,
    hideChoices,
    clearSprites,
    skipType,
    isTyping: () => isTyping
  };
})();
