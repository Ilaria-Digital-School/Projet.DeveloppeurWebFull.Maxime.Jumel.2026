const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeTags, parseProjectInput } = require("../services/projectInput");

test("normalizeTags découpe, nettoie et dédoublonne", () => {
    assert.deepEqual(normalizeTags(" React, node ,react,, SEO "), ["React", "node", "SEO"]);
    assert.deepEqual(normalizeTags(["a", " b ", "A"]), ["a", "b"]);
    assert.deepEqual(normalizeTags(undefined), []);
    assert.deepEqual(normalizeTags({ $ne: "" }), []);
});

test("parseProjectInput accepte un projet valide", () => {
    const { value, error } = parseProjectInput({ title: " Site ", description: "Desc", category: "Web", tags: "a,b" });
    assert.equal(error, undefined);
    assert.equal(value.title, "Site");
    assert.equal(value.category, "Web");
    assert.deepEqual(value.tags, ["a", "b"]);
});

test("parseProjectInput refuse titre/description manquants ou trop longs", () => {
    assert.ok(parseProjectInput({ description: "x" }).error);
    assert.ok(parseProjectInput({ title: "x" }).error);
    assert.ok(parseProjectInput({ title: "x".repeat(161), description: "x" }).error);
    assert.ok(parseProjectInput({ title: "x", description: "y".repeat(5001) }).error);
});

test("parseProjectInput refuse catégorie ou tags hors limites", () => {
    const base = { title: "t", description: "d" };
    assert.ok(parseProjectInput({ ...base, category: "c".repeat(81) }).error);
    assert.ok(parseProjectInput({ ...base, tags: Array.from({ length: 11 }, (_, i) => `t${i}`) }).error);
    assert.ok(parseProjectInput({ ...base, tags: "x".repeat(41) }).error);
});

test("parseProjectInput ignore les valeurs non textuelles (injection NoSQL)", () => {
    const { value } = parseProjectInput({ title: "t", description: "d", client: { $gt: "" } });
    assert.equal(value.client, "");
});
