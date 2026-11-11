/* =====================================================================
 *  DOGGY PARTY — Octave Tycoon : La Quête de Laure
 *  vie.js — La vie dans le salon : conversations entre personnages, phrases quand
 *  on touche un humain, caresses, événements surprise (le voisin du dessous,
 *  Gilbert qui vole un truc), Chichi qui demande à descendre du canapé.
 *  Les textes viennent de data.js (modifiables dans data/textes.csv).
 * ===================================================================== */
(function (global) {
  'use strict';

  const D = global.DATA;
  const EV = D.EVENTS;
  const fill = (s, v) => global.Texts.fill(s, v);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // api (fourni par game.js) : present(id), count(id), total(), busy(), reward(k), fmt(n),
  //                           banner(text, ms), say(sprite, name, text, ms), animalSound(animal, vol)
  let api = null;
  let chatT = 40, eventT = 110, chatBusy = false;
  let ev = null;                                  // événement en cours
  const cool = {};                                // délais anti-spam par personnage / animal
  const lastLine = {};

  const NEIGHBOR_FREEZE = 5;                      // secondes pendant lesquelles la meute se fige

  function init(a) { api = a; }

  /* ---- Conversations ---- */
  function playLines(lines, i) {
    if (i >= lines.length) { chatBusy = false; return; }
    const who = lines[i][0], text = lines[i][1];
    if (!api.present(who)) { chatBusy = false; return; }
    global.Room.speak(who, text);
    setTimeout(() => playLines(lines, i + 1), 1900 + text.length * 45 + 300);
  }
  function startChat() {
    const ok = D.CHATS.filter((c) => c.lines.every((l) => api.present(l[0])));
    if (!ok.length) return false;
    const c = pick(ok);
    chatBusy = true;
    playLines(c.lines, 0);
    return true;
  }

  /* ---- Événement : le voisin du dessous ---- */
  function startNeighbor() {
    ev = { type: 'voisin', t: 0, octave: false, hint: false };
    global.Room.setNeighbor(true);
    api.banner(EV.voisin.annonce);
  }
  function endNeighbor(resolved) {
    global.Room.setNeighbor(false);
    ev = null;
    if (!resolved) api.banner(EV.voisin.fin, 3500); else api.banner(null);
  }
  function resolveNeighbor() {
    const gain = api.reward(1.4);
    global.Room.speak('oliver', EV.voisin.olivier);
    global.Room.hop('oliver');
    global.Audio8.skill();
    endNeighbor(true);
    setTimeout(() => api.banner(fill(EV.voisin.succes, { gain: api.fmt(gain) }), 5000), 1300);
  }

  /* ---- Événement : Gilbert a volé un truc ---- */
  function startThief() {
    const item = pick(EV.gilbert);
    ev = { type: 'gilbert', item };
    global.Room.startThief(item.sprite);
    api.banner(item.annonce);
  }
  function thiefGone() {                          // il s'est enfui
    if (!ev || ev.type !== 'gilbert') return;
    api.banner(ev.item.fuite, 4500);
    ev = null;
  }
  function thiefCaught() {
    const item = ev.item;
    const t = global.Room.catchThief();
    const gain = api.reward(2.5);
    global.Audio8.golden();
    global.Room.floatText('+' + api.fmt(gain) + ' ✨', t.x, t.y - 26, 'gold');
    api.banner(fill(item.pris, { gain: api.fmt(gain) }), 5500);
    ev = null;
  }

  /* ---- Chichi sur le canapé (appelé par le salon) ---- */
  function chichi(kind) {
    if (kind === 'merci_descendu' || kind === 'merci_monte') {
      const gain = api.reward(0.7);
      global.Room.speakAnimal('chichi', fill(EV.chichi[kind], { gain: api.fmt(gain) }), 3800);
      global.Audio8.pet();
    } else {
      global.Room.speakAnimal('chichi', EV.chichi[kind], 2800);
    }
  }

  /* ---- Toucher ---- */
  // Événements : voleur, voisin (toucher Olivier), Chichi qui demande de l'aide
  function tapEvent(pt) {
    if (global.Room.thief && global.Room.hitThief(pt) && ev && ev.type === 'gilbert') { thiefCaught(); return true; }
    if (ev && ev.type === 'voisin' && ev.t < NEIGHBOR_FREEZE && global.Room.humanAt(pt) === 'oliver') { resolveNeighbor(); return true; }
    const ac = global.Room.actorAt(pt);
    if (ac && ac.id === 'chichi' && global.Room.chichiAsking()) { global.Room.chichiHelp(); return true; }
    return false;
  }
  // Toucher un humain : il dit une phrase au hasard
  function tapHuman(pt) {
    const id = global.Room.humanAt(pt);
    if (!id) return false;
    const now = performance.now();
    if (cool[id] && now - cool[id] < 1100) return true;
    cool[id] = now;
    const lines = D.TALK[id];
    if (lines && lines.length) {
      let t = pick(lines);
      for (let k = 0; k < 4 && lines.length > 1 && t === lastLine[id]; k++) t = pick(lines);
      lastLine[id] = t;
      global.Room.speak(id, t);
    }
    global.Room.hop(id);
    return true;
  }
  // Caresser un animal (il ne rapporte rien, il est juste content)
  function pet(ac) {
    const now = performance.now();
    if (cool[ac.id] && now - cool[ac.id] < 700) return;
    cool[ac.id] = now;
    global.Room.pet(ac);
    global.Audio8.pet();
    api.animalSound(ac.def, 0.22);
  }

  // Alerte kaiju (après la victoire) : Godzilla arrive à la fenêtre
  function kaiju() {
    global.Room.kaiju();
    global.Audio8.roar(0.5, 0.5);
    global.Room.floatText(D.UI.kaiju_rugissement, 42, 28, 'gold');
    api.say('octave', D.UI.dialogue_octave, D.UI.kaiju_alerte, 7000);
  }

  const eventActive = () => !!ev;
  const frozen = () => !!(ev && ev.type === 'voisin' && ev.t < NEIGHBOR_FREEZE);

  function update(dt) {
    if (ev && ev.type === 'voisin') {
      ev.t += dt;
      if (!ev.octave && ev.t > 0.9) { ev.octave = true; global.Room.speak('octave', EV.voisin.octave); }
      if (!ev.hint && ev.t > 2.4 && !api.present('oliver')) { ev.hint = true; global.Room.speak('octave', EV.voisin.indice); }
      if (ev.t >= NEIGHBOR_FREEZE) endNeighbor(false);
      return;
    }
    if (ev) return;                                // un seul événement à la fois
    if (api.busy()) return;
    chatT -= dt;
    if (chatT <= 0 && !chatBusy) { chatT = rand(30, 60); if (!startChat()) chatT = 15; }
    eventT -= dt;
    if (eventT <= 0 && !chatBusy) {
      const ok = [];
      if (api.total() >= 1500) ok.push('voisin');
      if (api.count('gilbert') > 0) ok.push('gilbert');
      eventT = rand(120, 240);
      if (ok.length) { if (pick(ok) === 'voisin') startNeighbor(); else startThief(); }
      else eventT = 40;
    }
  }

  global.Life = { init, update, frozen, eventActive, tapEvent, tapHuman, pet, chichi, thiefGone, kaiju,
    // pour les tests
    startNeighbor, startThief, startChat };
})(window);
