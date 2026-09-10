<<<<<<< HEAD
# Souflydev Backend

Application web Node.js pour la gestion des comptes clients, des demandes de devis et du support projet de Souflydev.

Le projet utilise Express, MongoDB/Mongoose et des vues EJS. Les pages existantes sont servies par le backend, mais la documentation ci-dessous se concentre sur l'architecture serveur et les workflows metier.

## Fonctionnalites

- Inscription et connexion securisees
- Activation du compte par verification email avec token expire
- Gestion de session et controle des roles `user`, `admin` et `developper`
- Demandes de devis client avec budget, prestation, description et date souhaitee
- Suivi des demandes de devis par le client
- Gestion des statuts de devis par les administrateurs
- Tickets de support et reponses admin/client
- Upload d'avatar WebP avec limite de taille
- Headers HTTP de securite et protection des routes API
- Rate limiting actif hors environnement de developpement

## Stack technique

- Node.js et Express 5
- MongoDB avec Mongoose
- EJS
- Nodemailer pour la verification email
- express-session pour les sessions
- bcryptjs pour le hashage des mots de passe
- express-rate-limit pour la limitation des requetes
- Multer pour les uploads

## Prerequis

- Node.js 18 ou plus recent
- npm
- MongoDB accessible depuis l'environnement d'execution
- Un compte SMTP pour l'activation des comptes en production

## Installation

```bash
npm install
```

Copier `.env.example` vers `.env`, puis renseigner les valeurs correspondant a ton environnement. Ne jamais versionner `.env`.

Demarrer en developpement :

```bash
npm run dev
```

Demarrer en production :

```bash
npm start
```

Le serveur est disponible par defaut sur `http://localhost:3000`.

## Variables d'environnement

```env
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
MONGO_URL=mongodb://localhost:27017/souflydev
JWT_SECRET=une-valeur-secrete-longue
SESSION_SECRET=une-valeur-secrete-longue

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=utilisateur-smtp
SMTP_PASSWORD=mot-de-passe-smtp
MAIL_FROM="Souflydev <no-reply@example.com>"
```

Le compte reste inactif tant que le lien de verification email n'a pas ete utilise. Le token expire apres 24 heures.

## Organisation du projet

```text
app.js                 Point d'entree Express et middlewares globaux
config.js              Configuration de l'application
middleware/            Authentification et autorisation
models/                Schemas Mongoose
router/                Routes HTML et API
script/                Connexion MongoDB et demarrage serveur
services/mailer.js     Envoi des emails de verification
views/                 Templates EJS servis par Express
public/                Ressources statiques et uploads
```

## Routes principales

| Methode | Route | Acces | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | Public | Cree un compte inactif et envoie un email de verification |
| `GET` | `/verify-email?token=...` | Public | Active un compte avec un token valide |
| `POST` | `/login` | Public | Ouvre une session apres verification du compte |
| `GET` | `/dashboard` | Connecte | Affiche l'espace client ou administrateur |
| `POST` | `/api/quotes` | Client | Cree une demande de devis |
| `POST` | `/api/admin/quotes/:userId/:quoteId/status` | Admin | Met a jour le statut d'un devis |
| `GET` | `/client/ticket` | Connecte | Affiche les tickets de support |

Toutes les routes sous `/api` necessitent une session authentifiee. Les routes d'administration verifient en plus le role de l'utilisateur.

## Test du rate limiting

Le test local utilise uniquement des identifiants fictifs et est limite a 20 requetes :

```bash
npm run security:rate-limit
```

Le rate limiting est desactive lorsque `NODE_ENV=development` et actif dans les autres environnements.

## Securite

- `.env` est exclu du depot Git.
- Les mots de passe sont hashes avec bcrypt.
- Les tokens de verification email sont hashes avant stockage.
- Les messages API sont inseres dans le DOM sans interpretation HTML cote client.
- Les erreurs JSON malforme renvoient HTTP 400.
- CSP, HSTS en production, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` et `X-Content-Type-Options` sont configures.

## Licence

Projet prive de Souflydev. Voir les informations du depot pour les conditions de distribution.
=======
# Portfolio Developpeur Web

Site vitrine/portfolio en HTML, CSS et JavaScript pour presenter des services, des projets, un blog et plusieurs pages secondaires.

## Apercu

Le projet contient une page d'accueil principale et plusieurs pages dans le dossier `web/` :

- `index.html` : page d'accueil
- `web/about.html`
- `web/blog.html`
- `web/contact.html`
- `web/contact_admin.html`
- `web/dasboard.html`
- `web/login.html`
- `web/portefolio.html`
- `web/project.html`
- `web/register.html`

## Technologies

- HTML5
- CSS3
- JavaScript
- Bootstrap 5 via CDN
- Bootstrap Icons via CDN

## Organisation

- `assets/css/` : feuilles de style du site
- `assets/js/` : scripts JavaScript
- `assets/images/` : images, logos et visuels
- `assets/source/` : fichiers multimedia
- `web/` : pages secondaires du site

## Lancer le projet

Le projet est statique, il ne requiert pas d'installation de dependances.

1. Ouvrir le dossier du projet dans VS Code.
2. Ouvrir `index.html` dans le navigateur ou utiliser l'extension Live Server.
3. Naviguer entre les differentes pages avec les liens du menu.

## Fonctionnalites visibles

- Navigation principale avec recherche
- Hero section avec visuels
- Cartes de services
- Carousel de projets
- Section articles et partenaires
- Pied de page avec liens et contact

## Remarques

- Les images et fichiers multimedia sont deja inclus dans le projet.
- Certaines pages et contenus semblent encore en cours de finalisation, mais la structure generale du site est en place.
# Lien des services externe google

```
https://drive.google.com/drive/folders/1lsmKTK6L7E82mtPjpGwdGKhomoxx1c58?usp=sharing

```
>>>>>>> origin/dev
