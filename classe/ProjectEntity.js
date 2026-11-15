const ContentEntity = require("./ContentEntity");

/** Projet réalisé : ContentEntity + informations client. */
class ProjectEntity extends ContentEntity {
    constructor(data = {}) {
        super(data);
        this.imageUrl = String(data.imageUrl ?? "");
        this.category = String(data.category ?? "");
        this.tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
        this.projectType = String(data.projectType ?? "");
        this.client = String(data.client ?? "");
        this.location = String(data.location ?? "");
        this.budget = String(data.budget ?? "");
        this.duration = String(data.duration ?? "");
        this.result = String(data.result ?? "");
    }

    static fromDocument(doc) {
        return new ProjectEntity(doc);
    }

    get kind() {
        return "project";
    }

    get imagePath() {
        return this.imageUrl;
    }

    toViewModel() {
        return {
            ...super.toViewModel(),
            imageUrl: this.imageUrl,
            category: this.category,
            tags: this.tags,
            projectType: this.projectType,
            client: this.client,
            location: this.location,
            budget: this.budget,
            duration: this.duration,
            result: this.result
        };
    }
}

module.exports = ProjectEntity;
