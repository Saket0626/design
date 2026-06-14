-- Run this in Supabase SQL Editor to restrict feed post edits while keeping likes working.

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;

create policy "posts_update_own"
  on public.feed_posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_feed_post_like(post_id uuid, should_like boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Must be signed in to like posts';
  end if;

  if should_like then
    update public.feed_posts
    set
      likes = case
        when current_user_id = any(liked_by) then likes
        else likes + 1
      end,
      liked_by = case
        when current_user_id = any(liked_by) then liked_by
        else array_append(liked_by, current_user_id)
      end
    where id = post_id;
  else
    update public.feed_posts
    set
      likes = case
        when current_user_id = any(liked_by) then greatest(likes - 1, 0)
        else likes
      end,
      liked_by = array_remove(liked_by, current_user_id)
    where id = post_id;
  end if;
end;
$$;

revoke all on function public.set_feed_post_like(uuid, boolean) from public;
grant execute on function public.set_feed_post_like(uuid, boolean) to authenticated;
