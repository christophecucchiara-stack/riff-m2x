// routes/videos.js
const path = require('path');
const express = require('express');
const multer = require('multer');
const { v4: uuid } = require('uuid');

const { readDb, writeDb } = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// --- Stockage des vidéos uploadées sur le disque local ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 Mo
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Seuls les fichiers vidéo sont acceptés.'));
    }
    cb(null, true);
  },
});

function toPublicVideo(video, db, currentUserId) {
  const author = db.users.find((u) => u.id === video.userId);
  const commentCount = db.comments.filter((c) => c.videoId === video.id).length;

  return {
    id: video.id,
    url: video.url.startsWith('http') ? video.url : `/uploads/${path.basename(video.url)}`,
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

// GET /api/videos?cursor=0&limit=5
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

// POST /api/videos  (multipart/form-data : champ "video", "caption", "sound")
router.post('/', requireAuth, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Ajoute un fichier vidéo.' });
  }

  const db = readDb();
  const video = {
    id: uuid(),
    userId: req.userId,
    url: req.file.filename,
    caption: (req.body.caption || '').slice(0, 300),
    sound: req.body.sound?.trim() || 'Son original',
    likes: [],
    createdAt: new Date().toISOString(),
  };

  db.videos.push(video);
  writeDb(db);

  res.status(201).json({ video: toPublicVideo(video, db, req.userId) });
});

// POST /api/videos/:id/like  -> ajoute ou retire le like de l'utilisateur courant
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

// POST /api/videos/:id/comments  { text }
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
