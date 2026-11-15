const BaseEntity = require('./BaseEntity');

/**
* contenu publiable (titre + desvcription + image)
* Hérite de baseEntity ; sert de parent à ArticleEntity et ProjetEntity
*/ 

class ContentEntity extends BaseEntity {
    constructor(data = {}) {
        super(data);
        this.title = String(data.title ?? "").trim();
        this.description = String(data.description ?? "").trim();
    }
    get kind() {
        return 'content';
    }
    get ImagePath() {
        return "";
    }
    isValid() {
        return this.title.length > 0 && this.description.length > 0;
    }

    excerpt(max = 120){
        return this.description.length > max
        ? `${this.description.slice(0, max - 1).trimEnd()}…`
        : this.description;
    }
    describe() {
        return `${super.describe()} << ${this.title} >> `;
    }
    toViewModel() {
        return {
            ...super.toViewModel(),
            title: this.title,
            description: this.description
        }
    }

}

module.exports = ContentEntity;