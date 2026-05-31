import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4201);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
};

const routes = {
  "/": "index.html",
  "/store": "store.html",
  "/store/plugins": "store-plugins.html",
  "/store/conteudos": "store-conteudos.html",
  "/store/comunidade": "store-comunidade.html",
  "/plugins": "store-plugins.html",
  "/conteudos": "store-conteudos.html",
  "/comunidade": "store-comunidade.html",
  "/institucional": "institucional.html",
  "/bpo-juridico": "bpo-juridico.html",
  "/treinamento": "treinamento.html",
  "/training": "treinamento.html",
  "/agentes-sistemas": "agents-systems.html",
  "/agents-systems": "agents-systems.html",
  "/raio-x": "raio-x.html",
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);

  const requestedPath = routes[url.pathname] || url.pathname.slice(1);
  const filePath = path.resolve(root, requestedPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`LEX.OS AI final running at http://127.0.0.1:${port}`);
});
