-- Run in Supabase SQL Editor to prevent authenticated users from editing
-- other designers' feed posts while preserving the public like button.

create or replace function public.toggle_post_like(post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  liker_id uuid := auth.uid();
begin
  if liker_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  update public.feed_posts
  set
    liked_by = case
      when liker_id = any(liked_by) then array_remove(liked_by, liker_id)
      else array_append(liked_by, liker_id)
    end,
    likes = cardinality(case
      when liker_id = any(liked_by) then array_remove(liked_by, liker_id)
      else array_append(liked_by, liker_id)
    end)
  where id = post_id;

  if not found then
    raise exception 'Post not found' using errcode = '02000';
  end if;
end;
$$;

revoke all on function public.toggle_post_like(uuid) from public;
grant execute on function public.toggle_post_like(uuid) to authenticated;

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_own" on public.feed_posts;
create policy "posts_update_own" on public.feed_posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
