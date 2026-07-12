import assert from "node:assert/strict";
import { isAbsolute, join, relative } from "node:path";
import test from "node:test";
import { distDir, getStaticFilePath } from "../server.mjs";

function assertInsideDist(filePath) {
  assert.equal(typeof filePath, "string");
  const relativePath = relative(distDir, filePath);
  assert.ok(relativePath.length > 0);
  assert.ok(!relativePath.startsWith(".."));
  assert.ok(!isAbsolute(relativePath));
}

test("serves root and asset paths from dist", () => {
  assert.equal(getStaticFilePath("/"), join(distDir, "index.html"));
  assert.equal(
    getStaticFilePath("/assets/index.js?v=123"),
    join(distDir, "assets", "index.js")
  );
  assertInsideDist(getStaticFilePath("/nested/route"));
});

test("rejects raw and encoded traversal attempts", () => {
  assert.equal(getStaticFilePath("/../server.mjs"), null);
  assert.equal(getStaticFilePath("/..%2Fserver.mjs"), null);
  assert.equal(getStaticFilePath("/%2e%2e/server.mjs"), null);
  assert.equal(getStaticFilePath("/assets/%2e%2e/%2e%2e/server.mjs"), null);
});

test("rejects malformed escape sequences", () => {
  assert.equal(getStaticFilePath("/%E0%A4%A"), null);
});
