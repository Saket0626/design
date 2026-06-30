-- Run in Supabase SQL Editor to remove the broad feed-post update policy.

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;

create policy "posts_update_own"
  on public.feed_posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.toggle_post_like(target_post_id uuid)
returns public.feed_posts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  updated_post public.feed_posts;
begin
  if current_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  with target as (
    select
      id,
      case
        when liked_by @> array[current_user_id] then array_remove(liked_by, current_user_id)
        else array_append(liked_by, current_user_id)
      end as next_liked_by
    from public.feed_posts
    where id = target_post_id
    for update
  ),
  updated as (
    update public.feed_posts p
    set
      liked_by = target.next_liked_by,
      likes = cardinality(target.next_liked_by)
    from target
    where p.id = target.id
    returning p.*
  )
  select * into updated_post from updated;

  if updated_post.id is null then
    raise exception 'Feed post not found' using errcode = 'P0002';
  end if;

  return updated_post;
end;
$$;

revoke all on function public.toggle_post_like(uuid) from public;
grant execute on function public.toggle_post_like(uuid) to authenticated;
