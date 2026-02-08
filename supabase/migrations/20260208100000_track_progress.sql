-- Track progress (cached, computed from submissions)
create table public.track_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  track_id text not null,
  current_level int default 1,
  questions_completed int default 0,
  percent_complete numeric(5,2) default 0,
  started_at timestamptz default now(),
  completed_at timestamptz,
  unique(user_id, track_id)
);

-- RLS policies
alter table public.track_progress enable row level security;

create policy "Users can view own progress"
  on public.track_progress for select using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.track_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.track_progress for update using (auth.uid() = user_id);
