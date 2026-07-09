-- Run in Supabase SQL Editor to prevent arbitrary feed post updates by authenticated users.

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;
create policy "posts_update_own" on public.feed_posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.toggle_post_like(target_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  updated_count integer;
begin
  if actor is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  update public.feed_posts
  set
    liked_by = case
      when actor = any(liked_by) then array_remove(liked_by, actor)
      else array_append(liked_by, actor)
    end,
    likes = cardinality(case
      when actor = any(liked_by) then array_remove(liked_by, actor)
      else array_append(liked_by, actor)
    end)
  where id = target_post_id;

  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    raise exception 'feed post not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.toggle_post_like(uuid) from public;
grant execute on function public.toggle_post_like(uuid) to authenticated;
