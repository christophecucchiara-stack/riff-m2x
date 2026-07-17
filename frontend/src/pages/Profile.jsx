// pages/Profile.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, X, Camera } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Mister2XAvatar from '../components/Mister2XAvatar';

// Mini-liste d'utilisateurs (abonnés ou abonnements) avec prise en charge des avatars personnalisés
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
              <div className="avatar" style={{ width:36, height:36, background:'#0f0f12', border:'1px solid #C9A22740', borderRadius:'50%', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.username} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <Mister2XAvatar size={36} />
                )}
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
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  // Gère le clic sur l'appareil photo pour envoyer un logo sur Cloudinary
  async function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Remplace par ton preset Cloudinary si différent

    try {
      // 1. Envoi direct sur ton Cloudinary (le même cloud name que tu utilises pour tes vidéos)
      const cloudName = "dyh7qj8ox"; // Nom de ton Cloudinary d'après tes précédentes configs
      const resCloud = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      const cloudData = await resCloud.json();
      const imageUrl = cloudData.secure_url;

      if (!imageUrl) throw new Error("Erreur de chargement de l'image");

      // 2. On envoie l'URL de l'avatar à ton serveur pour la lier à ton profil
      // En général la route est PUT /auth/profile ou PUT /users/update
      const resBack = await api.put('/auth/profile', { avatarUrl: imageUrl });
      
      // 3. Mise à jour des états locaux et globaux
      const updatedUser = { ...user, avatarUrl: imageUrl };
      if (setUser) setUser(updatedUser);
      
      setData(prev => ({
        ...prev,
        user: { ...prev.user, avatarUrl: imageUrl }
      }));

      alert("Logo mis à jour avec succès ! ✨");
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour le logo. Vérifie la configuration.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleLogout() { logout(); navigate('/login'); }

  if (notFound) return <div className="empty-state">Ce profil n'existe pas.</div>;
  if (!data) return <div className="feed-loader">Chargement…</div>;

  const isOwn = user?.username === data.user.username;
  const currentAvatarUrl = isOwn ? user?.avatarUrl : data.user.avatarUrl;

  return (
    <div className="profile-screen">
      <div className="profile-header">
        {/* Affichage de l'avatar ou de Mister 2X par défaut */}
        <div 
          className="avatar" 
          onClick={isOwn ? handleAvatarClick : undefined}
          style={{ 
            width: 84, 
            height: 84, 
            background: '#0f0f12', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            position: 'relative',
            cursor: isOwn ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isOwn ? '2px solid var(--color-accent)' : '1px solid #C9A22740'
          }}
        >
          {currentAvatarUrl ? (
            <img src={currentAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Mister2XAvatar size={84} glowing={isOwn} />
          )}

          {/* Bouton pour changer de logo si c'est mon profil */}
          {isOwn && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: uploadingAvatar ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
            className="avatar-hover"
            >
              <Camera size={20} color="#fff" />
            </div>
          )}
        </div>

        {/* Input de fichier caché */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />

        {uploadingAvatar && <span style={{ fontSize: 11, color: 'var(--color-accent)' }}>Mise à jour du logo...</span>}

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