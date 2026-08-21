# 🚀 Projet Full Stack — Maxime Jumel 2026

> **Projet de validation — Ilaria Digital School**
> Développeur Web Full Stack · Promotion 2026

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![EJS](https://img.shields.io/badge/EJS-Template-A91E50?style=for-the-badge&logo=ejs&logoColor=white)](https://ejs.co)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 📌 À propos du projet

Ce projet est le **fil rouge de fin de formation** à Ilaria Digital School. Il s'agit d'une application web full stack complète permettant la gestion d'utilisateurs, d'un système de support par tickets et d'un tableau de bord admin.

Le projet est **divisé en deux parties** dans le même dépôt :

| Partie | Branche / Repo | Description |
|---|---|---|
| 🖥️ **Back-end** | `main` (ce repo) | API REST + rendu EJS, base de données MongoDB |
| 🎨 **Front-end** | [`branch: 9669ad3`](https://github.com/Ilaria-Digital-School/Projet.DeveloppeurWebFull.Maxime.Jumel.2026/tree/9669ad334e4b7174921bd674b10b20f09bdde3be) | Interface utilisateur statique (HTML/CSS/JS) |

> ⚠️ **Le front-end se trouve dans la branche [`9669ad334e4b7174921bd674b10b20f09bdde3be`](https://github.com/Ilaria-Digital-School/Projet.DeveloppeurWebFull.Maxime.Jumel.2026/tree/9669ad334e4b7174921bd674b10b20f09bdde3be)** du même dépôt GitHub.

---

## 🗂️ Structure du projet (Back-end)

```
back-end/
├── app.js                  # Point d'entrée de l'application
├── config.js               # Configuration générale
├── exemple.env             # Exemple de variables d'environnement
├── middleware/
│   └── authMiddleware.js   # Middlewares d'authentification (isAdmin, isClient, isDev)
├── models/
│   └── User.js             # Modèle Mongoose — Utilisateurs & Tickets
├── router/
│   └── api.js              # Toutes les routes de l'application
├── script/
│   ├── serverRun.js        # Initialisation du serveur Express
│   └── rundb.js            # Connexion à MongoDB
├── views/                  # Templates EJS + pages HTML statiques
│   ├── index.ejs           # Page d'accueil
│   ├── login.ejs           # Page de connexion
│   ├── register.ejs        # Page d'inscription
│   ├── dashboard.ejs       # Tableau de bord (admin / client)
│   ├── ticketclient.ejs    # Gestion des tickets client
│   ├── about.html
│   ├── blog.html
│   ├── contact.html
│   ├── portfolio.html
│   └── project.html
└── public/
    └── uploads/            # Dossier des avatars uploadés
```

---

## ⚙️ Stack Technique

### Back-end
| Technologie | Usage |
|---|---|
| **Node.js** | Runtime JavaScript côté serveur |
| **Express 5** | Framework HTTP |
| **MongoDB + Mongoose** | Base de données NoSQL |
| **EJS** | Moteur de templates HTML |
| **bcryptjs** | Hash des mots de passe |
| **jsonwebtoken** | Gestion des tokens JWT |
| **express-session** | Gestion des sessions utilisateur |
| **Multer** | Upload de fichiers (avatars `.webp`) |
| **dotenv** | Gestion des variables d'environnement |

### Front-end *(branche dédiée)*
| Technologie | Usage |
|---|---|
| **HTML5** | Structure des pages |
| **CSS3** | Mise en forme et responsive design |
| **Bootstrap** | Framework CSS |
| **JavaScript** | Interactions dynamiques |

---

## 🔐 Authentification & Rôles

Le système de sécurité repose sur les **sessions Express** et les **middlewares d'autorisation**.

```
Rôles disponibles :
├── user        → Utilisateur simple (accès limité)
├── client      → Client avec accès aux tickets
├── admin       → Administrateur (gestion complète)
└── developper  → Développeur (droits équivalents admin)
```

| Middleware | Rôles autorisés |
|---|---|
| `isClient` | Tout utilisateur connecté |
| `isAdmin` | `admin`, `developper` |
| `isDev` | `developper`, `admin` |

---

## 🛣️ Routes API

### 🔓 Routes publiques

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/` | Page d'accueil |
| `GET` | `/register` | Formulaire d'inscription |
| `POST` | `/register` | Création de compte |
| `GET` | `/login` | Formulaire de connexion |
| `POST` | `/login` | Authentification |
| `GET` | `/logout` | Déconnexion |

### 🔒 Routes protégées — Client

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/dashboard` | Tableau de bord (adaptatif selon le rôle) |
| `POST` | `/profile/update/:id` | Mise à jour du profil + avatar |
| `GET` | `/client/ticket` | Liste des tickets du client |
| `POST` | `/api/tickets/create` | Créer un nouveau ticket |
| `POST` | `/api/tickets/:id/reply` | Répondre à un ticket |
| `GET` | `/api/tickets/views/:id` | Détail d'un ticket (JSON) |

### 🛡️ Routes protégées — Admin

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/admin/tickets/:userId/:ticketId/reply` | Répondre au ticket d'un client |
| `GET` | `/api/admin/tickets/:userId/:ticketId/delete` | Supprimer un ticket |
| `POST` | `/api/tickets/:id/update` | Modifier le statut d'un ticket |

---

## 🗃️ Modèle de données — Utilisateur

```js
User {
  pseudo      : String (unique, requis)
  email       : String (unique, requis)
  password    : String (hashé bcrypt)
  role        : "user" | "admin" | "developper"
  status      : "active" | "inactive"
  isBan       : Boolean
  avatar      : String (chemin fichier .webp)
  solde       : Number
  credits     : Number
  ticket      : Number (compteur)
  ticketClient: [
    {
      title   : String
      message : String
      status  : "open" | "pending" | "close" | "repondu"
      replies : [{ sender, role, message, createdAt }]
    }
  ]
}
```

---

## 🚀 Installation & Lancement

### Prérequis
- Node.js `>= 18`
- MongoDB (local ou [Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Cloner le dépôt

```bash
git clone https://github.com/Ilaria-Digital-School/Projet.DeveloppeurWebFull.Maxime.Jumel.2026.git
cd Projet.DeveloppeurWebFull.Maxime.Jumel.2026
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copier le fichier exemple et le compléter :

```bash
cp exemple.env .env
```

```env
PORT=3000
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=votre_clé_secrète_très_longue
```

### 4. Lancer le serveur

```bash
# Mode développement (rechargement automatique)
npm run dev

# Mode production
npm start
```

L'application sera disponible sur : **http://localhost:3000**

---

## 🎨 Front-end

> Le front-end de ce projet se trouve dans une branche dédiée du même dépôt.

🔗 **[Accéder au front-end](https://github.com/Ilaria-Digital-School/Projet.DeveloppeurWebFull.Maxime.Jumel.2026/tree/9669ad334e4b7174921bd674b10b20f09bdde3be)**

```bash
# Récupérer le front-end
git checkout 9669ad334e4b7174921bd674b10b20f09bdde3be
```

Le front-end est composé de pages HTML/CSS statiques (accueil, à propos, blog, contact, portfolio, projets) qui s'intègrent avec le back-end via les templates EJS et les routes Express.

---

## 📁 Fonctionnalités principales

- ✅ **Inscription / Connexion** avec validation sécurisée
- ✅ **Hachage des mots de passe** avec bcryptjs
- ✅ **Gestion des sessions** (express-session)
- ✅ **Tableau de bord** adaptatif (vue admin vs vue client)
- ✅ **Système de tickets** avec réponses bidirectionnelles
- ✅ **Upload d'avatar** (format `.webp`, 5 Mo max)
- ✅ **Contrôle d'accès** par rôle (client, admin, développeur)
- ✅ **Protection des routes** via middlewares

---

## 👤 Auteur

**Maxime Jumel**
- 🎓 Étudiant Développeur Web Full Stack — Ilaria Digital School (2026)
- 🐙 GitHub : [@soufly9009](https://github.com/soufly9009)
- 📦 Dépôt : [Ilaria-Digital-School/Projet.DeveloppeurWebFull.Maxime.Jumel.2026](https://github.com/Ilaria-Digital-School/Projet.DeveloppeurWebFull.Maxime.Jumel.2026)

---

## 📄 Licence

Ce projet est sous licence **MIT** — voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <sub>Projet réalisé dans le cadre de la formation Développeur Web Full Stack · Ilaria Digital School · 2026</sub>
</div>
