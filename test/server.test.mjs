import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolve } from "node:path";
import { resolveStaticFilePath } from "../server.mjs";

describe("resolveStaticFilePath", () => {
  const root = resolve("/app/dist");

  it("resolves normal SPA assets within the dist root", () => {
    assert.equal(resolveStaticFilePath("/", root), resolve(root, "index.html"));
    assert.equal(
      resolveStaticFilePath("/assets/app.js", root),
      resolve(root, "assets/app.js")
    );
  });

  it("rejects raw and encoded traversal outside the dist root", () => {
    assert.equal(resolveStaticFilePath("/../server.mjs", root), null);
    assert.equal(resolveStaticFilePath("/%2e%2e/.env", root), null);
    assert.equal(resolveStaticFilePath("/assets/%2e%2e/%2e%2e/package.json", root), null);
  });

  it("rejects malformed or invalid URL paths", () => {
    assert.equal(resolveStaticFilePath("/bad%zz", root), null);
    assert.equal(resolveStaticFilePath("/assets/app.js%00", root), null);
  });
});
