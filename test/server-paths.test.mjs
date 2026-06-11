import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { resolveStaticPath } from "../server.mjs";

const rootDir = resolve("/tmp/roomcraft-dist");

test("resolveStaticPath keeps normal asset paths inside the build directory", () => {
  assert.equal(
    resolveStaticPath("/assets/app.js", rootDir),
    resolve(rootDir, "assets/app.js")
  );
  assert.equal(resolveStaticPath("/", rootDir), rootDir);
});

test("resolveStaticPath rejects traversal outside the build directory", () => {
  assert.equal(resolveStaticPath("/../../../etc/passwd", rootDir), null);
  assert.equal(resolveStaticPath("/%2e%2e/%2e%2e/etc/passwd", rootDir), null);
  assert.equal(resolveStaticPath("/bad%ZZ", rootDir), null);
});
