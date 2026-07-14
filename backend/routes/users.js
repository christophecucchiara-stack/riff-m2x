// routes/users.js
const path = require('path');
const express = require('express');
const { readDb } = require('../db');

const router = express.Router();

router.get('/:username', (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.username === req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const videos = db.videos
    .filter((v) => v.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((v) => ({
      id: v.id,
      url: v.url.startsWith('http') ? v.url : `/uploads/${path.basename(v.url)}`,
      caption: v.caption,
      likeCount: v.likes.length,
    }));

  const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarColor: user.avatarColor,
    },
    videos,
    stats: { videoCount: videos.length, totalLikes },
  });
});

module.exports = router;
