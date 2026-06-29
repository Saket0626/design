import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { getStaticFilePath } from "./server.mjs";

function withDistRoot(fn) {
  const distRoot = mkdtempSync(join(tmpdir(), "roomcraft-server-"));
  try {
    fn(distRoot);
  } finally {
    rmSync(distRoot, { force: true, recursive: true });
  }
}

test("static paths resolve inside the dist root", () => {
  withDistRoot((distRoot) => {
    assert.equal(getStaticFilePath("/", distRoot), resolve(distRoot, "index.html"));
    assert.equal(
      getStaticFilePath("/assets/app.js?cache=123", distRoot),
      resolve(distRoot, "assets/app.js")
    );
    assert.equal(
      getStaticFilePath("/assets/file%20name.css", distRoot),
      resolve(distRoot, "assets/file name.css")
    );
  });
});

test("static paths reject raw and encoded directory traversal", () => {
  withDistRoot((distRoot) => {
    for (const path of [
      "/../server.mjs",
      "/assets/../../server.mjs",
      "/..%2Fserver.mjs",
      "/%2e%2e/server.mjs",
      "/assets/%2e%2e/%2e%2e/server.mjs",
    ]) {
      assert.equal(getStaticFilePath(path, distRoot), null, path);
    }
  });
});

test("static paths reject malformed URL encoding", () => {
  withDistRoot((distRoot) => {
    assert.equal(getStaticFilePath("/assets/%E0%A4%A", distRoot), null);
  });
});
