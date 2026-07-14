// pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Mister2XAvatar from '../components/Mister2XAvatar';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo-wrap">
        <Mister2XAvatar size={80} glowing />
        <div className="auth-wordmark">
          MISTER <span>2X</span>
        </div>
      </div>

      <p className="tagline">Connecte-toi pour liker et publier</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="switch-line">
        Pas encore de compte ?{' '}
        <Link to="/register">Crée-en un</Link>
      </p>
    </div>
  );
}
