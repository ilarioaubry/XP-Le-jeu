/* =====================================================================
 *  DOGGY PARTY — Octave Tycoon : La Quête de Laure
 *  characters.js — Les 6 animaux et les 5 humains de la coloc
 *  Dessinés en code avec le moteur de pixel art de sprites.js
 *  (formes + ombrage automatique + contour), d'après les vraies photos.
 *  Les animaux regardent vers la droite ; le jeu les retourne si besoin.
 *  Animaux : 4 images [repos A, repos B, marche A, marche B].
 *  Humains : 3 images [repos, clignement, respiration].
 * ===================================================================== */
(function (global) {
  'use strict';

  const { Grid, define, inEll: E, inPoly: Pg, inRect: R } = global.Sprites;

  /* Jeux de 3 tons (base, lumière, ombre) */
  const T = (b, h, d) => ({ b, h, d });
  const PRI = T('B', 'H', 'D');   // pelage principal
  const SEC = T('T', 'V', 'U');   // pelage secondaire (feu, orange foncé…)
  const WHT = T('W', 'Y', 'X');   // blanc
  const FAR = T('D', 'D', 'D');   // pattes lointaines, plus sombres

  /* Démarche : décalage des pattes selon l'image */
  const stride = (f) => (f === 2 ? 2 : f === 3 ? -2 : 0);

  function leg(g, x, top, bot, w, dx, pal, paw) {
    const b = bot - (dx > 0 ? 1 : 0);
    g.shade(Pg([[x, top], [x + w, top], [x + w + dx, b], [x + dx, b]]), pal);
    if (paw) g.fill(R(x + dx, b - 2, w, 2), paw);
  }

  /* =====================================================================
   *  1. CHICHI — chihuahua merle, bien enrobé, assis sur son gros derrière (il ne bouge pas)
   * ===================================================================== */
  function chichi(f) {
    const g = new Grid(28, 26), alt = f % 2;
    // petite queue en tire-bouchon derrière
    g.shade(Pg([[3.8, 22], [1.4, 20.4], [1.2, 17.2], [3, 16.2], [3.4, 18.4], [4.6, 20]]), PRI);
    g.fill(R(1.6, 16.6, 1.6, 1.4), 'A');
    // énorme corps en poire
    g.shade(E(11, 17.6, 8.8, 7.6), PRI);
    g.shade(E(7, 21.6, 4.6, 3.6), T('D', 'B', 'D'));                 // cuisse repliée
    g.shade(E(11.4, 24.4, 3.8, 1.6), SEC);                            // patte arrière tendue
    g.recolor(E(15.6, 18.4, 3.6, 5), { B: 'W', H: 'Y', D: 'X' });     // gros ventre blanc
    // pattes avant
    g.shade(Pg([[12.4, 19], [15.4, 19], [15.6, 25.4], [12.2, 25.4]]), FAR);
    g.shade(Pg([[15.2, 18.6], [18.6, 18.6], [18.8, 25.4], [15, 25.4]]), PRI);
    g.fill(R(15, 23.8, 3.8, 1.8), 'T'); g.fill(R(12.2, 24, 3.2, 1.6), 'U');
    // double menton, tête ronde, museau
    g.shade(E(18.2, 13.4, 4.2, 2.6), PRI);
    g.shade(E(18.4, 9.6, 5.6, 5), PRI);
    g.shade(E(22.8, 11.8, 3, 2.3), SEC);
    // oreilles
    g.shade(Pg([[14.8, 7.6], [13.4, 1.4], [18.6, 5.2]]), FAR);
    g.shade(Pg([[19, 5.2 + (alt ? 0.6 : 0)], [22.6, 0.6 + (alt ? 0.6 : 0)], [24.4, 7.2]]), PRI);
    g.fill(Pg([[20.2, 5.6], [22.4, 2.4], [23.2, 6.6]]), 'P');
    // taches merle
    const m = { B: 'A', H: 'a', D: 'Z' };
    g.recolor(E(8.4, 15, 3.2, 2.6), m);
    g.recolor(E(12.6, 21, 2.2, 1.8), m);
    g.recolor(E(5, 19.4, 1.8, 1.6), m);
    g.recolor(E(16.4, 7.4, 2.2, 2.2), m);
    // bourrelets
    for (const [x, y] of [[9, 12], [8, 13], [8, 14], [9, 15], [4, 18], [4, 19], [5, 20]]) g.fill(R(x, y, 1, 1), 'D', 'BHAa');
    // visage
    g.fill(R(19.6, 6, 3, 1), 'T', 'BHDA');
    g.fill(R(20.4, 7.6, 2, 2), 'E'); g.px(20.4, 7.6, 'w');
    g.fill(R(24.8, 10.4, 2, 2), 'N');
    g.fill(R(21, 13.4, 4.4, 1), 'u');
    if (alt) g.fill(R(23, 13.8, 2, 2), 'P');                          // langue pendante
    g.fill(R(14.2, 12.8, 3.8, 1.6), 'R'); g.px(16, 14.6, 'G');        // collier qui serre
    return g.outline();
  }

  /* =====================================================================
   *  2. SAPHIRE — spitz blanc tout duveteux, collier bleu saphir
   * ===================================================================== */
  function saphire(f) {
    const g = new Grid(32, 26), s = stride(f), alt = f % 2;
    // gros panache de queue
    g.shade(E(7, 11 + (alt ? 0.6 : 0), 4.6, 5.4), WHT);
    g.shade(E(10, 14, 4, 4), WHT);
    leg(g, 10.5, 18, 25, 2.6, s, T('X', 'X', 'X'), 'X');
    leg(g, 19, 18, 25, 2.6, -s, T('X', 'X', 'X'), 'X');
    g.shade(E(15, 17, 9.2, 5.2), WHT);
    g.shade(E(21.4, 17, 4.6, 4.8), WHT);                      // gros jabot
    leg(g, 8, 19, 25, 2.8, -s, WHT, 'Y');
    leg(g, 20.5, 19, 25, 2.8, s, WHT, 'Y');
    g.shade(E(23.4, 12.4, 4, 4), WHT);
    g.shade(E(24.4, 10.4, 5.2, 4.8), WHT);                    // tête
    g.shade(E(28.8, 12.4, 2.6, 2), WHT);                      // museau
    // oreilles de renard
    g.shade(Pg([[21, 8], [20.6, 2.4], [25, 6]]), T('X', 'W', 'X'));
    g.shade(Pg([[25.4, 6], [28.4, 2.2], [29.4, 8.4]]), WHT);
    g.fill(Pg([[26.4, 6.4], [28.2, 3.8], [28.8, 7.6]]), 'P');
    // crème sous le ventre
    g.recolor(E(14, 20.4, 6, 1.4), { W: 'X', Y: 'X' });
    g.fluff('WYX', 11 + f, 0.34);
    // visage
    g.fill(R(25.4, 9, 2, 2), 'E'); g.px(25, 9, 'w'); g.px(25.4, 9, 'w');
    g.fill(R(30, 11, 2, 2), 'N');
    g.fill(R(27, 14, 4, 1), 'u');
    if (alt) g.fill(R(29, 14, 2, 2), 'P');
    // collier bleu saphir
    g.fill(R(20.6, 13.8, 3.6, 1.6), 'C'); g.px(22, 15, 'S'); g.px(22, 16, 'S');
    return g.outline();
  }

  /* =====================================================================
   *  3. BOUBA — le tank : long poil noir, bottes feu, casque de chantier jaune
   * ===================================================================== */
  function bouba(f) {
    const g = new Grid(34, 26), s = stride(f), alt = f % 2;
    g.shade(E(5.5, 12 + (alt ? 0.8 : 0), 4.2, 5.8), PRI);                 // queue en panache
    leg(g, 11, 17, 25, 3, s, FAR, 'U');
    leg(g, 21, 17, 25, 3, -s, FAR, 'U');
    g.shade(E(16, 16.4, 11, 6), PRI);
    g.shade(E(9, 18, 4, 4.4), PRI);                                       // cuisse
    g.recolor(E(23.6, 18, 3.4, 4), { B: 'T', H: 'V', D: 'U' });           // poitrail feu
    leg(g, 7, 19, 25, 3.2, -s, SEC, 'U');
    leg(g, 22, 19, 25, 3.2, s, SEC, 'U');
    g.shade(E(25.6, 13, 4.2, 4), PRI);
    g.shade(E(27, 10.4, 5.6, 5), PRI);                                    // tête
    g.shade(E(31.2, 12.4, 2.8, 2.4), T('G', 'G', 'Z'));                   // museau gris
    // oreilles tombantes de chaque côté du casque
    g.shade(Pg([[22.6, 8.4], [21.2, 14.6], [24.8, 13.8], [25.4, 9]]), T('D', 'B', 'D'));
    g.shade(Pg([[30.4, 8.4], [32.8, 14.6], [29.4, 13.8], [28.6, 9]]), PRI);
    g.fluff('BHD', 5 + f, 0.42);
    // casque de chantier
    g.shade(Pg([[21.8, 8], [22.4, 4.6], [24.6, 2.8], [27.2, 2.2], [29.8, 2.8], [31.6, 4.6], [32.2, 8]]), T('J', 'j', 'k'));
    g.shade(Pg([[20.4, 7.8], [33.6, 7.8], [33.2, 9.4], [20.8, 9.4]]), T('J', 'j', 'k'));  // visière
    g.fill(R(26.4, 2.4, 1.6, 5.4), 'k');                                  // arête centrale
    g.px(25, 4, 'j'); g.px(25, 5, 'j');
    // visage sous la visière
    g.fill(R(27, 10, 2, 2), 'Q'); g.px(27, 10, 'w');
    g.fill(R(32, 11, 2, 2), 'N');
    g.fill(R(28, 14.4, 4, 1), 'u');
    if (alt) g.fill(R(30, 15, 2, 2), 'P');
    g.fill(R(22.8, 14, 3.6, 1.6), 'R'); g.px(24, 15.6, 'G');              // collier
    return g.outline();
  }

  /* =====================================================================
   *  4. GILBERT — petit chat roux tout fin, rayé, queue en point d'interrogation
   * ===================================================================== */
  function gilbert(f) {
    const g = new Grid(32, 28), s = stride(f), alt = f % 2;
    // queue fine qui se recourbe
    g.shade(Pg([[5.6, 15], [2.8, 12.6], [2, 8.6], [3.4, 4.2], [6, 3.4], [6.6, 4.6], [4.8, 6], [4.2, 9.4], [6.4, 12], [7.4, 14.4]]), PRI);
    g.fill(R(5.5, 3.5, 1.5, 1.5), 'W');                       // bout de queue clair
    if (alt) g.fill(R(6.5, 3.5, 1, 1), 'W');
    leg(g, 10, 17, 27, 2, s, FAR, 'W');
    leg(g, 20, 17, 27, 2, -s, FAR, 'W');
    g.shade(E(14.4, 16, 9.4, 3.5), PRI);                      // corps tout fin
    g.shade(E(8.4, 17.4, 2.6, 3.4), PRI);
    leg(g, 7, 18, 27, 2, -s, PRI, 'W');
    leg(g, 21, 18, 27, 2, s, PRI, 'W');
    g.recolor(E(22, 17.4, 2.4, 1.8), { B: 'W', H: 'Y', D: 'X' }); // plastron clair
    g.shade(E(24.4, 11.4, 4.6, 4.4), PRI);                    // tête ronde
    g.shade(E(27.4, 12.4, 2.2, 1.6), WHT);                    // menton clair
    g.shade(Pg([[21.2, 9], [21, 2.4], [25, 6.4]]), FAR);      // oreilles
    g.shade(Pg([[25.4, 6.2], [29.2, 2.2], [29, 9.6]]), PRI);
    g.fill(Pg([[26.4, 6.6], [28.6, 4.2], [28.4, 8]]), 'P');
    // rayures tigrées
    for (const x of [9, 12, 15, 18]) g.recolor(R(x, 12.6, 1, 3.4), { B: 'U', H: 'U', D: 'U' });
    for (const x of [6, 7.6]) g.recolor(R(x, 15, 1, 3), { B: 'U', H: 'U', D: 'U' });
    g.recolor(R(23.6, 7, 1, 2.4), { B: 'U', H: 'U', D: 'U' });
    g.recolor(R(25.4, 7, 1, 2.4), { B: 'U', H: 'U', D: 'U' });
    // visage
    g.fill(R(25.4, 10, 2, 2), 'E'); g.px(26, 10, 'N'); g.px(26, 11, 'N'); g.px(25, 10, 'w');
    g.px(28, 11, 'P'); g.px(29, 11, 'P');                     // nez rose
    g.fill(R(28, 13, 2, 1), 'u');
    g.line(30, 11, 31, 10, 'w'); g.line(30, 13, 31, 14, 'w'); // moustaches
    return g.outline();
  }

  /* =====================================================================
   *  5. IDYLLE — pékinois marron clair, crinière de lion, gilet de dressage
   * ===================================================================== */
  function idylle(f) {
    const g = new Grid(30, 22), alt = f % 2;
    // panache de queue enroulé sur le dos
    g.shade(E(7, 9.4 + (alt ? -0.6 : 0), 4.8, 3.8), PRI);
    g.shade(E(10.4, 7.8, 3.4, 2.8), PRI);
    // pattes lointaines
    g.shade(E(9.4, 20, 2.6, 2.2), T('D', 'D', 'D'));
    g.shade(E(20.6, 20, 2.6, 2.2), T('D', 'D', 'D'));
    // corps long et bas, tout en poils
    g.shade(E(13.4, 15.2, 10.8, 5.4), PRI);
    g.shade(E(7.6, 20, 3, 2.4), PRI);
    g.shade(E(18.6, 20.2, 3, 2.2), PRI);
    // crinière de lion
    g.shade(E(20.6, 12.6, 5.8, 6.2), PRI);
    g.recolor(E(20.4, 16.4, 3.6, 3), { B: 'W', H: 'Y', D: 'X' });
    // gilet de dressage
    g.shade(Pg([[9.4, 10.4], [15.8, 10.4], [16.2, 14.6], [9.8, 14.8]]), SEC);
    g.px(12.6, 12.4, 'G');
    // tête et masque noir écrasé
    g.shade(E(23.4, 11.2, 5, 4.7), PRI);
    g.fill(E(25.4, 12.6, 3.9, 3.1), 'A');
    // longues oreilles à franges
    g.shade(Pg([[19.4, 7], [22, 6.6], [22, 14.4], [19.6, 18], [17.8, 14]]), T('D', 'D', 'D'));
    g.fluff('BHDWYX', 21 + f, 0.4);
    // visage : gros yeux, mini truffe haute, bouche renfrognée
    g.fill(R(23.4, 9.6, 2, 2), 'E'); g.px(23.4, 9.6, 'w');
    g.fill(R(27, 9.6, 2, 2), 'E'); g.px(27, 9.6, 'w');
    g.fill(R(25.4, 11.6, 2, 1), 'N');
    g.fill(R(24, 14.4, 4.6, 1), 'u'); g.px(23.4, 13.6, 'u'); g.px(28.6, 13.6, 'u');
    if (alt) g.fill(R(25.6, 15.4, 2, 2), 'P');
    return g.outline();
  }

  /* =====================================================================
   *  6. JULY LA QUEEN — chat persan à la face écrasée, regard blasé, couronne et cape
   * ===================================================================== */
  function july(f) {
    const g = new Grid(32, 32), alt = f % 2;
    g.shade(Pg([[6, 18], [26, 18], [30, 31], [2, 31]]), T('M', 'm', 'n'));  // cape
    g.shade(E(26, 27, 3.6, 3), PRI);                                       // queue
    g.shade(E(16, 25, 9.6, 6.8), PRI);                                     // corps
    g.recolor(E(16, 26, 5, 4.6), { B: 'W', H: 'Y', D: 'X' });
    g.shade(E(12, 29.6, 2.8, 2.2), WHT);
    g.shade(E(20, 29.6, 2.8, 2.2), WHT);
    // tête énorme, large et écrasée, grosses bajoues
    g.shade(E(16, 13, 11, 7.6), PRI);
    g.shade(E(9.6, 18.2, 4.4, 3), PRI);
    g.shade(E(22.4, 18.2, 4.4, 3), PRI);
    g.shade(Pg([[7.4, 9], [6.6, 3.8], [11.6, 6.8]]), PRI);                // petites oreilles
    g.shade(Pg([[24.6, 9], [25.4, 3.8], [20.4, 6.8]]), PRI);
    g.fill(Pg([[8.4, 8.6], [8.2, 5.4], [10.8, 7.2]]), 'P');
    g.fill(Pg([[23.6, 8.6], [23.8, 5.4], [21.2, 7.2]]), 'P');
    // masque abricot tassé autour du nez
    g.recolor(E(16, 14.2, 7, 4.6), { B: 'T', H: 'V', D: 'U' });
    g.recolor(E(10.4, 18.2, 3, 2), { B: 'T', H: 'V', D: 'U' });
    g.recolor(E(21.6, 18.2, 3, 2), { B: 'T', H: 'V', D: 'U' });
    g.fluff('BHDTVU', 3, 0.34);
    // couronne
    g.shade(Pg([[11, 7], [11, 2.6], [13.6, 5], [16, 1.4], [18.4, 5], [21, 2.6], [21, 7]]), T('G', 'J', 'g'));
    g.px(16, 4, 'R'); g.px(13, 5.6, 'C'); g.px(19, 5.6, 'C');
    // gros yeux ronds collés au nez, sourcils plissés
    for (const x of [10.6, 18.4]) {
      g.fill(R(x, 10.4, 3, 3), 'Q'); g.fill(R(x + 1, 11, 1, 2), 'E'); g.px(x, 10.4, 'w');
    }
    g.fill(Pg([[9.2, 8.6], [14.2, 10.4], [14.2, 9.4], [9.2, 7.6]]), 'U');
    g.fill(Pg([[22.8, 8.6], [17.8, 10.4], [17.8, 9.4], [22.8, 7.6]]), 'U');
    g.px(15, 8.6, 'U'); g.px(16, 8.6, 'U'); g.px(15, 9.6, 'U');           // pli entre les yeux
    // nez minuscule, presque entre les yeux, larmes de persan
    g.px(15, 13, 'P'); g.px(16, 13, 'P');
    g.px(11.4, 13.8, 'U'); g.px(11.4, 14.8, 'U'); g.px(11.4, 15.8, 'U');
    g.px(20.6, 13.8, 'U'); g.px(20.6, 14.8, 'U'); g.px(20.6, 15.8, 'U');
    // moue de dégoût : bouche en arc vers le bas, bajoues
    g.px(15, 14.6, 'u'); g.px(16, 14.6, 'u');
    g.px(14, 15.4, 'u'); g.px(17, 15.4, 'u'); g.px(13, 16.2, 'u'); g.px(18, 16.2, 'u');
    g.px(12, 17, 'u'); g.px(19, 17, 'u');
    // collier doré à rubis
    g.fill(R(11.6, 20.4, 8.8, 1.2), 'G'); g.fill(R(15, 21.2, 2, 2), 'R');
    if (alt) { g.px(6, 15, 'w'); g.px(26, 15, 'w'); }
    return g.outline();
  }

  const ANIMAL_PAL = {
    chichi: { B: '#8d90a0', H: '#b9bccb', D: '#585a6e', A: '#2c2c3a', a: '#4a4a5c', Z: '#1a1a24',
      T: '#c98a4e', V: '#e5b078', U: '#8f5a2c', W: '#efe8de', Y: '#ffffff', X: '#c9c0b8',
      E: '#120a10', N: '#0a060c', P: '#e08a9a', R: '#d7263d', u: '#5a3a28' },
    saphire: { W: '#f6f1ea', Y: '#ffffff', X: '#d6cdc3', E: '#14101a', N: '#0a060c', P: '#e8a0ae',
      C: '#2a6bff', S: '#6fc3ff', u: '#7a6a5c' },
    bouba: { B: '#241e2a', H: '#453c52', D: '#120e18', T: '#b8743a', V: '#d9a066', U: '#7a4a24',
      G: '#8a8590', Z: '#5a5662', Q: '#9a5a2a', N: '#050308', P: '#d87a8a', R: '#d7263d', u: '#3a2a30',
      J: '#ffcf1f', j: '#fff27a', k: '#c8960a' },
    gilbert: { B: '#e8892b', H: '#f7b25a', D: '#b85c17', U: '#a84c14', W: '#fbeed8', Y: '#ffffff', X: '#d8c8a8',
      E: '#49d65a', N: '#0a060c', P: '#f08aa0', u: '#7a3a14', w: '#ffffff' },
    idylle: { B: '#d9a96b', H: '#efcb94', D: '#a97a40', W: '#f6e4bc', Y: '#fff4d8', X: '#d8bf90',
      A: '#3b2a22', E: '#0a0608', N: '#0a0608', P: '#e08a9a', u: '#5a3a28', w: '#ffffff',
      T: '#c0262d', V: '#e5505f', U: '#8c1023', G: '#ffd23f' },
    july: { B: '#efc79a', H: '#fbe0bc', D: '#cf9c6c', T: '#e0a068', V: '#f0b884', U: '#a8602c',
      W: '#fbf0dc', Y: '#ffffff', X: '#dcc8a8', Q: '#e8a010', E: '#1a0a10', P: '#f08aa0', u: '#7a4a2a',
      M: '#7b2cbf', m: '#a55ae0', n: '#4a1a7a', G: '#ffd23f', J: '#fff08a', g: '#b8861b', R: '#d7263d', C: '#6fc3ff' },
  };
  const animals = { chichi, saphire, bouba, gilbert, idylle, july };
  const dims = { chichi: [28, 26], saphire: [32, 26], bouba: [34, 26], gilbert: [32, 28], idylle: [30, 22], july: [32, 32] };
  Object.keys(animals).forEach((id) => {
    const fn = animals[id];
    define(id, {
      w: dims[id][0], h: dims[id][1], palette: Object.assign({ w: '#ffffff' }, ANIMAL_PAL[id]),
      frames: [0, 1, 2, 3].map((f) => () => fn(f)),
    });
  });

  /* =====================================================================
   *  LES HUMAINS (face, gabarit chibi 24x32)
   *  Chaque personne = jambes + torse + tête + cheveux + visage + accessoires.
   * ===================================================================== */
  const SK = T('S', 'L', 'D');
  const HR = T('H', 'I', 'J');
  const CT = T('C', 'c', 'd');
  const OV = T('O', 'o', 'q');
  const PT = T('P', 'p', 'u');

  function skinHead(g, dy) {
    g.shade(E(5.2, 10.4 + dy, 1.3, 1.9), SK);
    g.shade(E(18.8, 10.4 + dy, 1.3, 1.9), SK);
    g.fill(R(10, 15 + dy, 4, 3), 'D');                           // cou
    g.shade(E(12, 9 + dy, 6.9, 7.6), SK);
  }
  function eyes(g, dy, f, o) {
    o = o || {};
    const y = 10 + dy;
    for (const x of [8, 14]) {
      if (f === 1) { g.fill(R(x, y + 2, 2, 1), 'E'); }           // clignement
      else {
        g.fill(R(x, y, 2, 3), 'E'); g.px(x, y, 'w');
        if (o.lashes) { g.px(x === 8 ? 7 : 16, y, 'X'); g.px(x === 8 ? 7 : 16, y - 1, 'X'); }
      }
    }
    if (o.liner && f !== 1) { g.fill(R(7, y - 1, 4, 1), 'X'); g.fill(R(13, y - 1, 4, 1), 'X'); g.px(6, y - 2, 'X'); g.px(17, y - 2, 'X'); }
  }
  function brows(g, dy, c, thick) {
    const y = 8 + dy;
    g.fill(R(7, y, 4, thick ? 2 : 1), c); g.fill(R(13, y, 4, thick ? 2 : 1), c);
  }
  function legs(g, pal, shoe, o) {
    o = o || {};
    g.shade(Pg([[6.2, 25], [11.8, 25], [11.6, 30], [6.4, 30]]), pal);
    g.shade(Pg([[12.2, 25], [17.8, 25], [17.6, 30], [12.4, 30]]), pal);
    g.shade(Pg([[4.6, 29], [11.8, 29], [11.8, 32], [4.6, 32]]), shoe);
    g.shade(Pg([[12.2, 29], [19.4, 29], [19.4, 32], [12.2, 32]]), shoe);
    if (o.sole) { g.fill(R(4.6, 31, 7.2, 1), 'W'); g.fill(R(12.2, 31, 7.2, 1), 'W'); }
  }
  function arm(g, left, top, bot, sleeveEnd, sleevePal) {
    const x = left ? 2.6 : 18.4, w = 3.0;
    g.shade(Pg([[x, top], [x + w, top], [x + w, bot], [x, bot]]), SK);
    g.shade(Pg([[x - 0.4, top], [x + w + 0.4, top], [x + w + 0.2, sleeveEnd], [x - 0.2, sleeveEnd]]), sleevePal);
    g.shade(E(x + w / 2, bot, 1.7, 1.3), SK);                    // main
  }

  /* ---------- OCTAVE : cheveux bouclés bruns, fine moustache, t-shirt noir Vans ---------- */
  function octave(f) {
    const g = new Grid(24, 32), dy = f === 2 ? 1 : 0;
    legs(g, T('P', 'p', 'u'), T('F', 'f', 'g'), { sole: true });
    arm(g, true, 18 + dy, 26, 22 + dy, CT); arm(g, false, 18 + dy, 26, 22 + dy, CT);
    g.fill(R(2.6, 23.4 + dy, 3, 1.4), 'A');                      // bracelet orange
    g.shade(Pg([[5, 17.4 + dy], [8, 16.6 + dy], [16, 16.6 + dy], [19, 17.4 + dy], [19.6, 26], [4.4, 26]]), CT);
    g.px(11, 17 + dy, 'D'); g.px(12, 17 + dy, 'D');
    g.line(8, 18 + dy, 14, 25, 'Z');                              // bandoulière
    g.fill(R(14.6, 21 + dy, 3, 1), 'w'); g.px(15.6, 22 + dy, 'w'); // logo Vans
    skinHead(g, dy);
    // cheveux bouclés
    g.shade(E(12, 4.8 + dy, 7.4, 4.6), HR);
    for (const [x, y, r] of [[5.4, 6, 1.9], [6.8, 3.4, 2], [9.6, 1.8, 2], [13.6, 1.6, 2.1], [17, 3.2, 2], [18.6, 6.2, 1.9], [8, 8, 1.4], [16.6, 8.2, 1.4], [11.6, 7.2, 1.3], [14.6, 7, 1.2]]) g.shade(E(x, y + dy, r, r), HR);
    g.fill(R(5, 7 + dy, 1.4, 3), 'H'); g.fill(R(17.6, 7 + dy, 1.4, 3), 'H');
    brows(g, dy, 'J', true); eyes(g, dy, f);
    g.px(11, 13 + dy, 'D'); g.px(12, 13 + dy, 'D');               // nez
    g.fill(R(9, 14 + dy, 6, 1), 'J');                             // fine moustache
    g.fill(R(10.6, 15.4 + dy, 2.8, 1), 'M');
    g.px(7, 13 + dy, 'R'); g.px(16, 13 + dy, 'R');
    return g.outline();
  }

  /* ---------- LAURE : longs cheveux noirs ondulés, frange, eye-liner, veste en cuir, livre ---------- */
  function laure(f) {
    const g = new Grid(24, 32), dy = f === 2 ? 1 : 0;
    // cheveux de derrière (longs, ondulés)
    g.shade(Pg([[3.6, 6], [4.6, 1.2], [19.4, 1.2], [20.4, 6], [21, 18], [19.4, 24.6], [16, 21], [8, 21], [4.6, 24.6], [3, 18]]), HR);
    legs(g, T('G', 'g', 'z'), T('F', 'f', 'k'), { sole: true });
    g.shade(Pg([[5.2, 25], [18.8, 25], [18.4, 27.4], [5.6, 27.4]]), T('Z', 'Z', 'Z')); // jupe courte
    g.fill(R(5.4, 27, 13.2, 0.9), 'N');                          // ourlet résille
    // haut noir satiné + veste en cuir ouverte
    g.shade(Pg([[7, 17.4 + dy], [17, 17.4 + dy], [17.4, 25.4], [6.6, 25.4]]), CT);
    g.fill(R(9, 17.6 + dy, 6, 1), 'D');
    g.line(10, 18.6 + dy, 12, 22 + dy, 'N'); g.line(14, 18.6 + dy, 12, 22 + dy, 'N'); // collier
    g.px(11, 22.6 + dy, 'N'); g.px(12, 22.6 + dy, 'N'); g.px(11, 23.4 + dy, 'N');    // pendentif
    arm(g, true, 18 + dy, 26, 25, OV); arm(g, false, 18 + dy, 26, 25, OV);
    g.shade(Pg([[4.6, 17.6 + dy], [8, 17 + dy], [7.4, 25.6], [4.6, 25.6]]), OV);       // pans de la veste
    g.shade(Pg([[19.4, 17.6 + dy], [16, 17 + dy], [16.6, 25.6], [19.4, 25.6]]), OV);
    g.fill(R(2.6, 24 + dy, 3, 1.2), 'R');                        // bracelet rouge de festival
    g.fill(R(18.4, 23.6 + dy, 3, 1), 'N'); g.fill(R(18.4, 24.8 + dy, 3, 1), 'N');       // bracelets argentés
    // livre de Bourdieu
    g.fill(R(19, 24 + dy, 4.6, 6.4), 'B'); g.fill(R(19, 24 + dy, 1, 6.4), 'b'); g.fill(R(23, 24.4 + dy, 0.9, 5.6), 'W');
    g.px(21, 26 + dy, 'Q'); g.px(21, 27 + dy, 'Q');
    skinHead(g, dy);
    // frange + mèches
    g.shade(E(12, 4.6 + dy, 7.4, 4.4), HR);
    g.shade(Pg([[5.2, 6 + dy], [12, 6.4 + dy], [18.8, 6 + dy], [19, 11 + dy], [17.6, 9 + dy], [14.8, 8 + dy], [12, 9 + dy], [9.4, 8 + dy], [6.4, 9 + dy], [5, 11 + dy]]), HR);
    g.fill(R(5, 9 + dy, 1.6, 8), 'H'); g.fill(R(17.4, 9 + dy, 1.6, 8), 'H');
    brows(g, dy, 'J', false); eyes(g, dy, f, { liner: true, lashes: true });
    g.px(11, 13 + dy, 'D'); g.px(12, 13 + dy, 'D');
    g.fill(R(10, 14.8 + dy, 4, 1.6), 'M');                       // rouge à lèvres sombre
    return g.outline();
  }

  /* ---------- OLIVIER : cheveux gris en mulet, hâlé, t-shirt jaune, sac à dos, signe de paix ---------- */
  function oliver(f) {
    const g = new Grid(24, 32), dy = f === 2 ? 1 : 0;
    // mulet gris derrière la tête
    g.shade(Pg([[4.6, 6], [19.4, 6], [20, 14], [18.6, 19.4], [15.4, 17], [8.6, 17], [5.4, 19.4], [4, 14]]), HR);
    legs(g, T('P', 'p', 'u'), T('F', 'f', 'g'), { sole: true });
    arm(g, false, 18 + dy, 26, 22 + dy, CT);
    g.shade(Pg([[4.4, 17.4 + dy], [8, 16.6 + dy], [16, 16.6 + dy], [19.6, 17.4 + dy], [20.4, 26], [3.6, 26]]), CT);
    g.line(7, 17 + dy, 15, 25, 'Z'); g.line(7, 18 + dy, 15, 26, 'Z');       // bretelle noire
    g.px(11, 17 + dy, 'D'); g.px(12, 17 + dy, 'D');
    // bras gauche levé : signe de paix
    g.shade(Pg([[2.4, 18 + dy], [5.2, 18 + dy], [4.8, 12], [2.8, 12]]), SK);
    g.shade(Pg([[1.8, 18 + dy], [5.8, 18 + dy], [5.4, 22 + dy], [2, 22 + dy]]), CT);
    g.shade(E(3.8, 12.4, 2, 1.8), SK);
    g.fill(R(1.6, 7.4, 1.2, 4.6), 'S'); g.fill(R(3.8, 7.2, 1.2, 4.8), 'S');   // deux doigts en V
    g.px(1.6, 7.4, 'L'); g.px(3.8, 7.2, 'L');
    skinHead(g, dy);
    // cheveux gris clairsemés, front dégagé
    g.shade(Pg([[5.4, 8 + dy], [5.8, 3.4 + dy], [12, 1 + dy], [18.2, 3.4 + dy], [18.6, 8 + dy], [17, 5.6 + dy], [12, 4.4 + dy], [7, 5.6 + dy]]), HR);
    g.fill(R(5, 8 + dy, 1.4, 4), 'H'); g.fill(R(17.6, 8 + dy, 1.4, 4), 'H');
    brows(g, dy, 'I', true); eyes(g, dy, f);
    g.px(6, 12 + dy, 'D'); g.px(17, 12 + dy, 'D'); g.px(6, 13 + dy, 'D'); g.px(17, 13 + dy, 'D'); // pattes d'oie
    g.px(11, 13 + dy, 'D'); g.px(12, 13 + dy, 'D'); g.px(11, 14 + dy, 'D');
    g.fill(R(9, 15 + dy, 6, 1), 'M'); g.px(15, 14 + dy, 'M'); g.px(9, 15.6 + dy, 'D');   // sourire en coin
    g.fill(R(8, 14.4 + dy, 8, 1.6), 'D'); g.fill(R(10, 15 + dy, 4, 1), 'M');            // barbe de 3 jours
    return g.outline();
  }

  /* ---------- JANIS : blonde frangée, septum, t-shirt « I ♥ DALI » ---------- */
  function janis(f) {
    const g = new Grid(24, 32), dy = f === 2 ? 1 : 0;
    // cheveux blonds en couches, mulet
    g.shade(Pg([[3.6, 6], [4.6, 1.4], [19.4, 1.4], [20.4, 6], [21, 15], [19.6, 22], [16.4, 19], [7.6, 19], [4.4, 22], [3, 15]]), HR);
    legs(g, T('P', 'p', 'u'), T('F', 'f', 'g'), { sole: true });
    arm(g, true, 18 + dy, 26, 22 + dy, CT); arm(g, false, 18 + dy, 26, 22 + dy, CT);
    g.fill(R(2.6, 23.2 + dy, 3, 1.2), 'V');                      // bracelet brésilien vert
    g.fill(R(18.4, 23.2 + dy, 3, 1), 'N');                       // bracelet argenté
    // t-shirt noir « I ♥ DALI »
    g.shade(Pg([[4.4, 17.4 + dy], [8, 16.6 + dy], [16, 16.6 + dy], [19.6, 17.4 + dy], [20.2, 26], [3.8, 26]]), CT);
    g.fill(R(8, 19.4 + dy, 1, 3), 'W');
    g.px(10, 19.4 + dy, 'R'); g.px(12, 19.4 + dy, 'R'); g.fill(R(10, 20.4 + dy, 3, 1), 'R'); g.px(11, 21.4 + dy, 'R');
    for (const x of [8, 9, 11, 12, 14, 15, 16]) g.px(x, 23.4 + dy, 'W');
    g.line(9, 17.6 + dy, 11, 20 + dy, 'N'); g.line(15, 17.6 + dy, 13, 20 + dy, 'N');    // collier
    skinHead(g, dy);
    // frange rideau, mèches blondes
    g.shade(E(12, 4.6 + dy, 7.4, 4.4), HR);
    g.shade(Pg([[5.2, 6 + dy], [12, 6 + dy], [18.8, 6 + dy], [19.4, 14 + dy], [17.4, 9.6 + dy], [14.8, 8.2 + dy], [12, 7 + dy], [9.2, 8.2 + dy], [6.6, 9.6 + dy], [4.8, 14 + dy]]), HR);
    g.fill(R(5, 9 + dy, 1.4, 6), 'H'); g.fill(R(17.6, 9 + dy, 1.4, 6), 'H');
    brows(g, dy, 'J', false); eyes(g, dy, f);
    g.px(7, 13 + dy, 'b'); g.px(8, 13 + dy, 'b'); g.px(15, 13 + dy, 'b'); g.px(16, 13 + dy, 'b');
    g.px(11, 13 + dy, 'D'); g.px(12, 13 + dy, 'D');
    g.px(11, 14 + dy, 'N'); g.px(12, 14 + dy, 'N');               // anneau de septum
    g.fill(R(10, 15 + dy, 4, 1), 'w');                            // grand sourire
    g.px(9, 14.4 + dy, 'M'); g.px(14, 14.4 + dy, 'M'); g.fill(R(10, 16 + dy, 4, 0.8), 'M');
    return g.outline();
  }

  /* ---------- ANNA : cheveux roses, frange, piercings, grand t-shirt noir ---------- */
  function anna(f) {
    const g = new Grid(24, 32), dy = f === 2 ? 1 : 0;
    // cheveux roses mi-longs ondulés
    g.shade(Pg([[4, 8], [5, 2.6], [19, 2.6], [20, 8], [20.8, 19], [18.6, 21], [16, 17], [8, 17], [5.4, 21], [3.2, 19]]), HR);
    legs(g, T('P', 'p', 'u'), T('F', 'f', 'g'), { sole: true });   // jean baggy
    arm(g, true, 18 + dy, 26, 23 + dy, CT); arm(g, false, 18 + dy, 26, 23 + dy, CT);
    g.fill(R(2.6, 24.2 + dy, 3, 1), 'Z');                         // élastique noir au poignet
    g.fill(R(18.4, 24 + dy, 3, 1), 'G');
    // grand t-shirt noir oversize
    g.shade(Pg([[3.4, 17.4 + dy], [8, 16.6 + dy], [16, 16.6 + dy], [20.6, 17.4 + dy], [21.2, 26.8], [2.8, 26.8]]), CT);
    g.fill(R(9, 18 + dy, 6, 1), 'c');
    skinHead(g, dy);
    // frange droite + mèches
    g.shade(E(12, 4.6 + dy, 7.4, 4.4), HR);
    g.shade(Pg([[5.2, 6 + dy], [12, 6 + dy], [18.8, 6 + dy], [19, 13 + dy], [17, 9.6 + dy], [15, 8.2 + dy], [12, 8.4 + dy], [9, 8.2 + dy], [7, 9.6 + dy], [5, 13 + dy]]), HR);
    g.fill(R(5, 13 + dy, 1.4, 5), 'I'); g.fill(R(17.6, 13 + dy, 1.4, 5), 'I');
    brows(g, dy, 'J', false); eyes(g, dy, f, { liner: true, lashes: true });
    g.px(11, 13 + dy, 'D'); g.px(12, 13 + dy, 'D');
    g.px(13, 13.4 + dy, 'G');                                    // piercing de nez
    g.fill(R(10, 14.8 + dy, 4, 1.6), 'M');                       // gloss rose
    g.px(11, 14.8 + dy, 'w'); g.px(13, 16.2 + dy, 'G');          // piercing de lèvre
    g.px(3.6, 12 + dy, 'G'); g.px(3, 13 + dy, 'G'); g.px(3.6, 14 + dy, 'G'); g.px(4.2, 13 + dy, 'G');
    g.px(20.4, 12 + dy, 'G'); g.px(21, 13 + dy, 'G'); g.px(20.4, 14 + dy, 'G'); g.px(19.8, 13 + dy, 'G');
    return g.outline();
  }

  /* ---------- ADELINE : casquette kaki Ciele, grandes lunettes écaille, sweat rose duveteux ---------- */
  function adeline(f) {
    const g = new Grid(24, 32), dy = f === 2 ? 1 : 0;
    // cheveux sombres courts derrière
    g.shade(Pg([[4, 9], [5, 3], [19, 3], [20, 9], [20.4, 15], [18, 14], [6, 14], [3.6, 15]]), HR);
    legs(g, T('P', 'p', 'u'), T('F', 'f', 'g'), { sole: true });
    arm(g, true, 18 + dy, 26, 25, CT); arm(g, false, 18 + dy, 26, 25, CT);
    // sweat à capuche rose, texture duveteuse
    g.shade(Pg([[4.4, 17 + dy], [8, 16.4 + dy], [16, 16.4 + dy], [19.6, 17 + dy], [20.4, 26.4], [3.6, 26.4]]), CT);
    g.shade(Pg([[7, 16.2 + dy], [17, 16.2 + dy], [16, 19.4 + dy], [8, 19.4 + dy]]), T('c', 'c', 'd'));
    g.fill(R(10, 16.6 + dy, 4, 3), 'D');
    g.fill(R(8.4, 22.4 + dy, 7.2, 3), 'd');
    for (const [x, y] of [[6, 21], [9, 20], [15, 21], [18, 23], [7, 24], [17, 19], [12, 22], [5, 19], [19, 21]]) g.px(x, y + dy, 'c');
    skinHead(g, dy);
    g.fill(R(5, 8 + dy, 1.8, 5), 'H'); g.fill(R(17.2, 8 + dy, 1.8, 5), 'H');     // mèches sombres
    // casquette Ciele
    g.shade(Pg([[5, 8 + dy], [5.4, 3 + dy], [8.5, 1 + dy], [15.5, 1 + dy], [18.6, 3 + dy], [19, 8 + dy]]), T('Q', 'q', 'z'));
    g.shade(Pg([[3.2, 7.4 + dy], [20.8, 7.4 + dy], [20, 9.4 + dy], [4, 9.4 + dy]]), T('Z', 'q', 'y'));
    for (const [x, y] of [[6, 4], [7, 4], [6, 5], [6, 6], [7, 6], [9, 2], [9, 4], [9, 5], [9, 6], [11, 4], [12, 4], [11, 5], [12, 5], [11, 6],
      [14, 2], [14, 3], [14, 4], [14, 5], [14, 6], [16, 4], [17, 4], [16, 5], [17, 5], [16, 6]]) g.px(x, y + dy, 'w');
    // grandes lunettes en écaille
    const ring = (x, y, w, h) => {
      g.fill(R(x, y, w, 1), 'B'); g.fill(R(x, y + h - 1, w, 1), 'B');
      g.fill(R(x, y, 1, h), 'B'); g.fill(R(x + w - 1, y, 1, h), 'B');
    };
    ring(6, 9 + dy, 6, 5); ring(12, 9 + dy, 6, 5);
    g.px(7, 9 + dy, 'b'); g.px(13, 9 + dy, 'b'); g.px(5, 10 + dy, 'B'); g.px(18, 10 + dy, 'B');
    for (const x of [8, 14]) { g.fill(R(x, 10 + dy, 2, 3), 'E'); g.px(x, 10 + dy, 'w'); }
    if (f === 1) for (const x of [8, 14]) { g.fill(R(x, 10 + dy, 2, 2), 'S'); g.fill(R(x, 12 + dy, 2, 1), 'E'); }
    g.px(11, 13 + dy, 'D'); g.px(12, 13 + dy, 'D');
    g.px(13, 13.6 + dy, 'G');                                    // piercing de nez
    g.px(7, 14.6 + dy, 'D'); g.px(16, 14.6 + dy, 'D'); g.px(9, 14.4 + dy, 'D'); g.px(15, 14.4 + dy, 'D');   // taches de rousseur
    g.fill(R(10, 15.4 + dy, 4, 1), 'M'); g.px(9, 14.8 + dy, 'M'); g.px(14, 14.8 + dy, 'M');                 // petit sourire
    g.px(4, 12 + dy, 'G'); g.px(3, 13 + dy, 'G'); g.px(4, 14 + dy, 'G');                                    // créole
    return g.outline();
  }

  const HUMAN_PAL = {
    octave: { S: '#e2b48f', L: '#f2cba8', D: '#b98562', H: '#1c1420', I: '#3a2c3c', J: '#120c16',
      C: '#1b1822', c: '#2e2a38', d: '#0e0c14', P: '#2b3350', p: '#3a4468', u: '#1b2138',
      F: '#f4ecd8', f: '#ffffff', g: '#b8b0a0', A: '#ff7a2a', Z: '#4a4658', E: '#0b0710', w: '#ffffff', M: '#9a4a4a', R: '#e8a090', W: '#f4f4f4' },
    laure: { S: '#f0dcd2', L: '#fff0ea', D: '#cfaaa0', H: '#1e1018', I: '#42242f', J: '#0e060c',
      C: '#17101f', c: '#2a1c36', d: '#0a060e', O: '#7a4a2e', o: '#a0683e', q: '#4a2a18',
      G: '#241a30', g: '#3a2c4a', z: '#120c1c', F: '#1a1420', f: '#3a3040', k: '#08060c', Z: '#1d1428', N: '#d8d8e8',
      R: '#d7263d', B: '#5a0f22', b: '#7a1a34', W: '#e8dfc8', Q: '#ffd23f', E: '#1a0a14', X: '#0b0710', w: '#ffffff', M: '#7a1a3a' },
    oliver: { S: '#d9a07a', L: '#ecb994', D: '#a87250', H: '#9a9aa8', I: '#c4c4d0', J: '#6a6a78',
      C: '#f2c230', c: '#ffdc60', d: '#c9962a', P: '#4a4a62', p: '#62627e', u: '#323248',
      F: '#e8e0d0', f: '#ffffff', g: '#a0988a', Z: '#14101a', E: '#0b0710', w: '#ffffff', M: '#8a4a3a' },
    janis: { S: '#f2d0b4', L: '#ffe4cc', D: '#c8a084', H: '#e0be74', I: '#f6e0a0', J: '#a8863a',
      C: '#1b1822', c: '#2e2a38', d: '#0e0c14', P: '#2b3350', p: '#3a4468', u: '#1b2138',
      F: '#f4ecd8', f: '#ffffff', g: '#b8b0a0', R: '#e83a4a', W: '#f4f4f4', N: '#d8d8e8', V: '#3fa34d', b: '#f0a898',
      E: '#2a1a10', w: '#ffffff', M: '#b04a5a' },
    anna: { S: '#f2c4a8', L: '#ffdcc4', D: '#c8987c', H: '#ff5fa2', I: '#ff94c4', J: '#c02a78',
      C: '#1a1020', c: '#ff5fa2', d: '#0c0610', P: '#6a8ad0', p: '#8aaae8', u: '#4a62a0',
      F: '#f4ecd8', f: '#ffffff', g: '#b8b0c0', G: '#ffd23f', Z: '#14101a', E: '#0b0710', X: '#0b0710', w: '#ffffff', M: '#ff2e7e' },
    adeline: { S: '#eac2a4', L: '#f6d6bc', D: '#c49878', H: '#2a1c20', I: '#4a3a40', J: '#1a1014',
      C: '#e0b0b0', c: '#f2cccc', d: '#b88a8c', P: '#3a4262', p: '#4a5478', u: '#262c46',
      F: '#f4ecd8', f: '#ffffff', g: '#b8b0a0', Q: '#8f9a78', q: '#aab494', z: '#6a7458', Z: '#a6aa86', y: '#8a8e6c',
      B: '#a8734a', b: '#d29a66', G: '#ffd23f', E: '#2a160e', w: '#ffffff', M: '#b8505a' },
  };
  const humans = { octave, laure, oliver, janis, anna, adeline };
  Object.keys(humans).forEach((id) => {
    const fn = humans[id];
    define(id, { w: 24, h: 32, palette: HUMAN_PAL[id], frames: [0, 1, 2].map((f) => () => fn(f)) });
  });


  /* =====================================================================
   *  ICÔNES DES BOOSTS généraux sans matrice fixe (coupon et flamme)
   * ===================================================================== */
  define('icoCoupon', {
    w: 16, h: 16, palette: { Y: '#ffd23f', y: '#e8a524', o: '#b8861b', R: '#d7263d', W: '#fff6d8' },
    frames: [() => {
      const g = new Grid(16, 16);
      g.shade(Pg([[1, 3], [15, 3], [15, 13], [1, 13]]), T('Y', 'W', 'y'));
      g.fill(R(0, 7, 1, 2), 'K'); g.fill(R(15, 7, 1, 2), 'K');                    // encoches du ticket
      for (let x = 3; x < 14; x += 2) { g.px(x, 4, 'o'); g.px(x, 11, 'o'); }       // pointillés
      g.fill(R(4, 6, 2, 2), 'R'); g.fill(R(9, 9, 2, 2), 'R'); g.line(10, 5, 5, 11, 'R');   // le signe %
      return g.outline();
    }],
  });
  define('icoHaki', {
    w: 16, h: 16, palette: { Y: '#ffd23f', y: '#b8861b', W: '#fff6d8', R: '#d7263d' },
    frames: [() => {
      const g = new Grid(16, 16);
      const cross = (x, y) => R(6, 0.6, 4, 14.8)(x, y) || R(2.4, 4.6, 11.2, 4)(x, y);   // une croix
      g.shade(cross, T('Y', 'W', 'y'));
      g.fill(R(7, 5.6, 2, 2), 'R');                                                  // gemme au centre
      g.px(0, 2, 'W'); g.px(15, 12, 'W'); g.px(14, 1, 'W');
      return g.outline();
    }],
  });
  define('icoHype', {
    w: 16, h: 16, palette: { R: '#d7263d', O: '#ff8a1f', Y: '#ffd23f', W: '#fff6d8', r: '#8c1023' },
    frames: [() => {
      const g = new Grid(16, 16);
      g.shade(Pg([[8, 0.5], [11, 4.5], [13.4, 8.6], [12.6, 12.6], [8, 15], [3.4, 12.6], [2.6, 8.4], [5.2, 5.6], [6, 2.6]]), T('R', 'O', 'r'));
      g.shade(E(8, 10.6, 3.6, 4.2), T('O', 'Y', 'R'));
      g.shade(E(8, 11.8, 1.9, 2.4), T('Y', 'W', 'O'));
      return g.outline();
    }],
  });

  // Portrait (tête et épaules) pour les boîtes de dialogue et la victoire
  global.Sprites.portraitCrop = { x: 0, y: 0, w: 24, h: 24 };
})(window);
