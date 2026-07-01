import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";

import { getStaticFilePath } from "../server.mjs";

const projectRoot = resolve(new URL("..", import.meta.url).pathname);

describe("getStaticFilePath", () => {
  it("resolves normal static assets under dist", () => {
    assert.equal(getStaticFilePath("/"), resolve(projectRoot, "dist/index.html"));
    assert.equal(
      getStaticFilePath("/assets/app.js"),
      resolve(projectRoot, "dist/assets/app.js")
    );
  });

  it("rejects raw and encoded parent directory traversal", () => {
    const blockedPaths = [
      "../server.mjs",
      "/../server.mjs",
      "/assets/../../server.mjs",
      "/..%2Fserver.mjs",
      "/%2e%2e/server.mjs",
      "/assets/%2E%2E/%2E%2E/server.mjs",
      "/%2e%2e/%2e%2e/proc/self/environ",
    ];

    for (const blockedPath of blockedPaths) {
      assert.equal(getStaticFilePath(blockedPath), null, blockedPath);
    }
  });

  it("rejects malformed encoded paths", () => {
    assert.equal(getStaticFilePath("/%ZZ/server.mjs"), null);
  });
});
