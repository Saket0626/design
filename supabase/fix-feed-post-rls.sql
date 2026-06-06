-- Run in Supabase SQL Editor to replace the broad feed post update policy.

create or replace function public.toggle_post_like(post_id uuid)
returns table (id uuid, likes integer, liked_by uuid[])
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  return query
  with target as (
    select
      feed_posts.id,
      case
        when current_user_id = any(feed_posts.liked_by)
          then array_remove(feed_posts.liked_by, current_user_id)
        else array_append(feed_posts.liked_by, current_user_id)
      end as next_liked_by
    from public.feed_posts
    where feed_posts.id = post_id
    for update
  ),
  updated as (
    update public.feed_posts
    set
      liked_by = target.next_liked_by,
      likes = cardinality(target.next_liked_by)
    from target
    where feed_posts.id = target.id
    returning feed_posts.id, feed_posts.likes, feed_posts.liked_by
  )
  select updated.id, updated.likes, updated.liked_by
  from updated;
end;
$$;

revoke all on function public.toggle_post_like(uuid) from public;
grant execute on function public.toggle_post_like(uuid) to authenticated;

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;

create policy "posts_update_own" on public.feed_posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
