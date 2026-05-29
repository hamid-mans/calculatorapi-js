const http = require("http");
const url = require("url");
const Calculator = require("./calculator");

const PORT = 3000;
const calc = new Calculator();

function requestHandler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, OPTIONS");
    res.end(JSON.stringify({ error: "Méthode non autorisée. Utiliser GET." }));
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname !== "/calculate") {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Route introuvable." }));
    return;
  }

  const { operation, a, b } = parsedUrl.query;

  if (!operation || a === undefined || b === undefined) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Paramètres attendus : operation, a, b" }));
    return;
  }

  const numA = Number(a);
  const numB = Number(b);

  if (Number.isNaN(numA) || Number.isNaN(numB)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Les paramètres a et b doivent être des nombres." }));
    return;
  }

  if (!["add", "subtract", "multiply", "divide"].includes(operation)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Opération inconnue. Utiliser : add, subtract, multiply, divide" }));
    return;
  }

  try {
    let result;
    if (operation === "add") result = calc.add(numA, numB);
    if (operation === "subtract") result = calc.subtract(numA, numB);
    if (operation === "multiply") result = calc.multiply(numA, numB);
    if (operation === "divide") result = calc.divide(numA, numB);

    res.statusCode = 200;
    res.end(JSON.stringify({ operation, a: numA, b: numB, result }));
  } catch (error) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: error.message }));
  }
}

const server = http.createServer(requestHandler);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = { requestHandler, server };