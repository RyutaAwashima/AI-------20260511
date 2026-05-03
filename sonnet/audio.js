/**
 * audio.js
 * Web Audio API を使った BGM 管理（プロトタイプ：トーン生成でBGM不要）
 * 本番では mp3 ファイルに差し替える
 */

const Audio = (() => {
  let ctx = null;
  let currentNodes = [];
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
    currentBgm = null;
  }

  function play(bgmKey) {
    if (bgmKey === currentBgm) return;
    ensureContext();
    stop();
    if (BGM_PATTERNS[bgmKey]) {
      currentNodes = BGM_PATTERNS[bgmKey](ctx);
      currentBgm = bgmKey;
    }
  }

  return { play, stop };
})();
