// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const { readDb, writeDb } = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

router.post('/register', async (req, res) => {
  const { username, password, displayName } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const db = readDb();

  if (db.users.some((u) => u.username === cleanUsername)) {
    return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const palette = ['#FF3B5C', '#19E3D0', '#FFC857', '#7C5CFF', '#3DDC97'];

  const user = {
    id: uuid(),
    username: cleanUsername,
    password: hashed,
    displayName: displayName?.trim() || cleanUsername,
    bio: '',
    avatarColor: palette[Math.floor(Math.random() * palette.length)],
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  writeDb(db);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const cleanUsername = (username || '').trim().toLowerCase();

  const db = readDb();
  const user = db.users.find((u) => u.username === cleanUsername);

  if (!user) {
    return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
  }

  const match = await bcrypt.compare(password || '', user.password);
  if (!match) {
    return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  res.json({ user: publicUser(user) });
});
// backend/routes/auth.js

// Route pour mettre à jour l'avatar/logo d'un utilisateur
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    
    // req.user.id provient de ton middleware d'authentification (qui valide le token)
    const userId = req.user.id; 

    // 1. Si tu utilises un fichier db.json (Lowdb / JSON) :
    // Tu récupères l'utilisateur et tu lui associes le nouvel avatarUrl.
    // Exemple avec lowdb :
    // db.get('users').find({ id: userId }).assign({ avatarUrl }).write();
    
    // 2. Si tu utilises une base de données classique (MongoDB / Mongoose) :
    // await User.findByIdAndUpdate(userId, { avatarUrl });

    // Récupère l'utilisateur mis à jour pour le renvoyer au frontend
    const updatedUser = { ...req.user, avatarUrl }; 

    res.json({ 
      message: "Avatar mis à jour !", 
      user: updatedUser 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Impossible de mettre à jour l'avatar." });
  }
});
module.exports = router;
