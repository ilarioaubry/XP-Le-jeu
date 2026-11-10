# Doggy Party

## Octave Tycoon : La Quête de Laure

Un jeu *Idle Tycoon* en Pixel Art rétro (16-bit / GameBoy Color sombre), pensé pour **téléphone**,
dans l'esprit d'AdVenture Capitalist. Octave, maître-chien au chômage à Montpellier, doit récolter
**1 milliard de pizzas** avec sa meute pour impressionner **Laure**, son crush gothique passionnée de sociologie.

Tous les graphismes sont dessinés en code sur un `<canvas>` HTML5 (pixel art procédural) et les sons sont
générés avec la Web Audio API : aucun fichier image ou son externe.

### Comment jouer

1. **Touche un animal** (sa carte dans la liste, ou directement dans le salon) : il part chercher des pizzas.
   Le trajet dure un certain temps et rapporte un certain nombre de pizzas.
2. **Améliore-le** : plus de niveaux = plus de pizzas par trajet. Aux paliers de niveau (25, 50, 100…),
   ses trajets deviennent 2 fois plus rapides.
3. **Recrute son manager** (un humain de la coloc) : il automatise les trajets et double la rentabilité de l'animal.
4. **Achète des boosts** généraux (onglet BOOSTS).
5. Chaque animal et chaque manager débloqué déclenche une **animation d'UnLock**, avec la phrase phare du manager.
6. Atteins **1 milliard de pizzas** et recrute **Laure** pour gagner.

| Animal | Manager | Phrase phare |
|---|---|---|
| Chichi | Janis | « On gaspille rien : même les miettes, on les récolte ! » |
| Saphire | Anna | « Wesh la coloc ! Cette meute va devenir virale ! » |
| Bouba | Olivier | « Santé fiston ! La tournée est pour moi ! » (débloque la *Tournée Générale* : x3 pendant 15 s) |
| Gilbert | Adeline | « Je repère les bons plans avant tout le monde. De rien ! » |
| Idylle | Ilario | « Au pied ! Et que ça saute ! » |
| July la Queen | Laure | « ... Ton capital symbolique est fascinant. » (production x10 000 et victoire) |

### Modifier les textes (tableur)

Tous les textes écrits pour le jeu sont dans **`data/textes.csv`** (colonnes `id ; section ; ou_ca_apparait ; texte`).
Modifie la dernière colonne (`texte`) sur GitHub (crayon ✏️) ou dans un tableur, enregistre : le jeu les utilise au
prochain chargement. Une case vide garde le texte d'origine. Garde les mots entre accolades (`{animal}`, `{gain}`…),
le jeu les remplace. Pour régénérer le tableur depuis les textes par défaut : `node tools/export-textes.js`.

### Lancer le jeu

```bash
cd XP-Le-jeu
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Sur iPhone : écran fixe sans défilement ni zoom. « Sur l'écran d'accueil » (Partager) lance le jeu en plein écran.
Pour tester dans la console du navigateur : `DoggyParty.give(1e9)`.

### Architecture

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page (en-tête, salon, boutique, dialogues, animation d'UnLock) |
| `css/style.css` | Thème Pixel Art : bordures en escalier, polices *Press Start 2P* / *VT323*, palette gothique-néon |
| `js/sprites.js` | Moteur de pixel art (grille, formes, ombrage, contour), pizza, cartons, icônes, mini-police 3x5 |
| `js/characters.js` | Les 6 animaux (4 images : repos et marche) et les 5 humains (24x32), dessinés d'après les photos |
| `js/data.js` | Données : animaux, managers, boosts, textes par défaut |
| `js/textes.js` | Charge `data/textes.csv` et remplace les textes par défaut |
| `data/textes.csv` | Tableur de tous les textes, modifiable |
| `js/audio.js` | Bruitages 8-bit générés avec la Web Audio API |
| `js/room.js` | Le salon animé (canvas) : décor, animaux en déplacement, pizza dorée, cinématique de victoire |
| `js/game.js` | Économie, interface, boucle de jeu, sauvegarde `localStorage` |
