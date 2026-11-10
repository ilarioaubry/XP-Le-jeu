/* =====================================================================
 *  DOGGY PARTY — Octave Tycoon : La Quête de Laure
 *  data.js — Toutes les données du jeu (animaux, managers, boosts, textes)
 *
 *  Principe (à la AdVenture Capitalist) :
 *  - On touche un animal : il part chercher des pizzas. Le trajet dure `time` secondes
 *    et rapporte `pps × time × niveau` pizzas.
 *  - L'améliorer (+1 niveau) augmente la quantité rapportée. Certains paliers de niveau
 *    divisent son temps de trajet par 2.
 *  - Son manager (un humain de la coloc) automatise les trajets et double sa rentabilité.
 *  - Les boosts sont des bonus généraux.
 * ===================================================================== */
(function (global) {
  'use strict';

  const DATA = {
    SAVE_KEY: 'doggyparty.octaveTycoon.v2',
    GROWTH: 1.15,                      // +15 % de coût par niveau acheté
    MANAGER_MULT: 2,                   // un manager double la rentabilité de son animal
    SPEED_MILESTONES: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], // temps /2 à chaque palier
    WIN_AT: 1e9,

    /* time = durée du trajet (s) ; pps = pizzas par seconde et par niveau ; manager = id du manager */
    /* speed = vitesse de marche dans le salon ; still = reste assis à sa place ; un seul animal par espèce dans le salon */
    ANIMALS: [
      { id: 'chichi', name: 'Chichi', species: 'Chien', desc: 'Petit chien vif qui gratte les miettes.', cost: 15, time: 2, pps: 1, manager: 'janis', sound: 'bark', pitch: 1.6, speed: 0, still: true },
      { id: 'saphire', name: 'Saphire', species: 'Chien', desc: 'Flaire les parts oubliées sous le canapé.', cost: 100, time: 5, pps: 8, manager: 'anna', sound: 'bark', pitch: 1.2, speed: 20 },
      { id: 'bouba', name: 'Bouba', species: 'Chien', desc: 'Le gros tank qui rapporte des boîtes entières.', cost: 1100, time: 10, pps: 45, manager: 'oliver', sound: 'bark', pitch: 0.65, speed: 12 },
      { id: 'gilbert', name: 'Gilbert', species: 'Chat', desc: 'Le nouveau chat chaotique qui braque les livreurs.', cost: 12000, time: 20, pps: 260, manager: 'adeline', sound: 'meow', pitch: 1.1, speed: 30 },
      { id: 'idylle', name: 'Idylle', species: 'Chien (Pékinois)', desc: "L'élite du dressage, ultra disciplinée.", cost: 130000, time: 40, pps: 1400, manager: 'ilario', sound: 'bark', pitch: 1.0, speed: 14 },
      { id: 'july', name: 'July la Queen', species: 'Chat Ultime', desc: 'La reine absolue sur son trône de cartons.', cost: 1400000, time: 80, pps: 10000, manager: 'laure', sound: 'meow', pitch: 0.8, speed: 0, still: true },
    ],

    /* Un manager par animal : il automatise ses trajets et double sa rentabilité */
    MANAGERS: [
      { id: 'janis', animal: 'chichi', name: 'Janis', role: 'Coloc · Mode Paysanne', catch: 'On gaspille rien : même les miettes, on les récolte !', cost: 1500 },
      { id: 'anna', animal: 'saphire', name: 'Anna', role: 'Coloc · Mimi Baddie', catch: 'Wesh la coloc ! Cette meute va devenir virale !', cost: 15000 },
      { id: 'oliver', animal: 'bouba', name: 'Olivier', role: "Le Père d'Octave", catch: 'Santé fiston ! La tournée est pour moi !', cost: 180000, skill: true },
      { id: 'adeline', animal: 'gilbert', name: 'Adeline', role: 'Coloc · Casquette Ciele', catch: 'Je repère les bons plans avant tout le monde. De rien !', cost: 2100000 },
      { id: 'ilario', animal: 'idylle', name: 'Ilario', role: 'Maître-chien · Dressage', catch: 'Au pied ! Et que ça saute !', cost: 24000000 },
      { id: 'laure', animal: 'july', name: 'Laure', role: 'Le Crush Gothique · BOSS FINAL', catch: '... Ton capital symbolique est fascinant.', cost: 1e9, boss: true },
    ],

    /* Boosts généraux (achetables une fois) */
    BOOSTS: [
      { id: 'coupons', icon: 'icoCoupon', name: "Coupons Domino's", ref: 'Bon plan de la coloc', desc: 'Les croquettes en promo, la meute à prix cassé.', effect: '-20% sur le prix de toutes les améliorations', cost: 25000, discount: 0.8 },
      { id: 'haki', icon: 'icoHaki', name: 'Haki des Rois', ref: 'Tattoo One Piece', desc: "Octave dégage une aura de roi. Toute la meute court plus vite.", effect: 'Tous les trajets 2x plus rapides', cost: 400000, speed: 2 },
      { id: 'egoist', icon: 'icoEgoist', name: "Mentalité d'Égoïste", ref: 'Tattoo Blue Lock', desc: 'Chaque chien veut être le numéro 1 de la meute.', effect: 'Chichi, Saphire & Bouba : pizzas x2', cost: 2000000, ids: ['chichi', 'saphire', 'bouba'], mult: 2 },
      { id: 'hype', icon: 'icoHype', name: 'Hype TikTok', ref: 'La coloc devient virale', desc: 'Les livreurs se battent pour livrer à la coloc.', effect: 'Toutes les pizzas +35%', cost: 12000000, global: 1.35 },
      { id: 'kaneda', icon: 'icoKaneda', name: 'Moto de Kaneda', ref: 'Tattoo Akira', desc: 'Livraison en dérapage à travers Montpellier.', effect: 'Gilbert, Idylle & July : pizzas x2', cost: 80000000, ids: ['gilbert', 'idylle', 'july'], mult: 2 },
      { id: 'infinity', icon: 'icoInfinity', name: "Vers l'infini et au-delà", ref: 'Tattoo Toy Story', desc: 'La meute ne dort jamais. Même quand Octave dort.', effect: 'Toutes les pizzas x2 + gains hors-ligne', cost: 400000000, global: 2, offline: true },
    ],

    /* Textes de l'interface et des dialogues (modifiables dans data/textes.csv).
       {mots entre accolades} = valeurs remplacées par le jeu : à garder tels quels. */
    UI: {
      tutoriel: "Touche Chichi : il part chercher des pizzas ! Améliore-le pour qu'il en rapporte plus, puis recrute Janis pour qu'il y aille tout seul.",
      hors_ligne: 'Pendant mon absence ({duree}), la meute a ramené {gain} pizzas. Bons chiens.',
      cine_laure: "... Ta meute a un capital symbolique fascinant. Bourdieu n'avait pas prévu Chichi. ... On partage cette pizza ?",
      cine_victoire: 'VICTOIRE !',
      cine_soustitre: 'LAURE A DIT OUI',
      victoire_titre: '♥ VICTOIRE ♥',
      victoire_texte: 'Laure a refermé son Bourdieu. Elle te regarde. Elle sourit (un peu). Elle accepte une part de pizza.',
      victoire_stats: 'Temps de jeu : {duree} · Pizzas récoltées : {pizzas}',
      victoire_bouton: 'CONTINUER LA PARTY',
      unlock_animal: 'NOUVEAU DANS LA MEUTE !',
      unlock_manager: 'NOUVEAU MANAGER !',
      unlock_boss: 'LE BOSS FINAL ARRIVE !',
      unlock_gere: 'gère {animal}',
      unlock_continuer: 'TOUCHE POUR CONTINUER',
      palier_titre: '★ PALIER',
      dialogue_octave: 'OCTAVE',
      tournee_titre: 'OLIVIER (le daron)',
      tournee_bouton: 'TOURNÉE GÉNÉRALE !',
      tournee_recharge: 'RECHARGE {secondes}s',
      tournee_bandeau: '🍺 TOURNÉE GÉNÉRALE x3 · {secondes}s',
      onglet_meute: 'MEUTE',
      onglet_coloc: 'COLOC',
      onglet_boosts: 'BOOSTS',
      label_achat: 'Achat :',
      label_pps: 'Pizzas / seconde :',
      label_coeur: '♥ Cœur de Laure',
      carte_niveau: 'Niv. {niveau}',
      carte_inconnu: '???',
      carte_mystere: 'Continue de récolter pour le découvrir.',
      carte_palier: 'Niv. {niveau} : vitesse x2',
      carte_palier_max: 'Vitesse maximale !',
      carte_touche: 'TOUCHE ! +{pizzas} 🍕',
      bouton_debloquer: 'DÉBLOQUER',
      bouton_ameliorer: 'AMÉLIORER',
      manager_effet: 'Automatise {animal} · ses pizzas x{mult}',
      manager_competence: ' · Compétence « Tournée Générale »',
      manager_boss: ' · Production x10 000 · Victoire',
      manager_recrute: 'RECRUTÉ ✓',
      manager_verrouille: "Débloque d'abord {animal}",
      boost_actif: 'ACTIF ✓',
      boost_flottant: 'BOOST : {nom}',
      vitesse_flottant: '⚡ {animal} : VITESSE x2 !',
    },

    OLIVIER_ADVICE: [
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
    ],

    STORY: [
    [100, 'La coloc sent officiellement la pizza. Les voisins commencent à se poser des questions.'],
    [1000, '1 000 pizzas ! La table basse a disparu sous les cartons.'],
    [10000, "10 000 pizzas. Le livreur de Domino's connaît désormais Chichi par son prénom."],
    [100000, '100 000 pizzas. Midi Libre parle d\'une « odeur suspecte de margherita » dans l\'Écusson.'],
    [1000000, '1 MILLION de pizzas. Laure a levé les yeux de son livre pendant 0,3 seconde.'],
    [10000000, '10 millions. La coloc est visible depuis la Comédie. Par l\'odeur.'],
    [100000000, '100 millions. Laure a noté « phénomène de meute » dans son carnet de terrain.'],
    [1000000000, "1 MILLIARD de pizzas. C'est le moment. Laure attend."],
  ],
  };

  global.DATA = DATA;
})(window);
