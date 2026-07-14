// src/api.js
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('riff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function resolveMediaUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : url;
}

export default api;
