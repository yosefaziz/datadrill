-- DataDrill: initial schema
-- Tables: profiles, submissions
-- Includes: auto-profile trigger, RLS policies

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  role text check (role in ('student', 'junior', 'mid', 'senior', 'staff')),
  primary_goal text check (primary_goal in ('interview_prep', 'skill_building', 'career_switch')),
  weakest_skill text check (weakest_skill in ('sql', 'pyspark', 'architecture', 'modeling')),
  onboarding_completed boolean default false,
  pre_registration_activity jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- SUBMISSIONS
-- ============================================================
create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  question_id text not null,
  skill text not null,
  difficulty text not null,
  answer text,
  passed boolean default false,
  result_meta jsonb,
  created_at timestamptz default now()
);

alter table public.submissions enable row level security;

create policy "Users can insert own submissions"
  on public.submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can view own submissions"
  on public.submissions for select
  using (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
