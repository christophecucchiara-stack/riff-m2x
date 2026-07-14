// components/VideoCard.jsx
import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play } from 'lucide-react';
import api from '../api';
import api, { resolveMediaUrl } from '../api'; // 🟢 On ajoute l'import ici
import { useAuth } from '../context/AuthContext';
import CommentsSheet from './CommentsSheet';
import Mister2XAvatar from './Mister2XAvatar';

// Burst en X doré au double-tap (signature Mister 2X)
function XBurst() {
  return (
    <div className="like-burst">
      <svg width="90" height="90" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="15" y1="15" x2="85" y2="85" stroke="#FFD700" strokeWidth="14" strokeLinecap="round" />
        <line x1="85" y1="15" x2="15" y2="85" stroke="#FFD700" strokeWidth="14" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function VideoCard({ video, muted, onToggleMute }) {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [hasLiked, setHasLiked] = useState(video.hasLiked);
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [commentCount, setCommentCount] = useState(video.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [showXBurst, setShowXBurst] = useState(false);
  const [shareLabel, setShareLabel] = useState('Partager');

  // Lecture auto via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          videoRef.current?.play().catch(() => {});
          setPlaying(true);
        } else {
          videoRef.current?.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) { el.play().catch(() => {}); setPlaying(true); }
    else { el.pause(); setPlaying(false); }
  }

  async function toggleLike() {
    if (!user) return;
    const next = !hasLiked;
    setHasLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      await api.post(`/videos/${video.id}/like`);
    } catch {
      setHasLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  }

  function handleDoubleTap() {
    if (!hasLiked) toggleLike();
    setShowXBurst(true);
    setTimeout(() => setShowXBurst(false), 750);
  }

  let lastTap = 0;
  function handleTapLayerClick() {
    const now = Date.now();
    if (now - lastTap < 280) handleDoubleTap();
    else togglePlay();
    lastTap = now;
  }{/* 🟢 On applique resolveMediaUrl sur video.url */}
<video 
  ref={videoRef} 
  src={resolveMediaUrl(video.url)} 
  loop 
  muted={muted} 
  playsInline 
  preload="metadata" 
/>

  async function handleShare() {
    const url = `${window.location.origin}/video/${video.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel('Lien copié ✓');
    } catch {
      setShareLabel('Riff');
    }
    setTimeout(() => setShareLabel('Partager'), 1600);
  }

  return (
    <div className="video-card" ref={containerRef}>
      <video ref={videoRef} src={video.url} loop muted={muted} playsInline preload="metadata" />
      <div className="scrim" />
      <div className="tap-layer" onClick={handleTapLayerClick} />

      {!playing && (
        <div className="play-hint">
          <Play size={26} fill="#fff" />
        </div>
      )}

      {showXBurst && <XBurst />}

      <button className="mute-toggle" onClick={onToggleMute} aria-label="Couper / activer le son">
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div className="caption-block">
        <span className="username">@{video.author?.username || 'inconnu'}</span>
        <p className="caption-text">{video.caption}</p>
        <div className="sound-line">
          <span>♪ {video.sound}</span>
        </div>
      </div>

      <div className="action-rail">
        {/* Disque-avatar Mister 2X qui tourne */}
        <div className={`sound-disc ${playing ? 'spinning' : ''}`}>
          <Mister2XAvatar size={40} glowing={playing} />
        </div>

        <button className={`action-btn ${hasLiked ? 'liked' : ''}`} onClick={toggleLike} aria-label="Aimer">
          <span className="icon-circle">
            <Heart size={24} color={hasLiked ? '#FFD700' : '#fff'} fill={hasLiked ? '#FFD700' : 'none'} />
          </span>
          <span className="action-count">{likeCount}</span>
        </button>

        <button className="action-btn" onClick={() => setShowComments(true)} aria-label="Commentaires">
          <span className="icon-circle">
            <MessageCircle size={22} color="#fff" />
          </span>
          <span className="action-count">{commentCount}</span>
        </button>

        <button className="action-btn" onClick={handleShare} aria-label="Partager">
          <span className="icon-circle">
            <Share2 size={21} color="#fff" />
          </span>
          <span className="action-count" style={{ fontSize: 10 }}>{shareLabel}</span>
        </button>
      </div>

      {showComments && (
        <CommentsSheet
          video={video}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
        />
      )}
    </div>
  );
}
