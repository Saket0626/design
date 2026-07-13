-- Run in Supabase SQL Editor to prevent authenticated users from updating
-- other designers' feed post content while preserving the like button.

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;

create policy "posts_update_own" on public.feed_posts
  for update using (auth.uid() = user_id)
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
    raise exception 'Authentication required' using errcode = '28000';
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
  where id = target_post_id
  returning * into updated_post;

  if not found then
    raise exception 'Feed post not found' using errcode = 'P0002';
  end if;

  return updated_post;
end;
$$;

revoke all on function public.toggle_post_like(uuid) from public;
grant execute on function public.toggle_post_like(uuid) to authenticated;
