// pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Mister2XAvatar from '../components/Mister2XAvatar';

// Mini-liste d'utilisateurs (abonnés ou abonnements)
function UserListSheet({ title, users, onClose }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="comments-sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          {title}
          <button onClick={onClose} aria-label="Fermer"
            style={{ position:'absolute', right:14, top:8, background:'none', border:'none', color:'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="sheet-list">
          {users.length === 0 && <p className="sheet-empty">Aucun utilisateur à afficher.</p>}
          {users.map((u) => (
            <div key={u.id} className="follow-user-row">
              <div className="avatar" style={{ width:36, height:36, background:'#0f0f12', border:'1px solid #C9A22740' }}>
                <Mister2XAvatar size={36} />
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{u.displayName}</div>
                <div style={{ color:'var(--color-accent)', fontSize:12 }}>@{u.username}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // liste modale : null | 'followers' | 'following'
  const [sheet, setSheet] = useState(null);
  const [sheetUsers, setSheetUsers] = useState([]);
  const [sheetLoading, setSheetLoading] = useState(false);

  useEffect(() => {
    setData(null);
    setNotFound(false);
    api.get(`/users/${username}`)
      .then((res) => {
        setData(res.data);
        setFollowing(res.data.isFollowing);
        setFollowerCount(res.data.stats.followerCount);
      })
      .catch(() => setNotFound(true));
  }, [username]);

  async function toggleFollow() {
    if (!user) return navigate('/login');
    setFollowLoading(true);
    try {
      const res = await api.post(`/users/${username}/follow`);
      setFollowing(res.data.following);
      setFollowerCount(res.data.followerCount);
    } finally {
      setFollowLoading(false);
    }
  }

  async function openSheet(type) {
    setSheet(type);
    setSheetUsers([]);
    setSheetLoading(true);
    try {
      const res = await api.get(`/users/${username}/${type}`);
      setSheetUsers(res.data[type] || []);
    } finally {
      setSheetLoading(false);
    }
  }

  function handleLogout() { logout(); navigate('/login'); }

  if (notFound) return <div className="empty-state">Ce profil n'existe pas.</div>;
  if (!data) return <div className="feed-loader">Chargement…</div>;

  const isOwn = user?.username === data.user.username;

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <div className="avatar" style={{ width:84, height:84, background:'#0f0f12' }}>
          <Mister2XAvatar size={84} glowing={isOwn} />
        </div>
        <span className="display-name">{data.user.displayName}</span>
        <span className="username">@{data.user.username}</span>
        {data.user.bio && <p className="bio">{data.user.bio}</p>}

        {/* Bouton Suivre / Ne plus suivre */}
        {!isOwn && (
          <button
            className={`follow-btn ${following ? 'follow-btn--active' : ''}`}
            onClick={toggleFollow}
            disabled={followLoading}
          >
            {followLoading ? '…' : following ? 'Abonné ✓' : '+ Suivre'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat">
          <span className="stat-value">{data.stats.videoCount}</span>
          <span className="stat-label">vidéos</span>
        </div>
        <button className="stat stat-btn" onClick={() => openSheet('followers')}>
          <span className="stat-value">{followerCount}</span>
          <span className="stat-label">abonnés</span>
        </button>
        <button className="stat stat-btn" onClick={() => openSheet('following')}>
          <span className="stat-value">{data.stats.followingCount}</span>
          <span className="stat-label">abonnements</span>
        </button>
      </div>

      {isOwn && (
        <button className="logout-btn" onClick={handleLogout}>Se déconnecter</button>
      )}

      {data.videos.length === 0 ? (
        <p className="empty-state">Aucune vidéo publiée.</p>
      ) : (
        <div className="video-grid">
          {data.videos.map((v) => (
            <div className="grid-item" key={v.id}>
              <video src={v.url} muted preload="metadata" />
              <div className="grid-likes">
                <Heart size={12} fill="#FFD700" color="#FFD700" />
                {v.likeCount}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale liste abonnés/abonnements */}
      {sheet && (
        <UserListSheet
          title={sheet === 'followers' ? `${followerCount} abonné${followerCount > 1 ? 's' : ''}` : `${data.stats.followingCount} abonnement${data.stats.followingCount > 1 ? 's' : ''}`}
          users={sheetLoading ? [] : sheetUsers}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
