// src/pages/Feed.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import VideoCard from '../components/VideoCard';

export default function Feed() {
  const [videos, setVideos] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const feedRef = useRef(null);
  const fetchingRef = useRef(false);

  const loadMore = useCallback(async (startCursor) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await api.get('/videos', { params: { cursor: startCursor, limit: 5 } });
      setVideos((prev) => [...prev, ...res.data.videos]);
      setCursor(res.data.nextCursor);
      setHasMore(res.data.nextCursor !== null);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMore(0); }, [loadMore]);

  function handleScroll() {
    const el = feedRef.current;
    if (!el || !hasMore) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < el.clientHeight * 1.5) loadMore(cursor);
  }

  if (loading) return <div className="feed-loader">Chargement du flux…</div>;

  if (videos.length === 0) {
    return (
      <div className="feed-empty">
        <p>Le flux est vide.</p>
        <p>Publie la première vidéo avec le bouton + !</p>
      </div>
    );
  }

  return (
    <div className="feed" ref={feedRef} onScroll={handleScroll}>
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
        />
      ))}
    </div>
  );
}
