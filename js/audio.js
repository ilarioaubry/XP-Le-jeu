/* =====================================================================
 *  DOGGY PARTY — Octave Tycoon : La Quête de Laure
 *  audio.js — Bruitages 8-bit générés en direct avec la Web Audio API
 *  (aucun fichier son externe)
 * ===================================================================== */
(function (global) {
  'use strict';

  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.22;
      master.connect(ctx.destination);
      // buffer de bruit blanc (souffles, aboiements, mousse de bière)
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* Oscillateur avec enveloppe et glissando optionnel */
  function tone(o) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + (o.delay || 0);
    const dur = o.dur || 0.1;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.curve) {
      // liste de [tempsRelatif, fréquence]
      o.curve.forEach(([t, f]) => osc.frequency.linearRampToValueAtTime(f, t0 + t * dur));
    } else if (o.to) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
    }
    const v = o.vol == null ? 0.5 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(v, t0 + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noise(o) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + (o.delay || 0);
    const dur = o.dur || 0.1;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.value = o.freq || 1200;
    f.Q.value = o.q || 1;
    const g = ctx.createGain();
    const v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  function arp(notes, step, o) {
    o = o || {};
    notes.forEach((n, i) => tone(Object.assign({}, o, { freq: n, dur: step * 1.6, delay: (o.delay || 0) + i * step })));
  }

  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz

  const Audio8 = {
    unlock: ensure,
    isMuted: () => muted,
    setMuted(m) {
      muted = !!m;
      if (master) master.gain.value = muted ? 0 : 0.22;
    },

    click() {
      const f = 520 + Math.random() * 160;
      tone({ type: 'square', freq: f, to: f * 1.9, dur: 0.06, vol: 0.35 });
      noise({ dur: 0.03, freq: 3000, vol: 0.08 });
    },

    buy() {
      arp([NOTE(72), NOTE(76), NOTE(79), NOTE(84)], 0.05, { type: 'square', vol: 0.28 });
    },

    upgrade() {
      arp([NOTE(67), NOTE(71), NOTE(74), NOTE(79), NOTE(83), NOTE(86)], 0.06, { type: 'square', vol: 0.25 });
      arp([NOTE(55), NOTE(62)], 0.18, { type: 'triangle', vol: 0.35 });
    },

    error() {
      tone({ type: 'square', freq: 140, to: 90, dur: 0.18, vol: 0.3 });
    },

    // Aboiement 8-bit : pitch>1 = petit chien, pitch<1 = gros chien
    bark(pitch, vol) {
      pitch = pitch || 1; vol = vol == null ? 0.45 : vol;
      [0, 0.16].forEach((d) => {
        tone({ type: 'square', freq: 620 * pitch, to: 210 * pitch, dur: 0.11, vol, delay: d });
        tone({ type: 'sawtooth', freq: 310 * pitch, to: 120 * pitch, dur: 0.1, vol: vol * 0.5, delay: d });
        noise({ dur: 0.07, freq: 900 * pitch, q: 2, vol: vol * 0.4, delay: d });
      });
    },

    // Miaulement 8-bit : glissando montant puis descendant
    meow(pitch, vol) {
      pitch = pitch || 1; vol = vol == null ? 0.35 : vol;
      tone({
        type: 'triangle', freq: 420 * pitch, dur: 0.5, vol, attack: 0.04,
        curve: [[0.3, 880 * pitch], [0.6, 760 * pitch], [1, 380 * pitch]],
      });
      tone({
        type: 'square', freq: 210 * pitch, dur: 0.5, vol: vol * 0.25, attack: 0.04,
        curve: [[0.3, 440 * pitch], [1, 190 * pitch]],
      });
    },

    manager() {
      arp([NOTE(60), NOTE(64), NOTE(67), NOTE(72), NOTE(67), NOTE(72), NOTE(76)], 0.07, { type: 'square', vol: 0.25 });
    },

    // Compétence d'Oliver : décapsulage, glouglou, rot et fanfare
    skill() {
      noise({ dur: 0.08, freq: 4500, q: 4, vol: 0.4 });                 // pschitt
      for (let i = 0; i < 5; i++) {
        tone({ type: 'sine', freq: 300 + Math.random() * 200, to: 600, dur: 0.06, vol: 0.3, delay: 0.12 + i * 0.07 }); // glouglou
      }
      tone({ type: 'sawtooth', freq: 95, to: 60, dur: 0.35, vol: 0.4, delay: 0.55 }); // rot
      arp([NOTE(67), NOTE(67), NOTE(67), NOTE(72), NOTE(76), NOTE(79)], 0.09, { type: 'square', vol: 0.25, delay: 0 });
    },

    // Petit « ding » quand un animal rapporte ses pizzas
    collect() {
      tone({ type: 'triangle', freq: 784, to: 1175, dur: 0.09, vol: 0.22 });
      tone({ type: 'square', freq: 1568, dur: 0.05, vol: 0.08, delay: 0.06 });
    },

    // Fanfare d'UnLock : montée d'arpèges + scintillements
    fanfare() {
      arp([NOTE(60), NOTE(64), NOTE(67), NOTE(72), NOTE(76), NOTE(79), NOTE(84)], 0.075, { type: 'square', vol: 0.24 });
      arp([NOTE(48), NOTE(55), NOTE(60)], 0.2, { type: 'triangle', vol: 0.35 });
      [0.55, 0.65, 0.75, 0.85].forEach((d, i) => tone({ type: 'sine', freq: NOTE(96 + i * 2), dur: 0.14, vol: 0.12, delay: d }));
    },

    golden() {
      arp([NOTE(84), NOTE(88), NOTE(91), NOTE(96)], 0.04, { type: 'triangle', vol: 0.35 });
    },

    typeBlip() {
      tone({ type: 'square', freq: 880 + Math.random() * 120, dur: 0.025, vol: 0.08 });
    },

    victory() {
      const mel = [72, 76, 79, 84, 79, 84, 88, 91, 88, 96];
      mel.forEach((n, i) => tone({ type: 'square', freq: NOTE(n), dur: 0.22, vol: 0.25, delay: i * 0.16 }));
      [48, 55, 52, 60].forEach((n, i) => tone({ type: 'triangle', freq: NOTE(n), dur: 0.5, vol: 0.4, delay: i * 0.4 }));
    },

    // Petit thème mélancolique quand Laure apparaît
    laureTheme() {
      const mel = [69, 72, 76, 74, 72, 71, 69];
      mel.forEach((n, i) => tone({ type: 'triangle', freq: NOTE(n), dur: 0.45, vol: 0.3, delay: i * 0.32 }));
      [45, 41].forEach((n, i) => tone({ type: 'square', freq: NOTE(n), dur: 1.2, vol: 0.12, delay: i * 1.1 }));
    },
  };

  global.Audio8 = Audio8;
})(window);
