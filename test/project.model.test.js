const test = require("node:test");
const assert = require("node:assert/strict");
const Project = require("../models/Project");

test("Project : catégorie et tags ont des valeurs par défaut", () => {
    const project = new Project({ title: "t", description: "d" });
    assert.equal(project.validateSync(), undefined);
    assert.equal(project.category, "");
    assert.deepEqual([...project.tags], []);
});

test("Project : titre et description obligatoires", () => {
    const error = new Project({}).validateSync();
    assert.ok(error.errors.title && error.errors.description);
});

test("Project : tag trop long refusé", () => {
    const error = new Project({ title: "t", description: "d", tags: ["x".repeat(41)] }).validateSync();
    assert.ok(error);
});
