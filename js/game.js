/* =====================================================================
 *  DOGGY PARTY — Octave Tycoon : La Quête de Laure
 *  game.js — Boucle de jeu, économie, salon animé, sauvegarde, journal
 * ===================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const SAVE_KEY = 'doggyparty.octaveTycoon.v1';
  const W = 320, H = 180;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* =====================================================================
   *  DONNÉES DU JEU
   * ===================================================================== */
  const ANIMALS = [
    { id: 'chichi', name: 'Chichi', species: 'Chien', desc: 'Petit chien vif qui gratte les miettes.', cost: 15, pps: 1, sound: 'bark', pitch: 1.6, cap: 4, speed: 30, cry: 'WIF!' },
    { id: 'saphire', name: 'Saphire', species: 'Chien', desc: 'Flaire les parts oubliées sous le canapé.', cost: 100, pps: 8, sound: 'bark', pitch: 1.2, cap: 3, speed: 22, cry: 'WOUF!' },
    { id: 'bouba', name: 'Bouba', species: 'Chien', desc: 'Le gros tank qui rapporte des boîtes entières.', cost: 1100, pps: 45, sound: 'bark', pitch: 0.65, cap: 3, speed: 11, cry: 'WOOF!!' },
    { id: 'gilbert', name: 'Gilbert', species: 'Chat', desc: 'Le nouveau chat chaotique qui braque les livreurs.', cost: 12000, pps: 260, sound: 'meow', pitch: 1.1, cap: 3, speed: 34, cry: 'MRAOW' },
    { id: 'idylle', name: 'Idylle', species: 'Chien', desc: "L'élite du dressage, ultra disciplinée.", cost: 130000, pps: 1400, sound: 'bark', pitch: 1.0, cap: 3, speed: 0, cry: 'WOUF.' },
    { id: 'july', name: 'July la Queen', species: 'Chat Ultime', desc: 'La reine absolue sur son trône de cartons.', cost: 1400000, pps: 10000, sound: 'meow', pitch: 0.8, cap: 1, speed: 0, cry: 'MIAOU ROYAL' },
  ];
  const SMALL_DOGS = ['chichi', 'saphire', 'bouba'];
  const BIG_BEASTS = ['gilbert', 'idylle', 'july'];

  const MANAGERS = [
    { id: 'janis', name: 'Janis', role: 'Coloc · Mode Paysanne', desc: "Gère l'intendance.", effect: '-20% sur le prix de tous les animaux', cost: 2500 },
    { id: 'anna', name: 'Anna', role: 'Coloc · Mimi Baddie', desc: 'Met la hype dans la coloc.', effect: '+35% de production globale', cost: 250000 },
    { id: 'oliver', name: 'Oliver', role: "Le Père d'Octave", desc: 'Boit des bières, toujours de bonne humeur, zéro conseil pertinent.', effect: 'Compétence « Tournée Générale » : prod x3 pendant 15s (recharge 60s)', cost: 40000 },
    { id: 'laure', name: 'Laure', role: 'Le Crush Gothique · BOSS FINAL', desc: 'Hyper distante, lit Bourdieu dans un coin sombre.', effect: 'Production x10 000 + cinématique de victoire', cost: 1e9, boss: true },
  ];

  const UPGRADES = [
    { id: 'haki', icon: 'icoHaki', name: 'Haki des Rois', ref: 'Tattoo One Piece', desc: 'Octave dégage une aura de roi. Les pizzas obéissent.', effect: 'Clic manuel x5', cost: 500 },
    { id: 'egoist', icon: 'icoEgoist', name: "Mentalité d'Égoïste", ref: 'Tattoo Blue Lock', desc: 'Chaque chien veut être le numéro 1 de la meute.', effect: 'Chichi, Saphire & Bouba x2', cost: 15000 },
    { id: 'kaneda', icon: 'icoKaneda', name: 'Moto de Kaneda', ref: 'Tattoo Akira', desc: 'Livraison en dérapage à travers Montpellier.', effect: 'Gilbert, Idylle & July x2', cost: 750000 },
    { id: 'infinity', icon: 'icoInfinity', name: "Vers l'infini et au-delà", ref: 'Tattoo Toy Story', desc: 'La meute ne dort jamais. Même quand Octave dort.', effect: 'Production globale x2 + gains hors-ligne', cost: 6000000 },
  ];

  const OLIVER_ADVICE = [
    "Fiston, la pizza c'est comme le tiercé : faut toujours parier sur celle qui a des olives.",
    "Moi à ton âge j'avais déjà perdu trois fois mon permis. Et regarde-moi : heureux !",
    "Pour séduire une gothique, offre-lui une bougie parfumée du Monoprix. Ça marche à tous les coups. Enfin, une fois.",
    "Le chômage c'est des vacances que l'État te paye. Profite, et ressers-moi une mousse.",
    "Bourdieu ? C'était pas le gardien de Montpellier en 87 ?",
    "Si un chien aboie, c'est qu'il a soif. Donne-lui une bière. ... Non attends, fais pas ça.",
    "Range jamais tes mangas. Comme ça tu sais toujours où ils sont : par terre.",
    "La sociologie c'est comme le pastis : tout est dans le dosage de l'eau.",
    "Un vrai homme sait plier une boîte à pizza en forme de cygne. Moi je sais pas. Mais un vrai homme, oui.",
    "T'as déjà vu Palavas un mardi de novembre ? Non ? Moi non plus. Santé !",
    "Le secret d'une bonne relation, c'est la communication. Ou le barbecue. Je confonds toujours.",
    "Ton chat Gilbert m'a regardé bizarrement. Je crois qu'il veut ma bière. Il l'aura pas.",
    "Quand j'étais jeune, on n'avait pas de mangas. On avait des cailloux. Et on était contents.",
    "Tu sais pourquoi la pizza est ronde mais la boîte est carrée ? Moi non plus. C'est ça la vie, fiston.",
  ];

  const MILESTONES = [
    [100, 'La coloc sent officiellement la pizza. Les voisins commencent à se poser des questions.'],
    [1000, '1 000 pizzas ! La table basse a disparu sous les cartons.'],
    [10000, "10 000 pizzas. Le livreur de Domino's connaît désormais Chichi par son prénom."],
    [100000, '100 000 pizzas. Midi Libre parle d\'une « odeur suspecte de margherita » dans l\'Écusson.'],
    [1000000, '1 MILLION de pizzas. Laure a levé les yeux de son livre pendant 0,3 seconde.'],
    [10000000, '10 millions. La coloc est visible depuis la Comédie. Par l\'odeur.'],
    [100000000, '100 millions. Laure a noté « phénomène de meute » dans son carnet de terrain.'],
    [1000000000, "1 MILLIARD de pizzas. C'est le moment. Laure attend."],
  ];

  /* =====================================================================
   *  ÉTAT & SAUVEGARDE
   * ===================================================================== */
  function freshState() {
    return {
      pizzas: 0, total: 0, clicks: 0,
      animals: {}, managers: {}, upgrades: {},
      boostEnd: 0, oliverReady: 0,
      victory: false, golds: 0, milestone: 0,
      started: Date.now(), lastSave: Date.now(),
      muted: false,
    };
  }
  let S = freshState();
  let resetting = false;

  function save(manual) {
    if (resetting) return;
    S.lastSave = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(S));
      if (manual) log('Partie sauvegardée dans la mémoire de la GameBoy.', 'sys');
    } catch (e) {
      if (manual) log('Impossible de sauvegarder (stockage bloqué).', 'sys');
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      S = Object.assign(freshState(), data);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* =====================================================================
   *  ÉCONOMIE
   * ===================================================================== */
  const owned = (id) => S.animals[id] || 0;
  const hasM = (id) => !!S.managers[id];
  const hasU = (id) => !!S.upgrades[id];
  const boostActive = () => Date.now() < S.boostEnd;

  const discount = () => (hasM('janis') ? 0.8 : 1);

  function animalMult(id) {
    let m = 1;
    if (hasU('egoist') && SMALL_DOGS.includes(id)) m *= 2;
    if (hasU('kaneda') && BIG_BEASTS.includes(id)) m *= 2;
    return m;
  }
  function globalMult(withBoost) {
    let m = 1;
    if (hasM('anna')) m *= 1.35;
    if (hasU('infinity')) m *= 2;
    if (hasM('laure')) m *= 10000;
    if (withBoost && boostActive()) m *= 3;
    return m;
  }
  const unitPps = (a) => a.pps * animalMult(a.id) * globalMult(false);
  function pps(withBoost) {
    let base = 0;
    for (const a of ANIMALS) base += owned(a.id) * a.pps * animalMult(a.id);
    return base * globalMult(withBoost !== false);
  }
  const clickValue = () => (hasU('haki') ? 5 : 1);

  function bulkCost(a, qty) {
    const n = owned(a.id);
    const r = 1.15;
    return Math.ceil(a.cost * discount() * Math.pow(r, n) * (Math.pow(r, qty) - 1) / (r - 1));
  }
  function maxAffordable(a) {
    const n = owned(a.id);
    const first = a.cost * discount() * Math.pow(1.15, n);
    if (S.pizzas < first) return 0;
    return Math.max(0, Math.floor(Math.log(S.pizzas * 0.15 / first + 1) / Math.log(1.15)));
  }
  let buyQty = 1; // 1, 10 ou 'max'
  function qtyFor(a) {
    if (buyQty === 'max') return Math.max(1, maxAffordable(a));
    return buyQty;
  }

  /* =====================================================================
   *  FORMATAGE
   * ===================================================================== */
  const UNITS = [[1e24, 'Qa'], [1e21, 'Td'], [1e18, 'Tn'], [1e15, 'Bd'], [1e12, 'Bn'], [1e9, 'Md'], [1e6, 'M']];
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 1e6) return Math.floor(n).toLocaleString('fr-FR');
    for (const [v, s] of UNITS) {
      if (n >= v) return (n / v).toLocaleString('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + ' ' + s;
    }
    return String(n);
  }
  function fmtRate(n) {
    if (n < 100 && n % 1 !== 0) return n.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    return fmt(n);
  }
  function fmtDuration(sec) {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + 'h ' + String(m).padStart(2, '0') + 'min';
    if (m) return m + 'min ' + String(s).padStart(2, '0') + 's';
    return s + 's';
  }

  /* =====================================================================
   *  JOURNAL DE BORD
   * ===================================================================== */
  const logEl = $('log');
  function log(msg, cls) {
    const li = document.createElement('li');
    const d = new Date();
    const t = document.createElement('span');
    t.className = 'time';
    t.textContent = '[' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ']';
    const m = document.createElement('span');
    m.className = cls || 'event';
    m.textContent = msg;
    li.append(t, m);
    logEl.appendChild(li);
    while (logEl.children.length > 80) logEl.removeChild(logEl.firstChild);
    logEl.scrollTop = logEl.scrollHeight;
  }

  /* =====================================================================
   *  BOÎTE DE DIALOGUE RPG (effet machine à écrire)
   * ===================================================================== */
  const dlg = { el: $('dialog'), name: $('dialogName'), text: $('dialogText'), portrait: $('dialogPortrait'), full: '', i: 0, timer: null, close: null };
  const portraitCache = {};
  function portrait(name) {
    if (!portraitCache[name]) portraitCache[name] = Sprites.dataURL(name, 4);
    return portraitCache[name];
  }
  function showDialog(sprite, name, text, holdMs) {
    clearInterval(dlg.timer); clearTimeout(dlg.close);
    dlg.el.classList.remove('hidden');
    dlg.portrait.src = portrait(sprite);
    dlg.name.textContent = name;
    dlg.full = text; dlg.i = 0; dlg.text.textContent = '';
    dlg.timer = setInterval(() => {
      dlg.i++;
      dlg.text.textContent = dlg.full.slice(0, dlg.i);
      if (dlg.i % 3 === 0) Audio8.typeBlip();
      if (dlg.i >= dlg.full.length) finishTyping(holdMs);
    }, 28);
  }
  function finishTyping(holdMs) {
    clearInterval(dlg.timer); dlg.timer = null;
    dlg.text.textContent = dlg.full;
    dlg.i = dlg.full.length;
    clearTimeout(dlg.close);
    dlg.close = setTimeout(hideDialog, holdMs || 7000);
  }
  function hideDialog() {
    clearInterval(dlg.timer); clearTimeout(dlg.close);
    dlg.timer = null;
    dlg.el.classList.add('hidden');
  }
  dlg.el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dlg.timer) finishTyping(); else hideDialog();
  });

  /* =====================================================================
   *  LE SALON (CANVAS)
   * ===================================================================== */
  const canvas = $('room');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Positions des éléments du décor
  const POS = {
    pizza: { cx: 160, cy: 118, r: 20 },
    octave: { x: 124, y: 140 },
    janis: { x: 88, y: 124 },
    oliver: { x: 204, y: 114 },
    anna: { x: 238, y: 114 },
    laure: { x: 300, y: 124 },
    laureWin: { x: 102, y: 142 },
    throne: { x: 256, y: 140 },
    tv: { x: 10, y: 80 },
    boxStack: { x: 52, y: 122 },
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

  let BG = null;

  /* ---- Acteurs : les animaux qui se baladent dans le salon ---- */
  let actors = [];
  function syncActors(spawnFx) {
    for (const a of ANIMALS) {
      const n = Math.min(owned(a.id), a.cap);
      const cur = actors.filter((x) => x.id === a.id);
      for (let i = cur.length; i < n; i++) {
        const act = makeActor(a, i);
        actors.push(act);
        if (spawnFx) {
          const sz = Sprites.size(a.id);
          puff(act.x, act.y - sz.h / 2, ['#ffffff', '#c77dff', '#ffcf3f']);
          bubble(act, a.cry);
        }
      }
      if (cur.length > n) actors = actors.filter((x) => x.id !== a.id || x.idx < n);
    }
  }
  function makeActor(a, idx) {
    const fixedSpots = { idylle: [[66, 156], [294, 150], [36, 162]], july: [[POS.throne.x + 12, POS.throne.y - 15]] };
    const spot = fixedSpots[a.id] ? fixedSpots[a.id][idx % fixedSpots[a.id].length] : null;
    return {
      id: a.id, idx, def: a,
      x: spot ? spot[0] : rand(20, 300),
      y: spot ? spot[1] : rand(150, 176),
      dir: Math.random() < 0.5 ? -1 : 1,
      speed: a.speed * rand(0.8, 1.2),
      walking: a.speed > 0 && Math.random() < 0.7,
      timer: rand(1, 4),
      anim: Math.random() * 4,
      fixed: !!spot,
    };
  }
  function updateActors(dt) {
    for (const ac of actors) {
      ac.timer -= dt;
      if (!ac.fixed && ac.timer <= 0) {
        ac.walking = !ac.walking;
        ac.timer = ac.walking ? rand(1.5, 5) : rand(0.8, 3);
        if (ac.walking && Math.random() < 0.4) ac.dir *= -1;
      }
      if (ac.walking) {
        ac.x += ac.dir * ac.speed * dt;
        const half = Sprites.size(ac.id).w / 2;
        if (ac.x < 6 + half) { ac.x = 6 + half; ac.dir = 1; }
        if (ac.x > W - 6 - half) { ac.x = W - 6 - half; ac.dir = -1; }
      }
      ac.anim += dt * (ac.walking ? 7 : 1.6);
    }
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
      p.life -= dt;
      p.vy += p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    particles = particles.filter((p) => p.life > 0 && p.y < H + 5);
  }

  const floatersEl = $('floaters');
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

  /* ---- La grosse pizza ---- */
  const pizzaAnim = { t: 0 };
  function pizzaOffset() {
    if (pizzaAnim.t <= 0) return 0;
    const k = pizzaAnim.t / 0.22;
    return -Math.round(Math.sin(k * Math.PI) * 6);
  }

  /* ---- Pizza dorée (bonus aléatoire) ---- */
  let golden = null;
  let nextGolden = rand(40, 90);

  /* ---- Cinématique de victoire ---- */
  let cine = null;

  /* ---- Rendu ---- */
  let time = 0;
  function drawShadow(cx, y, w) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(Math.round(cx - w / 2), Math.round(y - 1), Math.round(w), 2);
    ctx.fillRect(Math.round(cx - w / 2 + 2), Math.round(y - 2), Math.round(w - 4), 4);
  }

  function drawHuman(name, x, y, phase, speed) {
    const sz = Sprites.size(name);
    const frame = Math.floor((time + phase) * (speed || 2)) % Sprites.frames(name);
    drawShadow(x, y, 12);
    Sprites.draw(ctx, name, x - sz.w / 2, y - sz.h, { frame });
  }

  function render() {
    ctx.drawImage(BG, 0, 0);

    // étoiles qui scintillent
    for (const [sx, sy, ph] of STARS) {
      const on = Math.sin(time * 2 + ph * 3) > -0.2;
      if (on) { ctx.fillStyle = Math.sin(time * 3 + ph) > 0.6 ? '#ffffff' : '#9fb0ff'; ctx.fillRect(sx, sy, 1, 1); }
    }

    // guirlande lumineuse néon
    for (let i = 0; i < 32; i++) {
      const x = 4 + i * 10;
      const y = 5 + Math.round(Math.sin(i * 0.9) * 1.5 + 1.5);
      ctx.fillStyle = '#0b0710'; ctx.fillRect(x - 4, y - 1, 10, 1);
      const cols = ['#ff2e7e', '#c77dff', '#ffcf3f', '#3ad6c5'];
      const on = (Math.floor(time * 2) + i) % 3 !== 0;
      ctx.fillStyle = on ? cols[(i + Math.floor(time)) % 4] : '#2a1a3a';
      ctx.fillRect(x, y, 2, 2);
    }

    // écran de la télé (anime en boucle)
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
    const boxes = Math.max(0, Math.min(10, Math.floor(Math.log10(S.total + 1) * 1.3)));
    for (let i = 0; i < boxes; i++) {
      Sprites.draw(ctx, 'box', POS.boxStack.x + ((i * 7) % 3) - 1, POS.boxStack.y - 6 - i * 4);
    }

    // trône de cartons de July
    if (owned('july') > 0) {
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
    if (hasM('janis')) ents.push({ y: POS.janis.y, draw: () => drawHuman('janis', POS.janis.x, POS.janis.y, 0.3) });
    if (hasM('oliver')) ents.push({ y: POS.oliver.y, draw: () => {
      drawHuman('oliver', POS.oliver.x, POS.oliver.y, 0.7, boostActive() ? 8 : 2);
      if (boostActive()) Sprites.draw(ctx, 'beer', POS.oliver.x + 4, POS.oliver.y - 26 + Math.round(Math.sin(time * 12) * 2));
    } });
    if (hasM('anna')) ents.push({ y: POS.anna.y, draw: () => drawHuman('anna', POS.anna.x, POS.anna.y, 1.1, 2.5) });
    if (hasM('laure') && !laureCine) {
      const p = POS.laureWin;
      ents.push({ y: p.y, draw: () => drawHuman('laure', p.x, p.y, 0.1, 1.2) });
    }
    ents.push({ y: POS.octave.y, draw: () => drawHuman('octave', POS.octave.x, POS.octave.y, 0, pizzaAnim.t > 0 ? 10 : 2) });

    // la pizza
    ents.push({ y: POS.pizza.cy + POS.pizza.r, draw: () => {
      const p = POS.pizza;
      const off = pizzaOffset() + Math.round(Math.sin(time * 2) * 1);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      const sw = 36 + off;
      ctx.fillRect(p.cx - sw / 2, p.cy + p.r - 1, sw, 3);
      ctx.fillRect(p.cx - sw / 2 + 3, p.cy + p.r - 2, sw - 6, 5);
      Sprites.draw(ctx, 'pizza', p.cx - 20, p.cy - 20 + off);
    } });

    for (const ac of actors) {
      ents.push({ y: ac.y, draw: () => {
        const sz = Sprites.size(ac.id);
        drawShadow(ac.x, ac.y, sz.w * 0.75);
        Sprites.draw(ctx, ac.id, ac.x - sz.w / 2, ac.y - sz.h, { frame: Math.floor(ac.anim), flip: ac.dir < 0 && !ac.fixed });
      } });
    }
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.draw());

    // pizza dorée
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

    // particules
    for (const p of particles) {
      ctx.fillStyle = p.col;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.sz, p.sz);
    }

    // effet clignotant de la Tournée Générale
    if (boostActive()) {
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

  /* =====================================================================
   *  CINÉMATIQUE DE VICTOIRE
   * ===================================================================== */
  function startCinematic() {
    cine = { t: 0, said: false, cheered: false };
    hideDialog();
    Audio8.laureTheme();
  }
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
      showDialog('laure', 'LAURE', "... Ta meute a un capital symbolique fascinant. Bourdieu n'avait pas prévu Chichi. ... On partage cette pizza ?", 6000);
      log('Laure a refermé son livre. Elle s\'approche. Elle... sourit ?!', 'laure');
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
      const txt = 'VICTOIRE !';
      const sc = 4;
      const tw = Sprites.textWidth(txt, sc);
      const col = ['#ffcf3f', '#ff2e7e', '#ffffff', '#c77dff'][Math.floor(t * 8) % 4];
      Sprites.drawText(ctx, txt, (W - tw) / 2 + 2, 22, '#0b0710', sc);
      Sprites.drawText(ctx, txt, (W - tw) / 2, 20, col, sc);
      const sub = 'LAURE A DIT OUI';
      Sprites.drawText(ctx, sub, (W - Sprites.textWidth(sub, 2)) / 2, 46, '#f4ecd8', 2);
    }
  }
  function easeInOut(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function endCinematic() {
    cine = null;
    S.victory = true;
    save();
    $('vicStats').textContent = 'Temps de jeu : ' + fmtDuration((Date.now() - S.started) / 1000) +
      ' · Pizzas récoltées : ' + fmt(S.total) + ' · Clics : ' + S.clicks.toLocaleString('fr-FR');
    $('victory').classList.remove('hidden');
  }

  /* =====================================================================
   *  INTERACTIONS
   * ===================================================================== */
  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }

  function clickPizza(x, y) {
    const v = clickValue();
    S.pizzas += v; S.total += v; S.clicks++;
    pizzaAnim.t = 0.22;
    Audio8.click();
    const p = POS.pizza;
    puff(x != null ? x : p.cx, y != null ? y : p.cy, ['#ffcf3f', '#e8a524', '#c0262d', '#d98b3a', '#fff1b0'], 10);
    floatText('+' + fmt(v) + ' 🍕', (x != null ? x : p.cx) + rand(-6, 6), (y != null ? y : p.cy) - 8);
    if (S.clicks === 1) log('Premier clic ! Octave attrape une part. La quête commence.', 'event');
    if (S.clicks % 500 === 0) log(S.clicks.toLocaleString('fr-FR') + ' clics. Le doigt d\'Octave atteint le niveau Haki.', 'event');
  }

  function catchGolden() {
    const reward = Math.max(pps(true) * 45, clickValue() * 60, 30);
    S.pizzas += reward; S.total += reward; S.golds++;
    Audio8.golden();
    puff(golden.x, golden.y, ['#fff6a8', '#ffd23f', '#ffffff'], 24);
    floatText('+' + fmt(reward) + ' ✨', golden.x, golden.y - 10, 'gold');
    log('PIZZA DORÉE ! Gilbert l\'a braquée à un livreur en scooter : +' + fmt(reward) + ' pizzas.', 'gold');
    golden = null;
    nextGolden = rand(50, 120);
  }

  canvas.addEventListener('pointerdown', (e) => {
    Audio8.unlock();
    const pt = canvasPoint(e);
    if (golden && Math.hypot(pt.x - golden.x, pt.y - golden.y) < 12) { catchGolden(); return; }
    const p = POS.pizza;
    if (Math.hypot(pt.x - p.cx, pt.y - (p.cy + pizzaOffset())) <= p.r + 4) { clickPizza(pt.x, pt.y); return; }
    // clic sur un animal : il réagit
    for (let i = actors.length - 1; i >= 0; i--) {
      const ac = actors[i]; const sz = Sprites.size(ac.id);
      if (pt.x > ac.x - sz.w / 2 && pt.x < ac.x + sz.w / 2 && pt.y > ac.y - sz.h && pt.y < ac.y) {
        animalSound(ac.def, 0.3);
        bubble(ac, ac.def.cry);
        return;
      }
    }
  });
  canvas.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); Audio8.unlock(); clickPizza(); }
  });

  function animalSound(a, vol) {
    if (a.sound === 'meow') Audio8.meow(a.pitch, vol); else Audio8.bark(a.pitch, vol);
  }

  /* ---- Achats ---- */
  function buyAnimal(a) {
    if (!isUnlocked(a)) return;
    const q = qtyFor(a);
    const cost = bulkCost(a, q);
    if (S.pizzas < cost) { Audio8.error(); return; }
    S.pizzas -= cost;
    const first = owned(a.id) === 0;
    S.animals[a.id] = owned(a.id) + q;
    animalSound(a);
    if (first) log(a.name + ' rejoint la meute ! ' + a.desc, 'buy');
    else log((q > 1 ? q + ' × ' : '') + a.name + ' de plus dans la coloc (total : ' + owned(a.id) + ').', 'buy');
    syncActors(true);
    refreshShop();
  }

  function buyManager(m) {
    if (hasM(m.id)) return;
    if (S.pizzas < m.cost) { Audio8.error(); return; }
    S.pizzas -= m.cost;
    S.managers[m.id] = true;
    if (m.id === 'laure') {
      log('Tu offres 1 MILLIARD de pizzas à Laure...', 'laure');
      startCinematic();
    } else {
      Audio8.manager();
      log(m.name + ' (' + m.role + ') débarque dans le salon ! ' + m.effect + '.', 'manager');
      const lines = {
        janis: "J'ai fait les comptes de la coloc. Avec moi, les croquettes coûtent 20% moins cher. Et j'ai planté du basilic sur le balcon.",
        anna: "Wesh la coloc ! Je poste une story avec la meute, ça va exploser. +35% de hype, minimum.",
        oliver: "Salut fiston ! J'ai ramené un pack de 24. Quand t'as besoin d'un coup de pouce, appuie sur le bouton bière. Santé !",
      };
      showDialog(m.id, m.name.toUpperCase(), lines[m.id], 6000);
      const pos = POS[m.id];
      puff(pos.x, pos.y - 8, ['#ffffff', '#c77dff', '#ffcf3f'], 18);
    }
    refreshShop();
  }

  function buyUpgrade(u) {
    if (hasU(u.id)) return;
    if (S.pizzas < u.cost) { Audio8.error(); return; }
    S.pizzas -= u.cost;
    S.upgrades[u.id] = true;
    Audio8.upgrade();
    log('Nouveau tattoo pour Octave : « ' + u.name + ' » (' + u.ref + ') — ' + u.effect + '.', 'upgrade');
    puff(POS.octave.x, POS.octave.y - 10, ['#6fc3ff', '#ffffff', '#ffcf3f'], 20);
    refreshShop();
  }

  function useOliver() {
    if (!hasM('oliver')) return;
    const now = Date.now();
    if (now < S.oliverReady) { Audio8.error(); return; }
    S.boostEnd = now + 15000;
    S.oliverReady = now + 60000;
    Audio8.skill();
    showDialog('oliver', 'OLIVER (le daron)', pick(OLIVER_ADVICE), 8000);
    log('Oliver lance une TOURNÉE GÉNÉRALE ! Production x3 pendant 15 secondes.', 'oliver');
    puff(POS.oliver.x, POS.oliver.y - 18, ['#f2a81d', '#ffffff', '#ffcf3f'], 22);
  }
  $('btnOliver').addEventListener('click', () => { Audio8.unlock(); useOliver(); });

  /* =====================================================================
   *  BOUTIQUE (DOM)
   * ===================================================================== */
  const shopRefs = { animals: [], managers: [], upgrades: [] };

  function isUnlocked(a) {
    const i = ANIMALS.indexOf(a);
    return i === 0 || owned(ANIMALS[i - 1].id) > 0 || owned(a.id) > 0 || S.total >= a.cost * 0.5;
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildShop() {
    const pa = $('panel-animals');
    ANIMALS.forEach((a) => {
      const item = el('div', 'item');
      item.setAttribute('role', 'button'); item.tabIndex = 0;
      const img = el('img', 'item-icon'); img.src = Sprites.dataURL(a.id, 3); img.alt = a.name;
      const mid = el('div');
      const name = el('div', 'item-name', a.name);
      const sub = el('div', 'item-sub', a.species);
      const desc = el('div', 'item-desc', a.desc);
      const eff = el('div', 'item-effect');
      const cost = el('div', 'item-cost');
      mid.append(name, sub, desc, eff, cost);
      const count = el('div', 'item-count', '0');
      item.append(img, mid, count);
      const act = () => { Audio8.unlock(); buyAnimal(a); };
      item.addEventListener('click', act);
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      pa.appendChild(item);
      shopRefs.animals.push({ a, item, name, sub, desc, eff, cost, count, locked: null });
    });

    const pm = $('panel-managers');
    MANAGERS.forEach((m) => {
      const item = el('div', 'item' + (m.boss ? ' boss' : ''));
      item.setAttribute('role', 'button'); item.tabIndex = 0;
      const img = el('img', 'item-icon'); img.src = Sprites.dataURL(m.id, 3); img.alt = m.name;
      const mid = el('div');
      mid.append(el('div', 'item-name', m.name), el('div', 'item-sub', m.role), el('div', 'item-desc', m.desc), el('div', 'item-effect', m.effect));
      const cost = el('div', 'item-cost');
      mid.appendChild(cost);
      const count = el('div', 'item-count', '');
      item.append(img, mid, count);
      const act = () => { Audio8.unlock(); buyManager(m); };
      item.addEventListener('click', act);
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      pm.appendChild(item);
      shopRefs.managers.push({ m, item, cost, count });
    });

    const pu = $('panel-upgrades');
    UPGRADES.forEach((u) => {
      const item = el('div', 'item');
      item.setAttribute('role', 'button'); item.tabIndex = 0;
      const img = el('img', 'item-icon'); img.src = Sprites.dataURL(u.icon, 3); img.alt = u.name;
      const mid = el('div');
      mid.append(el('div', 'item-name', u.name), el('div', 'item-sub', u.ref), el('div', 'item-desc', u.desc), el('div', 'item-effect', u.effect));
      const cost = el('div', 'item-cost');
      mid.appendChild(cost);
      const count = el('div', 'item-count', '');
      item.append(img, mid, count);
      const act = () => { Audio8.unlock(); buyUpgrade(u); };
      item.addEventListener('click', act);
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      pu.appendChild(item);
      shopRefs.upgrades.push({ u, item, cost, count });
    });

    // onglets
    document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
      ['animals', 'managers', 'upgrades'].forEach((id) => $('panel-' + id).classList.toggle('hidden', id !== t.dataset.tab));
      $('buyMode').classList.toggle('hidden', t.dataset.tab !== 'animals');
    }));
    // mode d'achat x1 / x10 / MAX
    document.querySelectorAll('#buyMode .px-btn').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('#buyMode .px-btn').forEach((x) => x.classList.toggle('active', x === b));
      buyQty = b.dataset.qty === 'max' ? 'max' : +b.dataset.qty;
      refreshShop();
    }));
  }

  function refreshShop() {
    for (const r of shopRefs.animals) {
      const a = r.a;
      const unlocked = isUnlocked(a);
      if (r.locked !== !unlocked) {
        r.locked = !unlocked;
        r.item.classList.toggle('locked', !unlocked);
        r.name.textContent = unlocked ? a.name : '???';
        r.sub.textContent = unlocked ? a.species : 'Membre mystère';
        r.desc.textContent = unlocked ? a.desc : 'Continue de récolter des pizzas pour découvrir ce membre de la meute.';
      }
      const q = qtyFor(a);
      const c = bulkCost(a, q);
      const can = unlocked && S.pizzas >= c;
      r.eff.textContent = unlocked ? '+' + fmtRate(unitPps(a)) + ' PPS chacun' : '';
      r.cost.textContent = unlocked ? (q > 1 ? 'x' + q + ' : ' : '') + fmt(c) + ' 🍕' : '';
      r.cost.classList.toggle('no', !can);
      r.count.textContent = owned(a.id);
      r.item.classList.toggle('can', can);
      r.item.classList.toggle('cannot', unlocked && !can);
    }
    for (const r of shopRefs.managers) {
      const own = hasM(r.m.id);
      const can = !own && S.pizzas >= r.m.cost;
      r.cost.textContent = own ? 'RECRUTÉ ✓' : fmt(r.m.cost) + ' 🍕';
      r.cost.classList.toggle('no', !own && !can);
      r.count.textContent = own ? '★' : '';
      r.item.classList.toggle('owned', own);
      r.item.classList.toggle('can', can);
      r.item.classList.toggle('cannot', !own && !can);
    }
    for (const r of shopRefs.upgrades) {
      const own = hasU(r.u.id);
      const can = !own && S.pizzas >= r.u.cost;
      r.cost.textContent = own ? 'TATOUÉ ✓' : fmt(r.u.cost) + ' 🍕';
      r.cost.classList.toggle('no', !own && !can);
      r.count.textContent = own ? '★' : '';
      r.item.classList.toggle('owned', own);
      r.item.classList.toggle('can', can);
      r.item.classList.toggle('cannot', !own && !can);
    }
  }

  /* ---- HUD ---- */
  function refreshHud() {
    $('pizzaCount').textContent = fmt(S.pizzas);
    $('ppsCount').textContent = fmtRate(pps(true)) + '/s';
    $('clickCount').textContent = '+' + fmt(clickValue());
    document.title = fmt(S.pizzas) + ' 🍕 · Octave Tycoon — Doggy Party';

    const pct = hasM('laure') ? 100 : Math.min(100, S.pizzas / 1e9 * 100);
    $('laureBar').style.width = pct + '%';
    $('laurePct').textContent = hasM('laure') ? '♥ 100%' : (pct < 1 ? pct.toFixed(2) : pct.toFixed(1)) + '%';

    const ob = $('btnOliver');
    ob.classList.toggle('hidden', !hasM('oliver'));
    if (hasM('oliver')) {
      const now = Date.now();
      const ready = now >= S.oliverReady;
      ob.disabled = !ready;
      ob.classList.toggle('ready', ready);
      $('oliverLabel').textContent = ready ? 'TOURNÉE GÉNÉRALE !' : 'RECHARGE ' + Math.ceil((S.oliverReady - now) / 1000) + 's';
    }
    const boosting = boostActive();
    $('boostBanner').classList.toggle('hidden', !boosting);
    $('stage').classList.toggle('boost', boosting);
    if (boosting) $('boostTime').textContent = Math.ceil((S.boostEnd - Date.now()) / 1000);
    $('btnMute').textContent = S.muted ? '♪ OFF' : '♪ ON';
  }

  /* =====================================================================
   *  ÉVÉNEMENTS D'AMBIANCE
   * ===================================================================== */
  function flavorPool() {
    const p = [
      "Octave regarde l'épisode 1015 de One Piece pour la quatrième fois.",
      'Un livreur hésite devant la porte de la coloc. Il a peur.',
      'Une odeur de 4 fromages flotte dans le salon.',
      'Le voisin du dessous tape au plafond avec un balai.',
      'Octave relit Akira tome 3. Il pleure un peu. Personne ne le saura.',
      "Il pleut sur Montpellier. C'est rare. Tout le monde est choqué.",
    ];
    if (owned('chichi')) p.push('Chichi aboie sur un carton vide. Victoire morale.', 'Chichi tremble. Personne ne sait si c\'est le froid ou l\'excitation.');
    if (owned('saphire')) p.push('Saphire a retrouvé une part de calzone de 2019 sous le canapé.');
    if (owned('bouba')) p.push("Bouba s'est assis sur la télécommande. Personne ne la récupérera.", 'Bouba ramène une boîte familiale. Intacte. Mystère.');
    if (owned('gilbert')) p.push("Gilbert a volé le casque d'un livreur. Personne ne sait pourquoi.", 'Gilbert fixe le mur. Il sait quelque chose.');
    if (owned('idylle')) p.push('Idylle range les mangas par ordre alphabétique. Puis par tome. Puis par couleur.');
    if (owned('july')) p.push('July la Queen exige que sa part lui soit servie sur un coussin.', 'July la Queen a destitué Gilbert. Il prépare sa vengeance.');
    if (hasM('janis')) p.push('Janis fait une confiture de figues maison. La coloc sent la campagne.');
    if (hasM('anna')) p.push("Anna filme un TikTok devant le poster d'Akira. 2,3 M de vues.", 'Anna a renommé le Wi-Fi « BADDIE_COLOC_5G ».');
    if (hasM('oliver')) p.push('Oliver ouvre une bière avec un briquet. Puis une autre avec un manga.', 'Oliver raconte (encore) son voyage à Palavas en 1994.');
    if (!hasM('laure')) p.push('Au loin, Laure souligne un passage de « La Distinction ». Elle ne t\'a pas vu.', 'Laure a liké une photo de Bouba. Est-ce un signe ?', 'Laure porte un nouveau ras-de-cou. Octave fait semblant de ne pas avoir remarqué.');
    else p.push("Laure explique le concept d'habitus à Chichi. Chichi semble convaincu.", 'Laure et Octave débattent : Akira ou Bourdieu ? Match nul.');
    return p;
  }
  let nextFlavor = rand(20, 40);
  let nextCry = rand(10, 20);

  function checkMilestones() {
    while (S.milestone < MILESTONES.length && S.total >= MILESTONES[S.milestone][0]) {
      log('★ ' + MILESTONES[S.milestone][1], 'laure');
      S.milestone++;
    }
  }

  /* =====================================================================
   *  BOUCLE DE JEU
   * ===================================================================== */
  let last = performance.now();
  let lastProd = Date.now();
  let uiAcc = 0, saveAcc = 0;

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    time += dt;

    // production (en temps réel, même si l'onglet est en arrière-plan)
    const nowMs = Date.now();
    const elapsed = Math.min(3600, (nowMs - lastProd) / 1000);
    lastProd = nowMs;
    const gain = pps(true) * elapsed;
    S.pizzas += gain; S.total += gain;

    if (pizzaAnim.t > 0) pizzaAnim.t = Math.max(0, pizzaAnim.t - dt);
    updateActors(dt);
    updateParticles(dt);

    // pizza dorée
    if (golden) {
      golden.life -= dt;
      if (golden.life <= 0) { golden = null; nextGolden = rand(50, 120); }
    } else if (!cine) {
      nextGolden -= dt;
      if (nextGolden <= 0) {
        golden = { x: rand(30, 290), y: rand(70, 100), life: 9 };
        log('Une PIZZA DORÉE flotte dans le salon ! Clique vite dessus !', 'gold');
      }
    }

    // ambiance
    nextFlavor -= dt;
    if (nextFlavor <= 0) { log(pick(flavorPool()), 'event'); nextFlavor = rand(30, 60); }
    nextCry -= dt;
    if (nextCry <= 0) {
      nextCry = rand(12, 25);
      if (actors.length && !cine) { const ac = pick(actors); animalSound(ac.def, 0.12); bubble(ac, ac.def.cry); }
    }

    if (cine) {
      cine.t += dt;
      if (cine.t >= 13) endCinematic();
    }

    render();

    uiAcc += dt;
    if (uiAcc >= 0.1) { uiAcc = 0; refreshHud(); refreshShop(); checkMilestones(); }
    saveAcc += dt;
    if (saveAcc >= 15) { saveAcc = 0; save(); }

    requestAnimationFrame(frame);
  }

  /* =====================================================================
   *  INITIALISATION
   * ===================================================================== */
  function init() {
    BG = buildBackground();
    $('pizzaIcon').src = Sprites.dataURL('pizzaMini', 3);
    $('beerIcon').src = Sprites.dataURL('beer', 2);
    $('vicOctave').src = Sprites.dataURL('octave', 6);
    $('vicLaure').src = Sprites.dataURL('laure', 6);
    $('vicHeart').src = Sprites.dataURL('heart', 6);
    buildShop();

    const hadSave = load();
    Audio8.setMuted(S.muted);
    syncActors(false);

    if (!hadSave) {
      log('Montpellier, 23h47. Salon de la coloc. Odeur de carton tiède.', 'sys');
      log('Octave, maître-chien au chômage, a un plan : 1 MILLIARD de pizzas pour impressionner Laure.', 'laure');
      log('Clique sur la grosse pizza pour commencer la récolte !', 'event');
      setTimeout(() => showDialog('octave', 'OCTAVE', "Laure... un jour tu remarqueras ma meute. Et mes pizzas. Un milliard de pizzas. Allez, au boulot !", 6000), 600);
    } else {
      log('Partie chargée. La meute t\'attendait (et elle a faim).', 'sys');
      // gains hors-ligne (upgrade Toy Story)
      const away = (Date.now() - S.lastSave) / 1000;
      if (hasU('infinity') && away > 10) {
        const secs = Math.min(away, 86400);
        const gain = pps(false) * secs;
        S.pizzas += gain; S.total += gain;
        log('Vers l\'infini et au-delà ! Pendant ton absence (' + fmtDuration(secs) + '), la meute a récolté ' + fmt(gain) + ' pizzas.', 'upgrade');
        setTimeout(() => showDialog('octave', 'OCTAVE', 'Pendant mon absence (' + fmtDuration(secs) + '), la meute a ramené ' + fmt(gain) + ' pizzas. Bons chiens.', 6000), 600);
      }
      // une partie gagnée reste gagnée, mais on ne rejoue pas la cinématique
      if (hasM('laure')) S.victory = true;
    }
    lastProd = Date.now();
    refreshShop(); refreshHud();
    requestAnimationFrame((t) => { last = t; requestAnimationFrame(frame); });
  }

  /* ---- Boutons système ---- */
  $('btnMute').addEventListener('click', () => {
    S.muted = !S.muted;
    Audio8.setMuted(S.muted);
    if (!S.muted) { Audio8.unlock(); Audio8.click(); }
    refreshHud();
  });
  $('btnSave').addEventListener('click', () => save(true));
  $('btnReset').addEventListener('click', () => {
    if (!confirm('Tout recommencer ? La meute, les colocs et les tattoos seront perdus.')) return;
    resetting = true;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* stockage bloqué */ }
    location.reload();
  });
  $('btnContinue').addEventListener('click', () => {
    $('victory').classList.add('hidden');
    log('La party continue. Production x10 000. Laure reste. ♥', 'laure');
  });
  document.addEventListener('pointerdown', () => Audio8.unlock(), { once: true });
  window.addEventListener('beforeunload', () => save());
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  // Outils de test dans la console : DoggyParty.give(1e6)
  window.DoggyParty = {
    give(n) { S.pizzas += n; S.total += n; },
    state: () => S,
  };

  init();
})();
