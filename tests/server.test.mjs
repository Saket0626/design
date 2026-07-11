import assert from "node:assert/strict";
import { isAbsolute, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { getStaticFilePath } from "../server.mjs";

const distDir = resolve(fileURLToPath(new URL("../dist", import.meta.url)));

function assertInsideDist(filePath) {
  assert.ok(filePath, "expected a static file path");
  const relativePath = relative(distDir, filePath);
  assert.equal(relativePath.startsWith(".."), false);
  assert.equal(isAbsolute(relativePath), false);
}

test("resolves normal static paths inside dist", () => {
  assertInsideDist(getStaticFilePath("/"));
  assertInsideDist(getStaticFilePath("/assets/index.js"));
  assert.equal(getStaticFilePath("/"), resolve(distDir, "index.html"));
});

test("rejects raw and encoded parent-directory traversal", () => {
  assert.equal(getStaticFilePath("/../server.mjs"), null);
  assert.equal(getStaticFilePath("/../../proc/self/environ"), null);
  assert.equal(getStaticFilePath("/..%2Fserver.mjs"), null);
  assert.equal(getStaticFilePath("/%2e%2e/server.mjs"), null);
  assert.equal(getStaticFilePath("/assets/%2e%2e/%2e%2e/server.mjs"), null);
});

test("rejects malformed encoded paths", () => {
  assert.equal(getStaticFilePath("/%zz"), null);
});
