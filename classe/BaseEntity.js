/*
 * class racine de toute les entitée metier du seveur
 * Elle porte ce que est commun : indentifiant, titre, description, slogan, image, date
 * sérialisation. les class fille completent ou redefinissent le comportement (heritage + polymorphisme)
 */

class BaseEntity {
    #id;
    #createdAt;
    constructor(data = {}) {
        this.#id = String(data._id ?? data.id ?? "");
        this.#createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    }
    get id() {
        return this.#id;
    }
    get createdAt() {
        return this.#createdAt;
    }
    get kind() {
        return 'base';
    }
    describe() {
        return `id: ${this.id}, createdAt: ${this.createdAt}`;
    }
    toViewModel() {
        return {
            id: this.id,
            createdAt: this.createdAt,
            kind: this.kind
        }
    }
    toJSON() {
        return this.toViewModel()
        
    }
}



module.exports = BaseEntity;