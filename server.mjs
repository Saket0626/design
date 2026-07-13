import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const serverEntry = fileURLToPath(import.meta.url);
const isMain = process.argv[1] === serverEntry;
const distDir = resolve(__dirname, "dist");
const indexHtml = join(distDir, "index.html");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";

if (!Number.isFinite(port) || port < 1 || port > 65535) {
  console.error("Invalid PORT:", process.env.PORT);
  process.exit(1);
}

if (isMain && !existsSync(indexHtml)) {
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

function requestPathname(rawUrl = "/") {
  return (rawUrl || "/").split("?")[0] || "/";
}

function hasUnsafePathSegment(pathname) {
  return pathname.includes("\0") || pathname.split(/[\\/]+/).includes("..");
}

export function getStaticFilePath(rawUrl = "/") {
  const rawPathname = requestPathname(rawUrl);
  const rawStaticPath = rawPathname === "/" ? "/index.html" : rawPathname;

  if (hasUnsafePathSegment(rawStaticPath)) return null;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawStaticPath);
  } catch {
    return null;
  }

  if (hasUnsafePathSegment(decodedPath)) return null;

  const filePath = join(distDir, decodedPath);
  const relativePath = relative(distDir, filePath);
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) return null;

  return filePath;
}

export const server = createServer(async (req, res) => {
  try {
    let pathname = (req.url ?? "/").split("?")[0];

    if (pathname === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }

    if (pathname === "/runtime-config.js") {
      const config = {
        VITE_SUPABASE_URL:
          process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
        VITE_SUPABASE_ANON_KEY:
          process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
      };
      res.writeHead(200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(`window.__RUNTIME_CONFIG__=${JSON.stringify(config)};`);
      return;
    }

    if (pathname === "/") pathname = "/index.html";

    const filePath = getStaticFilePath(pathname);

    if (!filePath) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

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

if (isMain) {
  server.on("error", (err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });

  server.listen(port, host, () => {
    const hasUrl = Boolean(process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL);
    const hasKey = Boolean(
      process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
    );
    console.log(`RoomCraft listening on http://${host}:${port}`);
    console.log(`Health check: http://${host}:${port}/health`);
    if (!hasUrl || !hasKey) {
      console.warn(
        "WARNING: Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Railway Variables."
      );
    } else {
      console.log("Supabase runtime config: OK");
    }
  });
}
