const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

function readDb() {
  try {
    // Si le fichier n'existe pas, on le crée avec une structure valide
    if (!fs.existsSync(dbPath)) {
      const defaultData = { users: [], videos: [], comments: [] };
      fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }

    const data = fs.readFileSync(dbPath, 'utf8').trim();
    
    // 🟢 SÉCURITÉ : Si le fichier est complètement vide (0 octet), on évite le crash !
    if (!data) {
      const defaultData = { users: [], videos: [], comments: [] };
      fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }

    return JSON.parse(data);
  } catch (error) {
    // Si le JSON est malformé, on renvoie une structure vide pour éviter de bloquer le serveur
    console.error("Erreur de lecture de la DB, réinitialisation sécurisée :", error.message);
    return { users: [], videos: [], comments: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readDb,
  writeDb
};