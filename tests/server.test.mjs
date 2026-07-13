import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import { getStaticFilePath } from "../server.mjs";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const distRoot = resolve(repoRoot, "dist");

test("static file resolver keeps normal assets inside dist", () => {
  assert.equal(
    getStaticFilePath("/assets/index.js"),
    resolve(distRoot, "assets/index.js")
  );
  assert.equal(getStaticFilePath("/"), resolve(distRoot, "index.html"));
});

test("static file resolver rejects raw and encoded traversal", () => {
  for (const path of [
    "/../server.mjs",
    "/..%2Fserver.mjs",
    "/%2e%2e/server.mjs",
    "/assets/%2e%2e/%2e%2e/server.mjs",
    "/%5c..%5cserver.mjs",
  ]) {
    assert.equal(getStaticFilePath(path), null, path);
  }
});
