-- Apply this migration to existing RoomCraft databases.
-- Projects may only be inserted into, or moved into, a category owned by
-- the same authenticated user.

drop policy if exists "projects_insert_own" on public.portfolio_projects;
create policy "projects_insert_own"
on public.portfolio_projects
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.style_categories
    where id = category_id
      and user_id = auth.uid()
  )
);

drop policy if exists "projects_update_own" on public.portfolio_projects;
create policy "projects_update_own"
on public.portfolio_projects
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.style_categories
    where id = category_id
      and user_id = auth.uid()
  )
);
