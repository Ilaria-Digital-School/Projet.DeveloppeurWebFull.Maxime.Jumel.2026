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

## Demarrage avec Docker

Docker Desktop doit etre installe et demarre.

Construire et lancer l'application avec MongoDB :

```bash
docker compose up -d --build
```

L'application est disponible sur `http://localhost:3000`. MongoDB est accessible uniquement
sur le reseau Docker et ses donnees sont conservees dans le volume `mongodb_data`.

Voir les journaux :

```bash
docker compose logs -f app
```

Arreter les conteneurs sans supprimer les donnees :

```bash
docker compose down
```

Le fichier `.env` est charge par Compose pour les secrets SMTP et les autres variables.
Compose remplace automatiquement `MONGO_URL` par l'URL du service MongoDB interne.

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
SECURITY_CONTACT_EMAIL=security@example.com

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
- CSP, HSTS en production, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` et `X-Content-Type-Options` sont configures par `middleware/securityHeaders.js`.
- La CSP utilise un nonce par requete : tout script inline doit porter `nonce="<%= cspNonce %>"`. Seul `https://cdn.jsdelivr.net` est autorise (Bootstrap, avec SRI) ; le reste est servi depuis `public/` (voir ci-dessous).
- Les attributs `onclick`/`onchange`/`oninput` et les URL `javascript:` sont bloques par la CSP : utiliser des attributs `data-*` avec un ecouteur delegue.
- Le canal de signalement est publie sur `/.well-known/security.txt` (et `/security.txt`). Le contact provient de `SECURITY_CONTACT_EMAIL`.
- `X-Powered-By` est desactive et l'en-tete `Server` est retire.

### Mot de passe oublie

Parcours complet : `/forgot-password` (demande) puis `/reset-password/:token` (nouveau mot de passe), avec `/reset-password/termine` en confirmation. Le lien est aussi accessible depuis `/login`.

- Le jeton est tire au hasard (32 octets), stocke **hache en SHA-256** et valable 1 heure.
- Usage unique : il est efface des la premiere reussite, un rejeu est refuse.
- La reponse de `POST /forgot-password` est identique que le compte existe ou non : la page ne revele jamais quelles adresses sont enregistrees. Un compte banni ne peut pas utiliser cette voie.
- `POST /forgot-password` est limite a 5 appels par heure et par IP.
- Un changement de mot de passe incremente `sessionVersion` : toutes les sessions ouvertes avec l'ancien mot de passe sont invalidees au chargement suivant.

### Bannissement et acces

`middleware/authMiddleware.js` exporte `enforceAccountStatus`, monte dans `script/serverRun.js` juste apres la session et avant le routeur. Il relit le compte en base a chaque requete et :

- laisse passer les visiteurs non connectes sans toucher a la base ;
- coupe l'acces immediatement si `isBan`, `status !== "active"` ou email non verifie ;
- detruit la session serveur et supprime le cookie : le bannissement est immediat, sans attendre l'expiration ;
- affiche `views/banned.ejs` (avec le motif saisi par l'admin) pour les pages, renvoie `403` JSON pour les appels `/api`.

Les routes protegees (`isAdmin`, `isClient`, `isDevelopper`) reutilisent le meme chargement de compte, memorise sur la requete : une seule lecture Mongo par requete. Toute route qui exige une session doit passer par l'un de ces middlewares.

### Reverse proxy nginx

Si l'application est derriere nginx, ajouter dans le `server{}` pour masquer la version serveur :

```nginx
server_tokens off;

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

`server_tokens off;` transforme `Server: nginx/1.22.1` en `Server: nginx`. Les en-tetes de securite sont emis par Express ; nginx peut aussi les renvoyer en defense en profondeur.

### Dependances front-end

Bootstrap est charge depuis le CDN jsdelivr, avec une empreinte SRI : le navigateur refuse le fichier s'il ne correspond pas a la somme de controle, ce qui neutralise le risque d'injection par un tiers compromis. La CSP autorise explicitement `https://cdn.jsdelivr.net` pour les scripts et les styles.

| Ressource | Origine | Version |
| --- | --- | --- |
| `bootstrap.min.css` | CDN jsdelivr + `integrity` | Bootstrap 5.3.8 |
| `bootstrap.bundle.min.js` | CDN jsdelivr + `integrity` | Bootstrap 5.3.8 (bundle) |
| `public/css/vendor/bootstrap-icons/1.13.1/` | local | bootstrap-icons 1.13.1 (CSS + woff2/woff) |
| `public/css/vendor/font-awesome/all.min.css` | local | Font Awesome 6.6.0 |
| `public/css/vendor/webfonts/` | local | Font Awesome 6.6.0 (fa-solid, fa-regular, fa-brands, v4compat) |
| `public/css/vendor/fonts.css` + `public/fonts/` | local | Inter + Outfit (latin / latin-ext, normale + italique) |

Les ressources locales sont generees par `node script/fetch-vendor.js` et `node script/fetch-fonts.js` : a relancer uniquement pour mettre a jour une version. Les chemins relatifs de polices declares dans les CSS sont preserves, ne pas deplacer ces fichiers a la main.

Si la CSP doit etre resserree a nouveau, il faut d'abord repasser Bootstrap en local : retablir `script-src 'self'`, `style-src 'self' 'unsafe-inline'` et retirer les attributs `integrity` / `crossorigin` des vues.

## Licence

Projet prive de Souflydev. Voir les informations du depot pour les conditions de distribution.
