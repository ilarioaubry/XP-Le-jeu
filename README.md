# Doggy Party

## Octave Tycoon : La Quête de Laure

Un jeu *Idle Tycoon / Clicker* en Pixel Art rétro (16-bit / GameBoy Color sombre).
Octave, maître-chien au chômage à Montpellier, doit récolter **1 milliard de pizzas** avec sa meute
pour impressionner **Laure**, son crush gothique passionnée de sociologie.

Tous les graphismes sont dessinés en code sur un `<canvas>` HTML5 à partir de matrices de pixels.
Les sons sont générés avec la Web Audio API. Le jeu n'utilise aucun fichier image ou son externe.

### Lancer le jeu

```bash
cd XP-Le-jeu
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

(Ou `npx serve .`, ou simplement ouvrir `index.html` dans un navigateur.)

### Architecture

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page (HUD, salon, boutique, dialogues) |
| `css/style.css` | Thème Pixel Art : bordures en escalier, polices *Press Start 2P* / *VT323*, palette gothique-néon |
| `js/sprites.js` | Moteur de pixel art (grille, formes, ombrage, contour), pizza, cartons, icônes, mini-police 3x5 |
| `js/characters.js` | Les 6 animaux (4 images : repos et marche) et les 5 humains (24x32), dessinés d'après les photos |
| `js/audio.js` | Bruitages 8-bit générés avec la Web Audio API (clic, achat, aboiements, miaulements, rot d'Olivier…) |
| `js/game.js` | Boucle de jeu, économie, salon animé, cinématique, sauvegarde `localStorage` |

### Contenu

- **Meute (générateurs, +15 % de coût par achat)** : Chichi (1 PPS), Saphire (8), Bouba (45), Gilbert (260), Idylle (1 400), July la Queen (10 000)
- **Colocs (managers)** : Janis (-20 % sur le prix des animaux), Anna (+35 % de production), Olivier (compétence *Tournée Générale* : x3 pendant 15 s, recharge 60 s), Adeline (pizzas dorées 2x plus fréquentes et 2x plus généreuses), Laure (1 milliard : x10 000 et cinématique de victoire)
- **Tattoos (upgrades)** : Haki des Rois (clic x5), Mentalité d'Égoïste (chiens x2), Moto de Kaneda (Gilbert/Idylle/July x2), Vers l'infini et au-delà (x2 global et gains hors-ligne)
- Pizzas dorées aléatoires, paliers racontés par Octave, achat x1 / x10 / MAX, sauvegarde automatique

Jeu pensé pour téléphone uniquement : écran fixe sans défilement ni zoom. « Sur l'écran d'accueil » (Partager) lance le jeu en plein écran.

Raccourcis : `Espace` ou `Entrée` sur le salon pour cliquer la pizza.
Pour tester dans la console du navigateur : `DoggyParty.give(1e9)`.
