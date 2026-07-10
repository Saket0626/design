import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const schema = await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8");

test("feed posts do not grant blanket authenticated updates", () => {
  assert.equal(schema.includes('create policy "posts_update_authenticated"'), false);
  assert.equal(/for update\s+using\s*\(\s*auth\.role\(\)\s*=\s*'authenticated'\s*\)/i.test(schema), false);
  assert.match(schema, /create policy "posts_update_own"[\s\S]+using \(auth\.uid\(\) = user_id\)[\s\S]+with check \(auth\.uid\(\) = user_id\)/);
});

test("feed likes use a dedicated authenticated RPC", () => {
  assert.match(schema, /create or replace function public\.toggle_post_like\(target_post_id uuid\)/);
  assert.match(schema, /grant execute on function public\.toggle_post_like\(uuid\) to authenticated/);
});
