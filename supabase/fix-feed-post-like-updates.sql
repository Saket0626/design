-- Run this in Supabase SQL Editor to prevent authenticated users from
-- updating arbitrary feed post fields while preserving the like toggle.

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_likes_authenticated" on public.feed_posts;
create policy "posts_update_likes_authenticated" on public.feed_posts
  for update to authenticated
  using (true)
  with check (true);

revoke update on public.feed_posts from anon, authenticated;
grant update (likes, liked_by) on public.feed_posts to authenticated;

create or replace function public.validate_feed_post_like_update()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'Authentication required';
  end if;

  if new.id <> old.id
    or new.user_id <> old.user_id
    or new.project_id is distinct from old.project_id
    or new.category_id is distinct from old.category_id
    or new.title <> old.title
    or new.caption <> old.caption
    or new.media_url <> old.media_url
    or new.media_type <> old.media_type
    or new.created_at <> old.created_at then
    raise exception 'Only feed post likes can be updated';
  end if;

  if actor = any(old.liked_by) then
    if new.liked_by <> array_remove(old.liked_by, actor)
      or new.likes <> greatest(old.likes - 1, 0) then
      raise exception 'Invalid feed post unlike update';
    end if;
  else
    if new.liked_by <> array_append(old.liked_by, actor)
      or new.likes <> old.likes + 1 then
      raise exception 'Invalid feed post like update';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_feed_post_like_update on public.feed_posts;
create trigger validate_feed_post_like_update
  before update on public.feed_posts
  for each row execute function public.validate_feed_post_like_update();
