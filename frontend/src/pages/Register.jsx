// pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Mister2XAvatar from '../components/Mister2XAvatar';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(username, password, displayName);
      navigate('/');
    } catch (err) {
      // 🟢 Sécurité : On extrait uniquement du texte pour éviter le crash "React error #31"
      let errorMessage = 'Inscription impossible.';

      if (err.response?.data) {
        const serverError = err.response.data;
        // Si le serveur renvoie un objet d'erreur, on cherche la clé de texte (error ou message)
        if (typeof serverError === 'object') {
          errorMessage = serverError.error || serverError.message || JSON.stringify(serverError);
        } else if (typeof serverError === 'string') {
          errorMessage = serverError;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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

      <p className="tagline">Crée ton compte pour publier</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="displayName">Nom affiché</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ton prénom ou pseudo"
          />
        </div>
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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="switch-line">
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}