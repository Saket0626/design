import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { resolveStaticPath } from "../server-utils.mjs";

const root = "/app/dist";

test("resolveStaticPath resolves files under the dist root", () => {
  assert.equal(resolveStaticPath(root, "/assets/app.js"), resolve(root, "assets/app.js"));
  assert.equal(resolveStaticPath(root, "/"), root);
});

test("resolveStaticPath rejects directory traversal outside the dist root", () => {
  assert.equal(resolveStaticPath(root, "/../package.json"), null);
  assert.equal(resolveStaticPath(root, "/assets/../../server.mjs"), null);
  assert.equal(resolveStaticPath(root, "/%2e%2e/package.json"), null);
});

test("resolveStaticPath rejects malformed or unsafe paths", () => {
  assert.equal(resolveStaticPath(root, "/%E0%A4%A"), null);
  assert.equal(resolveStaticPath(root, "/assets/app.js%00"), null);
});
