import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { request } from "node:http";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

async function getAvailablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  assert(address && typeof address === "object");

  server.close();
  await once(server, "close");
  return address.port;
}

async function waitForServer(child) {
  let output = "";

  await new Promise((resolveReady, rejectReady) => {
    const timeout = setTimeout(() => {
      rejectReady(new Error(`Server did not start. Output:\n${output}`));
    }, 10_000);

    child.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.includes("RoomCraft listening")) {
        clearTimeout(timeout);
        resolveReady();
      }
    });

    child.stderr.on("data", (chunk) => {
      output += chunk;
    });

    child.once("exit", (code) => {
      clearTimeout(timeout);
      rejectReady(new Error(`Server exited with ${code}. Output:\n${output}`));
    });
  });
}

async function get(port, path) {
  return new Promise((resolveRequest, rejectRequest) => {
    const req = request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method: "GET",
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolveRequest({ statusCode: res.statusCode, body });
        });
      }
    );

    req.on("error", rejectRequest);
    req.end();
  });
}

test("production server does not serve files outside dist", async (t) => {
  const port = await getAvailablePort();
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: rootDir,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  await waitForServer(child);

  const serverSource = await readFile(resolve(rootDir, "server.mjs"), "utf8");
  const traversalToSource = await get(port, "/..%2Fserver.mjs");
  const traversalToEtcPasswd = await get(port, "/..%2F..%2F..%2Fetc%2Fpasswd");

  for (const response of [traversalToSource, traversalToEtcPasswd]) {
    assert.equal(response.statusCode, 200);
    assert.match(response.body, /<div id="root"><\/div>/);
  }

  assert.notEqual(traversalToSource.body, serverSource);
  assert.doesNotMatch(traversalToEtcPasswd.body, /root:x:0:0:/);
});
