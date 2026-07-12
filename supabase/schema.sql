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

create or replace function public.toggle_post_like(target_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
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
  where id = target_post_id;

  if not found then
    raise exception 'Post not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.toggle_post_like(uuid) from public;
grant execute on function public.toggle_post_like(uuid) to authenticated;

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
create policy "posts_update_own" on public.feed_posts
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Workshops (private to owner)
create policy "workshops_select_own" on public.workshops for select using (auth.uid() = user_id);
create policy "workshops_insert_own" on public.workshops for insert with check (auth.uid() = user_id);
create policy "workshops_update_own" on public.workshops for update using (auth.uid() = user_id);
create policy "workshops_delete_own" on public.workshops for delete using (auth.uid() = user_id);
