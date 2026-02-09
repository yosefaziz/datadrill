-- Interview sessions - stores completed mock interview results
create table public.interview_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  scenario_id text not null,
  category text not null check (category in ('coding', 'system_design')),
  level text not null check (level in ('junior', 'mid', 'senior', 'staff')),
  started_at timestamptz not null,
  completed_at timestamptz,
  overall_score real,
  round_results jsonb not null,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.interview_sessions enable row level security;

create policy "Users can view own sessions"
  on public.interview_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.interview_sessions for insert with check (auth.uid() = user_id);

-- Indexes
create index idx_interview_sessions_user_id on public.interview_sessions(user_id);
create index idx_interview_sessions_scenario_id on public.interview_sessions(scenario_id);
