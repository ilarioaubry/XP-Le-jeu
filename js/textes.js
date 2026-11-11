/* =====================================================================
 *  DOGGY PARTY — Octave Tycoon : La Quête de Laure
 *  textes.js — Tous les textes du jeu dans un tableur modifiable
 *
 *  Le fichier data/textes.csv (colonnes : id ; section ; ou_ca_apparait ; texte)
 *  remplace les textes par défaut écrits dans data.js. Une case « texte » vide
 *  garde le texte par défaut. Le jeu fonctionne aussi sans ce fichier.
 *  Pour régénérer le tableur depuis data.js : node tools/export-textes.js
 * ===================================================================== */
(function (global) {
  'use strict';

  const D = global.DATA;
  const entries = [];
  const add = (id, section, where, get, set) => entries.push({ id, section, where, get, set });

  /* ---- Animaux ---- */
  D.ANIMALS.forEach((a) => {
    add('animal.' + a.id + '.nom', 'Animaux', a.name + ' : nom (carte, animation d\'unlock)', () => a.name, (v) => { a.name = v; });
    add('animal.' + a.id + '.espece', 'Animaux', a.name + ' : espèce, affichée sous son nom dans l\'animation d\'unlock', () => a.species, (v) => { a.species = v; });
    add('animal.' + a.id + '.desc', 'Animaux', a.name + ' : description (sur sa carte tant qu\'il n\'est pas débloqué, et dans l\'animation d\'unlock)', () => a.desc, (v) => { a.desc = v; });
  });

  /* ---- Managers ---- */
  D.MANAGERS.forEach((m) => {
    add('manager.' + m.id + '.nom', 'Managers', m.name + ' : nom (carte COLOC, animation d\'unlock)', () => m.name, (v) => { m.name = v; });
    add('manager.' + m.id + '.role', 'Managers', m.name + ' : rôle, affiché sous son nom', () => m.role, (v) => { m.role = v; });
    add('manager.' + m.id + '.phrase', 'Managers', m.name + ' : phrase phare, écrite pendant l\'animation d\'unlock', () => m.catch, (v) => { m.catch = v; });
  });

  /* ---- Boosts généraux ---- */
  D.BOOSTS.forEach((b) => {
    add('boost.' + b.id + '.nom', 'Boosts', 'Boost ' + b.name + ' : nom', () => b.name, (v) => { b.name = v; });
    add('boost.' + b.id + '.ref', 'Boosts', 'Boost ' + b.name + ' : sous-titre', () => b.ref, (v) => { b.ref = v; });
    add('boost.' + b.id + '.desc', 'Boosts', 'Boost ' + b.name + ' : description', () => b.desc, (v) => { b.desc = v; });
    add('boost.' + b.id + '.effet', 'Boosts', 'Boost ' + b.name + ' : effet affiché en vert', () => b.effect, (v) => { b.effect = v; });
  });

  /* ---- Conseils d'Olivier (Tournée Générale) : un tiré au hasard à chaque fois ---- */
  D.OLIVIER_ADVICE.forEach((t, i) => {
    const n = String(i + 1).padStart(2, '0');
    add('conseil.' + n, 'Conseils d\'Olivier', 'Conseil n°' + n + ' d\'Olivier, dit quand on lance la Tournée Générale (un au hasard)', () => D.OLIVIER_ADVICE[i], (v) => { D.OLIVIER_ADVICE[i] = v; });
  });

  /* ---- Paliers d'histoire : racontés par Octave quand on atteint un total de pizzas ---- */
  D.STORY.forEach((p, i) => {
    const n = String(i + 1).padStart(2, '0');
    add('palier.' + n, 'Paliers', 'Dialogue quand le total de pizzas atteint ' + p[0].toLocaleString('fr-FR'), () => D.STORY[i][1], (v) => { D.STORY[i][1] = v; });
  });

  /* ---- Dialogues et interface ---- */
  const UI_WHERE = {
    tutoriel: ['Dialogues', 'Octave au tout début de la partie, après l\'unlock de Chichi'],
    hors_ligne: ['Dialogues', 'Octave au retour dans le jeu (boost « Vers l\'infini »). {duree} = temps d\'absence, {gain} = pizzas gagnées'],
    cine_laure: ['Dialogues', 'Laure pendant la cinématique de victoire'],
    cine_victoire: ['Dialogues', 'Gros titre de la cinématique (majuscules sans accents : police pixel limitée)'],
    cine_soustitre: ['Dialogues', 'Sous-titre de la cinématique (majuscules sans accents : police pixel limitée)'],
    victoire_titre: ['Écran de victoire', 'Titre'],
    victoire_texte: ['Écran de victoire', 'Texte principal'],
    victoire_stats: ['Écran de victoire', 'Statistiques. {duree} = temps de jeu, {pizzas} = pizzas récoltées'],
    victoire_bouton: ['Écran de victoire', 'Bouton'],
    unlock_animal: ['Animation d\'unlock', 'Titre quand un animal est débloqué'],
    unlock_manager: ['Animation d\'unlock', 'Titre quand un manager est débloqué'],
    unlock_boss: ['Animation d\'unlock', 'Titre quand Laure (boss final) est débloquée'],
    unlock_gere: ['Animation d\'unlock', 'Fin de la ligne sous le nom du manager. {animal} = animal géré'],
    unlock_continuer: ['Animation d\'unlock', 'Petit texte clignotant en bas'],
    palier_titre: ['Dialogues', 'Nom affiché au-dessus des paliers d\'histoire'],
    dialogue_octave: ['Dialogues', 'Nom affiché quand Octave parle'],
    tournee_titre: ['Tournée Générale', 'Nom affiché quand Olivier donne un conseil'],
    tournee_bouton: ['Tournée Générale', 'Bouton quand la compétence est prête'],
    tournee_recharge: ['Tournée Générale', 'Bouton pendant la recharge. {secondes} = secondes restantes'],
    tournee_bandeau: ['Tournée Générale', 'Bandeau pendant l\'effet. {secondes} = secondes restantes'],
    onglet_meute: ['Interface', 'Onglet de la liste des animaux'],
    onglet_coloc: ['Interface', 'Onglet de la liste des managers'],
    onglet_boosts: ['Interface', 'Onglet de la liste des boosts'],
    label_achat: ['Interface', 'Texte avant les boutons x1 / x10 / MAX'],
    label_pps: ['Interface', 'En haut de l\'écran, avant le nombre de pizzas par seconde'],
    label_coeur: ['Interface', 'Jauge sous le salon'],
    carte_niveau: ['Cartes des animaux', 'Niveau. {niveau} = niveau actuel'],
    carte_inconnu: ['Cartes des animaux', 'Nom d\'un animal pas encore découvert'],
    carte_mystere: ['Cartes des animaux', 'Texte d\'un animal pas encore découvert'],
    carte_palier: ['Cartes des animaux', 'Prochain palier de vitesse. {niveau} = niveau du palier'],
    carte_palier_max: ['Cartes des animaux', 'Quand tous les paliers de vitesse sont atteints'],
    carte_touche: ['Cartes des animaux', 'Dans la jauge quand l\'animal attend qu\'on le touche. {pizzas} = pizzas rapportées'],
    bouton_debloquer: ['Cartes des animaux', 'Bouton d\'achat d\'un animal pas encore possédé'],
    bouton_ameliorer: ['Cartes des animaux', 'Bouton d\'amélioration'],
    manager_effet: ['Cartes des managers', 'Effet affiché en vert. {animal} = animal géré, {mult} = multiplicateur'],
    manager_competence: ['Cartes des managers', 'Ajouté à l\'effet d\'Olivier'],
    manager_boss: ['Cartes des managers', 'Ajouté à l\'effet de Laure'],
    manager_recrute: ['Cartes des managers', 'Quand le manager est déjà recruté'],
    manager_verrouille: ['Cartes des managers', 'Quand on n\'a pas encore l\'animal. {animal} = animal à débloquer'],
    boost_actif: ['Cartes des boosts', 'Quand le boost est déjà acheté'],
    boost_flottant: ['Messages flottants', 'Quand on achète un boost. {nom} = nom du boost'],
    vitesse_flottant: ['Messages flottants', 'Quand un animal passe un palier de vitesse. {animal} = son nom'],
  };
  Object.keys(D.UI).forEach((k) => {
    const w = UI_WHERE[k] || ['Interface', k];
    add('ui.' + k, w[0], w[1], () => D.UI[k], (v) => { D.UI[k] = v; });
  });

  /* ---- Lecture / écriture du CSV (séparateur « ; », guillemets acceptés) ---- */
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const rows = [];
    let row = [], field = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += c;
      } else if (c === '"' && field === '') q = true;
      else if (c === ';') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        rows.push(row); row = [];
      } else field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }
  const esc = (t) => (/[;"\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t);
  function toCSV() {
    const lines = ['id;section;ou_ca_apparait;texte'];
    entries.forEach((e) => lines.push([e.id, e.section, e.where, e.get()].map(esc).join(';')));
    return lines.join('\r\n') + '\r\n';
  }

  // Applique un CSV : ne touche que les lignes dont l'id existe et dont le texte n'est pas vide
  function apply(csv) {
    const byId = {};
    entries.forEach((e) => { byId[e.id] = e; });
    let n = 0;
    parseCSV(csv).forEach((r) => {
      const id = (r[0] || '').trim();
      if (!byId[id]) return;
      const text = r.slice(3).join(';').trim();     // les « ; » dans le texte sont acceptés
      if (text === '') return;
      byId[id].set(text); n++;
    });
    return n;
  }

  function load(url) {
    if (typeof fetch !== 'function' || typeof Promise !== 'function') return Promise.resolve(0);
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const request = fetch(url, { cache: 'no-cache', signal: ctl ? ctl.signal : undefined })
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => apply(text))
      .catch(() => 0);
    const timeout = new Promise((resolve) => setTimeout(() => { if (ctl) ctl.abort(); resolve(0); }, 2000));
    return Promise.race([request, timeout]);     // jamais bloqué plus de 2 secondes
  }

  // Textes placés directement dans la page : <span data-ui="onglet_meute">
  function applyDom() {
    document.querySelectorAll('[data-ui]').forEach((node) => {
      const t = D.UI[node.getAttribute('data-ui')];
      if (t != null) node.textContent = t;
    });
  }

  const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (v && k in v ? v[k] : m));

  global.Texts = { entries, toCSV, apply, load, applyDom, fill };
})(typeof window !== 'undefined' ? window : globalThis);
