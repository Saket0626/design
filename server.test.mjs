import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { distDir, getRequestPath, resolveStaticFilePath } from "./server.mjs";

test("resolves static assets inside dist", () => {
  assert.equal(resolveStaticFilePath("/assets/app.js"), join(distDir, "assets/app.js"));
  assert.equal(resolveStaticFilePath("/"), join(distDir, "index.html"));
});

test("rejects raw traversal paths before reading from disk", () => {
  assert.equal(resolveStaticFilePath("/../../../etc/passwd"), null);
  assert.equal(resolveStaticFilePath("/assets/../../server.mjs"), null);
});

test("normalizes encoded dot segments through URL parsing", () => {
  const pathname = getRequestPath("/%2e%2e/%2e%2e/etc/passwd?download=1");

  assert.equal(pathname, "/etc/passwd");
  assert.equal(resolveStaticFilePath(pathname), join(distDir, "etc/passwd"));
});
