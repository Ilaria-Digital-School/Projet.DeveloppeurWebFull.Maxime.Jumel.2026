const test = require("node:test");
const assert = require("node:assert/strict");
const { ArticleEntity, ContentEntity } = require("../classe");

test("ArticleEntity hérite de ContentEntity", () => {
    assert.ok(new ArticleEntity({}) instanceof ContentEntity);
});

test("ArticleEntity valide titre, description, slogan et catégorie", () => {
    const ok = ArticleEntity.fromDocument({ title: "t", description: "d", slogan: "s", category: "c" });
    assert.equal(ok.isValid(), true);
    assert.equal(ok.kind, "article");
    assert.equal(ok.toViewModel().slogan, "s");
    assert.equal(ArticleEntity.fromDocument({ title: "t", description: "d", category: "c" }).isValid(), false);
});
