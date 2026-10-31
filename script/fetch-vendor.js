// Télécharge les dépendances front-end servies en local (bootstrap-icons,
// Font Awesome). Bootstrap n'est PAS ici : il est chargé depuis le CDN
// jsdelivr par views/partials/head.ejs.
//   node script/fetch-vendor.js
const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..", "public");

const FILES = [
  // bootstrap-icons 1.13.1
  { url: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css", dest: "css/vendor/bootstrap-icons/1.13.1/bootstrap-icons.min.css" },
  { url: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/fonts/bootstrap-icons.woff2?e34853135f9e39acf64315236852cd5a", dest: "css/vendor/bootstrap-icons/1.13.1/fonts/bootstrap-icons.woff2" },
  { url: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/fonts/bootstrap-icons.woff?e34853135f9e39acf64315236852cd5a", dest: "css/vendor/bootstrap-icons/1.13.1/fonts/bootstrap-icons.woff" },

  // Font Awesome 6.6.0 (les polices sont attendues dans ../webfonts)
  { url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css", dest: "css/vendor/font-awesome/all.min.css" },
  { url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-solid-900.woff2", dest: "css/vendor/webfonts/fa-solid-900.woff2" },
  { url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-regular-400.woff2", dest: "css/vendor/webfonts/fa-regular-400.woff2" },
  { url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-brands-400.woff2", dest: "css/vendor/webfonts/fa-brands-400.woff2" },
  { url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-solid-900.ttf", dest: "css/vendor/webfonts/fa-solid-900.ttf" },
  { url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-regular-400.ttf", dest: "css/vendor/webfonts/fa-regular-400.ttf" },
  { url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-brands-400.ttf", dest: "css/vendor/webfonts/fa-brands-400.ttf" },
  { url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-v4compatibility.woff2", dest: "css/vendor/webfonts/fa-v4compatibility.woff2" },
  { url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-v4compatibility.ttf", dest: "css/vendor/webfonts/fa-v4compatibility.ttf" },
];

const get = (url, redirects = 5) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          if (redirects <= 0) return reject(new Error(`Trop de redirections: ${url}`));
          return resolve(get(new URL(res.headers.location, url).href, redirects - 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${res.statusCode} sur ${url}`));
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });

(async () => {
  for (const file of FILES) {
    const target = path.join(ROOT, file.dest);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    try {
      const body = await get(file.url);
      fs.writeFileSync(target, body);
      console.log(`ok   ${file.dest} (${body.length} octets)`);
    } catch (error) {
      console.error(`FAIL ${file.dest} : ${error.message}`);
      process.exitCode = 1;
    }
  }
})();