const http = require('http');
const { securityHeaders } = require('../middleware/securityHeaders');
const { exposeCookieConsent } = require('../middleware/cookieManager');
const { getCurrentUser } = require('../middleware/authMiddleware');
const Project = require('../models/Project');
const Article = require('../models/Article');
const { ProjectEntity, ArticleEntity } = require('./index');

const run = (middleware, req, res) => new Promise((resolve, reject) => {
    middleware(req, res, (err) => { err ? reject(err) : resolve(); });
});

/**
 * Serveur HTTP « from scratch » (module natif `http`, sans Express).
 *
 * Il prend en charge la page d'accueil (GET/HEAD /) ; toutes les autres
 * requêtes sont déléguées telles quelles à l'application Express.
 */
class NativeServer {
    constructor(expressApp, { cookieParser, session, guard = null }) {
        this.guard = guard;
        this.expressApp = expressApp;
        this.cookieParser = cookieParser;
        this.session = session;
        this.server = http.createServer((req, res) => this.#dispatch(req, res));
    }

    listen(port, callback) {
        return this.server.listen(port, callback);
    }

    #isHome(req) {
        if (req.method !== 'GET' && req.method !== 'HEAD') return false;
        return new URL(req.url, 'http://localhost').pathname === '/';
    }

    async #dispatch(req, res) {
        if (!this.#isHome(req)) {
            // Déléguer à l'application Express
            return this.expressApp(req, res);
        }
        try {
            await this.#home(req, res);
        } catch (err) {
            console.error('Erreur lors du traitement de la requête native :', err);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            }
            if (!res.writableEnded) res.end('Erreur interne du serveur');
        }
    }

    async #home(req, res) {
        // On initialise res.locals pour que les middlewares puissent y stocker des données.
        res.locals = {};
        if (this.guard) {
            // Le limiteur n'appelle pas next() quand il refuse : on s'arrête à la fin de la réponse.
            const allowed = await new Promise((resolve) => {
                res.once('close', () => resolve(false));
                this.guard(req, res, (err) => resolve(!err));
            });
            if (!allowed) return;
        }
        await run(securityHeaders, req, res);
        await run(this.cookieParser, req, res);
        await run(this.session, req, res);

        // Session ouverte mais compte banni / inactif / périmé : on laisse
        // Express appliquer la procédure complète (déconnexion, page de ban...).
        if (req.session?.isAuth && req.session?.user) {
            let state = null;
            try {
                state = await getCurrentUser(req);
            } catch (error) {
                console.error('Erreur vérification du compte (route native) :', error);
            }
            if (state && state.reason && state.reason !== 'anonymous') {
                return this.expressApp(req, res);
            }
        }
        await run(exposeCookieConsent, req, res);

        let projects = [];
        let articles = [];
        try {
            const [projectDocs, articleDocs] = await Promise.all([
                Project.find().sort({ createdAt: -1 }).lean(),
                Article.find().sort({ createdAt: -1 }).lean()
            ]);
            projects = projectDocs.map((doc) => ProjectEntity.fromDocument(doc).toViewModel());
            articles = articleDocs.map((doc) => ArticleEntity.fromDocument(doc).toViewModel());
        } catch (error) {
            console.error('Erreur chargement accueil :', error);
        }

        const html = await new Promise((resolve, reject) => {
            this.expressApp.render(
                'index',
                { ...res.locals, user: req.session?.user || null, projects, articles },
                (err, out) => (err ? reject(err) : resolve(out))
            );
        });

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Length': Buffer.byteLength(html)
        });
        res.end(req.method === 'HEAD' ? undefined : html);
    }
}

module.exports = NativeServer;
