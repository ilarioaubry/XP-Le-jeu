// Régénère data/textes.csv à partir des textes par défaut de js/data.js
// Usage : node tools/export-textes.js
const fs = require('fs');
const path = require('path');
global.window = global;
require(path.join(__dirname, '..', 'js', 'data.js'));
require(path.join(__dirname, '..', 'js', 'textes.js'));
const out = path.join(__dirname, '..', 'data', 'textes.csv');
fs.writeFileSync(out, '﻿' + global.Texts.toCSV());
console.log(global.Texts.entries.length + ' textes écrits dans ' + out);
