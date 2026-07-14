// components/BottomNav.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <button
        className={isActive('/') ? 'active' : ''}
        onClick={() => navigate('/')}
        aria-label="Accueil"
      >
        <Home size={22} />
        Accueil
      </button>

      <button
        className="nav-upload"
        onClick={() => navigate(user ? '/upload' : '/login')}
        aria-label="Publier"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>

      <button
        className={isActive('/profile') || location.pathname.startsWith('/profile') ? 'active' : ''}
        onClick={() => navigate(user ? `/profile/${user.username}` : '/login')}
        aria-label="Profil"
      >
        <User size={22} />
        Profil
      </button>
    </nav>
  );
}
