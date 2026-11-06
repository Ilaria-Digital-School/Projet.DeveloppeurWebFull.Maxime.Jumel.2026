const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 40;

const text = (value) => (typeof value === "string" ? value.trim() : "");

// Accepte "a, b, c", un tableau ou un champ répété ; dédoublonne sans tenir compte de la casse.
const normalizeTags = (raw) => {
    const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
    const seen = new Set();
    const tags = [];
    for (const item of list) {
        const tag = text(item);
        const key = tag.toLowerCase();
        if (!tag || seen.has(key)) continue;
        seen.add(key);
        tags.push(tag);
    }
    return tags;
};

// Retourne { value } si valide, sinon { error }.
const parseProjectInput = (body = {}) => {
    const value = {
        title: text(body.title),
        description: text(body.description),
        category: text(body.category),
        tags: normalizeTags(body.tags),
        projectType: text(body.projectType),
        client: text(body.client),
        location: text(body.location),
        budget: text(body.budget),
        duration: text(body.duration),
        result: text(body.result)
    };
    if (!value.title || value.title.length > 160 || !value.description || value.description.length > 5000) {
        return { error: "Le titre et la description sont obligatoires." };
    }
    if (value.category.length > 80) {
        return { error: "La catégorie est trop longue (80 caractères max)." };
    }
    if (value.tags.length > MAX_TAGS || value.tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
        return { error: `Maximum ${MAX_TAGS} tags de ${MAX_TAG_LENGTH} caractères.` };
    }
    return { value };
};

module.exports = { normalizeTags, parseProjectInput, MAX_TAGS, MAX_TAG_LENGTH };
