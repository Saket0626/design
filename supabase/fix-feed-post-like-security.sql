-- Run in Supabase SQL Editor to restrict cross-user post updates while preserving likes

drop policy if exists "projects_insert_own" on public.portfolio_projects;
create policy "projects_insert_own"
  on public.portfolio_projects
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.style_categories c
      where c.id = category_id
        and c.user_id = auth.uid()
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
      from public.style_categories c
      where c.id = category_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;
create policy "posts_update_own"
  on public.feed_posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_post_like(_post_id uuid, _liked boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid := auth.uid();
  _current_liked_by uuid[];
  _next_liked_by uuid[];
begin
  if _user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select liked_by
    into _current_liked_by
    from public.feed_posts
    where id = _post_id
    for update;

  if not found then
    return;
  end if;

  if _liked then
    if _user_id = any(_current_liked_by) then
      _next_liked_by := _current_liked_by;
    else
      _next_liked_by := array_append(_current_liked_by, _user_id);
    end if;
  else
    _next_liked_by := array_remove(_current_liked_by, _user_id);
  end if;

  update public.feed_posts
    set liked_by = _next_liked_by,
        likes = cardinality(_next_liked_by)
    where id = _post_id;
end;
$$;

revoke all on function public.set_post_like(uuid, boolean) from public;
grant execute on function public.set_post_like(uuid, boolean) to authenticated;
