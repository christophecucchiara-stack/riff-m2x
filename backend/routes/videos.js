// routes/videos.js
const path = require('path');
const express = require('express');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const { readDb, writeDb } = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configuration Cloudinary avec tes futures variables d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration du stockage pour envoyer directement sur Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'riff_videos',
    resource_type: 'video', // Très important pour supporter les fichiers .mp4
    public_id: (req, file) => uuid(),
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limite à 100 Mo par vidéo
});

function toPublicVideo(video, db, currentUserId) {
  const author = db.users.find((u) => u.id === video.userId);
  const commentCount = db.comments.filter((c) => c.videoId === video.id).length;

  return {
    id: video.id,
    url: video.url, // Cloudinary donne directement une URL HTTPS absolue (plus besoin de resolveMediaUrl !)
    caption: video.caption,
    sound: video.sound,
    createdAt: video.createdAt,
    likeCount: video.likes.length,
    commentCount,
    hasLiked: currentUserId ? video.likes.includes(currentUserId) : false,
    author: author
      ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          avatarColor: author.avatarColor,
        }
      : null,
  };
}

// GET /api/videos
router.get('/', optionalAuth, (req, res) => {
  const db = readDb();
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
  const cursor = parseInt(req.query.cursor, 10) || 0;

  const sorted = [...db.videos].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const page = sorted.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < sorted.length ? cursor + limit : null;

  res.json({
    videos: page.map((v) => toPublicVideo(v, db, req.userId)),
    nextCursor,
  });
});

// POST /api/videos (Envoi de la vidéo vers Cloudinary)
router.post('/', requireAuth, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Ajoute un fichier vidéo.' });
  }

  const db = readDb();
  const video = {
    id: uuid(),
    userId: req.userId,
    url: req.file.path, // 🟢 Récupère l'URL sécurisée générée par Cloudinary !
    caption: (req.body.caption || '').slice(0, 300),
    sound: req.body.sound?.trim() || 'Son original',
    likes: [],
    createdAt: new Date().toISOString(),
  };

  db.videos.push(video);
  writeDb(db);

  res.status(201).json({ video: toPublicVideo(video, db, req.userId) });
});

// POST /api/videos/:id/like
router.post('/:id/like', requireAuth, (req, res) => {
  const db = readDb();
  const video = db.videos.find((v) => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Vidéo introuvable.' });

  const already = video.likes.includes(req.userId);
  video.likes = already
    ? video.likes.filter((id) => id !== req.userId)
    : [...video.likes, req.userId];

  writeDb(db);
  res.json({ likeCount: video.likes.length, hasLiked: !already });
});

// GET /api/videos/:id/comments
router.get('/:id/comments', (req, res) => {
  const db = readDb();
  const video = db.videos.find((v) => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Vidéo introuvable.' });

  const comments = db.comments
    .filter((c) => c.videoId === req.params.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((c) => {
      const author = db.users.find((u) => u.id === c.userId);
      return {
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        author: author
          ? { username: author.username, displayName: author.displayName, avatarColor: author.avatarColor }
          : null,
      };
    });

  res.json({ comments });
});

// POST /api/videos/:id/comments
router.post('/:id/comments', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Le commentaire est vide.' });
  }

  const db = readDb();
  const video = db.videos.find((v) => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Vidéo introuvable.' });

  const comment = {
    id: uuid(),
    videoId: req.params.id,
    userId: req.userId,
    text: text.trim().slice(0, 300),
    createdAt: new Date().toISOString(),
  };
  db.comments.push(comment);
  writeDb(db);

  const author = db.users.find((u) => u.id === req.userId);
  res.status(201).json({
    comment: {
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      author: { username: author.username, displayName: author.displayName, avatarColor: author.avatarColor },
    },
  });
});

module.exports = router;