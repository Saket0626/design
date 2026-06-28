import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { distDir, getStaticFilePath } from "./server.mjs";

test("static file resolver keeps asset requests inside dist", () => {
  assert.equal(getStaticFilePath("/"), join(distDir, "index.html"));
  assert.equal(getStaticFilePath("/assets/app.js?cache=1"), join(distDir, "assets/app.js"));
});

test("static file resolver rejects path traversal attempts", () => {
  assert.equal(getStaticFilePath("/../server.mjs"), null);
  assert.equal(getStaticFilePath("/..%2Fserver.mjs"), null);
  assert.equal(getStaticFilePath("/%2e%2e%2fserver.mjs"), null);
});
