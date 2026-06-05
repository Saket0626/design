-- Run in Supabase SQL Editor to prevent authenticated users from editing
-- other users' feed posts while preserving cross-user likes.

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;

create policy "posts_update_own" on public.feed_posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.toggle_feed_post_like(target_post_id uuid)
returns public.feed_posts
language plpgsql
security definer
set search_path = public
as $$
declare
  liker_id uuid := auth.uid();
  updated_post public.feed_posts;
begin
  if liker_id is null then
    raise exception 'Must be authenticated to like posts' using errcode = '28000';
  end if;

  update public.feed_posts
  set
    liked_by = case
      when liker_id = any(coalesce(liked_by, '{}'::uuid[]))
        then array_remove(coalesce(liked_by, '{}'::uuid[]), liker_id)
      else array_append(coalesce(liked_by, '{}'::uuid[]), liker_id)
    end,
    likes = cardinality(case
      when liker_id = any(coalesce(liked_by, '{}'::uuid[]))
        then array_remove(coalesce(liked_by, '{}'::uuid[]), liker_id)
      else array_append(coalesce(liked_by, '{}'::uuid[]), liker_id)
    end)
  where id = target_post_id
  returning * into updated_post;

  if not found then
    raise exception 'Feed post not found' using errcode = 'P0002';
  end if;

  return updated_post;
end;
$$;

revoke all on function public.toggle_feed_post_like(uuid) from public;
grant execute on function public.toggle_feed_post_like(uuid) to authenticated;
