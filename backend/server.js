// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Fichiers vidéo uploadés, servis statiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Gestion d'erreurs simple (ex : fichier trop gros, type de fichier refusé)
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message || 'Une erreur est survenue.' });
});

app.listen(PORT, () => {
  console.log(`Riff API en écoute sur http://localhost:${PORT}`);
});
