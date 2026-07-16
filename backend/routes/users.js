// routes/users.js
const path = require('path');
const express = require('express');
const { readDb, writeDb } = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:username  — profil public + stats follows
router.get('/:username', optionalAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.username === req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const follows = db.follows || [];

  const followerCount  = follows.filter((f) => f.followingId === user.id).length;
  const followingCount = follows.filter((f) => f.followerId  === user.id).length;
  const isFollowing    = req.userId
    ? follows.some((f) => f.followerId === req.userId && f.followingId === user.id)
    : false;

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
    stats: { videoCount: videos.length, totalLikes, followerCount, followingCount },
    isFollowing,
  });
});

// POST /api/users/:username/follow  — toggle follow/unfollow
router.post('/:username/follow', requireAuth, (req, res) => {
  const db = readDb();
  const target = db.users.find((u) => u.username === req.params.username.toLowerCase());
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  if (target.id === req.userId) return res.status(400).json({ error: 'Tu ne peux pas te suivre toi-même.' });

  if (!db.follows) db.follows = [];

  const idx = db.follows.findIndex(
    (f) => f.followerId === req.userId && f.followingId === target.id
  );

  let following;
  if (idx !== -1) {
    db.follows.splice(idx, 1);
    following = false;
  } else {
    db.follows.push({ followerId: req.userId, followingId: target.id, createdAt: new Date().toISOString() });
    following = true;
  }

  writeDb(db);
  const followerCount = db.follows.filter((f) => f.followingId === target.id).length;
  res.json({ following, followerCount });
});

// GET /api/users/:username/followers  — liste des abonnés
router.get('/:username/followers', (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.username === req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const follows = db.follows || [];
  const followerIds = follows.filter((f) => f.followingId === user.id).map((f) => f.followerId);
  const followers = db.users
    .filter((u) => followerIds.includes(u.id))
    .map((u) => ({ id: u.id, username: u.username, displayName: u.displayName, avatarColor: u.avatarColor }));

  res.json({ followers });
});

// GET /api/users/:username/following  — liste des abonnements
router.get('/:username/following', (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.username === req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const follows = db.follows || [];
  const followingIds = follows.filter((f) => f.followerId === user.id).map((f) => f.followingId);
  const following = db.users
    .filter((u) => followingIds.includes(u.id))
    .map((u) => ({ id: u.id, username: u.username, displayName: u.displayName, avatarColor: u.avatarColor }));

  res.json({ following });
});

module.exports = router;
