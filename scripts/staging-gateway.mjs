// Divinity Companion staging gateway.
// Mirrors apps/app/nginx/default.conf.template for non-docker runs:
//   /healthz            -> static ok
//   /health, /api/*     -> proxy to core api
//   /socket.io/*        -> proxy (hand-off upgraded WS connections)
//   /assets/*           -> static, immutable cache
//   /runtime-config.json-> no-store 404 fallback
//   /                   -> SPA fallback to index.html
// cloud-api (/cloud/*) rides /cloud when P0-B lands.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";

const DIST = path.resolve(new URL("../apps/app/dist", import.meta.url).pathname);
const API_HOST = process.env.GATEWAY_API_HOST ?? "127.0.0.1";
const API_PORT = Number(process.env.GATEWAY_API_PORT ?? 3000);
const PORT = Number(process.env.GATEWAY_PORT ?? 8080);
// shared-world mode trusts x-cloud-user-phone only from its loopback boundary;
// the staging gateway reproduces cloud-api's injection for a single demo tenant.
const STAGING_PHONE = process.env.STAGING_PHONE ?? "+10000000001";
// staging gate: all paths require ?k= or cookie k= equal to STAGING_KEY
const STAGING_KEY = process.env.STAGING_KEY ?? "";
function requestAuthorized(req, url) {
  if (!STAGING_KEY) return true;
  const queryKey = url.searchParams.get("k");
  if (queryKey === STAGING_KEY) return "set-cookie";
  const cookieHeader = req.headers.cookie ?? "";
  const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith(`staging_key=${STAGING_KEY}`));
  return Boolean(match);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function serveFile(res, filePath, cache) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "content-type": MIME[ext] ?? "application/octet-stream",
    "cache-control": cache,
  });
  fs.createReadStream(filePath).pipe(res);
}

function proxyCoreApi(req, res, tenant) {
  const headers = { ...req.headers };
  headers.host = `${API_HOST}:${API_PORT}`;
  if (tenant) {
    headers["x-cloud-user-phone"] = STAGING_PHONE;
  }
  headers["x-forwarded-proto"] = headers["x-forwarded-proto"] ?? "http";
  const upstream = http.request(
    {
      host: API_HOST,
      port: API_PORT,
      method: req.method,
      path: req.url,
      headers,
    },
    (apiRes) => {
      res.writeHead(apiRes.statusCode ?? 502, apiRes.headers);
      apiRes.pipe(res);
    },
  );
  upstream.on("error", () => {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end("upstream unavailable");
  });
  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url ?? "/", "http://gate.local");
  const auth = requestAuthorized(req, reqUrl);
  if (auth === false) {
    res.writeHead(401, { "content-type": "text/plain" });
    res.end("staging key required: append ?k=<key> once");
    return;
  }
  if (auth === "set-cookie") {
    res.writeHead(302, {
      location: reqUrl.pathname,
      "set-cookie": `staging_key=${STAGING_KEY}; Path=/; HttpOnly; SameSite=Lax`,
    });
    res.end();
    return;
  }

  const urlPath = reqUrl.pathname;

  if (urlPath === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok\n");
    return;
  }

  if (urlPath === "/health" || urlPath.startsWith("/api/") || urlPath.startsWith("/socket.io/")) {
    proxyCoreApi(req, res, true);
    return;
  }

  if (urlPath === "/runtime-config.json") {
    res.writeHead(404, { "content-type": "text/plain", "cache-control": "no-store" });
    res.end("not found");
    return;
  }

  const relative = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  if (relative.startsWith("assets/")) {
    const file = path.join(DIST, relative);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      serveFile(res, file, "public, max-age=31536000, immutable");
      return;
    }
  }

  const candidate = path.join(DIST, relative);
  const indexFile = path.join(DIST, "index.html");
  if (!relative.endsWith("/") && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    const isHtml = candidate.endsWith(".html");
    serveFile(res, candidate, isHtml ? "no-store" : "public, max-age=3600");
    return;
  }

  if (fs.existsSync(indexFile)) {
    serveFile(res, indexFile, "no-store");
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
});

server.on("upgrade", (req, socket, head) => {
  const urlPath = req.url?.split("?")[0] ?? "/";
  if (!urlPath.startsWith("/socket.io/")) {
    socket.destroy();
    return;
  }

  const reqUrl = new URL(req.url ?? "/", "http://gate.local");
  if (!requestAuthorized(req, reqUrl)) {
    socket.destroy();
    return;
  }

  const rawHeaders = [
    `${req.method} ${req.url} HTTP/1.1`,
    ...Object.entries(req.headers)
      .filter(([key]) => !["host", "connection"].includes(key))
      .map(([key, value]) => `${key}: ${value}`),
    `host: ${API_HOST}:${API_PORT}`,
    `x-cloud-user-phone: ${STAGING_PHONE}`,
    `x-forwarded-proto: http`,
    "",
    "",
  ].join("\r\n");

  const upstream = net.connect(API_PORT, API_HOST, () => {
    upstream.write(rawHeaders);
    if (head?.length) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });

  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(
    `staging gateway listening on http://127.0.0.1:${PORT} (dist: ${DIST}, api ${API_HOST}:${API_PORT}, tenant ${STAGING_PHONE})`,
  );
});