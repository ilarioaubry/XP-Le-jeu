/* =====================================================================
 *  DOGGY PARTY — Octave Tycoon : La Quête de Laure
 *  room.js — Le salon de la coloc (canvas) : décor, animaux qui partent chercher
 *  des pizzas, colocs, particules, pizza dorée, cinématique de victoire.
 *  Le salon ne connaît pas l'économie : il interroge `host` (fourni par game.js).
 * ===================================================================== */
(function (global) {
  'use strict';

  const W = 320, H = 180;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const ANIMALS = global.DATA.ANIMALS;

  let host = null;            // { count, has, running, auto, ready, progress, boost, busy, say, onVictory, onTap }
  let canvas = null, ctx = null, floatersEl = null, BG = null;
  let time = 0;

  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Positions des éléments du décor (x = milieu, y = pieds)
  const POS = {
    octave: { x: 124, y: 146 },
    janis: { x: 46, y: 138 },
    oliver: { x: 208, y: 120 },
    adeline: { x: 202, y: 150 },
    ilario: { x: 172, y: 148 },
    anna: { x: 240, y: 120 },
    laure: { x: 300, y: 128 },
    laureWin: { x: 96, y: 146 },
    throne: { x: 256, y: 140 },
    tv: { x: 10, y: 80 },
    boxStack: { x: 72, y: 124 },
  };

  const STARS = (() => {
    const r = mulberry(7); const s = [];
    for (let i = 0; i < 18; i++) s.push([17 + Math.floor(r() * 50), 17 + Math.floor(r() * 22), r() * 6]);
    return s;
  })();

  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

  /* ---- Décor statique, dessiné une seule fois dans un canvas hors-écran ---- */
  function buildBackground() {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const rng = mulberry(42);

    // --- Mur (papier peint gothique) ---
    R(0, 0, W, 112, '#1d1030');
    for (let x = 0; x < W; x += 8) R(x, 0, 1, 112, '#241438');
    for (let y = 6; y < 106; y += 12) {
      for (let x = ((y / 6) % 2) * 4 + 2; x < W; x += 8) { R(x, y, 1, 1, '#34204f'); R(x - 1, y + 1, 3, 1, '#2b1844'); R(x, y + 2, 1, 1, '#34204f'); }
    }
    R(0, 0, W, 3, '#0d0716');
    // plinthe
    R(0, 108, W, 6, '#120a1c'); R(0, 108, W, 1, '#3a2456');

    // --- Parquet ---
    R(0, 114, W, 66, '#2a1810');
    for (let y = 114; y < H; y += 7) {
      R(0, y, W, 1, '#170c06');
      const off = (y * 7) % 40;
      for (let x = off; x < W; x += 40) R(x, y, 1, 7, '#170c06');
      for (let x = (y * 13) % 30; x < W; x += 52) R(x + 3, y + 2, 12, 1, '#3a2418');
    }

    // --- Tapis violet sous la pizza ---
    R(92, 128, 136, 44, '#0b0710');
    R(93, 129, 134, 42, '#7a1530');
    R(96, 131, 128, 38, '#3a1458');
    for (let y = 134; y < 168; y += 8) {
      for (let x = 100 + ((y / 8) % 2) * 8; x < 222; x += 16) {
        R(x + 2, y, 1, 1, '#6a2a90'); R(x + 1, y + 1, 3, 1, '#6a2a90'); R(x, y + 2, 5, 1, '#6a2a90'); R(x + 1, y + 3, 3, 1, '#6a2a90'); R(x + 2, y + 4, 1, 1, '#6a2a90');
      }
    }
    for (let x = 94; x < 226; x += 3) { R(x, 172, 1, 2, '#c9a66b'); R(x, 126, 1, 2, '#c9a66b'); }

    // --- Fenêtre : Montpellier la nuit ---
    R(6, 9, 72, 2, '#b8861b'); // tringle
    R(13, 13, 58, 50, '#0b0710');
    R(15, 15, 54, 46, '#0d1440');
    R(15, 40, 54, 10, '#141c52');
    R(15, 50, 54, 11, '#1d2462');
    // lune
    for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (x * x + y * y <= 22) R(58 + x, 24 + y, 1, 1, '#fff1b0');
    R(56, 22, 2, 2, '#e6d49a'); R(60, 26, 1, 1, '#e6d49a');
    // toits de l'Écusson
    let bx = 15;
    while (bx < 69) {
      const bw = 5 + Math.floor(rng() * 7), bh = 8 + Math.floor(rng() * 14);
      const w = Math.min(bw, 69 - bx);
      R(bx, 61 - bh, w, bh, '#07040c');
      if (rng() > 0.4) R(bx + 1, 61 - bh - 2, Math.max(1, w - 2), 2, '#07040c');
      for (let wy = 61 - bh + 3; wy < 59; wy += 4) for (let wx = bx + 1; wx < bx + w - 1; wx += 3) if (rng() > 0.55) R(wx, wy, 1, 2, '#ffcf3f');
      bx += w;
    }
    // croisillons + appui
    R(40, 15, 2, 46, '#0b0710'); R(15, 37, 54, 2, '#0b0710');
    R(10, 62, 64, 4, '#3a2456'); R(10, 65, 64, 1, '#0b0710');
    // rideaux
    [[6, 10], [68, 10]].forEach(([x]) => {
      R(x, 10, 10, 60, '#4a1a7a');
      for (let i = 1; i < 10; i += 3) R(x + i, 10, 1, 60, '#331258');
      R(x, 68, 10, 2, '#7b2cbf');
    });

    // --- Poster AKIRA ---
    R(88, 13, 32, 46, '#0b0710');
    R(89, 14, 30, 44, '#d7263d');
    R(89, 48, 30, 10, '#1a0a0e');
    Sprites.drawText(g, 'AKIRA', 89 + (30 - Sprites.textWidth('AKIRA')) / 2, 17, '#f4ecd8');
    Sprites.draw(g, 'icoKaneda', 96, 28);
    R(89, 52, 30, 1, '#d7263d');
    R(87, 12, 4, 3, '#e8e0c8'); R(117, 12, 4, 3, '#e8e0c8');

    // --- Poster ONE PIECE (avis de recherche) ---
    R(126, 15, 38, 46, '#0b0710');
    R(127, 16, 36, 44, '#e8d6a8');
    R(127, 16, 36, 1, '#c9b07a'); R(127, 59, 36, 1, '#c9b07a');
    Sprites.drawText(g, 'WANTED', 127 + (36 - Sprites.textWidth('WANTED')) / 2, 19, '#3a2418');
    // tête de mort au chapeau de paille
    R(138, 33, 14, 9, '#f4ecd8'); R(139, 42, 12, 3, '#f4ecd8');
    R(140, 36, 3, 3, '#0b0710'); R(147, 36, 3, 3, '#0b0710'); R(144, 40, 2, 1, '#0b0710');
    R(141, 43, 1, 2, '#0b0710'); R(144, 43, 1, 2, '#0b0710'); R(147, 43, 1, 2, '#0b0710');
    R(134, 31, 22, 2, '#f5d061'); R(138, 26, 14, 5, '#f5d061'); R(138, 29, 14, 2, '#d7263d');
    R(134, 33, 22, 1, '#b8902a');
    for (let i = 0; i < 7; i++) { R(133 + i * 3, 46 + (i % 2), 2, 1, '#f4ecd8'); }
    Sprites.drawText(g, 'ONE PIECE', 127 + (36 - Sprites.textWidth('ONE PIECE')) / 2, 51, '#3a2418');
    R(125, 14, 4, 3, '#e8e0c8'); R(161, 14, 4, 3, '#e8e0c8');

    // --- Étagère à mangas au-dessus du canapé ---
    R(192, 56, 72, 3, '#3a2418'); R(192, 59, 72, 1, '#0b0710');
    R(196, 59, 2, 4, '#3a2418'); R(258, 59, 2, 4, '#3a2418');
    const spines = ['#d7263d', '#ffcf3f', '#2a6bff', '#f4ecd8', '#7b2cbf', '#3fa34d', '#ff5fa2', '#1a1020', '#e8892b'];
    let sx = 194;
    while (sx < 252) {
      const h = 9 + Math.floor(rng() * 4), w = 2 + Math.floor(rng() * 2);
      R(sx, 56 - h, w, h, pick.call(null, spines));
      R(sx, 56 - h, w, 1, '#0b0710');
      sx += w + (rng() > 0.85 ? 3 : 0);
    }
    // petite figurine
    R(254, 47, 6, 9, '#0b0710'); R(255, 48, 4, 3, '#e8b796'); R(255, 51, 4, 5, '#d7263d'); R(255, 47, 4, 1, '#1b1b2f');

    // --- Canapé en velours ---
    R(184, 82, 96, 2, '#0b0710');
    R(186, 84, 92, 18, '#5a1838');
    for (let x = 200; x < 270; x += 22) R(x, 86, 1, 14, '#3a0c26');
    R(182, 100, 100, 10, '#6a1f44'); R(182, 100, 100, 1, '#8a3060');
    R(178, 90, 9, 26, '#3a0c26'); R(277, 90, 9, 26, '#3a0c26');
    R(178, 90, 9, 1, '#5a1838'); R(277, 90, 9, 1, '#5a1838');
    R(182, 110, 100, 6, '#2a0818');
    R(184, 116, 3, 3, '#0b0710'); R(277, 116, 3, 3, '#0b0710');
    // coussin Akira
    R(262, 92, 12, 9, '#d7263d'); R(266, 95, 4, 3, '#f4ecd8');

    // --- Coin sombre de Laure (dithering) ---
    for (let y = 0; y < 128; y++) {
      for (let x = 270; x < W; x++) {
        const p = Math.min(1, (x - 270) / 46) * 13;
        if (BAYER[y % 4][x % 4] < p) R(x, y, 1, 1, '#07040c');
      }
    }
    // lampadaire violet + halo
    for (let y = -22; y <= 22; y++) {
      for (let x = -22; x <= 22; x++) {
        const d = Math.sqrt(x * x + y * y);
        const px = 312 + x, py = 66 + y;
        if (d < 22 && px < W && BAYER[(py + 64) % 4][(px + 64) % 4] < (22 - d) / 22 * 9) R(px, py, 1, 1, '#2d1250');
      }
    }
    R(311, 62, 2, 60, '#2a2230'); R(306, 120, 12, 2, '#2a2230');
    R(305, 52, 14, 2, '#4a1a7a'); R(304, 54, 16, 6, '#7b2cbf'); R(303, 60, 18, 2, '#4a1a7a');
    R(307, 62, 10, 1, '#c77dff');
    // pile de livres de socio
    R(286, 117, 14, 3, '#5a0f22'); R(287, 114, 12, 3, '#241430'); R(286, 111, 13, 3, '#3a1458');
    R(286, 117, 14, 1, '#d8cfc0');

    // --- Vieille télé + console ---
    const tx = POS.tv.x, ty = POS.tv.y;
    R(tx - 4, ty + 26, 46, 4, '#3a2418'); R(tx - 2, ty + 30, 3, 12, '#2a1810'); R(tx + 37, ty + 30, 3, 12, '#2a1810');
    R(tx, ty, 38, 26, '#0b0710'); R(tx + 1, ty + 1, 36, 24, '#2a2a3a');
    R(tx + 3, ty + 3, 26, 20, '#0b0710');
    R(tx + 31, ty + 5, 4, 4, '#555566'); R(tx + 31, ty + 12, 4, 2, '#555566'); R(tx + 31, ty + 16, 4, 2, '#555566');
    R(tx + 12, ty - 6, 1, 6, '#9a9aa8'); R(tx + 20, ty - 8, 1, 8, '#9a9aa8');
    R(tx + 4, ty + 32, 14, 4, '#6a6a7a'); R(tx + 6, ty + 33, 3, 1, '#d7263d');

    // --- Mangas éparpillés au sol ---
    const books = [[62, 152], [70, 166], [36, 172], [244, 162], [258, 150], [300, 170], [18, 150], [204, 176], [286, 152]];
    books.forEach(([x, y], i) => {
      const col = spines[i % spines.length];
      R(x, y, 9, 6, '#0b0710'); R(x + 1, y + 1, 7, 4, col); R(x + 1, y + 4, 7, 1, '#f4ecd8');
      if (i % 3 === 0) { R(x + 2, y - 3, 8, 4, '#0b0710'); R(x + 3, y - 2, 6, 2, spines[(i + 3) % spines.length]); R(x + 3, y, 6, 1, '#f4ecd8'); }
    });

    return c;
  }


  /* ---------------------------------------------------------------------
   *  Les animaux : ils partent chercher des pizzas quand leur trajet est en cours
   * --------------------------------------------------------------------- */
  let actors = [];
  // Place des animaux qui restent assis (Chichi sur le tapis, July sur son trône)
  const SPOTS = { chichi: [150, 166, 1], july: [POS.throne.x + 12, POS.throne.y - 15, -1] };
  function makeActor(a, idx) {
    const spot = a.still ? SPOTS[a.id] : null;
    return {
      id: a.id, idx, def: a,
      x: spot ? spot[0] : rand(30, 290),
      y: spot ? spot[1] : rand(152, 176),
      dir: spot ? spot[2] : (Math.random() < 0.5 ? -1 : 1),
      speed: a.speed * rand(0.85, 1.15),
      walking: false,
      timer: rand(1, 3),
      anim: Math.random() * 4,
      fixed: !!spot,
    };
  }
  function syncActors(spawnFx) {
    for (const a of ANIMALS) {
      const n = host.count(a.id) > 0 ? 1 : 0;          // un seul animal par espèce, quel que soit son niveau
      const cur = actors.filter((x) => x.id === a.id);
      for (let i = cur.length; i < n; i++) {
        const act = makeActor(a, i);
        actors.push(act);
        if (spawnFx) {
          const sz = Sprites.size(a.id);
          puff(act.x, act.y - sz.h / 2, ['#ffffff', '#c77dff', '#ffcf3f']);
        }
      }
      if (cur.length > n) actors = actors.filter((x) => x.id !== a.id || x.idx < n);
    }
  }
  function updateActors(dt) {
    for (const ac of actors) {
      const run = host.running(ac.id);
      ac.walking = run && !ac.fixed;
      if (ac.walking) {
        ac.timer -= dt;
        if (ac.timer <= 0) { ac.timer = rand(1.5, 4); if (Math.random() < 0.35) ac.dir *= -1; }
        ac.x += ac.dir * ac.speed * dt;
        const half = Sprites.size(ac.id).w / 2;
        if (ac.x < 6 + half) { ac.x = 6 + half; ac.dir = 1; }
        if (ac.x > W - 6 - half) { ac.x = W - 6 - half; ac.dir = -1; }
      }
      ac.anim += dt * (run ? (ac.fixed ? 6 : 5) : 1.4);
    }
  }
  // L'animal le plus proche du doigt (zone de touche généreuse)
  function actorAt(pt) {
    let best = null, bd = 1e9;
    for (const ac of actors) {
      const sz = Sprites.size(ac.id);
      const cx = ac.x, cy = ac.y - sz.h / 2;
      const dx = Math.max(0, Math.abs(pt.x - cx) - sz.w / 2), dy = Math.max(0, Math.abs(pt.y - cy) - sz.h / 2);
      const d = Math.hypot(dx, dy);
      if (d < 9 && d < bd) { bd = d; best = ac; }
    }
    return best;
  }

  /* ---- Particules & textes flottants ---- */
  let particles = [];
  function puff(x, y, colors, n) {
    n = n || 14;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = rand(25, 80);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: rand(0.4, 0.9), col: pick(colors), sz: Math.random() < 0.3 ? 2 : 1, grav: 160 });
    }
  }
  function updateParticles(dt) {
    for (const p of particles) {
      p.life -= dt; p.vy += p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    particles = particles.filter((p) => p.life > 0 && p.y < H + 5);
  }
  function floatText(text, x, y, cls) {
    const el = document.createElement('div');
    el.className = 'floater' + (cls ? ' ' + cls : '');
    el.textContent = text;
    el.style.left = (x / W * 100) + '%';
    el.style.top = (y / H * 100) + '%';
    floatersEl.appendChild(el);
    setTimeout(() => el.remove(), cls === 'bubble' ? 1500 : 1100);
  }
  function bubble(ac, text) {
    const sz = Sprites.size(ac.id);
    floatText(text, ac.x, ac.y - sz.h - 6, 'bubble');
  }
  // Un animal revient avec ses pizzas
  function collect(id, text) {
    const list = actors.filter((a) => a.id === id);
    if (!list.length) return;
    const ac = pick(list), sz = Sprites.size(id);
    puff(ac.x, ac.y - sz.h, ['#ffcf3f', '#e8a524', '#c0262d', '#d98b3a', '#fff1b0'], 9);
    floatText(text, ac.x, ac.y - sz.h - 8);
  }
  function say(id, text) {
    const list = actors.filter((a) => a.id === id);
    if (list.length) bubble(pick(list), text);
  }

  /* ---- Pizza dorée (bonus aléatoire) ---- */
  let golden = null;
  function spawnGolden() { golden = { x: rand(30, 290), y: rand(70, 100), life: 9 }; }
  function hitGolden(pt) { return golden && Math.hypot(pt.x - golden.x, pt.y - golden.y) < 14; }
  function takeGolden() { const g = golden; golden = null; return g; }

  /* ---- Rendu ---- */
  function drawShadow(cx, y, w) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(Math.round(cx - w / 2), Math.round(y - 1), Math.round(w), 2);
    ctx.fillRect(Math.round(cx - w / 2 + 2), Math.round(y - 2), Math.round(w - 4), 4);
  }
  function drawHuman(name, x, y, phase, speed) {
    const sz = Sprites.size(name);
    const frame = Math.floor((time + phase) * (speed || 2)) % Sprites.frames(name);
    drawShadow(x, y, 16);
    Sprites.draw(ctx, name, x - sz.w / 2, y - sz.h, { frame });
  }

  function render() {
    ctx.drawImage(BG, 0, 0);

    for (const [sx, sy, ph] of STARS) {
      const on = Math.sin(time * 2 + ph * 3) > -0.2;
      if (on) { ctx.fillStyle = Math.sin(time * 3 + ph) > 0.6 ? '#ffffff' : '#9fb0ff'; ctx.fillRect(sx, sy, 1, 1); }
    }
    for (let i = 0; i < 32; i++) {
      const x = 4 + i * 10;
      const y = 5 + Math.round(Math.sin(i * 0.9) * 1.5 + 1.5);
      ctx.fillStyle = '#0b0710'; ctx.fillRect(x - 4, y - 1, 10, 1);
      const cols = ['#ff2e7e', '#c77dff', '#ffcf3f', '#3ad6c5'];
      const on = (Math.floor(time * 2) + i) % 3 !== 0;
      ctx.fillStyle = on ? cols[(i + Math.floor(time)) % 4] : '#2a1a3a';
      ctx.fillRect(x, y, 2, 2);
    }
    // écran de la télé
    const tx = POS.tv.x + 3, ty = POS.tv.y + 3;
    const scene = Math.floor(time * 1.5) % 4;
    const tvCols = [['#2a6bff', '#ffcf3f'], ['#d7263d', '#0b0710'], ['#3fa34d', '#f4ecd8'], ['#7b2cbf', '#ff5fa2']][scene];
    ctx.fillStyle = tvCols[0]; ctx.fillRect(tx, ty, 26, 20);
    ctx.fillStyle = tvCols[1];
    ctx.fillRect(tx + 6 + (Math.floor(time * 6) % 8), ty + 8, 6, 6);
    ctx.fillRect(tx + 2, ty + 16, 22, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let yy = ty; yy < ty + 20; yy += 2) ctx.fillRect(tx, yy, 26, 1);

    // pile de cartons de pizza (grandit avec le total récolté)
    const boxes = Math.max(0, Math.min(10, Math.floor(Math.log10(host.total() + 1) * 1.1)));
    for (let i = 0; i < boxes; i++) Sprites.draw(ctx, 'box', POS.boxStack.x + ((i * 7) % 3) - 1, POS.boxStack.y - 6 - i * 4);

    // trône de cartons de July
    if (host.count('july') > 0) {
      const t = POS.throne;
      Sprites.draw(ctx, 'box', t.x, t.y - 6);
      Sprites.draw(ctx, 'box', t.x + 1, t.y - 11);
      Sprites.draw(ctx, 'box', t.x - 1, t.y - 16);
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(t.x + 4, t.y - 18, 16, 2);
      ctx.fillStyle = '#b8861b'; ctx.fillRect(t.x + 4, t.y - 16, 16, 1);
      ctx.fillStyle = '#7b2cbf'; ctx.fillRect(t.x + 2, t.y - 30, 2, 14); ctx.fillRect(t.x + 20, t.y - 30, 2, 14);
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(t.x + 1, t.y - 32, 4, 2); ctx.fillRect(t.x + 19, t.y - 32, 4, 2);
    }

    // --- Entités triées par profondeur (pied = y) ---
    const ents = [];
    const laureCine = cine && cine.t < 12;
    if (host.has('janis')) ents.push({ y: POS.janis.y, draw: () => drawHuman('janis', POS.janis.x, POS.janis.y, 0.3) });
    if (host.has('oliver')) ents.push({ y: POS.oliver.y, draw: () => {
      drawHuman('oliver', POS.oliver.x, POS.oliver.y, 0.7, host.boost() ? 8 : 2);
      if (host.boost()) Sprites.draw(ctx, 'beer', POS.oliver.x + 8, POS.oliver.y - 17 + Math.round(Math.sin(time * 12) * 2));
    } });
    if (host.has('adeline')) ents.push({ y: POS.adeline.y, draw: () => drawHuman('adeline', POS.adeline.x, POS.adeline.y, 0.5, 2) });
    if (host.has('ilario')) ents.push({ y: POS.ilario.y, draw: () => drawHuman('ilario', POS.ilario.x, POS.ilario.y, 0.9, 2) });
    if (host.has('anna')) ents.push({ y: POS.anna.y, draw: () => drawHuman('anna', POS.anna.x, POS.anna.y, 1.1, 2.5) });
    if (host.has('laure') && !laureCine) ents.push({ y: POS.laureWin.y, draw: () => drawHuman('laure', POS.laureWin.x, POS.laureWin.y, 0.1, 1.2) });
    ents.push({ y: POS.octave.y, draw: () => drawHuman('octave', POS.octave.x, POS.octave.y, 0, host.busy() ? 6 : 2) });

    for (const ac of actors) {
      ents.push({ y: ac.y, draw: () => {
        const sz = Sprites.size(ac.id);
        const step = Math.floor(ac.anim) % 2;
        const hop = ac.walking && step ? 1 : 0;
        drawShadow(ac.x, ac.y, sz.w * 0.75);
        Sprites.draw(ctx, ac.id, ac.x - sz.w / 2, ac.y - sz.h - hop, { frame: ac.walking ? 2 + step : step, flip: ac.dir < 0 });
        const top = ac.y - sz.h - 4;
        if (host.running(ac.id)) {                       // jauge de trajet au-dessus de la tête
          const p = Math.max(0, Math.min(1, host.progress(ac.id)));
          ctx.fillStyle = '#0b0710'; ctx.fillRect(Math.round(ac.x - 9), Math.round(top - 2), 18, 4);
          ctx.fillStyle = '#4a2a6e'; ctx.fillRect(Math.round(ac.x - 8), Math.round(top - 1), 16, 2);
          ctx.fillStyle = '#ffcf3f'; ctx.fillRect(Math.round(ac.x - 8), Math.round(top - 1), Math.round(16 * p), 2);
        } else if (host.ready(ac.id)) {                  // « touche-moi » : une pizza qui rebondit
          Sprites.draw(ctx, 'pizzaMini', ac.x - 5, top - 12 + Math.round(Math.abs(Math.sin(time * 5)) * -3));
        }
      } });
    }
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.draw());

    if (golden) {
      const blinkOut = golden.life < 2 && Math.floor(time * 10) % 2 === 0;
      if (!blinkOut) {
        const gy = golden.y + Math.sin(time * 4) * 3;
        Sprites.draw(ctx, 'pizzaGold', golden.x - 7, gy - 7);
        if (Math.floor(time * 6) % 2 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(golden.x + 8, gy - 8, 1, 3); ctx.fillRect(golden.x + 7, gy - 7, 3, 1);
          ctx.fillRect(golden.x - 9, gy + 5, 1, 3); ctx.fillRect(golden.x - 10, gy + 6, 3, 1);
        }
      }
    }
    for (const p of particles) { ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.sz, p.sz); }

    // effet clignotant de la Tournée Générale
    if (host.boost()) {
      const ph = Math.floor(time * 7) % 2;
      ctx.fillStyle = ph ? 'rgba(255,207,63,0.13)' : 'rgba(215,38,61,0.13)';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 12; i++) {
        const dx = (i * 53 + Math.floor(time * 20) * 7) % W, dy = (i * 37 + Math.floor(time * 20) * 3) % 110;
        ctx.fillStyle = ['#ffcf3f', '#ff2e7e', '#3ad6c5'][i % 3];
        ctx.fillRect(dx, dy, 2, 2);
      }
    }
    if (cine) renderCinematic();
  }

  /* ---------------------------------------------------------------------
   *  Cinématique de victoire
   * --------------------------------------------------------------------- */
  let cine = null;
  function startCinematic() { cine = { t: 0, said: false, cheered: false }; Audio8.laureTheme(); }
  function renderCinematic() {
    const t = cine.t;
    const from = POS.laure, to = POS.laureWin;
    // assombrissement
    const dark = Math.min(1, t / 1.5) * (t > 11 ? Math.max(0, 1 - (t - 11)) : 1);
    ctx.fillStyle = 'rgba(7,4,12,' + (0.72 * dark) + ')';
    ctx.fillRect(0, 0, W, H);
    // halo violet de projecteur
    const k = Math.max(0, Math.min(1, (t - 1.5) / 3.5));
    const lx = Math.round(from.x + (to.x - from.x) * easeInOut(k));
    const ly = Math.round(from.y + (to.y - from.y) * easeInOut(k));
    if (dark > 0.05) {
      ctx.fillStyle = 'rgba(199,125,255,' + (0.18 * dark) + ')';
      for (let r = 26; r > 0; r -= 6) ctx.fillRect(lx - r, ly - 10 - r * 0.6, r * 2, r * 1.2);
      ctx.fillStyle = 'rgba(255,207,63,' + (0.15 * dark) + ')';
      ctx.fillRect(POS.octave.x - 14, POS.octave.y - 28, 28, 30);
    }
    // Octave et Laure restent éclairés
    drawHuman('octave', POS.octave.x, POS.octave.y, 0, 2);
    const walking = t > 1.5 && t < 5;
    drawHuman('laure', lx, ly, 0, walking ? 6 : 1.2);

    // dialogue
    if (t > 5 && !cine.said) {
      cine.said = true;
      host.say('laure', global.DATA.MANAGERS.find((m) => m.id === 'laure').name.toUpperCase(), global.DATA.UI.cine_laure, 6000);
    }
    // cœurs qui montent
    if (t > 5 && t < 11) {
      for (let i = 0; i < 6; i++) {
        const ht = (t * 0.8 + i / 6) % 1;
        const hx = (POS.octave.x + lx) / 2 - 20 + i * 8 + Math.sin(t * 3 + i) * 3;
        const hy = 120 - ht * 90;
        Sprites.draw(ctx, 'heart', hx, hy);
      }
    }
    // VICTOIRE !
    if (t > 8.5) {
      if (!cine.cheered) {
        cine.cheered = true;
        Audio8.victory();
        for (let i = 0; i < 6; i++) puff(rand(40, 280), rand(20, 80), ['#ff2e7e', '#ffcf3f', '#c77dff', '#3ad6c5', '#ffffff'], 18);
      }
      const txt = global.DATA.UI.cine_victoire;
      const sc = 4;
      const tw = Sprites.textWidth(txt, sc);
      const col = ['#ffcf3f', '#ff2e7e', '#ffffff', '#c77dff'][Math.floor(t * 8) % 4];
      Sprites.drawText(ctx, txt, (W - tw) / 2 + 2, 22, '#0b0710', sc);
      Sprites.drawText(ctx, txt, (W - tw) / 2, 20, col, sc);
      const sub = global.DATA.UI.cine_soustitre;
      Sprites.drawText(ctx, sub, (W - Sprites.textWidth(sub, 2)) / 2, 46, '#f4ecd8', 2);
    }
  }
  function easeInOut(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function update(dt) {
    time += dt;
    updateActors(dt); updateParticles(dt);
    if (golden) { golden.life -= dt; if (golden.life <= 0) golden = null; }
    if (cine) { cine.t += dt; if (cine.t >= 13) { cine = null; host.onVictory(); } }
  }

  function init(canvasEl, floaters, hostObj) {
    host = hostObj; canvas = canvasEl; floatersEl = floaters;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    BG = buildBackground();
    canvas.addEventListener(global.PointerEvent ? 'pointerdown' : 'click', (e) => {
      const r = canvas.getBoundingClientRect();
      host.onTap({ x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H });
    });
  }

  global.Room = {
    W, H, init, update, render, syncActors, actorAt, puff, floatText, bubble, collect, say,
    spawnGolden, hitGolden, takeGolden, startCinematic,
    get golden() { return golden; },
    get cinematic() { return !!cine; },
  };
})(window);
