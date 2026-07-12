-- Run in Supabase SQL Editor to replace broad feed-post updates with a safe
-- like-toggle RPC for existing databases.

create or replace function public.toggle_post_like(target_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  update public.feed_posts
  set
    liked_by = case
      when current_user_id = any(liked_by) then array_remove(liked_by, current_user_id)
      else array_append(liked_by, current_user_id)
    end,
    likes = case
      when current_user_id = any(liked_by) then greatest(likes - 1, 0)
      else likes + 1
    end
  where id = target_post_id;

  if not found then
    raise exception 'Post not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.toggle_post_like(uuid) from public;
grant execute on function public.toggle_post_like(uuid) to authenticated;

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;
create policy "posts_update_own" on public.feed_posts
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
