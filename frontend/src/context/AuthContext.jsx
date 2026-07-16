
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour configurer le token dans les requêtes Axios
  const setAuthHeader = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('riff_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // 🟢 On configure le token dans Axios AVANT de faire la requête de vérification !
    setAuthHeader(token);

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Erreur de reconnexion automatique :", err);
        // Si le token est invalide ou a expiré, on nettoie tout
        localStorage.removeItem('riff_token');
        setAuthHeader(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const token = res.data.token;
    
    localStorage.setItem('riff_token', token);
    setAuthHeader(token); // 🟢 On active le token pour les prochaines requêtes
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (username, password, displayName) => {
    const res = await api.post('/auth/register', { username, password, displayName });
    const token = res.data.token;

    localStorage.setItem('riff_token', token);
    setAuthHeader(token); // 🟢 On active le token pour les prochaines requêtes
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('riff_token');
    setAuthHeader(null); // 🟢 On supprime le token d'Axios
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}