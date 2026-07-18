import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const normalize = (sql) => sql.replace(/\s+/g, " ").trim().toLowerCase();

async function readSql(path) {
  return normalize(await readFile(new URL(path, import.meta.url), "utf8"));
}

function assertCategoryOwnershipChecks(sql) {
  assert.match(
    sql,
    /create policy "projects_insert_own".*?for insert with check \( auth\.uid\(\) = user_id and exists \( select 1 from public\.style_categories where id = category_id and user_id = auth\.uid\(\) \) \)/
  );
  assert.match(
    sql,
    /create policy "projects_update_own".*?for update using \(auth\.uid\(\) = user_id\) with check \( auth\.uid\(\) = user_id and exists \( select 1 from public\.style_categories where id = category_id and user_id = auth\.uid\(\) \) \)/
  );
}

test("base schema requires project categories to belong to the project owner", async () => {
  assertCategoryOwnershipChecks(await readSql("../supabase/schema.sql"));
});

test("deployed-database patch replaces both vulnerable project policies", async () => {
  const sql = await readSql("../supabase/fix-project-category-security.sql");

  assert.match(
    sql,
    /drop policy if exists "projects_insert_own" on public\.portfolio_projects/
  );
  assert.match(
    sql,
    /drop policy if exists "projects_update_own" on public\.portfolio_projects/
  );
  assertCategoryOwnershipChecks(sql);
});
