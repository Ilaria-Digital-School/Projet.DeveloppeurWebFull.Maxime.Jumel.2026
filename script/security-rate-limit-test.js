const http = require("http");

const targetUrl = new URL(process.argv[2] || "http://127.0.0.1:3000/login");
const requestCount = Math.min(Number(process.argv[3]) || 12, 20);
const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);

if (targetUrl.protocol !== "http:" || !localHosts.has(targetUrl.hostname)) {
    console.error("Refus: ce test est limité à un serveur HTTP local (localhost/127.0.0.1/::1). ");
    process.exit(1);
}

const sendFakeLogin = () => new Promise((resolve, reject) => {
    // Identifiants synthétiques: aucune création ni modification de données.
    const body = JSON.stringify({
        email: "security-test-invalid@example.invalid",
        password: "WrongPassword1!"
    });
    const request = http.request({
        hostname: targetUrl.hostname,
        port: targetUrl.port || 80,
        path: targetUrl.pathname,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    }, (response) => {
        response.resume();
        response.on("end", () => resolve(response.statusCode));
    });

    request.on("error", reject);
    request.write(body);
    request.end();
});

(async () => {
    const counts = {};

    for (let index = 0; index < requestCount; index += 1) {
        const status = await sendFakeLogin();
        counts[status] = (counts[status] || 0) + 1;
        console.log(`#${index + 1}: HTTP ${status}`);
    }

    console.log("\nRésumé:", counts);
    if (counts[429]) {
        console.log("OK: le rate limiting a répondu avec HTTP 429.");
        return;
    }

    console.error("ATTENTION: aucun HTTP 429 reçu pendant ce test.");
    process.exitCode = 1;
})().catch((error) => {
    console.error("Échec du test:", error.message);
    process.exitCode = 1;
});
