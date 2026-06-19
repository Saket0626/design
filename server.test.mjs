import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import test from "node:test";
import { distDir, getStaticFilePath } from "./server.mjs";

test("maps root requests to dist/index.html", () => {
  assert.equal(getStaticFilePath("/"), join(distDir, "index.html"));
});

test("allows static files inside dist", () => {
  assert.equal(
    getStaticFilePath("/assets/app.js"),
    resolve(distDir, "assets/app.js")
  );
});

test("rejects raw traversal outside dist", () => {
  assert.equal(getStaticFilePath("/../server.mjs"), null);
  assert.equal(getStaticFilePath("/../../../../etc/passwd"), null);
});

test("rejects encoded traversal outside dist", () => {
  assert.equal(getStaticFilePath("/%2e%2e/server.mjs"), null);
  assert.equal(getStaticFilePath("/..%2fserver.mjs"), null);
});
