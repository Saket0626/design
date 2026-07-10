import assert from "node:assert/strict";
import { test } from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getStaticFilePath } from "../server.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(rootDir, "dist");

test("resolves static files inside dist", () => {
  assert.equal(getStaticFilePath("/"), resolve(distDir, "index.html"));
  assert.equal(
    getStaticFilePath("/assets/app.js?version=1"),
    resolve(distDir, "assets/app.js")
  );
});

test("rejects traversal outside dist", () => {
  for (const requestPath of [
    "/../server.mjs",
    "/..%2Fserver.mjs",
    "/%2e%2e/server.mjs",
    "/assets/../../server.mjs",
    "/assets/%2e%2e/%2e%2e/server.mjs",
  ]) {
    assert.equal(getStaticFilePath(requestPath), null, requestPath);
  }
});
