# Souflydev Backend

<p align="center">
  <img src="./public/images/upload/soulfydev.webp" alt="Logo Souflydev" width="180">
</p>

<p align="center">
  <strong>API et dashboard de gestion Souflydev</strong><br>
  Backend Node.js/Express pour <a href="https://souflyhub.dev">souflyhub.dev</a>
</p>

<p align="center">
  <a href="https://github.com/Ilaria-Digital-School/Projet.DeveloppeurWebFull.Maxime.Jumel.2026">
    <img src="https://img.shields.io/badge/version-v0.0.1-4f46e5?style=for-the-badge&logo=semver&logoColor=white" alt="Version 0.0.1">
  </a>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 18 ou plus">
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB avec Mongoose">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="Licence MIT">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/security-reCAPTCHA%20v3-4285F4?style=flat-square&logo=google&logoColor=white" alt="reCAPTCHA v3">
  <img src="https://img.shields.io/badge/templates-EJS-B4CA65?style=flat-square" alt="Templates EJS">
  <img src="https://img.shields.io/badge/API-REST-orange?style=flat-square" alt="API REST">
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="Statut actif">
</p>

> **Version actuelle : `v0.0.1`**  
> Pour consulter l'historique des versions, utiliser les releases du depot.

Backend Node.js/Express de Souflydev. L'application sert les pages EJS du site
`https://souflyhub.dev`, gere les comptes utilisateurs, les demandes de devis,
les articles, le catalogue de services, les commandes et les tickets support.
Les donnees sont stockees dans MongoDB avec Mongoose.

## Sommaire

- [Fonctionnalites](#fonctionnalites)
- [Prerequis](#prerequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Commandes](#commandes)
- [Architecture](#architecture)
- [API HTTP](#api-http)
- [Authentification et roles](#authentification-et-roles)
- [Format des reponses et erreurs](#format-des-reponses-et-erreurs)
- [Securite](#securite)
- [Docker et reverse proxy](#docker-et-reverse-proxy)
- [Tests](#tests)
- [Depannage](#depannage)

## Fonctionnalites

- 👤 Inscription, verification email, connexion et deconnexion.
- 🔐 Sessions securisees avec les roles `user`, `admin` et `developper`.
- 🛡️ Protection reCAPTCHA v3 invisible sur connexion, inscription et mot de passe
  oublie.
- 🔑 Recuperation de mot de passe avec token a usage unique expire.
- 📝 Demandes de devis et pre-demandes d'articles par les clients.
- ⚙️ Administration des utilisateurs, bannissements, commandes, articles,
  categories et services.
- 🎫 Tickets support avec reponses client/admin.
- 📊 Journal d'activite MongoDB affiche dans le dashboard administrateur.
- 🖼️ Uploads d'images en memoire, limites a 5 Mo, stockes en data URI MongoDB.
- 🚦 Rate limiting, CSP avec nonce, HSTS en production et en-tetes HTTP de securite.

## Versions et stack

| Composant | Version / choix |
| --- | --- |
| 📦 Application | `v0.0.1` |
| 🟢 Node.js | `>=18` |
| 🚂 Express | `5.x` |
| 🍃 MongoDB / Mongoose | `MongoDB 6+` / `Mongoose 9.x` |
| 🎨 Templates | `EJS 6.x` |
| 🔒 Sessions | `express-session 1.x` |
| 📧 Emails | `Nodemailer 10.x` |
| 🧪 Tests sécurité | Script de test du rate limiting |

### Convention de version

Le projet suit le versionnage semantique :

- `MAJEUR` : changement incompatible dans l'API ou le comportement public ;
- `MINEUR` : nouvelle fonctionnalite compatible ;
- `CORRECTIF` : correction ou mise a jour sans changement d'API.

La version de reference est definie dans le champ `version` de
[`package.json`](./package.json). Toute release doit mettre a jour ce champ,
le badge ci-dessus et cette ligne de version.

## Prerequis

- Node.js 18 ou plus recent.
- npm.
- MongoDB 6 ou plus recent, local ou distant.
- Un compte SMTP pour les emails de verification et de reinitialisation.
- En production, une paire de cles reCAPTCHA v3.

## Installation

```bash
npm install
copy exemple.env .env
npm run dev
```

Sous macOS/Linux, remplacer `copy` par `cp`.

Le serveur demarre par defaut sur `http://localhost:3000`. L'URL publique
attendue en production est `https://souflyhub.dev`.

## Commandes

Commandes disponibles :

```bash
npm run dev                 # developpement avec nodemon
npm start                   # demarrage production
npm run security:rate-limit # test du limiteur de requetes
```

## Configuration

Les secrets ne doivent jamais etre commites. Exemple de configuration :

```env
PORT=3000
NODE_ENV=development
APP_URL=https://souflyhub.dev
MONGO_URL=mongodb://localhost:27017/souflydev
JWT_SECRET=une-valeur-secrete-longue
SESSION_SECRET=une-valeur-secrete-longue
SESSION_COOKIE_NAME=soufly.sid
SECURITY_CONTACT_EMAIL=security@example.com
SUPPORT_EMAIL=contact@example.com

# reCAPTCHA v3 invisible
RECAPTCHA_SITE_KEY=cle-publique-recaptcha-v3
RECAPTCHA_SECRET_KEY=cle-secrete-recaptcha-v3

EMAIL_MODE=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FAMILY=4
SMTP_USER=utilisateur-smtp
SMTP_PASSWORD=mot-de-passe-smtp
MAIL_FROM="Souflydev <no-reply@example.com>"
```

En production, `JWT_SECRET`, `SESSION_SECRET`, `MONGO_URL`, les parametres SMTP
et `RECAPTCHA_SECRET_KEY` sont obligatoires. Si le secret reCAPTCHA manque en
production, les formulaires proteges renvoient `503` au lieu de fonctionner
sans verification.

Le compte est cree avec le statut `inactive` et devient utilisable apres
verification de l'email. Les tokens de verification expirent apres 24 heures.

## Architecture

```text
app.js                       Point d'entree, rate limiting et erreurs globales
config.js                    Configuration depuis les variables d'environnement
router/api.js                Pages HTML et endpoints HTTP
middleware/authMiddleware.js Sessions, roles et statut des comptes
middleware/recaptcha.js      Verification serveur reCAPTCHA v3
middleware/securityHeaders.js CSP et en-tetes de securite
models/                      Schemas Mongoose (User, Article, ActivityLog, ...)
services/mailer.js            Emails de verification et de reinitialisation
services/activityLogger.js    Ecriture du journal d'activite
script/serverRun.js            Express, session, Mongo et fichiers statiques
views/                        Templates EJS
public/                       CSS, JavaScript et images
```

## API HTTP

### Conventions

- Base URL locale : `http://localhost:3000`.
- Base URL production : `https://souflyhub.dev`.
- Les requetes JSON doivent envoyer `Content-Type: application/json`.
- Les cookies de session sont geres automatiquement par le navigateur.
- Une route `/api` necessite une session sauf indication contraire.
- Les routes marquees **Admin** sont reservees au role `admin`.
- Les routes de support marquees **Support** acceptent `admin` et `developper`.
- Les routes marquees **Client** necessitent un compte connecte.
- Les endpoints avec upload utilisent `multipart/form-data`.

### Authentification

#### `POST /register` — Public

Creer un compte inactif et envoyer le lien de verification.

```json
{
  "pseudo": "alice",
  "email": "alice@example.com",
  "password": "MotDePasse1!"
}
```

Avec reCAPTCHA actif, ajouter `recaptchaToken`. Le pseudo accepte 3 a 30
caracteres alphanumeriques, `_`, `.` ou `-`. Le mot de passe doit contenir une
minuscule, une majuscule, un chiffre et un caractere special.

#### `POST /login` — Public

Ouvrir une session.

```json
{
  "email": "alice@example.com",
  "password": "MotDePasse1!",
  "recaptchaToken": "token-recaptcha-v3"
}
```

Reponse de succes :

```json
{
  "success": true,
  "errcode": 200,
  "message": "Connexion réussie ! Redirection...",
  "redirect": "/dashboard"
}
```

#### `POST /forgot-password` — Public

Demander un lien de reinitialisation. La reponse reste volontairement identique
que l'adresse existe ou non.

```json
{
  "email": "alice@example.com",
  "recaptchaToken": "token-recaptcha-v3"
}
```

#### `POST /reset-password/:token` — Public

Definir un nouveau mot de passe avec le token recu par email.

```json
{
  "password": "NouveauMotDePasse1!",
  "confirmation": "NouveauMotDePasse1!"
}
```

#### `GET /logout` — Connecte

Detruire la session et rediriger vers `/login`.

### Demandes client

#### `POST /api/quotes` — Client

Creer une demande de devis.

```json
{
  "title": "Site vitrine",
  "description": "Creation d'un site pour une entreprise locale.",
  "service": "Developpement web",
  "budget": 2500,
  "desiredDate": "2026-12-01"
}
```

`budget` et `desiredDate` sont optionnels. La description est limitee a 3000
caracteres et le budget a 1 000 000.

#### `POST /api/article-requests` — Client

Creer une pre-demande d'article.

```json
{
  "title": "Guide du e-commerce",
  "category": "Marketing",
  "format": "Article de blog",
  "description": "Brief editorial.",
  "budget": 400,
  "desiredDate": "2026-11-15"
}
```

#### `POST /api/tickets/create` — Client

Creer un ticket support.

```json
{
  "title": "Question sur mon projet",
  "message": "Bonjour, pouvez-vous me donner une mise a jour ?"
}
```

#### `GET /api/tickets/views/:id` — Client

Lire un ticket accessible a l'utilisateur courant.

#### `POST /api/tickets/:id/reply` — Client

Ajouter une reponse a un ticket :

```json
{
  "replyMessage": "Voici les informations demandees."
}
```

### Administration des devis, commandes et tickets

#### `POST /api/admin/quotes/:userId/:quoteId/status` — Admin

Mettre a jour un devis. `status` accepte `pending`, `reviewing`, `sent`,
`accepted` ou `declined`. `adminNote` est optionnel.

#### `POST /api/orders/create` — Admin

Creer une commande pour un client identifie par son pseudo.

```json
{
  "name": "Site vitrine",
  "client_name": "alice",
  "description": "Commande de developpement.",
  "price": 2500,
  "quantity": 1,
  "status": "En cours"
}
```

Les statuts acceptes sont `En cours`, `Complété`, `En attente` et `Annulé`.

#### `POST /api/orders/:orderId/status` — Admin

Mettre a jour le statut d'une commande avec `{ "status": "Complété" }`.

#### `POST /api/orders/:orderId/delete` — Admin

Supprimer une commande.

#### `POST /api/admin/tickets/:userId/:ticketId/reply` — Support

Repondre a un ticket et modifier son statut :

```json
{
  "replyMessage": "Votre demande a ete prise en compte.",
  "status": "repondu"
}
```

#### `POST /api/admin/tickets/:userId/:ticketId/delete` — Support

Supprimer un ticket.

#### `POST /api/tickets/:id/update` — Support

Mettre a jour `title`, `message` et/ou `status` d'un ticket. Cette route
retourne une redirection pour une requete HTML et une reponse JSON pour une
requete XHR.

#### `POST /api/admin/users/update` — Admin

Mettre a jour un utilisateur. Champs disponibles : `userId`, `pseudo`, `email`,
`role`, `status`, `solde`, `credits`, `avatar`, `emailVerified`, `isBan`,
`banReason` et `password`.

#### `POST /api/admin/users/:userId/toggle-ban` — Admin

Basculer le bannissement d'un utilisateur.

### Contenu et catalogue

#### Articles

| Methode | Route | Acces |
| --- | --- | --- |
| `POST` | `/articles` | Admin |
| `PUT` | `/articles/:id` | Admin |
| `DELETE` | `/articles/:id` | Admin |

Les champs principaux sont `title`, `description`, `category` et `image`.
Les images peuvent etre envoyees comme fichier `image` (JPEG, PNG ou WebP,
5 Mo maximum) ou comme data URI lors de la creation.

#### Projets

`POST /projects` — **Admin**, `multipart/form-data`.

Champs : `title`, `description`, `projectType`, `client`, `location`, `budget`,
`duration`, `result` et fichier `image` optionnel.

#### Categories et services

| Methode | Route | Acces |
| --- | --- | --- |
| `POST` | `/create-category` | Admin |
| `PUT` | `/update-category/:id` | Admin |
| `DELETE` | `/delete-category/:id` | Admin |
| `POST` | `/create-service` | Admin |
| `PUT` | `/update-service/:id` | Admin |
| `DELETE` | `/delete-service/:id` | Admin |

Une categorie utilise `name`, `description` et `icon`. Un service utilise
`name`, `description` et `categoryId`.

#### Profil

`POST /profile/update/:id` — **Client**, `multipart/form-data`.

Le profil accepte notamment `pseudo`, `email`, `password` et le fichier
`avatar` (JPEG, PNG ou WebP, 5 Mo maximum).

### Newsletter et contact

#### `POST /subscribe` — Public

Inscrire une adresse a la newsletter :

```json
{
  "email": "alice@example.com"
}
```

Cette route est limitee a 100 requetes par IP toutes les 15 minutes.

#### `POST /contact` — Public

Creer un ticket temporaire dans la session avec `full-name`, `email`, `subject`
et `message`. Cette route HTML redirige/rend une vue, elle ne constitue pas une
API JSON stable.

### Pages HTML principales

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/` | Accueil |
| `GET` | `/about` | Presentation |
| `GET` | `/blog` | Articles |
| `GET` | `/portfolio` | Projets |
| `GET` | `/project?id=...` | Detail d'un projet |
| `GET` | `/services` | Catalogue de services |
| `GET` | `/dashboard` | Dashboard connecte |
| `GET` | `/client/ticket` | Tickets du client |
| `GET` | `/.well-known/security.txt` | Contact de securite |

## Format des reponses et erreurs

Les reponses JSON de succes utilisent generalement :

```json
{
  "success": true,
  "message": "Operation reussie.",
  "errcode": 200
}
```

Les erreurs suivent le meme format :

```json
{
  "success": false,
  "errcode": 400,
  "message": "Les champs fournis sont invalides."
}
```

Codes courants :

| Code | Signification |
| --- | --- |
| `400` | Requete invalide ou validation echouee |
| `401` | Session absente ou invalide |
| `403` | Role insuffisant, compte inactif/banni ou CAPTCHA refuse |
| `404` | Ressource introuvable |
| `409` | Conflit, par exemple doublon |
| `429` | Trop de requetes |
| `500` | Erreur serveur |
| `503` | Protection reCAPTCHA indisponible en production |

## Authentification et roles

L'application utilise une session Express stockee dans un cookie HTTP-only,
`SameSite=Lax`, avec `secure=true` en production.

- `user` : acces a son dashboard, profil, devis et tickets.
- `admin` : acces aux operations d'administration.
- `developper` : acces uniquement a l'espace support/tickets et aux actions de
  traitement des tickets ; aucun acces au dashboard client, aux devis,
  commandes, utilisateurs, articles, projets ou catalogue.

Les routes API sont protegees par `router.use("/api", isAuthenticated)`, puis
les routes sensibles ajoutent `isAdmin`, `isClient` ou `isTicketAgent`. Le statut de compte est verifie sur chaque
requete authentifiee : bannissement, inactivite, email non verifie et session
obsolete provoquent un refus.

## Securite

- Les mots de passe sont hashes avec bcrypt.
- Les tokens email et reset sont hashes avant stockage.
- reCAPTCHA v3 est verifie cote serveur avec controle de l'action et du score.
- Le rate limiting global est actif hors environnement `development`.
- Les routes d'authentification ont un limiteur dedie.
- La CSP utilise un nonce par requete et autorise uniquement les CDN necessaires.
- HSTS est active uniquement en production sur HTTPS.
- `X-Powered-By` et `Server` sont retires.
- Les fichiers uploades sont limites a 5 Mo et restreints a JPEG, PNG et WebP.
- Les erreurs JSON malforme renvoient `400`.
- Les activites de connexion et d'inscription sont stockees dans `ActivityLog`
  et visibles dans « Activite recente » pour les administrateurs.

## Docker et reverse proxy

```bash
docker compose up -d --build
docker compose logs -f app
docker compose down
```

Le reverse proxy doit transmettre au minimum :

```nginx
server_tokens off;

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

En production, Express active `trust proxy` afin de reconnaitre HTTPS et
l'adresse IP d'origine derriere le proxy.

## Tests

Le test fourni du rate limiting envoie uniquement des requetes fictives et reste
limite :

```bash
npm run security:rate-limit
```

Avant une mise en production, verifier manuellement :

1. inscription et reception du mail de verification ;
2. connexion avec et sans token reCAPTCHA ;
3. mot de passe oublie et expiration du token ;
4. acces d'un compte `user` a une route admin ;
5. bannissement puis invalidation immediate de la session ;
6. upload d'un type de fichier non autorise ;
7. apparition de l'activite dans le dashboard admin.

## Depannage

### MongoDB inaccessible

Verifier `MONGO_URL`, l'accessibilite du serveur MongoDB et les logs :

```bash
docker compose logs -f mongo
```

### Emails non envoyes

Verifier `EMAIL_MODE`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASSWORD`, `MAIL_FROM` et `APP_URL`. En developpement, utiliser le mode
console si aucun SMTP n'est disponible.

### CAPTCHA refuse

Verifier que le domaine `souflyhub.dev` est autorise dans la console Google
reCAPTCHA, que `RECAPTCHA_SITE_KEY` correspond a `RECAPTCHA_SECRET_KEY` et que
l'action envoyee correspond a `login`, `register` ou `forgot_password`.

### Erreur `SESSION_SECRET`

Definir une valeur longue et aleatoire dans `.env`, puis redemarrer le serveur.

## Licence

Projet prive Souflydev. Consulter le fichier `package.json` pour les
informations de licence du projet.
