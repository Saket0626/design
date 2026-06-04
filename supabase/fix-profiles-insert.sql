-- Run in Supabase SQL Editor if Google sign-in creates auth user but no profile row

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);
