# Documentation technique

## Architecture

- `app.js` initialise l'application.
- `router/api.js` expose les pages HTML et les routes HTTP.
- `models/` contient les schémas Mongoose.
- `middleware/` centralise l'authentification, les sessions et les en-têtes de sécurité.
- `views/` contient les templates EJS.
- `classe/` contient les entités métier et l'adaptateur `http.createServer`.

## Données

MongoDB est utilisé via Mongoose. `Service.category` et `Article.category`
référencent `Category` avec un `ObjectId`. Les projets conservent une catégorie
éditoriale et un tableau de tags.

## Exécution

```bash
copy .env.example .env
npm install
npm test
npm run dev
```

Les secrets, l'URL MongoDB et les paramètres SMTP sont fournis uniquement par
les variables d'environnement.
