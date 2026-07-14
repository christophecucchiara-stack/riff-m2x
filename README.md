# Riff — une application de vidéos courtes inspirée de TikTok

Riff est une application web complète (backend + frontend) qui reprend les
mécaniques principales de TikTok : flux vertical en plein écran avec lecture
automatique, like, commentaires, upload de vidéo et profils utilisateurs.

## Stack technique

- **Backend** : Node.js + Express, authentification par JWT, upload de
  fichiers avec Multer, stockage des données dans un simple fichier JSON
  (aucune base de données à installer).
- **Frontend** : React 18 + Vite, React Router, axios, icônes lucide-react.
- **Stockage des vidéos** : les fichiers uploadés sont sauvegardés sur le
  disque du serveur (`backend/uploads/`) et servis statiquement.

Trois comptes/vidéos de démonstration sont préchargés pour que le flux ne
soit pas vide au premier lancement (les vidéos pointent vers des fichiers de
test publics de Google, utilisés couramment pour tester des lecteurs vidéo).

## Installation

Il faut deux terminaux : un pour l'API, un pour l'interface.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

L'API démarre sur `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'interface démarre sur `http://localhost:5173` et appelle l'API via un
proxy Vite déjà configuré (`vite.config.js`) — pas besoin de changer d'URL.

Ouvre `http://localhost:5173` dans ton navigateur (idéalement en mode
mobile dans les outils de développement, l'interface est pensée pour un
écran de téléphone).

## Compte de démonstration

```
Nom d'utilisateur : marina.codes
Mot de passe       : password123
```

Ou crée ton propre compte via "Crée-en un" sur l'écran de connexion.

## Fonctionnalités

- Flux vertical avec scroll-snap, lecture/pause automatique selon la vidéo
  visible à l'écran, tap pour mettre en pause, double-tap pour liker.
- Likes et commentaires en temps réel, persistés côté serveur.
- Upload de vidéo (caméra ou fichier) avec légende et nom de son.
- Pages de profil avec statistiques (nombre de vidéos, total de likes) et
  grille des vidéos publiées.
- Authentification complète (inscription / connexion / session persistante).

## Structure du projet

```
riff/
├── backend/
│   ├── server.js          point d'entrée Express
│   ├── db.js               lecture/écriture du fichier JSON
│   ├── data/db.json         "base de données" (utilisateurs, vidéos, commentaires)
│   ├── middleware/auth.js   vérification du token JWT
│   ├── routes/               auth, videos, users
│   └── uploads/              fichiers vidéo uploadés (créé automatiquement)
└── frontend/
    └── src/
        ├── pages/            Feed, Login, Register, Upload, Profile
        ├── components/       VideoCard, CommentsSheet, BottomNav…
        ├── context/          AuthContext (état de connexion global)
        └── styles/           tokens de design + styles par écran
```

## Limites à connaître

- Le stockage en fichier JSON convient pour développer et tester, mais ne
  tient pas la charge d'une vraie application en production (pas
  d'indexation, pas d'accès concurrent sécurisé). Pour aller plus loin,
  remplacer `db.js` par une vraie base (PostgreSQL, MongoDB…) sans changer
  les routes serait l'étape naturelle.
- Pas de transcodage vidéo : les fichiers sont servis tels qu'uploadés.
- Pas de modération de contenu ni de recommandation par algorithme : le
  flux affiche simplement les vidéos par ordre chronologique.
