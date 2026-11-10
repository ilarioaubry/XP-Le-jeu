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
    const w = def.w || def.frames[0][0].length;
    const h = def.h || def.frames[0].length;
    defs[name] = {
      w, h,
      palette: Object.assign({}, BASE, def.palette || {}),
      frames: def.frames.map((f) => norm(f, w)),
    };
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
    const rows = d.frames[fi];
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

  /* =====================================================================
   *  LES MINEURS : LA MEUTE DE LA COLOC
   * ===================================================================== */

  // 1. CHICHI — petit chihuahua nerveux
  const chichiA = [
    '................',
    '................',
    '................',
    '................',
    '................',
    '..........K..K..',
    '.........KDKKDK.',
    '.........KBBBBK.',
    '.........KBEBEK.',
    '..K......KBBBNK.',
    '.KBK......KBBK..',
    '..KBKKKKKKBBK...',
    '...KBBBBBBBBK...',
    '...KBLLLLLBBK...',
    '...KBK...KBK....',
    '...KKK...KKK....',
  ];
  define('chichi', {
    palette: { B: '#d9a066', D: '#a8703a', L: '#f0d0a0' },
    frames: [
      chichiA,
      patch(chichiA, {
        9: 'K........KBBBNK.',
        10: '.KK.......KBBK..',
        14: '....KBK.KBK.....',
        15: '....KKK.KKK.....',
      }),
    ],
  });

  // 2. SAPHIRE — chienne au pelage bleu-gris, collier saphir
  const saphireA = [
    '................',
    '................',
    '..........KK.KK.',
    '.........KDDKDDK',
    '.........KBBBBBK',
    '.........KBEBBEK',
    '.........KBBBBBK',
    '.K.......KBBBNNK',
    'KBK.......KBBTK.',
    '.KBKKKKKKKCCCK..',
    '..KBBBBBBBBBBK..',
    '..KBBBBBBBBBBK..',
    '..KDBLLLLLLBDK..',
    '..KBKBK....KBKBK',
    '..KBKBK....KBKBK',
    '..KKKKK....KKKKK',
  ];
  define('saphire', {
    palette: { B: '#6b7fa8', D: '#46557a', L: '#aab6d6', C: '#2a6bff' },
    frames: [
      saphireA,
      patch(saphireA, {
        7: '.........KBBBNNK',
        8: '..........KBBTK.',
        9: 'KBBKKKKKKKCCCK..',
        13: '...KBKBK..KBKBK.',
        14: '...KBKBK..KBKBK.',
        15: '...KKKKK..KKKKK.',
      }),
    ],
  });

  // 3. BOUBA — le gros tank
  const boubaA = [
    '....................',
    '..............KKKK..',
    '.............KDBBDK.',
    '............KDBBBBDK',
    '............KBEBBEBK',
    '............KBBBBBBK',
    '............KBBBNNNK',
    '............KBBTTKK.',
    '...KKKKKKKKKKBBBBK..',
    '..KDBBBBBBBBBBBBBK..',
    '.KDBBBBBBBBBBBBBBBK.',
    '.KDBBBBBBBBBBBBBBBK.',
    '.KDBBLLLLLLLLLLBBBK.',
    '.KDDBLLLLLLLLLLBBDK.',
    '..KBBBK......KBBBK..',
    '..KKKKK......KKKKK..',
  ];
  define('bouba', {
    palette: { B: '#6a4430', D: '#3a2418', L: '#9a7050' },
    frames: [
      boubaA,
      patch(boubaA, {
        7: '............KBBBBKK.',
        14: '...KBBBK....KBBBK...',
        15: '...KKKKK....KKKKK...',
      }),
    ],
  });

  // 4. GILBERT — chat roux à masque de bandit
  const gilbertA = [
    '................',
    '................',
    '..........K...K.',
    '.........KBK.KBK',
    '.........KBBKBBK',
    '.........KBBBBBK',
    '.........KMMMMMK',
    '.........KMYMYMK',
    '.K.......KBBNBBK',
    'KBK.......KBBBK.',
    'KBK..KKKKKKBBK..',
    '.KBKKBDBDBDBBK..',
    '..KBBDBDBDBBBK..',
    '..KBBBBLLLLBBK..',
    '..KBK..KBK.KBK..',
    '..KKK..KKK.KKK..',
  ];
  define('gilbert', {
    palette: { B: '#e8892b', D: '#a8561a', L: '#f6c88a', M: '#1a1020', Y: '#c6ff3a', N: '#ff7a9a' },
    frames: [
      gilbertA,
      patch(gilbertA, {
        8: 'K........KBBNBBK',
        9: 'KB........KBBBK.',
        10: '.KK..KKKKKKBBK..',
        14: '...KBK.KBK.KBK..',
        15: '...KKK.KKK.KKK..',
      }),
    ],
  });

  // 5. IDYLLE — l'élite du dressage, assise au garde-à-vous
  const idylleA = [
    '................',
    '...KK......KK...',
    '..KDDK....KDDK..',
    '..KDBBKKKKBBDK..',
    '..KBBBBBBBBBBK..',
    '..KBDEBBBBEDBK..',
    '..KBBBBBBBBBBK..',
    '...KBBBNNBBBK...',
    '....KBBTTBBK....',
    '....KRRRRRRK....',
    '...KBBRRGRBBK...',
    '...KBBBBGBBBK...',
    '...KBBDBBBBBK...',
    '..KBBBDBBBBBBK..',
    '..KBLBKBBKBLBK..',
    '..KKKKKKKKKKKK..',
  ];
  define('idylle', {
    palette: { B: '#f2efe8', D: '#2a2230', L: '#cfc8d8' },
    frames: [
      idylleA,
      patch(idylleA, {
        5: '..KBDKBBBBKDBK..',
        8: '....KBBBBBBK....',
      }),
    ],
  });

  // 6. JULY LA QUEEN — chat ultime couronné
  const julyA = [
    '.....G.GG.G.....',
    '.....GGGGGG.....',
    '..K..GRGGRG..K..',
    '.KBK.KKKKKK.KBK.',
    '.KBBKBBBBBBKBBK.',
    '.KBBBBBBBBBBBBK.',
    '.KBBEEBBBBEEBBK.',
    '.KBBBBBNNBBBBBK.',
    '..KBBBBBBBBBBK..',
    '...KKBBBBBBKK...',
    '..KBBLLLLLLBBK..',
    '.KBBLLLLLLLLBBK.',
    '.KBBLLLLLLLLBBKK',
    '.KBBBLLLLLLBBBKB',
    '.KBBBBBBBBBBBBKK',
    '..KKKKKKKKKKKK..',
  ];
  define('july', {
    palette: { B: '#d8c8ef', L: '#ffffff', E: '#39d98a', N: '#ff8fb0' },
    frames: [
      julyA,
      patch(julyA, {
        0: '.....W.GG.W.....',
        6: '.KBBKKBBBBKKBBK.',
        12: '.KBBLLLLLLLLBBK.',
        13: '.KBBBLLLLLLBBBKK',
        14: '.KBBBBBBBBBBBBKB',
      }),
    ],
  });

  /* =====================================================================
   *  LES HUMAINS DE LA COLOC (gabarit chibi 16x16)
   * ===================================================================== */
  const HUMAN = [
    '................',
    '.....KKKKKK.....',
    '....KHHHHHHK....',
    '...KHHHHHHHHK...',
    '...KHSSSSSSHK...',
    '...KSSESSESSK...',
    '...KSSSSSSSSK...',
    '....KSSMMSSK....',
    '.....KKSSKK.....',
    '....KCCCCCCK....',
    '...KCCCCCCCCK...',
    '..KSKCCCCCCKSK..',
    '..KSKCCCCCCKSK..',
    '...KKccccccKK...',
    '....KccKKccK....',
    '....KKK..KKK....',
  ];
  // frame 2 : clignement des yeux + respiration
  function humanFrames(rows, blinkRow) {
    const blink = patch(rows, { [blinkRow || 5]: rows[blinkRow || 5].replace(/E/g, 'K') });
    return [rows, rows, bob(blink, 13)];
  }

  // OCTAVE — maître-chien, veste rouge Kaneda, tattoos sur les bras
  const octave = patch(HUMAN, {
    0: '.....K..K.......',
    1: '....KKHKKHKK....',
    10: '...KCCCCWWCCK...',
    11: '..KXKCCCCCCKXK..',
    12: '..KSKCCCCCCKSK..',
  });
  define('octave', {
    palette: { H: '#1b1b2f', S: '#e8b796', C: '#d7263d', c: '#2b2d42', M: '#7a3b3b', X: '#3a6b7a' },
    frames: humanFrames(octave),
  });

  // JANIS — mode paysanne : fichu, tablier, robe longue
  const janis = patch(HUMAN, {
    1: '.....KKKKKK.....',
    2: '....KHHFHHHKK...',
    3: '...KHHHHHHHHKHK.',
    4: '...KhSSSSSShK...',
    9: '....KCWWWWCK....',
    10: '...KCCWWWWCCK...',
    11: '..KSKCWWWWCKSK..',
    12: '..KSKCWWWWCKSK..',
    13: '...KCCWWWWCCK...',
    14: '...KCCCCCCCCK...',
    15: '....KKKKKKKK....',
  });
  define('janis', {
    palette: { H: '#5b7a3a', h: '#7a4a2a', F: '#ff6f91', S: '#f1c6a0', C: '#b8945a', W: '#efe3c2', M: '#b0505a' },
    frames: humanFrames(janis),
  });

  // ANNA — mimi baddie : cheveux roses, crop top, boucles d'oreilles
  const anna = patch(HUMAN, {
    4: '..KHHSSSSSSHHK..',
    5: '..KHSSESSESSHK..',
    6: '..KGSSSSSSSSGK..',
    7: '..KHKSSMMSSKHK..',
    8: '..KHHKKSSKKHHK..',
    9: '...KHCCCCCCHK...',
    12: '..KSKSSSSSSKSK..',
  });
  define('anna', {
    palette: { H: '#ff5fa2', S: '#f3c1a5', C: '#1a1020', c: '#b03aa8', M: '#ff2e7e' },
    frames: humanFrames(anna),
  });

  // OLIVER — le père : calvitie, barbe grise, chemise hawaïenne, bière
  const oliver = patch(HUMAN, {
    1: '.....KKKKKK.....',
    2: '....KSSSSSSK....',
    3: '...KHSSSSSSHK...',
    4: '...KHSSSSSSHK...',
    7: '....KZZMMZZK....',
    8: '.....KZZZZK.....',
    9: '....KCCCCCCK....',
    10: '...KCFCCCFCCKWK.',
    11: '..KSKCCCCCCKSYK.',
    12: '..KSKCCFCCCKSYK.',
    13: '...KCCCCCCCCK...',
    14: '....KccKKccK....',
  });
  define('oliver', {
    palette: { H: '#9a9aa8', S: '#eab08e', Z: '#bdbdc8', C: '#f28c28', F: '#3ad6c5', c: '#3b4a7a', M: '#7a2b2b', Y: '#f2a81d' },
    frames: humanFrames(oliver),
  });

  // LAURE — le crush gothique : cheveux noirs, ras-de-cou, livre de Bourdieu
  const laure = patch(HUMAN, {
    1: '.....KKKKKK.....',
    2: '....KHHHHHHK....',
    3: '...KHHHHHHHHK...',
    4: '..KHHHHSSSSHHK..',
    5: '..KHSSESSESSHK..',
    6: '..KHSSSSSSSSHK..',
    7: '..KHKSSMMSSKHK..',
    8: '..KHHKPPPPKHHK..',
    9: '..KHKCCCCCCKHK..',
    10: '...KCCPCCPCCK...',
    11: '..KSRRRRRRRRSK..',
    12: '..KSRWWWWWWRSK..',
    13: '...KCCCCCCCCK...',
    14: '..KCCPCCCCPCCK..',
    15: '..KKKKKKKKKKKK..',
  });
  define('laure', {
    palette: { H: '#1a1024', S: '#ece0ea', E: '#3a0a4a', C: '#241430', M: '#6a1a7b', R: '#5a0f22', W: '#d8cfc0' },
    frames: [laure, laure, patch(laure, { 5: '..KHSSKSSKSSHK..', 12: '..KSRWWKWWWRSK..' })],
  });

  /* =====================================================================
   *  ICÔNES D'UPGRADES (tattoos d'Octave)
   * ===================================================================== */
  define('icoHaki', {
    palette: { Y: '#f5d061', y: '#b8902a', R: '#d7263d' },
    frames: [[
      '..P..........P..',
      '.P.....PP.....P.',
      '................',
      '.....KKKKKK.....',
      '....KYYYYYYK....',
      '...KYYYYYYYYK...',
      '...KYYYYYYYYK...',
      '...KRRRRRRRRK...',
      '...KRRRRRRRRK...',
      '.KKKYYYYYYYYKKK.',
      'KYYYYYYYYYYYYYYK',
      'KyYYYYYYYYYYYYyK',
      '.KKyyyyyyyyyyKK.',
      '...KKKKKKKKKK...',
      '.P............P.',
      '..P..........P..',
    ]],
  });

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
    dataURL(name, scale, frame) {
      const src = render(name, frame || 0);
      const c = document.createElement('canvas');
      c.width = src.width * scale; c.height = src.height * scale;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(src, 0, 0, c.width, c.height);
      return c.toDataURL();
    },
    drawText,
    textWidth,
  };

  global.Sprites = Sprites;
})(window);
