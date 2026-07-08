import { test } from "node:test";
import assert from "node:assert/strict";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getStaticFilePath } from "./server.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = resolve(__dirname, "dist");

function assertInsideDist(filePath) {
  assert.ok(filePath);
  const fromDist = relative(distDir, filePath);
  assert.ok(!fromDist.startsWith(".."));
  assert.equal(isAbsolute(fromDist), false);
}

test("resolves safe static paths inside dist", () => {
  assert.equal(getStaticFilePath("/"), resolve(distDir, "index.html"));
  assert.equal(getStaticFilePath("/assets/app.js"), resolve(distDir, "assets/app.js"));
  assertInsideDist(getStaticFilePath("/assets/app%20bundle.js"));
});

test("rejects raw and encoded traversal outside dist", () => {
  assert.equal(getStaticFilePath("/../server.mjs"), null);
  assert.equal(getStaticFilePath("/..%2Fserver.mjs"), null);
  assert.equal(getStaticFilePath("/%2e%2e/server.mjs"), null);
  assert.equal(getStaticFilePath("/assets/%2e%2e/%2e%2e/server.mjs"), null);
});

test("rejects malformed or null-byte paths", () => {
  assert.equal(getStaticFilePath("/%E0%A4%A"), null);
  assert.equal(getStaticFilePath("/assets/app.js%00.png"), null);
});
