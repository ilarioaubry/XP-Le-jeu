/* =====================================================================
 *  DOGGY PARTY — Octave Tycoon : La Quête de Laure
 *  game.js — Économie à la AdVenture Capitalist, interface, boucle de jeu,
 *  sauvegarde `localStorage`, animations d'UnLock.
 *  (données : data.js · salon animé : room.js · sons : audio.js)
 * ===================================================================== */
(function () {
  'use strict';

  const { ANIMALS, MANAGERS, BOOSTS, GROWTH, MANAGER_MULT, SPEED_MILESTONES, SAVE_KEY, WIN_AT, STORY, OLIVIER_ADVICE, UI } = window.DATA;
  const fill = window.Texts.fill;
  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const A = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));
  const M = Object.fromEntries(MANAGERS.map((m) => [m.id, m]));
  const HUMANS = ['octave', 'laure', 'oliver', 'janis', 'anna', 'adeline'];

  /* ---- Pas de zoom : pincement, double-tap et menu contextuel bloqués ---- */
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) =>
    document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1 || (e.scale && e.scale !== 1)) e.preventDefault();
  }, { passive: false });
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });

  /* =====================================================================
   *  ÉTAT & SAUVEGARDE
   * ===================================================================== */
  function freshState() {
    return {
      v: 2,
      pizzas: 0, total: 0,
      biz: { chichi: { n: 1, t: 0, run: false } },   // Octave démarre avec Chichi
      mgr: {}, boost: {}, seen: {},
      tourneeEnd: 0, tourneeReady: 0,
      victory: false, golds: 0, story: 0,
      started: Date.now(), lastSave: Date.now(),
    };
  }
  let S = freshState();

  function save() {
    S.lastSave = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* stockage bloqué */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      S = Object.assign(freshState(), JSON.parse(raw));
      return true;
    } catch (e) { return false; }
  }

  /* =====================================================================
   *  ÉCONOMIE
   *  Trajet d'un animal : dure `time / 2^paliers / vitesse` secondes
   *  et rapporte `pps × time × niveau × bonus` pizzas.
   * ===================================================================== */
  const lvl = (id) => (S.biz[id] && S.biz[id].n) || 0;
  const hasM = (id) => !!S.mgr[id];
  const hasB = (id) => !!S.boost[id];
  const isAuto = (a) => hasM(a.manager);
  const tourneeOn = () => Date.now() < S.tourneeEnd;
  const discount = () => BOOSTS.reduce((d, b) => (hasB(b.id) && b.discount ? d * b.discount : d), 1);

  function speedMult() {
    let m = tourneeOn() ? 3 : 1;
    for (const b of BOOSTS) if (hasB(b.id) && b.speed) m *= b.speed;
    return m;
  }
  const milestonesReached = (level) => SPEED_MILESTONES.reduce((c, m) => (level >= m ? c + 1 : c), 0);
  const nextMilestone = (level) => SPEED_MILESTONES.find((m) => m > level) || 0;
  const baseCycle = (a) => a.time / Math.pow(2, milestonesReached(lvl(a.id)));
  const cycleTime = (a) => baseCycle(a) / speedMult();

  function globalMult() {
    let m = hasM('laure') ? 10000 : 1;
    for (const b of BOOSTS) if (hasB(b.id) && b.global) m *= b.global;
    return m;
  }
  function boostMult(id) {
    let m = 1;
    for (const b of BOOSTS) if (hasB(b.id) && b.ids && b.ids.includes(id)) m *= b.mult;
    return m;
  }
  const profit = (a) => a.pps * a.time * lvl(a.id) * (isAuto(a) ? MANAGER_MULT : 1) * boostMult(a.id) * globalMult();
  // Pizzas par seconde des animaux automatisés (régime permanent)
  function pps() {
    let t = 0;
    for (const a of ANIMALS) if (lvl(a.id) && isAuto(a)) t += profit(a) / cycleTime(a);
    return t;
  }

  function bulkCost(a, q) {
    const r = GROWTH;
    return Math.ceil(a.cost * discount() * Math.pow(r, lvl(a.id)) * (Math.pow(r, q) - 1) / (r - 1));
  }
  function maxAffordable(a) {
    const first = a.cost * discount() * Math.pow(GROWTH, lvl(a.id));
    if (S.pizzas < first) return 0;
    return Math.max(0, Math.floor(Math.log(S.pizzas * (GROWTH - 1) / first + 1) / Math.log(GROWTH)));
  }
  let buyQty = 1; // 1, 10 ou 'max'
  const qtyFor = (a) => (buyQty === 'max' ? Math.max(1, maxAffordable(a)) : buyQty);
  const isRevealed = (a) => lvl(a.id) > 0 || S.total >= a.cost * 0.4;

  /* =====================================================================
   *  FORMATAGE
   * ===================================================================== */
  const UNITS = [[1e24, 'Qa'], [1e21, 'Td'], [1e18, 'Tn'], [1e15, 'Bd'], [1e12, 'Bn'], [1e9, 'Md'], [1e6, 'M']];
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 1e6) return Math.floor(n).toLocaleString('fr-FR');
    if (n >= 1e27) return n.toExponential(2).replace('e+', 'e');
    for (const [v, s] of UNITS) {
      if (n >= v) return (n / v).toLocaleString('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + ' ' + s;
    }
    return String(n);
  }
  function fmtRate(n) {
    if (n < 100 && n % 1 !== 0) return n.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    return fmt(n);
  }
  function fmtSec(s) {
    if (s < 10) return s.toFixed(1).replace('.', ',') + ' s';
    if (s < 60) return Math.ceil(s) + ' s';
    const m = Math.floor(s / 60), r = Math.ceil(s % 60);
    return m + ' min ' + (r ? String(r).padStart(2, '0') + ' s' : '');
  }
  function fmtDuration(sec) {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + 'h ' + String(m).padStart(2, '0') + 'min';
    if (m) return m + 'min ' + String(s).padStart(2, '0') + 's';
    return s + 's';
  }
  const setText = (node, t) => { if (node.textContent !== t) node.textContent = t; };

  /* =====================================================================
   *  BOÎTE DE DIALOGUE RPG (effet machine à écrire)
   * ===================================================================== */
  const dlg = { el: $('dialog'), name: $('dialogName'), text: $('dialogText'), portrait: $('dialogPortrait'), full: '', i: 0, timer: null, close: null };
  const portraitCache = {};
  const faceOf = (name, scale) => Sprites.dataURL(name, scale, 0, HUMANS.includes(name) ? Sprites.portraitCrop : undefined);
  function portrait(name) {
    if (!portraitCache[name]) portraitCache[name] = faceOf(name, 4);
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
   *  ANIMATION D'UNLOCK (animal ou manager débloqué)
   * ===================================================================== */
  const UL = {
    el: $('unlock'), kicker: $('unlockKicker'), img: $('unlockImg'), name: $('unlockName'),
    sub: $('unlockSub'), quote: $('unlockQuote'), sparks: $('unlockSparks'),
    q: [], cur: null, typer: null, auto: null, full: '', i: 0,
  };
  function queueUnlock(u) {
    UL.q.push(u);
    if (!UL.cur) nextUnlock();
  }
  function nextUnlock() {
    clearInterval(UL.typer); clearTimeout(UL.auto);
    UL.typer = null;
    const u = UL.q.shift();
    if (!u) { UL.cur = null; UL.el.classList.add('hidden'); return; }
    UL.cur = u;
    let line;
    if (u.type === 'animal') {
      const a = A[u.id];
      S.seen['a:' + u.id] = true;
      UL.kicker.textContent = UI.unlock_animal;
      UL.name.textContent = a.name.toUpperCase();
      UL.sub.textContent = a.species;
      line = a.desc;
      UL.img.src = Sprites.dataURL(a.id, 5);
      setTimeout(() => (a.sound === 'meow' ? Audio8.meow(a.pitch, 0.4) : Audio8.bark(a.pitch, 0.5)), 450);
    } else {
      const m = M[u.id];
      S.seen['m:' + u.id] = true;
      UL.kicker.textContent = m.boss ? UI.unlock_boss : UI.unlock_manager;
      UL.name.textContent = m.name.toUpperCase();
      UL.sub.textContent = m.role + ' · ' + fill(UI.unlock_gere, { animal: A[m.animal].name });
      line = '« ' + m.catch + ' »';
      UL.img.src = Sprites.dataURL(m.id, 5);
      setTimeout(() => Audio8.manager(), 450);
    }
    // relance les animations CSS
    UL.el.classList.remove('hidden', 'play');
    void UL.el.offsetWidth;
    UL.el.classList.add('play');
    UL.sparks.innerHTML = '';
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('i');
      const ang = (i / 16) * Math.PI * 2 + rand(-0.15, 0.15), d = rand(90, 190);
      s.style.setProperty('--dx', Math.round(Math.cos(ang) * d) + 'px');
      s.style.setProperty('--dy', Math.round(Math.sin(ang) * d) + 'px');
      s.style.animationDelay = (0.25 + (i % 4) * 0.05) + 's';
      UL.sparks.appendChild(s);
    }
    Audio8.fanfare();
    UL.full = line; UL.i = 0; UL.quote.textContent = '';
    setTimeout(() => {
      if (UL.cur !== u) return;
      UL.typer = setInterval(() => {
        UL.i++;
        UL.quote.textContent = UL.full.slice(0, UL.i);
        if (UL.i % 3 === 0) Audio8.typeBlip();
        if (UL.i >= UL.full.length) { clearInterval(UL.typer); UL.typer = null; clearTimeout(UL.auto); UL.auto = setTimeout(closeUnlock, 5000); }
      }, 32);
    }, 700);
    UL.auto = setTimeout(closeUnlock, 14000);   // sécurité
  }
  function closeUnlock() {
    const u = UL.cur;
    clearInterval(UL.typer); clearTimeout(UL.auto);
    UL.typer = null;
    if (u && u.onClose) u.onClose();
    nextUnlock();
  }
  UL.el.addEventListener('click', () => {
    if (UL.typer) {                      // 1er toucher : affiche tout le texte
      clearInterval(UL.typer); UL.typer = null;
      UL.quote.textContent = UL.full;
      clearTimeout(UL.auto); UL.auto = setTimeout(closeUnlock, 4000);
    } else if (UL.i >= UL.full.length) {
      closeUnlock();
    }
  });

  /* =====================================================================
   *  ACTIONS DU JOUEUR
   * ===================================================================== */
  const animalSound = (a, vol) => (a.sound === 'meow' ? Audio8.meow(a.pitch, vol) : Audio8.bark(a.pitch, vol));

  // On touche un animal : il part chercher des pizzas (rien ne se passe s'il est déjà parti)
  function tapAnimal(id) {
    const b = S.biz[id];
    if (!b || !b.n || b.run) return;
    b.run = true; b.t = 0;
    Audio8.click();
  }

  // Un animal revient avec ses pizzas
  const fx = {};                    // cumul d'effets pour les animaux automatisés (trajets rapides)
  let lastDing = 0;
  function onCollect(a, gain, auto) {
    const now = performance.now();
    if (!auto) {
      Room.collect(a.id, '+' + fmt(gain) + ' 🍕');
      Audio8.collect();
      if (Math.random() < 0.5) animalSound(a, 0.15);
      return;
    }
    const f = fx[a.id] || (fx[a.id] = { gain: 0, at: 0 });
    f.gain += gain;
    if (now - f.at > 1100) {
      Room.collect(a.id, '+' + fmt(f.gain) + ' 🍕');
      f.gain = 0; f.at = now;
      if (now - lastDing > 350) { Audio8.collect(); lastDing = now; }
    }
  }

  function buyAnimal(a) {
    if (!isRevealed(a)) return;
    const q = qtyFor(a), cost = bulkCost(a, q);
    if (S.pizzas < cost) { Audio8.error(); return; }
    const before = milestonesReached(lvl(a.id));
    S.pizzas -= cost;
    const first = lvl(a.id) === 0;
    const b = S.biz[a.id] || (S.biz[a.id] = { n: 0, t: 0, run: false });
    b.n += q;
    Room.syncActors(true);
    if (first) {
      queueUnlock({ type: 'animal', id: a.id });
    } else {
      animalSound(a, 0.55);                                  // il aboie (ou miaule) à chaque amélioration
      if (milestonesReached(lvl(a.id)) > before) {
        setTimeout(Audio8.upgrade, 350);
        Room.floatText(fill(UI.vitesse_flottant, { animal: a.name.toUpperCase() }), 160, 40, 'gold');
      } else {
        setTimeout(Audio8.buy, 300);
      }
    }
    refreshShop();
  }

  function buyManager(m) {
    if (hasM(m.id)) return;
    if (!lvl(m.animal)) { Audio8.error(); Room.floatText(fill(UI.manager_verrouille, { animal: A[m.animal].name }), 160, 40, 'gold'); return; }
    if (S.pizzas < m.cost) { Audio8.error(); return; }
    S.pizzas -= m.cost;
    S.mgr[m.id] = true;
    const b = S.biz[m.animal];
    b.run = true; b.t = 0;
    queueUnlock({
      type: 'manager', id: m.id,
      onClose: m.boss ? () => { hideDialog(); Room.startCinematic(); } : null,
    });
    refreshShop();
  }

  function buyBoost(b) {
    if (hasB(b.id)) return;
    if (S.pizzas < b.cost) { Audio8.error(); return; }
    S.pizzas -= b.cost;
    S.boost[b.id] = true;
    Audio8.upgrade();
    Room.puff(160, 120, ['#6fc3ff', '#ffffff', '#ffcf3f'], 24);
    Room.floatText(fill(UI.boost_flottant, { nom: b.name.toUpperCase() }), 160, 50, 'gold');
    refreshShop();
  }

  // Compétence d'Olivier : Tournée Générale (tous les trajets x3 pendant 15 s)
  function useTournee() {
    if (!hasM('oliver')) return;
    const now = Date.now();
    if (now < S.tourneeReady) { Audio8.error(); return; }
    S.tourneeEnd = now + 15000;
    S.tourneeReady = now + 60000;
    Audio8.skill();
    showDialog('oliver', UI.tournee_titre, pick(OLIVIER_ADVICE), 8000);
  }
  $('btnOliver').addEventListener('click', () => { Audio8.unlock(); useTournee(); });

  // Pizza dorée (bonus aléatoire dans le salon)
  const goldenDelay = () => rand(50, 120);
  let nextGolden = rand(40, 90);
  function catchGolden() {
    const top = ANIMALS.reduce((m, a) => (lvl(a.id) ? Math.max(m, profit(a)) : m), 0);
    const reward = Math.max(30, pps() * 45, top * 3);
    const g = Room.takeGolden();
    S.pizzas += reward; S.total += reward; S.golds++;
    Audio8.golden();
    Room.puff(g.x, g.y, ['#fff6a8', '#ffd23f', '#ffffff'], 24);
    Room.floatText('+' + fmt(reward) + ' ✨', g.x, g.y - 10, 'gold');
  }

  /* =====================================================================
   *  LIEN AVEC LE SALON
   * ===================================================================== */
  const anyRunning = () => ANIMALS.some((a) => S.biz[a.id] && S.biz[a.id].run);
  const host = {
    count: lvl,
    has: hasM,
    running: (id) => !!(S.biz[id] && S.biz[id].run),
    ready: (id) => lvl(id) > 0 && !S.biz[id].run && !isAuto(A[id]),
    progress: (id) => { const b = S.biz[id]; return b ? b.t / cycleTime(A[id]) : 0; },
    boost: tourneeOn,
    busy: anyRunning,
    total: () => S.total,
    say: showDialog,
    onVictory: () => {
      S.victory = true;
      save();
      $('vicStats').textContent = fill(UI.victoire_stats, { duree: fmtDuration((Date.now() - S.started) / 1000), pizzas: fmt(S.total) });
      $('victory').classList.remove('hidden');
    },
    onTap: (pt) => {
      Audio8.unlock();
      if (Room.hitGolden(pt)) { catchGolden(); return; }
      const ac = Room.actorAt(pt);
      if (ac) tapAnimal(ac.id);
    },
  };

  /* =====================================================================
   *  BOUTIQUE (DOM)
   * ===================================================================== */
  const shop = { animals: [], managers: [], boosts: [] };
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  const onKey = (node, fn) => node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });

  function buildShop() {
    // ---- MEUTE : une carte par animal, comme un « business »
    const pa = $('panel-animals');
    ANIMALS.forEach((a) => {
      const root = el('div', 'biz locked');
      const icon = el('button', 'biz-icon'); icon.type = 'button'; icon.setAttribute('aria-label', 'Envoyer ' + a.name);
      const img = el('img'); img.src = Sprites.dataURL(a.id, 3); img.alt = a.name; icon.appendChild(img);
      const main = el('div', 'biz-main');
      const top = el('div', 'biz-top');
      const name = el('span', 'biz-name', a.name), lv = el('span', 'biz-lv'), auto = el('span', 'biz-auto', 'AUTO');
      top.append(name, lv, auto);
      const bar = el('div', 'biz-bar'); bar.setAttribute('role', 'button');
      const fill = el('div', 'biz-fill'), txt = el('span', 'biz-bartext');
      bar.append(fill, txt);
      const next = el('div', 'biz-next');
      main.append(top, bar, next);
      const buy = el('button', 'biz-buy'); buy.type = 'button';
      const bl = el('span', 'biz-buy-l'), bc = el('span', 'biz-buy-c');
      buy.append(bl, bc);
      root.append(icon, main, buy);
      const go = () => { Audio8.unlock(); tapAnimal(a.id); };
      icon.addEventListener('click', go); bar.addEventListener('click', go);
      buy.addEventListener('click', () => { Audio8.unlock(); buyAnimal(a); });
      pa.appendChild(root);
      shop.animals.push({ a, root, img, name, lv, auto, fill, txt, next, bl, bc, buy });
    });

    // ---- COLOC : un manager par animal
    const pm = $('panel-managers');
    MANAGERS.forEach((m) => {
      const item = el('div', 'item' + (m.boss ? ' boss' : ''));
      item.setAttribute('role', 'button'); item.tabIndex = 0;
      const img = el('img', 'item-icon'); img.src = faceOf(m.id, 3); img.alt = m.name;
      const mid = el('div');
      const effect = fill(UI.manager_effet, { animal: A[m.animal].name, mult: MANAGER_MULT }) + (m.skill ? UI.manager_competence : '') + (m.boss ? UI.manager_boss : '');
      const sub = el('div', 'item-sub', m.role);
      const cost = el('div', 'item-cost');
      mid.append(el('div', 'item-name', m.name), sub, el('div', 'item-effect', effect), cost);
      const count = el('div', 'item-count', '');
      item.append(img, mid, count);
      const act = () => { Audio8.unlock(); buyManager(m); };
      item.addEventListener('click', act); onKey(item, act);
      pm.appendChild(item);
      shop.managers.push({ m, item, cost, count });
    });

    // ---- BOOSTS généraux
    const pb = $('panel-boosts');
    BOOSTS.forEach((b) => {
      const item = el('div', 'item');
      item.setAttribute('role', 'button'); item.tabIndex = 0;
      const img = el('img', 'item-icon'); img.src = Sprites.dataURL(b.icon, 3); img.alt = b.name;
      const mid = el('div');
      const cost = el('div', 'item-cost');
      mid.append(el('div', 'item-name', b.name), el('div', 'item-sub', b.ref), el('div', 'item-desc', b.desc), el('div', 'item-effect', b.effect), cost);
      const count = el('div', 'item-count', '');
      item.append(img, mid, count);
      const act = () => { Audio8.unlock(); buyBoost(b); };
      item.addEventListener('click', act); onKey(item, act);
      pb.appendChild(item);
      shop.boosts.push({ b, item, cost, count });
    });

    document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
      ['animals', 'managers', 'boosts'].forEach((id) => $('panel-' + id).classList.toggle('hidden', id !== t.dataset.tab));
      $('buyMode').classList.toggle('hidden', t.dataset.tab !== 'animals');
    }));
    document.querySelectorAll('#buyMode .px-btn').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('#buyMode .px-btn').forEach((x) => x.classList.toggle('active', x === b));
      buyQty = b.dataset.qty === 'max' ? 'max' : +b.dataset.qty;
      refreshShop();
    }));
  }

  // Textes et états (10 fois par seconde)
  function refreshShop() {
    for (const r of shop.animals) {
      const a = r.a, n = lvl(a.id), revealed = isRevealed(a);
      r.root.classList.toggle('locked', !revealed);
      setText(r.name, revealed ? a.name : UI.carte_inconnu);
      setText(r.lv, n ? fill(UI.carte_niveau, { niveau: n }) : '');
      r.auto.style.display = n && isAuto(a) ? '' : 'none';
      const nm = nextMilestone(n);
      setText(r.next, !revealed ? UI.carte_mystere : !n ? a.desc :
        nm ? fill(UI.carte_palier, { niveau: nm }) : UI.carte_palier_max);
      const q = n ? qtyFor(a) : 1, cost = bulkCost(a, q);
      const can = revealed && S.pizzas >= cost;
      setText(r.bl, !n ? UI.bouton_debloquer : q > 1 ? UI.bouton_ameliorer + ' x' + q : UI.bouton_ameliorer);
      setText(r.bc, revealed ? fmt(cost) + ' 🍕' : UI.carte_inconnu);
      r.buy.classList.toggle('can', can);
      r.buy.disabled = !revealed;
    }
    for (const r of shop.managers) {
      const own = hasM(r.m.id), animalOwned = lvl(r.m.animal) > 0;
      const can = !own && animalOwned && S.pizzas >= r.m.cost;
      setText(r.cost, own ? UI.manager_recrute : animalOwned ? fmt(r.m.cost) + ' 🍕' : fill(UI.manager_verrouille, { animal: A[r.m.animal].name }));
      r.cost.classList.toggle('no', !own && !can);
      setText(r.count, own ? '★' : '');
      r.item.classList.toggle('owned', own);
      r.item.classList.toggle('can', can);
      r.item.classList.toggle('cannot', !own && !can);
    }
    for (const r of shop.boosts) {
      const own = hasB(r.b.id), can = !own && S.pizzas >= r.b.cost;
      setText(r.cost, own ? UI.boost_actif : fmt(r.b.cost) + ' 🍕');
      r.cost.classList.toggle('no', !own && !can);
      setText(r.count, own ? '★' : '');
      r.item.classList.toggle('owned', own);
      r.item.classList.toggle('can', can);
      r.item.classList.toggle('cannot', !own && !can);
    }
  }

  // Jauges de trajet (à chaque image)
  function refreshBars() {
    for (const r of shop.animals) {
      const a = r.a, b = S.biz[a.id], n = lvl(a.id);
      if (!n) { r.fill.style.width = '0%'; setText(r.txt, ''); continue; }
      const cyc = cycleTime(a), auto = isAuto(a), gain = profit(a);
      const fast = cyc < 0.35;
      const p = fast ? 1 : Math.min(1, b.t / cyc);
      r.fill.style.width = (p * 100).toFixed(1) + '%';
      r.root.classList.toggle('fast', fast && b.run);
      r.root.classList.toggle('running', !!b.run);
      setText(r.txt, fast ? '+' + fmt(gain / cyc) + ' 🍕 / s'
        : b.run ? '+' + fmt(gain) + ' 🍕 · ' + fmtSec(Math.max(0, cyc - b.t))
          : fill(UI.carte_touche, { pizzas: fmt(gain) }));
    }
  }

  function refreshHud() {
    setText($('pizzaCount'), fmt(S.pizzas));
    setText($('ppsCount'), fmtRate(pps()));
    document.title = fmt(S.pizzas) + ' 🍕 · Octave Tycoon — Doggy Party';
    const pct = hasM('laure') ? 100 : Math.min(100, S.pizzas / WIN_AT * 100);
    $('laureBar').style.width = pct + '%';
    setText($('laurePct'), hasM('laure') ? '♥ 100%' : (pct < 1 ? pct.toFixed(2) : pct.toFixed(1)) + '%');
    const ob = $('btnOliver');
    ob.classList.toggle('hidden', !hasM('oliver'));
    if (hasM('oliver')) {
      const now = Date.now(), ready = now >= S.tourneeReady;
      ob.disabled = !ready;
      ob.classList.toggle('ready', ready);
      setText($('oliverLabel'), ready ? UI.tournee_bouton : fill(UI.tournee_recharge, { secondes: Math.ceil((S.tourneeReady - now) / 1000) }));
    }
    const boosting = tourneeOn();
    $('boostBanner').classList.toggle('hidden', !boosting);
    $('stage').classList.toggle('boost', boosting);
    if (boosting) setText($('boostText'), fill(UI.tournee_bandeau, { secondes: Math.ceil((S.tourneeEnd - Date.now()) / 1000) }));
  }

  // Paliers de pizzas racontés par Octave (quand aucune boîte de dialogue n'est ouverte)
  function checkStory() {
    if (S.story < STORY.length && S.total >= STORY[S.story][0] && !Room.cinematic && !UL.cur &&
        dlg.el.classList.contains('hidden')) {
      showDialog('pizzaMini', UI.palier_titre, STORY[S.story][1], 6000);
      S.story++;
    }
  }

  /* =====================================================================
   *  PRODUCTION & BOUCLE DE JEU
   * ===================================================================== */
  function tick(elapsed) {
    for (const a of ANIMALS) {
      const b = S.biz[a.id];
      if (!b || !b.n) continue;
      const auto = isAuto(a);
      if (auto && !b.run) { b.run = true; b.t = 0; }
      if (!b.run) continue;
      const cyc = cycleTime(a);
      b.t += elapsed;
      if (b.t < cyc) continue;
      const cycles = auto ? Math.floor(b.t / cyc) : 1;
      const gain = profit(a) * cycles;
      S.pizzas += gain; S.total += gain;
      if (auto) b.t -= cycles * cyc; else { b.t = 0; b.run = false; }
      onCollect(a, gain, auto);
    }
  }

  let last = performance.now(), lastProd = Date.now(), uiAcc = 0, saveAcc = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const nowMs = Date.now();
    const elapsed = Math.min(3600, Math.max(0, (nowMs - lastProd) / 1000));   // le temps passe même onglet en veille
    lastProd = nowMs;
    tick(elapsed);

    if (!Room.golden && !Room.cinematic && !UL.cur) {
      nextGolden -= dt;
      if (nextGolden <= 0) { Room.spawnGolden(); nextGolden = goldenDelay(); }
    }

    Room.update(dt);
    Room.render();
    refreshBars();

    uiAcc += dt;
    if (uiAcc >= 0.1) { uiAcc = 0; refreshHud(); refreshShop(); checkStory(); }
    saveAcc += dt;
    if (saveAcc >= 15) { saveAcc = 0; save(); }
    requestAnimationFrame(frame);
  }

  /* =====================================================================
   *  INITIALISATION
   * ===================================================================== */
  function init() {
    $('pizzaIcon').src = Sprites.dataURL('pizzaMini', 3);
    $('beerIcon').src = Sprites.dataURL('beer', 2);
    $('vicOctave').src = faceOf('octave', 6);
    $('vicLaure').src = faceOf('laure', 6);
    $('vicHeart').src = Sprites.dataURL('heart', 6);
    buildShop();
    Room.init($('room'), $('floaters'), host);

    const hadSave = load();
    Room.syncActors(false);

    if (!hadSave) {
      // Début de partie : Chichi est débloqué, Octave explique le principe
      queueUnlock({
        type: 'animal', id: 'chichi',
        onClose: () => showDialog('octave', UI.dialogue_octave, UI.tutoriel, 9000),
      });
    } else {
      // gains hors-ligne des animaux automatisés (boost « Vers l'infini »)
      const away = (Date.now() - S.lastSave) / 1000;
      if (BOOSTS.some((b) => b.offline && hasB(b.id)) && away > 10) {
        const secs = Math.min(away, 86400);
        const gain = pps() * secs;
        if (gain > 0) {
          S.pizzas += gain; S.total += gain;
          setTimeout(() => showDialog('octave', UI.dialogue_octave, fill(UI.hors_ligne, { duree: fmtDuration(secs), gain: fmt(gain) }), 6000), 600);
        }
      }
    }
    lastProd = Date.now();
    refreshShop(); refreshHud();
    requestAnimationFrame((t) => { last = t; requestAnimationFrame(frame); });
  }

  $('btnContinue').addEventListener('click', () => $('victory').classList.add('hidden'));
  document.addEventListener('pointerdown', () => Audio8.unlock(), { once: true });
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  // Outils de test dans la console : DoggyParty.give(1e6)
  window.DoggyParty = {
    give(n) { S.pizzas += n; S.total += n; },
    state: () => S,
  };

  // Les textes du tableur (data/textes.csv) sont chargés avant de démarrer
  Texts.load('data/textes.csv').then(() => { Texts.applyDom(); init(); });
})();
