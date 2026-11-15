const ContentEntity = require('./ContentEntity');


/**
 * Article de blog : Content = solgan + description + image + date 
 */
class ArticleEntity extends ContentEntity {
    constructor(data = {}) {
        super(data);
        this.slogan = String(data.slogan ?? "").trim();
        this.image = data.image ?? "";
        this.date = data.date ?? null;
        this.category = data.category?.name ?? data.category ?? "";
    }

    static fromDocument(document) {
        return new ArticleEntity(document);
    }
    get kind() {
        return 'article';
    }

    // Retourne le chemin de l'image de l'article
    get imagePath() {
        return this.image
    }
    // Retourne un booléen indiquant si l'article est valide (titre, description, slogan et catégorie non vides)
    isValid() {
        return super.isValid() && this.slogan.length > 0 && this.category.length > 0;
    }
    // Retourne un extrait de la description de l'article, limité à un nombre de caractères spécifié (par défaut 120)
    toViewModel() {
        return {
            ...super.toViewModel(),
            slogan: this.slogan,
            category: this.category,
            image: this.image,
            date: this.date
        }
    }



}

module.exports = ArticleEntity;