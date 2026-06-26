-- Run this in Supabase SQL Editor to apply the critical RLS/security fixes
-- to an existing RoomCraft database.

-- Do not expose profile email addresses through public profile reads.
revoke select on public.profiles from public, anon, authenticated;
grant select (id, username, display_name, avatar_url, bio, specialties, created_at)
  on public.profiles to anon, authenticated;

-- Do not let authenticated clients update arbitrary feed post columns.
drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;
create policy "posts_update_own" on public.feed_posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke update on public.feed_posts from public, anon, authenticated;
grant update on public.feed_posts to authenticated;

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

  update public.feed_posts
  set
    liked_by = case
      when liked_by @> array[current_user_id] then array_remove(liked_by, current_user_id)
      else array_append(liked_by, current_user_id)
    end,
    likes = cardinality(case
      when liked_by @> array[current_user_id] then array_remove(liked_by, current_user_id)
      else array_append(liked_by, current_user_id)
    end)
  where id = target_post_id
  returning * into updated_post;

  if not found then
    raise exception 'Post not found' using errcode = 'P0002';
  end if;

  return updated_post;
end;
$$;

revoke execute on function public.toggle_post_like(uuid) from public, anon;
grant execute on function public.toggle_post_like(uuid) to authenticated;
