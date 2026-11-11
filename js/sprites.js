/* =====================================================================
 *  DOGGY PARTY — Octave Tycoon : La Quête de Laure
 *  sprites.js — Moteur de sprites Pixel Art 100% procédural
 *  Chaque sprite est une matrice de caractères : 1 caractère = 1 pixel.
 *  '.' = transparent, les autres lettres sont résolues via une palette.
 * ===================================================================== */
(function (global) {
  'use strict';

  /* ---------- Palette commune (surchargée par chaque sprite) ---------- */
  const BASE = {
    K: '#0b0710', // contour
    E: '#0b0710', // yeux
    N: '#1a1020', // truffe
    W: '#f4ecd8', // blanc cassé
    G: '#ffd23f', // or
    g: '#b8861b', // or sombre
    R: '#d7263d', // rouge Akira
    r: '#8c1023', // rouge sombre
    P: '#7b2cbf', // violet gothique
    p: '#4a1a7a', // violet sombre
    T: '#e0507a', // langue
    Y: '#ffcf3f', // fromage
    y: '#e8a524', // fromage sombre
    V: '#3fa34d', // basilic
  };

  const defs = {};
  const cache = {};

  /* ---------- Outils de matrices ---------- */
  function norm(rows, w) {
    return rows.map((r) => (r + '.'.repeat(w)).slice(0, w));
  }
  // Remplace certaines lignes d'une matrice (pour créer des frames d'animation)
  function patch(rows, map) {
    const out = rows.slice();
    Object.keys(map).forEach((k) => { out[+k] = map[k]; });
    return out;
  }
  // "Respiration" : décale le haut du sprite d'1px vers le bas (squash)
  function bob(rows, keepFrom) {
    const w = rows[0].length;
    const top = rows.slice(0, keepFrom - 1);
    return ['.'.repeat(w)].concat(top, rows.slice(keepFrom));
  }

  function define(name, def) {
    // frames : tableaux de lignes OU fonctions () => Grid / tableau de lignes
    const w = def.w || def.frames[0][0].length;
    const h = def.h || def.frames[0].length;
    defs[name] = {
      w, h,
      palette: Object.assign({}, BASE, def.palette || {}),
      frames: def.frames,
      rows: [],
    };
  }

  function frameRows(d, fi) {
    if (!d.rows[fi]) {
      let f = d.frames[fi];
      if (typeof f === 'function') f = f();
      if (f && typeof f.rows === 'function') f = f.rows();
      d.rows[fi] = norm(f, d.w);
    }
    return d.rows[fi];
  }

  function render(name, frame) {
    const d = defs[name];
    if (!d) throw new Error('Sprite inconnu : ' + name);
    const fi = ((frame || 0) % d.frames.length + d.frames.length) % d.frames.length;
    const key = name + '#' + fi;
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas');
    c.width = d.w; c.height = d.h;
    const x = c.getContext('2d');
    const rows = frameRows(d, fi);
    for (let j = 0; j < d.h; j++) {
      const row = rows[j] || '';
      for (let i = 0; i < d.w; i++) {
        const ch = row[i];
        if (!ch || ch === '.' || ch === ' ') continue;
        const col = d.palette[ch];
        if (!col) continue;
        x.fillStyle = col;
        x.fillRect(i, j, 1, 1);
      }
    }
    cache[key] = c;
    return c;
  }

  /* =====================================================================
   *  MOTEUR PIXEL ART : une grille de caractères que l'on remplit avec des
   *  formes (ellipses, polygones, rectangles), ombrées automatiquement,
   *  puis détourées. Le résultat est une matrice de pixels comme les autres.
   * ===================================================================== */
  const inEll = (cx, cy, rx, ry) => (x, y) => {
    const dx = (x - cx) / rx, dy = (y - cy) / ry;
    return dx * dx + dy * dy <= 1;
  };
  const inPoly = (pts) => (x, y) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const inRect = (x0, y0, w, h) => (x, y) => x >= x0 && x < x0 + w && y >= y0 && y < y0 + h;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  class Grid {
    constructor(w, h) {
      this.w = w; this.h = h;
      this.a = [];
      for (let y = 0; y < h; y++) this.a.push(new Array(w).fill('.'));
    }
    get(x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? '.' : this.a[y][x]; }
    px(x, y, c) {
      x = Math.floor(x); y = Math.floor(y);
      if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y][x] = c;
      return this;
    }
    // Remplit les pixels dont le centre est dans la forme (option : seulement sur certains caractères)
    fill(inside, c, only) {
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          if (!inside(x + 0.5, y + 0.5)) continue;
          if (only && only.indexOf(this.a[y][x]) < 0) continue;
          this.a[y][x] = c;
        }
      }
      return this;
    }
    // Remplit avec 3 tons : lumière en haut à gauche, ombre en bas à droite
    shade(inside, pal, only, s) {
      s = s || 1;
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          const cx = x + 0.5, cy = y + 0.5;
          if (!inside(cx, cy)) continue;
          if (only && only.indexOf(this.a[y][x]) < 0) continue;
          let c = pal.b;
          if (!inside(cx - s, cy - s)) c = pal.h;
          else if (!inside(cx + s, cy + s)) c = pal.d;
          this.a[y][x] = c;
        }
      }
      return this;
    }
    // Change la couleur de ce qui existe déjà (taches, plastron…) en gardant l'ombrage
    recolor(inside, map) {
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          if (!inside(x + 0.5, y + 0.5)) continue;
          const n = map[this.a[y][x]];
          if (n) this.a[y][x] = n;
        }
      }
      return this;
    }
    line(x0, y0, x1, y1, c, thick) {
      x0 = Math.floor(x0); y0 = Math.floor(y0); x1 = Math.floor(x1); y1 = Math.floor(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.px(x0, y0, c);
        if (thick) this.px(x0 + 1, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
      return this;
    }
    // Poils : ajoute des pixels aléatoires autour de la silhouette (fourrure ébouriffée)
    fluff(chars, seed, p) {
      const r = rng(seed || 1);
      const add = [];
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          const c = this.a[y][x];
          if (chars.indexOf(c) < 0) continue;
          [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
            if (this.get(x + dx, y + dy) === '.' && r() < p) add.push([x + dx, y + dy, c]);
          });
        }
      }
      add.forEach(([x, y, c]) => this.px(x, y, c));
      return this;
    }
    // Contour sombre autour de la silhouette
    outline(c) {
      c = c || 'K';
      const add = [];
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          if (this.a[y][x] !== '.') continue;
          if (this.get(x - 1, y) !== '.' || this.get(x + 1, y) !== '.' ||
              this.get(x, y - 1) !== '.' || this.get(x, y + 1) !== '.') add.push([x, y]);
        }
      }
      add.forEach(([x, y]) => this.a[y][x] = c);
      return this;
    }
    rows() { return this.a.map((r) => r.join('')); }
  }

  /* =====================================================================
   *  GÉNÉRATEURS PROCÉDURAUX (pizza, cartons)
   * ===================================================================== */
  function makePizza(S, opts) {
    opts = opts || {};
    const rows = [];
    const c = (S - 1) / 2;
    const R = S / 2 - 0.5;
    const k = R / 19; // échelle relative à la grosse pizza
    const pep = opts.pepperoni || [
      [-0.45, -0.38], [0.36, -0.5], [0.52, 0.18], [-0.08, 0.5], [-0.55, 0.28], [0.12, -0.12],
    ];
    const pr = Math.max(1.2, 2.8 * k);
    for (let y = 0; y < S; y++) {
      let row = '';
      for (let x = 0; x < S; x++) {
        const dx = x - c, dy = y - c;
        const d = Math.hypot(dx, dy);
        if (d > R + 0.5) { row += '.'; continue; }
        if (d > R - 0.7) { row += 'K'; continue; }
        if (d > R - Math.max(1.5, 3.2 * k)) {
          const s = dx + dy;
          row += s > R * 0.55 ? 'c' : (s < -R * 0.55 ? 'L' : 'C');
          continue;
        }
        // pepperoni
        let ch = null;
        for (const [px, py] of pep) {
          const ex = dx - px * R, ey = dy - py * R;
          const pd = Math.hypot(ex, ey);
          if (pd <= pr) {
            if (ex < -pr * 0.3 && ey < -pr * 0.3 && pd > pr * 0.4) ch = 'w';
            else if (ex + ey > pr * 0.6) ch = 'r';
            else ch = 'R';
            break;
          }
        }
        if (ch) { row += ch; continue; }
        // lignes de découpe (8 parts)
        if (opts.slices !== false &&
          (Math.abs(dx) < 0.5 || Math.abs(dy) < 0.5 || Math.abs(dx - dy) < 0.5 || Math.abs(dx + dy) < 0.5) && d > 1.5) {
          row += 'S'; continue;
        }
        // basilic & variations de fromage
        const h = (x * 73856093) ^ (y * 19349663);
        const m = Math.abs(h) % 23;
        if (opts.basil !== false && m === 0) row += 'V';
        else if (m < 4) row += 'y';
        else if (m === 5) row += 'w';
        else row += 'Y';
      }
      rows.push(row);
    }
    return rows;
  }

  const PIZZA_PAL = {
    C: '#d98b3a', c: '#a65a1f', L: '#f2b866',
    Y: '#ffcf3f', y: '#f0a62a', S: '#c4561f',
    R: '#c0262d', r: '#7c1218', w: '#fff1b0', V: '#3fa34d',
  };
  const GOLD_PAL = {
    C: '#e0a400', c: '#9c6a00', L: '#fff08a',
    Y: '#ffe55c', y: '#ffc400', S: '#d18f00',
    R: '#fff6c9', r: '#d9a800', w: '#ffffff', V: '#fff6c9',
  };

  function makeBox(w) {
    return [
      'K'.repeat(w),
      'K' + 'b'.repeat(w - 2) + 'K',
      'K' + 'b'.repeat(Math.floor((w - 8) / 2)) + 'R'.repeat(6) + 'b'.repeat(Math.ceil((w - 8) / 2)) + 'K',
      'K' + 'd'.repeat(w - 2) + 'K',
      'K' + 'd'.repeat(w - 2) + 'K',
      'K'.repeat(w),
    ];
  }

  /* =====================================================================
   *  LA PIZZA, LES CARTONS, LES PETITES ICÔNES
   * ===================================================================== */
  define('pizza', { palette: PIZZA_PAL, frames: [makePizza(41)] });
  define('pizzaMini', { palette: PIZZA_PAL, frames: [makePizza(11, { slices: false, basil: false, pepperoni: [[-0.35, -0.25], [0.3, 0.3]] })] });
  define('pizzaGold', { palette: GOLD_PAL, frames: [makePizza(15, { slices: false, basil: false, pepperoni: [[-0.3, -0.3], [0.35, 0.25], [-0.2, 0.4]] })] });
  define('box', { palette: { b: '#c9935a', d: '#9a6a3a' }, frames: [makeBox(24)] });

  define('heart', {
    frames: [[
      '.KK.KK.',
      'KRRKRRK',
      'KRWRRRK',
      '.KRRRK.',
      '..KRK..',
      '...K...',
    ]],
  });

  define('beer', {
    palette: { Y: '#f2a81d', y: '#c27a0e' },
    frames: [[
      '............',
      '..WWWWWW....',
      '.WWWWWWWW...',
      '.KWWWWWWK...',
      '.KYYYYYYKKK.',
      '.KYyYYYYK.K.',
      '.KYyYYYYK.K.',
      '.KYyYYYYK.K.',
      '.KYyYYYYKKK.',
      '.KYYYYYYK...',
      '.KKKKKKKK...',
      '............',
    ]],
  });

  /* Les animaux et les humains sont dessinés dans characters.js,
   * avec le moteur de pixel art (Sprites.Grid) défini ci-dessus. */

  /* =====================================================================
   *  ICÔNES D'UPGRADES (tattoos d'Octave)
   * ===================================================================== */
  define('icoEgoist', {
    palette: { B: '#2a8bff', W: '#f4f4ff' },
    frames: [[
      '..B..........B..',
      '......KKKK......',
      '....KKWWWWKK....',
      '...KWWWKKWWWK...',
      '..KWWWKKKKWWWK..',
      '..KWWWWKKWWWWK..',
      '.KKKWWWWWWWWKKK.',
      '.KKWWWWWWWWWWKK.',
      '.KWWWWKKKWWWWWK.',
      '.KWWWKKKKKWWWWK.',
      '.KWWWWKKKWWWWWK.',
      '..KWWWWWWWWKKK..',
      '..KKWWWWWWWKKK..',
      '...KKWWWWWWKK...',
      'B...KKKKKKKK...B',
      '................',
    ]],
  });

  define('icoKaneda', {
    palette: { g: '#9a9aa8' },
    frames: [[
      '................',
      '................',
      '................',
      '........KKKK....',
      '......KKRRRRK...',
      '....KKRRRRRRRK..',
      '...KRRRRWWRRRRK.',
      'RRKRRRRRRRRRRRRK',
      '.KKKRRRRRRRRKKK.',
      '.KKK.KKKKKK.KKK.',
      'KgggK......KgggK',
      'KgKgK......KgKgK',
      'KgggK......KgggK',
      '.KKK........KKK.',
      'RR..RR..........',
      '................',
    ]],
  });

  define('icoInfinity', {
    palette: { W: '#f4f4ff', B: '#6fc3ff', G: '#4ad66d', O: '#ff9a3c' },
    frames: [[
      '.......KK.......',
      '......KWWK......',
      '.Y...KWWWWK...Y.',
      '.....KWBBWK.....',
      '.....KWBBWK.....',
      '.....KWWWWK.....',
      '.....KGWWGK.....',
      '.....KWWWWK.....',
      '....KKWWWWKK....',
      '...KGKWWWWKGK...',
      '..KGGKWWWWKGGK..',
      '..KGK.KKKK.KGK..',
      '..KK..ROOR..KK..',
      '......ROOR......',
      '.Y.....RR.....Y.',
      '................',
    ]],
  });

  /* =====================================================================
   *  MINI POLICE PIXEL 3x5 (pour les posters & la cinématique)
   * ===================================================================== */
  const FONT = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
    C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
    E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
    G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
    I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
    K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
    M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'],
    O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
    Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
    S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
    U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
    W: ['#.#', '#.#', '###', '###', '#.#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
    '!': ['.#.', '.#.', '.#.', '...', '.#.'], '?': ['##.', '..#', '.#.', '...', '.#.'],
    '.': ['...', '...', '...', '...', '.#.'], '3': ['##.', '..#', '.#.', '..#', '##.'],
    '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'],
    'x': ['...', '#.#', '.#.', '#.#', '...'], ' ': ['...', '...', '...', '...', '...'],
  };

  function textWidth(str, scale) {
    return str.length * 4 * (scale || 1) - (scale || 1);
  }
  function drawText(ctx, str, x, y, color, scale) {
    scale = scale || 1;
    ctx.fillStyle = color;
    let cx = Math.round(x);
    for (const chRaw of str) {
      const ch = FONT[chRaw] ? chRaw : chRaw.toUpperCase();
      const g = FONT[ch] || FONT['?'];
      for (let j = 0; j < 5; j++) {
        for (let i = 0; i < 3; i++) {
          if (g[j][i] === '#') ctx.fillRect(cx + i * scale, Math.round(y) + j * scale, scale, scale);
        }
      }
      cx += 4 * scale;
    }
  }

  /* =====================================================================
   *  API PUBLIQUE
   * ===================================================================== */
  const Sprites = {
    get: render,
    size(name) { const d = defs[name]; return { w: d.w, h: d.h }; },
    frames(name) { return defs[name].frames.length; },
    has(name) { return !!defs[name]; },
    draw(ctx, name, x, y, o) {
      o = o || {};
      const c = render(name, o.frame || 0);
      const s = o.scale || 1;
      if (o.flip) {
        ctx.save();
        ctx.translate(Math.round(x) + c.width * s, Math.round(y));
        ctx.scale(-1, 1);
        ctx.drawImage(c, 0, 0, c.width * s, c.height * s);
        ctx.restore();
      } else {
        ctx.drawImage(c, Math.round(x), Math.round(y), c.width * s, c.height * s);
      }
    },
    // Exporte un sprite en image (portraits & icônes de l'interface)
    // crop = {x, y, w, h} en pixels du sprite (ex. portrait = tête et épaules)
    dataURL(name, scale, frame, crop) {
      const src = render(name, frame || 0);
      const k = crop || { x: 0, y: 0, w: src.width, h: src.height };
      const c = document.createElement('canvas');
      c.width = k.w * scale; c.height = k.h * scale;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(src, k.x, k.y, k.w, k.h, 0, 0, c.width, c.height);
      return c.toDataURL();
    },
    define, Grid, inEll, inPoly, inRect, rng,
    drawText,
    textWidth,
  };

  global.Sprites = Sprites;
})(window);
