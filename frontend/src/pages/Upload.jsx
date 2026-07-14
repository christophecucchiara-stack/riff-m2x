// src/pages/Upload.jsx
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [sound, setSound] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleSubmit() {
    if (!file) { setError('Choisis d\'abord une vidéo.'); return; }
    setError('');
    setSubmitting(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);
    formData.append('sound', sound || `Son original - ${user.username}`);
    try {
      await api.post('/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "L'envoi a échoué, réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="upload-screen">
      <h2>Publier une vidéo</h2>

      <div className="dropzone" onClick={() => inputRef.current?.click()}>
        <UploadCloud size={28} />
        <p>{file ? file.name : 'Touche pour choisir une vidéo (mp4, mov…)'}</p>
        <input ref={inputRef} type="file" accept="video/*" onChange={handleFileChange} />
      </div>

      {previewUrl && <video className="video-preview" src={previewUrl} controls muted />}

      <div className="field">
        <label htmlFor="caption">Légende</label>
        <textarea
          id="caption"
          rows={3}
          value={caption}
          maxLength={300}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="De quoi parle cette vidéo ?"
        />
      </div>
      <p className="char-count">{caption.length} / 300</p>

      <div className="field">
        <label htmlFor="sound">Nom du son (optionnel)</label>
        <input
          id="sound"
          value={sound}
          onChange={(e) => setSound(e.target.value)}
          placeholder={`Son original - ${user?.username || ''}`}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Publication…' : 'Publier'}
      </button>
    </div>
  );
}
