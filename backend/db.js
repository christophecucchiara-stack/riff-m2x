// db.js
// Petite couche de persistance basée sur un fichier JSON.
// Pas besoin d'installer ni de configurer une vraie base de données :
// tout est lu/écrit dans data/db.json, ce qui suffit largement pour
// faire tourner ce projet en local ou pour apprendre la stack.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// S'assure que le fichier existe avant la première lecture.
function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    writeDb({ users: [], videos: [], comments: [] });
  }
}

ensureDb();

module.exports = { readDb, writeDb };
