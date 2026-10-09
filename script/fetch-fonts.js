// Télécharge Inter et Outfit (sous-ensembles latin + latin-ext) dans public/fonts/
// et génère public/css/vendor/fonts.css. Les URL de polices du projet pointaient vers
// Google Fonts, ce que la CSP bloquait — et Inter n'était de toute façon pas livré.
//   node script/fetch-fonts.js
const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..", "public");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// `opsz` n'est pas accepte par l'API css2 pour Inter : on garde les axes `wght`,
// ce qui suffit au design (les variantes de graisse restent variables).
const FAMILIES = [
    { name: "inter", query: "Inter:wght@100..900" },
    { name: "inter-italic", query: "Inter:ital,wght@1,100..900" },
    { name: "outfit", query: "Outfit:wght@100..900" }
];

const get = (url, headers = {}) =>
    new Promise((resolve, reject) => {
        https
            .get(url, { headers }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    res.resume();
                    return resolve(get(new URL(res.headers.location, url).href, headers));
                }
                if (res.statusCode !== 200) {
                    res.resume();
                    return reject(new Error(`${res.statusCode} sur ${url}`));
                }
                const chunks = [];
                res.on("data", (c) => chunks.push(c));
                res.on("end", () => resolve(Buffer.concat(chunks)));
            })
            .on("error", reject);
    });

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

(async () => {
    const dir = path.join(ROOT, "fonts");
    fs.mkdirSync(dir, { recursive: true });

    const rules = [];

    for (const family of FAMILIES) {
        // La query Google contient des `:` et `,` qui ne doivent pas être encodés.
        const url = `https://fonts.googleapis.com/css2?family=${family.query}&display=swap`;
        const css = (await get(url, { "User-Agent": UA })).toString("utf8");

        // Découpe le CSS Google en blocs @font-face precedés d'un commentaire de subset.
        const blocks = css.split("/*").slice(1);
        for (const raw of blocks) {
            const subset = raw.slice(0, raw.indexOf("*/")).trim();
            if (subset !== "latin" && subset !== "latin-ext") continue;

            const face = raw.slice(raw.indexOf("*/") + 2);
            const url2 = face.match(/url\((https:\/\/[^)]+\.woff2)\)/);
            if (!url2) continue;

            const file = `${slug(family.name)}-${slug(subset)}.woff2`;
            fs.writeFileSync(path.join(dir, file), await get(url2[1], { "User-Agent": UA }));
            console.log(`ok   fonts/${file}`);

            rules.push(
                face
                    .replace(/url\(https:\/\/[^)]+\.woff2\)/, `url("/fonts/${file}")`)
                    .replace(/\/\*.*?\*\//gs, "")
                    .trim()
            );
        }
    }

    const out = path.join(ROOT, "css", "vendor", "fonts.css");
    fs.writeFileSync(out, `/* Inter + Outfit servis depuis public/fonts (script/fetch-fonts.js) */\n${rules.join("\n\n")}\n`);
    console.log(`ok   css/vendor/fonts.css (${rules.length} @font-face)`);
})();