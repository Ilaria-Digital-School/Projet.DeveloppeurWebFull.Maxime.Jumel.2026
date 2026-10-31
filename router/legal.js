const express = require("express");

const router = express.Router();

const pages = {
    "/mentions-legales": "legal/mentions-legales",
    "/confidentialite": "legal/confidentialite",
    "/cookies": "legal/cookies",
    "/cgv": "legal/cgv",
    "/cgu": "legal/cgu"
};

for (const [path, view] of Object.entries(pages)) {
    router.get(path, (req, res) => res.render(view));
}

module.exports = router;
