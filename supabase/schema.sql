-- Run this in Supabase: SQL Editor → New query → Run

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text not null,
  email text not null,
  avatar_url text not null default '',
  bio text not null default '',
  specialties text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Style portfolio categories
create table if not exists public.style_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  cover_image text not null,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

-- Projects within a category
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.style_categories (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  images text[] not null default '{}',
  room_type text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- TikTok-style feed posts
create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.portfolio_projects (id) on delete set null,
  category_id uuid references public.style_categories (id) on delete set null,
  title text not null,
  caption text not null default '',
  media_url text not null,
  media_type text not null default 'image',
  likes integer not null default 0,
  liked_by uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Virtual workshop rooms
create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  background_url text not null,
  placed_products jsonb not null default '[]',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile when a user signs up (email or Google)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'username'), ''),
      nullif(trim(split_part(coalesce(new.email, 'user'), '@', 1)), ''),
      'user'
    ),
    '[^a-z0-9]+', '', 'g'
  ));

  if base_username = '' then
    base_username := 'user';
  end if;

  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, email, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      final_username
    ),
    coalesce(new.email, ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''),
      nullif(trim(new.raw_user_meta_data->>'picture'), ''),
      ''
    )
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.style_categories enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.feed_posts enable row level security;
alter table public.workshops enable row level security;

-- Profiles
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Categories
create policy "categories_select_all" on public.style_categories for select using (true);
create policy "categories_insert_own" on public.style_categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.style_categories for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.style_categories for delete using (auth.uid() = user_id);

-- Projects
create policy "projects_select_all" on public.portfolio_projects for select using (true);
create policy "projects_insert_own" on public.portfolio_projects for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.portfolio_projects for update using (auth.uid() = user_id);
create policy "projects_delete_own" on public.portfolio_projects for delete using (auth.uid() = user_id);

-- Feed posts
create policy "posts_select_all" on public.feed_posts for select using (true);
create policy "posts_insert_own" on public.feed_posts for insert with check (auth.uid() = user_id);
create policy "posts_update_authenticated" on public.feed_posts for update using (auth.role() = 'authenticated');

-- Authenticated users may toggle their own like, but must not edit another user's post.
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

-- Workshops (private to owner)
create policy "workshops_select_own" on public.workshops for select using (auth.uid() = user_id);
create policy "workshops_insert_own" on public.workshops for insert with check (auth.uid() = user_id);
create policy "workshops_update_own" on public.workshops for update using (auth.uid() = user_id);
create policy "workshops_delete_own" on public.workshops for delete using (auth.uid() = user_id);
