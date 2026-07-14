// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Bloque la route si aucun token valide n'est fourni.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Connecte-toi pour continuer.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expirée, reconnecte-toi.' });
  }
}

// Lit le token si présent mais ne bloque jamais la requête.
// Utile pour savoir si l'utilisateur courant a liké une vidéo, par exemple.
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.userId = payload.userId;
    } catch (err) {
      // Token invalide : on continue simplement sans utilisateur connecté.
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
