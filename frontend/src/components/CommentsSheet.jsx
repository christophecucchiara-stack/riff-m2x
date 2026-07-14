// components/CommentsSheet.jsx
import { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Mister2XAvatar from './Mister2XAvatar';

export default function CommentsSheet({ video, onClose, onCommentAdded }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/videos/${video.id}/comments`)
      .then((res) => { if (active) setComments(res.data.comments); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [video.id]);

  async function handleSend() {
    if (!text.trim() || sending || !user) return;
    setSending(true);
    try {
      const res = await api.post(`/videos/${video.id}/comments`, { text });
      setComments((prev) => [...prev, res.data.comment]);
      setText('');
      onCommentAdded?.();
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="comments-sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          {comments.length} commentaire{comments.length === 1 ? '' : 's'}
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ position: 'absolute', right: 14, top: 8, background: 'none', border: 'none', color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sheet-list">
          {loading && <div className="sheet-empty">Chargement…</div>}
          {!loading && comments.length === 0 && (
            <div className="sheet-empty">Sois le premier à commenter 🎤</div>
          )}
          {comments.map((c) => (
            <div className="comment-row" key={c.id}>
              <div className="avatar" style={{ width: 32, height: 32, background: '#0f0f12', border: '1px solid #C9A22740' }}>
                <Mister2XAvatar size={32} />
              </div>
              <div className="comment-body">
                <span className="username">@{c.author?.username || 'inconnu'}</span>
                <div className="text">{c.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sheet-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={user ? 'Ajouter un commentaire…' : 'Connecte-toi pour commenter'}
            disabled={!user}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            maxLength={300}
          />
          <button onClick={handleSend} disabled={!user || !text.trim() || sending} aria-label="Envoyer">
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
