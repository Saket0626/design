-- Run in Supabase SQL Editor to prevent non-owners from editing feed post content.
-- This keeps authenticated like toggles working while enforcing ownership on post fields.

create or replace function public.enforce_feed_post_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  expected_liked_by uuid[];
  expected_likes integer;
begin
  if actor_id is null then
    raise exception 'Authentication required to update feed posts' using errcode = '42501';
  end if;

  if new.user_id is distinct from old.user_id
    or new.created_at is distinct from old.created_at then
    raise exception 'Feed post ownership and creation time cannot be changed' using errcode = '42501';
  end if;

  if actor_id = old.user_id then
    return new;
  end if;

  if new.project_id is distinct from old.project_id
    or new.category_id is distinct from old.category_id
    or new.title is distinct from old.title
    or new.caption is distinct from old.caption
    or new.media_url is distinct from old.media_url
    or new.media_type is distinct from old.media_type then
    raise exception 'Only the post owner can edit feed post content' using errcode = '42501';
  end if;

  if actor_id = any(old.liked_by) then
    expected_liked_by := array_remove(old.liked_by, actor_id);
    expected_likes := old.likes - 1;
  else
    expected_liked_by := array_append(old.liked_by, actor_id);
    expected_likes := old.likes + 1;
  end if;

  if new.liked_by is distinct from expected_liked_by
    or new.likes is distinct from expected_likes then
    raise exception 'Feed post likes can only be toggled for the authenticated user' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_feed_post_update on public.feed_posts;
create trigger enforce_feed_post_update
  before update on public.feed_posts
  for each row execute function public.enforce_feed_post_update();
