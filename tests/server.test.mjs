import assert from "node:assert/strict";
import { isAbsolute, relative, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createRoomCraftServer, getStaticFilePath } from "../server.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const distDir = resolve(projectRoot, "dist");

test("static file paths stay inside dist", () => {
  const filePath = getStaticFilePath("/assets/app.js?cache=1");

  assert.equal(filePath, resolve(distDir, "assets/app.js"));
  assert.equal(relative(distDir, filePath).startsWith(".."), false);
  assert.equal(isAbsolute(relative(distDir, filePath)), false);
});

test("static file paths reject traversal attempts", () => {
  for (const path of [
    "/../server.mjs",
    "/..%2Fserver.mjs",
    "/%2e%2e/server.mjs",
    "/assets/../../server.mjs",
    "/%zz",
  ]) {
    assert.equal(getStaticFilePath(path), null, path);
  }
});

test("server returns 404 for encoded traversal requests", async () => {
  const server = createRoomCraftServer();

  await new Promise((resolveListen) => {
    server.listen(0, "127.0.0.1", resolveListen);
  });

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/..%2Fserver.mjs`);

    assert.equal(response.status, 404);
    assert.equal(await response.text(), "Not Found");
  } finally {
    await new Promise((resolveClose, rejectClose) => {
      server.close((error) => (error ? rejectClose(error) : resolveClose()));
    });
  }
});
