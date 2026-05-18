/**
 * audio.js
 * Web Audio API を使った BGM 管理（プロトタイプ：トーン生成でBGM不要）
 * 本番では mp3 ファイルに差し替える
 */

const Audio = (() => {
  let ctx = null;
  let currentNodes = [];
  let currentMedia = null;
  let currentBgm = null;

  // BGM定義（Web Audio APIでシンプルなトーンを合成）
  const BGM_PATTERNS = {
    // 不気味：低い唸り
    eerie: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(58, ctx.currentTime + 4);
      osc.frequency.linearRampToValueAtTime(62, ctx.currentTime + 8);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return [osc, gain];
    },
    // 切ない：ゆっくりしたサイン波
    emotional: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return [osc, gain];
    },
    // 希望：明るめ
    hopeful: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return [osc, gain];
    },
    // ポップ：高め軽快
    cheerful: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return [osc, gain];
    },
    // コミカル：揺れるピッチ
    silly: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return [osc, gain];
    },
    // 大げさ
    triumphant: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return [osc, gain];
    },
    // 緊張
    tense: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return [osc, gain];
    },
    // ドラマチック
    dramatic: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return [osc, gain];
    },
    // アクション
    action: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return [osc, gain];
    }
  };

  function ensureContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  }

  function stop() {
    currentNodes.forEach(n => { try { n.stop(); } catch(e) {} });
    currentNodes = [];
    if (currentMedia) {
      try { currentMedia.pause(); } catch (e) {}
      currentMedia.src = '';
      currentMedia = null;
    }
    currentBgm = null;
  }

  function play(bgmKey, bgmData) {
    if (bgmKey === currentBgm) return;
    stop();

    // bgmData は { id, name, url } オブジェクト、または文字列（旧形式・ローカルストーリー）
    const isObj = bgmData && typeof bgmData === 'object';
    const bgmId = isObj ? (bgmData.id || bgmKey) : bgmKey;

    // 明示的URLがあれば最優先で再生
    const explicitUrl = isObj ? String(bgmData.url || '').trim() : '';
    if (explicitUrl) {
      const el = new window.Audio(explicitUrl);
      el.loop = bgmData.loop !== false;
      if (typeof bgmData.volume === 'number') {
        const v = Number(bgmData.volume);
        el.volume = Math.max(0, Math.min(1, isNaN(v) ? 0.8 : v));
      } else {
        el.volume = 0.8;
      }
      currentMedia = el;
      currentBgm = bgmKey;
      el.play().catch(() => {
        currentMedia = null;
        ensureContext();
        if (BGM_PATTERNS[bgmId]) {
          currentNodes = BGM_PATTERNS[bgmId](ctx);
          currentBgm = bgmKey;
        }
      });
      return;
    }

    ensureContext();

    // デフォルトの Web Audio パターン（eerie / action などのキー名）
    if (BGM_PATTERNS[bgmId]) {
      currentNodes = BGM_PATTERNS[bgmId](ctx);
      currentBgm = bgmKey;
      return;
    }

    // bgmId を Google Drive ファイルIDとしてストリーム再生
    const driveUrl = `https://drive.google.com/uc?export=open&id=${encodeURIComponent(bgmId)}`;
    const el = new window.Audio(driveUrl);
    el.loop = true;
    el.volume = 0.8;
    currentMedia = el;
    currentBgm = bgmKey;
    el.play().catch(err => {
      console.warn('[Audio] BGM再生失敗:', bgmId, err);
      currentMedia = null;
      currentBgm = null;
    });
  }

  return { play, stop };
})();
