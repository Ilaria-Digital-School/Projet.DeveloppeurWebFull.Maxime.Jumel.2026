# SouflyDev — Portfolio Développeur Web Full Stack

Site portfolio et application web full stack : vitrine (accueil, portfolio, blog, contact), authentification utilisateur et tableau de bord protégé.

Projet réalisé par **Maxime Jumel** dans le cadre de la formation Développeur Web Full Stack (Ilaria Digital School, 2026).

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts disponibles](#scripts-disponibles)
- [API](#api)
- [Déploiement](#déploiement)
- [Sécurité](#sécurité)

## Fonctionnalités

- Pages publiques : accueil, portfolio, blog, contact
- Inscription et connexion (mots de passe hachés, authentification par JWT)
- Tableau de bord protégé (graphiques, tableau de données avec tri et glisser-déposer, barre latérale)
- Thème clair / sombre
- Interface responsive (Bootstrap, Tailwind CSS, shadcn/ui)
- Déploiement conteneurisé (Docker Compose) derrière un reverse proxy nginx

## Stack technique

| Couche | Technologies |
| --- | --- |
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Bootstrap 5 / React-Bootstrap, Framer Motion, Recharts, TanStack Table, dnd-kit |
| Validation | Zod |
| Backend | Node.js, Express 5, Passport (stratégie locale), JSON Web Tokens, bcryptjs |
| Base de données | MongoDB 8 (Mongoose 9) |
| Infrastructure | Docker, Docker Compose, nginx |

## Architecture

```
.
├── app/               # Pages Next.js (accueil, login, signup, dashboard, portfolio, blog, contact)
├── components/        # Composants React (formulaires, dashboard, composants shadcn/ui)
├── hooks/  lib/       # Hooks et utilitaires
├── public/            # Fichiers statiques
├── backend/           # API Express
│   ├── app.js         # Point d'entrée et routes
│   └── Models/        # Modèles Mongoose (User)
├── nginx/             # Configuration du reverse proxy
├── Dockerfile         # Image du frontend
└── docker-compose.yml # Frontend + backend + MongoDB
```

## Prérequis

- Node.js 22 ou supérieur
- npm
- MongoDB (local) ou Docker

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Ilaria-Digital-School/Projet.DeveloppeurWebFull.Maxime.Jumel.2026.git
cd Projet.DeveloppeurWebFull.Maxime.Jumel.2026
git checkout reactdev

# 2. Installer les dépendances
npm install
cd backend && npm install && cd ..

# 3. Créer les fichiers d'environnement (voir section suivante)

# 4. Lancer le backend (terminal 1)
cd backend && npm run dev

# 5. Lancer le frontend (terminal 2)
npm run dev
```

Le frontend est disponible sur <http://localhost:3000>.

## Variables d'environnement

**`.env`** (racine, frontend)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | URL de l'API utilisée par le navigateur (ex. `http://localhost:3222`) |

**`backend/.env`**

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | Chaîne de connexion MongoDB |
| `JWT_SECRET` | Secret de signature des tokens JWT (long et aléatoire) |
| `FRONTEND_URL` | Origine autorisée par CORS (défaut : `http://localhost:3000`) |

Ces fichiers ne doivent jamais être commités (ils sont déjà dans `.gitignore`).

## Scripts disponibles

**Frontend (racine)**

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lance le build de production |
| `npm run lint` | Analyse ESLint |

**Backend (`backend/`)**

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Démarrage avec rechargement automatique (nodemon) |
| `npm start` | Démarrage en production |

## API

| Méthode | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/registers` | Non | Création d'un compte |
| `POST` | `/api/login` | Non | Connexion, retourne un JWT |
| `GET` | `/api/me` | JWT | Profil de l'utilisateur connecté |

Le token est transmis dans l'en-tête `Authorization: Bearer <token>`.

## Déploiement

L'ensemble de la stack se lance avec Docker Compose :

```bash
docker compose up -d --build
```

| Service | Conteneur | Port exposé |
| --- | --- | --- |
| Frontend Next.js | `souflydev-nextjs` | `127.0.0.1:3000` |
| API Express | `souflydev-backend` | `3222` (interne : 3445) |
| MongoDB | `souflydev-mongodb` | non exposé (volume `mongodb_data`) |

nginx sert de reverse proxy : la configuration de référence est dans [`nginx/souflyhub.conf`](nginx/souflyhub.conf) (frontend sur `souflyhub.dev`, API sur `api.souflyhub.dev`). Copiez-la dans `/etc/nginx/sites-available/`, activez-la avec un lien dans `sites-enabled`, puis ajoutez le HTTPS (par exemple avec Certbot).

`NEXT_PUBLIC_BACKEND_URL` est intégrée au build : relancez `docker compose up -d --build` après l'avoir modifiée.

## Sécurité

- Mots de passe hachés avec bcrypt
- Authentification stateless par JWT
- CORS restreint à l'origine du frontend
- Secrets exclus du dépôt via `.gitignore` et `.dockerignore`
- Ne publiez pas le port MongoDB sur Internet

## Auteur

**Maxime Jumel** — [@soufly9009](https://github.com/soufly9009)
