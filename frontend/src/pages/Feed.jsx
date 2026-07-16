// pages/Feed.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const { user } = useAuth();
  const [tab, setTab] = useState('forYou');
  const [videos, setVideos] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const feedRef = useRef(null);
  const fetchingRef = useRef(false);

  const loadMore = useCallback(async (startCursor, currentTab) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await api.get('/videos', {
        params: { cursor: startCursor, limit: 5, tab: currentTab },
      });
      setVideos((prev) => startCursor === 0 ? res.data.videos : [...prev, ...res.data.videos]);
      setCursor(res.data.nextCursor ?? null);
      setHasMore(res.data.nextCursor !== null);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Recharge quand on change d'onglet
  useEffect(() => {
    setLoading(true);
    setVideos([]);
    setCursor(0);
    setHasMore(true);
    loadMore(0, tab);
  }, [tab, loadMore]);

  function handleScroll() {
    const el = feedRef.current;
    if (!el || !hasMore) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < el.clientHeight * 1.5) loadMore(cursor, tab);
  }

  const isEmpty = !loading && videos.length === 0;

  return (
    <div style={{ height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Onglets */}
      <div className="feed-tabs">
        <button
          className={`feed-tab ${tab === 'forYou' ? 'active' : ''}`}
          onClick={() => setTab('forYou')}
        >
          Pour toi
        </button>
        <button
          className={`feed-tab ${tab === 'following' ? 'active' : ''}`}
          onClick={() => {
            if (!user) return;
            setTab('following');
          }}
          style={!user ? { opacity: 0.4 } : {}}
          title={!user ? 'Connecte-toi pour voir tes abonnements' : ''}
        >
          Abonnements
        </button>
      </div>

      {/* Contenu */}
      {loading && <div className="feed-loader">Chargement…</div>}

      {isEmpty && tab === 'following' && (
        <div className="feed-empty">
          <p>Aucune vidéo de tes abonnements.</p>
          <p>Suis des comptes pour voir leurs vidéos ici !</p>
        </div>
      )}

      {isEmpty && tab === 'forYou' && (
        <div className="feed-empty">
          <p>Le flux est vide.</p>
          <p>Publie la première vidéo avec le bouton + !</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="feed" ref={feedRef} onScroll={handleScroll} style={{ flex: 1 }}>
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
