import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

async function readRepoFile(path) {
  return readFile(new URL(path, `file://${repoRoot}/`), "utf8");
}

test("feed post RLS does not allow blanket authenticated updates", async () => {
  const schema = await readRepoFile("supabase/schema.sql");
  const patch = await readRepoFile("supabase/fix-feed-post-security.sql");

  for (const sql of [schema, patch]) {
    assert.match(sql, /create policy "posts_update_own" on public\.feed_posts/);
    assert.match(sql, /for update using \(auth\.uid\(\) = user_id\)/);
    assert.match(sql, /with check \(auth\.uid\(\) = user_id\)/);
    assert.doesNotMatch(sql, /create policy "posts_update_authenticated"/);
    assert.doesNotMatch(sql, /auth\.role\(\) = 'authenticated'/);
  }
});

test("feed likes go through the constrained RPC", async () => {
  const schema = await readRepoFile("supabase/schema.sql");
  const database = await readRepoFile("src/lib/database.ts");

  assert.match(schema, /create or replace function public\.toggle_post_like/);
  assert.match(schema, /grant execute on function public\.toggle_post_like\(uuid\) to authenticated/);
  assert.match(database, /\.rpc\("toggle_post_like",/);
  assert.doesNotMatch(database, /\.from\("feed_posts"\)\s*[\s\S]*?\.update\(\{ likes, liked_by: likedBy \}\)/);
});
