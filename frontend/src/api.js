// src/api.js
import axios from 'axios';

// On récupère l'adresse de l'API définie dans les variables d'environnement Vercel (Render),
// et on garde localhost en secours pour le développement local.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({ 
  baseURL: `${API_BASE_URL}/api` 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('riff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  // Si c'est un chemin relatif (ex: /uploads/video.mp4), on lui ajoute l'adresse du backend Render
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default api;