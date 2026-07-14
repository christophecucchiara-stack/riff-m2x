// pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Mister2XAvatar from '../components/Mister2XAvatar';

export default function Profile() {
  const { username } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setData(null);
    setNotFound(false);
    api
      .get(`/users/${username}`)
      .then((res) => setData(res.data))
      .catch(() => setNotFound(true));
  }, [username]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (notFound) return <div className="empty-state">Ce profil n'existe pas.</div>;
  if (!data) return <div className="feed-loader">Chargement du profil…</div>;

  const isOwnProfile = user?.username === data.user.username;

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <div className="avatar" style={{ width: 84, height: 84, background: '#0f0f12' }}>
          <Mister2XAvatar size={84} glowing={isOwnProfile} />
        </div>
        <span className="display-name">{data.user.displayName}</span>
        <span className="username">@{data.user.username}</span>
        {data.user.bio && <p className="bio">{data.user.bio}</p>}
      </div>

      <div className="profile-stats">
        <div className="stat">
          <span className="stat-value">{data.stats.videoCount}</span>
          <span className="stat-label">vidéos</span>
        </div>
        <div className="stat">
          <span className="stat-value">{data.stats.totalLikes}</span>
          <span className="stat-label">likes</span>
        </div>
      </div>

      {isOwnProfile && (
        <button className="logout-btn" onClick={handleLogout}>
          Se déconnecter
        </button>
      )}

      {data.videos.length === 0 ? (
        <p className="empty-state">Aucune vidéo publiée pour l'instant.</p>
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
    </div>
  );
}
