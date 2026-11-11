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

    /* time = durée du trajet (s) ; pps = pizzas par seconde et par niveau ; manager = id du manager
       speed = vitesse de marche dans le salon ; still = reste à sa place ; window = apparaît à la fenêtre
       postgame = n'apparaît qu'après la victoire ; un seul animal par espèce dans le salon */
    ANIMALS: [
      { id: 'chichi', name: 'Chichi', species: 'Chien', desc: 'Petit chien vif qui gratte les miettes.', cost: 15, time: 2, pps: 1, manager: 'janis', sound: 'bark', pitch: 1.6, speed: 0, still: true },
      { id: 'saphire', name: 'Saphire', species: 'Chien', desc: 'Flaire les parts oubliées sous le canapé.', cost: 100, time: 5, pps: 8, manager: 'anna', sound: 'bark', pitch: 1.2, speed: 20 },
      { id: 'jojo', name: 'Jojo Lardon', species: 'Peluche (singe IKEA)', desc: "Le singe peluche d'IKEA : il ne dort jamais, il te regarde.", cost: 400, time: 6, pps: 20, manager: 'janis', sound: 'squeak', pitch: 1.5, speed: 14 },
      { id: 'bouba', name: 'Bouba', species: 'Chien', desc: 'Le gros tank qui rapporte des boîtes entières.', cost: 1100, time: 10, pps: 45, manager: 'oliver', sound: 'bark', pitch: 0.65, speed: 12 },
      { id: 'brindibou', name: 'Brindibou', species: 'Pokémon (Plante/Vol)', desc: 'Petit hibou-plante qui livre des pizzas en silence, la nuit.', cost: 4500, time: 14, pps: 120, manager: 'anna', sound: 'hoot', pitch: 1.0, speed: 26 },
      { id: 'gilbert', name: 'Gilbert', species: 'Chat', desc: 'Le nouveau chat chaotique qui braque les livreurs.', cost: 12000, time: 20, pps: 260, manager: 'adeline', sound: 'meow', pitch: 1.1, speed: 30 },
      { id: 'idylle', name: 'Idylle', species: 'Chien (Pékinois)', desc: "L'élite du dressage, ultra disciplinée.", cost: 130000, time: 40, pps: 1400, manager: 'ilario', sound: 'bark', pitch: 1.0, speed: 14 },
      { id: 'july', name: 'July la Queen', species: 'Chat Ultime', desc: 'La reine absolue sur son trône de cartons.', cost: 1400000, time: 80, pps: 10000, manager: 'laure', sound: 'meow', pitch: 0.8, speed: 0, still: true },
      { id: 'godzilla', name: 'Godzilla', species: 'Kaiju', desc: 'Le roi des monstres. Il ne rapporte pas des pizzas : il pille les pizzerias.', cost: 3e13, time: 200, pps: 2e8, manager: 'octave', sound: 'roar', pitch: 0.5, speed: 0, still: true, window: true, postgame: true },
    ],

    /* Un manager gère un ou plusieurs animaux : il automatise leurs trajets et double leur rentabilité */
    MANAGERS: [
      { id: 'janis', animals: ['chichi', 'jojo'], name: 'Janis', role: 'Coloc · Emmaüs & blocus', catch: 'Rien ne se perd, tout se récupère. Comme à Emmaüs !', cost: 2500 },
      { id: 'anna', animals: ['saphire', 'brindibou'], name: 'Anna', role: 'Coloc · Artiste', catch: 'Cette meute sera ma plus belle toile. DarlingChouchou va adorer.', cost: 20000 },
      { id: 'oliver', animals: ['bouba'], name: 'Olivier', role: "Le Père d'Octave", catch: 'Santé fiston ! La tournée est pour moi !', cost: 180000, skill: true },
      { id: 'adeline', animals: ['gilbert'], name: 'Adeline', role: 'Coloc · Casquette Ciele', catch: 'Je repère les bons plans avant tout le monde. De rien !', cost: 2100000 },
      { id: 'ilario', animals: ['idylle'], name: 'Ilario', role: 'Maître-chien · Dressage', catch: 'Au pied ! Et que ça saute !', cost: 24000000 },
      { id: 'laure', animals: ['july'], name: 'Laure', role: 'Le Crush Gothique · BOSS FINAL', catch: '... Ton capital symbolique est fascinant.', cost: 1e9, boss: true },
      { id: 'octave', animals: ['godzilla'], name: 'Octave', role: 'Dresseur de kaiju', catch: 'Assis ! ... Bon, reste debout.', cost: 4e14 },
    ],

    /* Boosts généraux (achetables une fois) */
    BOOSTS: [
      { id: 'coupons', icon: 'icoCoupon', name: "Coupons Domino's", ref: 'Bon plan de la coloc', desc: 'Les croquettes en promo, la meute à prix cassé.', effect: '-20% sur le prix de toutes les améliorations', cost: 25000, discount: 0.8 },
      { id: 'haki', icon: 'icoHaki', name: 'Haki des Rois', ref: 'Tattoo One Piece', desc: "Octave dégage une aura de roi. Toute la meute court plus vite.", effect: 'Tous les trajets 2x plus rapides', cost: 400000, speed: 2 },
      { id: 'egoist', icon: 'icoEgoist', name: "Mentalité d'Égoïste", ref: 'Tattoo Blue Lock', desc: 'Chaque chien veut être le numéro 1 de la meute.', effect: 'Chichi, Saphire & Bouba : pizzas x2', cost: 2000000, ids: ['chichi', 'saphire', 'bouba'], mult: 2 },
      { id: 'hype', icon: 'icoHype', name: 'Vernissage de la coloc', ref: 'Anna expose', desc: 'DarlingChouchou et Théodora ont tout acheté, même les pizzas.', effect: 'Toutes les pizzas +35%', cost: 12000000, global: 1.35 },
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
      kaiju_alerte: 'Le sol tremble… Quelque chose rôde derrière la fenêtre. Un kaiju ?! Il a l\'air de chercher des pizzas.',
      kaiju_rugissement: 'GRAAAOUUU !',
      carte_gere: 'gère {animal}',
    },

    /* Phrases dites quand on touche un personnage (une au hasard). Une case par phrase dans le tableur. */
    TALK: {
      octave: [
        'Un milliard de pizzas... c\'est un début.',
        'Laure m\'a regardé hier. Enfin, dans ma direction.',
        'Je suis maître-chien, pas maître de moi-même.',
        'Quelqu\'un a vu mes mangas ? ... Ah, par terre.',
        'Akira, tome 3. Encore.',
        'Si Laure me répond, j\'arrête la pizza. Peut-être.',
      ],
      janis: [
        'Emmaüs avait des chaises à 5 euros. J\'ai pris tout le stock.',
        'Blocus à Paul-Valéry demain. Ramenez des sandwichs.',
        'J\'ai trouvé Jojo Lardon à Emmaüs. Il me regardait.',
        'En AG, ils ont voté quelque chose. Personne sait quoi.',
        'Emmaüs, c\'est mon Louvre.',
        'Pas de cours demain : le blocus s\'organise. Les croquettes aussi.',
      ],
      anna: [
        'DarlingChouchou m\'a envoyé un croquis. J\'en tremble encore.',
        'Théodora dit que la pizza, c\'est de l\'art conceptuel.',
        'Ma prochaine expo : DarlingChouchou et Théodora, techniques mixtes.',
        'Théodora a posé sa tête sur mon épaule. La muse, quoi.',
        'J\'ai fait le portrait de DarlingChouchou en sauce tomate.',
        'Sans Théodora, mon trait n\'est plus le même.',
      ],
      oliver: [
        'Le truc avec la bière, c\'est qu\'elle se boit.',
        'Fiston, une pizza sans fromage, c\'est une galette.',
        'J\'ai toujours dit : pas de conseils. Voilà, c\'est un conseil.',
        'Santé !',
        'À Palavas en 94, j\'avais des cheveux.',
        'Moi, la sociologie, j\'y ai juste goûté.',
      ],
      adeline: [
        'Et toi, qu\'est-ce que ça te fait de récolter autant de pizzas ?',
        'Le vide qu\'on remplit de pizza, tu y as déjà pensé ?',
        'Gilbert exprime peut-être son enfant intérieur.',
        'Qu\'est-ce que cette absence réveille chez toi ?',
        'On est tous le chien de quelqu\'un.',
        'Respire. Observe la meute. Qu\'est-ce que tu ressens ?',
      ],
      ilario: [
        'Apagnan !',
        'Quoicoubeh.',
        'T\'as les cramptés ?',
        'Apagnan, c\'est chaud.',
        'T\'as les cramptés ou pas ?',
        'Quoicoubeh, mec.',
      ],
      laure: [
        '...',
        'Bourdieu avait raison. Sur tout.',
        'Je lis. Merci.',
        'Le capital symbolique d\'un chien est sous-estimé.',
        'Ne me parle pas de pizza. ... Si, continue.',
      ],
    },

    /* Conversations dans le salon (toutes les 30 à 60 secondes, si les personnages sont là) */
    CHATS: [
      { lines: [['oliver', 'Bourdieu, c\'est pas le gardien de Montpellier ?'], ['laure', '...'], ['oliver', 'Santé.']] },
      { lines: [['janis', 'Y\'a un blocus à Paul-Valéry, tu viens ?'], ['anna', 'Théodora dit que le blocus est une performance.'], ['janis', 'Théodora ramène des sandwichs ?']] },
      { lines: [['adeline', 'Qu\'est-ce qui te pousse à vouloir impressionner Laure ?'], ['octave', '... Les pizzas ?'], ['adeline', 'Hm. Intéressant.']] },
      { lines: [['ilario', 'Apagnan !'], ['oliver', 'Santé, fiston.'], ['ilario', 'Quoicoubeh.']] },
      { lines: [['anna', 'DarlingChouchou dit que tu me comprends trop bien.'], ['adeline', 'Et ça te fait quoi ?'], ['anna', 'Un tableau.']] },
      { lines: [['janis', 'J\'ai trouvé un four à Emmaüs.'], ['octave', 'Un four à pizza ?'], ['janis', 'Un four. On verra.']] },
      { lines: [['ilario', 'T\'as les cramptés ?'], ['adeline', 'Qu\'est-ce que cette question dit de toi ?'], ['ilario', 'Quoicoubeh.']] },
      { lines: [['oliver', 'À Emmaüs j\'ai acheté un tonneau.'], ['janis', 'Il est vide ?'], ['oliver', 'Il l\'était.']] },
      { lines: [['octave', 'Ton Idylle est bien dressée, Ilario.'], ['ilario', 'Apagnan, c\'est elle qui me dresse.']] },
      { lines: [['anna', 'Théodora aimerait te peindre, Laure.'], ['laure', '... Pas aujourd\'hui.'], ['anna', 'DarlingChouchou dit pareil.']] },
      { lines: [['adeline', 'Olivier, qu\'est-ce que la bière vous apporte ?'], ['oliver', 'De la mousse.'], ['adeline', 'On creuse.']] },
      { lines: [['janis', 'Ilario, tu viens au blocus ?'], ['ilario', 'Quoicoubeh ?'], ['janis', 'J\'en conclus que oui.']] },
      { lines: [['octave', 'Laure, tu veux une part ?'], ['laure', '... Peut-être.'], ['octave', 'Elle a dit peut-être !!']] },
      { lines: [['anna', 'J\'expose DarlingChouchou à Paul-Valéry.'], ['janis', 'Pendant le blocus ? Le public sera sur place.']] },
    ],

    /* Événements surprise et Chichi sur le canapé */
    EVENTS: {
      voisin: {
        annonce: 'Le voisin du dessous tape au plafond avec son balai ! La meute se fige…',
        indice: 'Il faudrait quelqu\'un pour aller lui parler…',
        octave: 'Chut !! Plus un bruit !',
        olivier: 'Je m\'en occupe. J\'ai une bière pour lui.',
        succes: 'Le voisin est calmé. Il t\'offre {gain} pizzas pour la peine.',
        fin: 'Le voisin se calme. Pour l\'instant.',
      },
      gilbert: [
        { sprite: 'beer', annonce: 'Gilbert a volé la bière d\'Olivier ! Attrape-le !', pris: 'Gilbert lâche la bière. Olivier, ému, te donne {gain} pizzas.', fuite: 'Gilbert s\'enfuit avec la bière d\'Olivier…' },
        { sprite: 'itemSketch', annonce: 'Gilbert a volé le carnet de croquis d\'Anna ! Attrape-le !', pris: 'Gilbert lâche le carnet. Anna te donne {gain} pizzas contre un croquis de toi.', fuite: 'Gilbert s\'enfuit avec le carnet de croquis d\'Anna…' },
        { sprite: 'itemHelmet', annonce: 'Gilbert a volé le casque de Bouba ! Attrape-le !', pris: 'Gilbert lâche le casque. Bouba aboie de joie et t\'apporte {gain} pizzas.', fuite: 'Gilbert s\'enfuit avec le casque de Bouba…' },
      ],
      chichi: {
        demande_descendre: 'Quelqu\'un peut m\'aider à descendre ?',
        merci_descendu: 'Merci ! Le sol, c\'est la vie. Tiens, {gain} pizzas.',
        abandon_descendre: 'Bon... je reste là-haut.',
        demande_monter: 'Je peux remonter sur le canapé ?',
        merci_monte: 'Ah, mon canapé ♥ Tiens, {gain} pizzas.',
        abandon_monter: 'Tant pis, je remonte toute seule !',
      },
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
