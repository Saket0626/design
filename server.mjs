import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(__dirname, "dist");
const indexHtml = join(distDir, "index.html");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";

if (!Number.isFinite(port) || port < 1 || port > 65535) {
  console.error("Invalid PORT:", process.env.PORT);
  process.exit(1);
}

if (!existsSync(indexHtml)) {
  console.error("Missing dist/index.html — run `npm run build` before `npm start`");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff2": "font/woff2",
};

async function sendFile(res, filePath) {
  const body = await readFile(filePath);
  const ext = extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    let pathname = (req.url ?? "/").split("?")[0];

    if (pathname === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }

    if (pathname === "/") pathname = "/index.html";

    const filePath = join(distDir, pathname);

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      await sendFile(res, filePath);
      return;
    }

    await sendFile(res, indexHtml);
  } catch (err) {
    console.error("Request error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`RoomCraft listening on http://${host}:${port}`);
  console.log(`Health check: http://${host}:${port}/health`);
});
