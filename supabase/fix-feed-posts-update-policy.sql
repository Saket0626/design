-- Run in Supabase SQL Editor to prevent authenticated users from editing
-- arbitrary feed post content while preserving the existing like button.

drop policy if exists "posts_update_authenticated" on public.feed_posts;
drop policy if exists "posts_update_likes_authenticated" on public.feed_posts;

revoke update on table public.feed_posts from anon, authenticated;
grant update (likes, liked_by) on table public.feed_posts to authenticated;

create policy "posts_update_likes_authenticated"
  on public.feed_posts
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
