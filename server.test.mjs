import assert from "node:assert/strict";
import test from "node:test";
import { sep } from "node:path";
import { resolveDistPath } from "./server.mjs";

test("resolves normal static asset paths inside dist", () => {
  const filePath = resolveDistPath("/assets/app.js");

  assert.ok(filePath);
  assert.ok(filePath.endsWith(`${sep}dist${sep}assets${sep}app.js`));
});

test("rejects plain path traversal outside dist", () => {
  assert.equal(resolveDistPath("/../../../etc/passwd"), null);
});

test("rejects encoded path traversal outside dist", () => {
  assert.equal(resolveDistPath("/%2e%2e/%2e%2e/etc/passwd"), null);
});
