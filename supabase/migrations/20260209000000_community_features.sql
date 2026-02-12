-- Community features: reports, discussions, solutions, voting

-- ── Question Reports ─────────────────────────────────────────────

create type public.report_category as enum (
  'wrong_output', 'unclear_description', 'broken_test', 'typo', 'other'
);

create table public.question_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id text not null,
  category public.report_category not null,
  details text check (char_length(details) <= 500),
  created_at timestamptz default now()
);

alter table public.question_reports enable row level security;

create policy "Users can view own reports"
  on public.question_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on public.question_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reports"
  on public.question_reports for update
  using (auth.uid() = user_id);

-- ── Discussions ──────────────────────────────────────────────────

create table public.discussions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id text not null,
  content text not null check (char_length(content) <= 2000),
  created_at timestamptz default now()
);

alter table public.discussions enable row level security;

create policy "Authenticated users can view discussions"
  on public.discussions for select
  using (auth.uid() is not null);

create policy "Users can insert own discussions"
  on public.discussions for insert
  with check (auth.uid() = user_id);

create index idx_discussions_question on public.discussions (question_id, created_at desc);

-- ── Solutions ────────────────────────────────────────────────────

create table public.solutions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id text not null,
  title text not null check (char_length(title) <= 200),
  content text not null,
  language text not null default 'sql',
  vote_count int default 0,
  created_at timestamptz default now(),
  unique(user_id, question_id)
);

alter table public.solutions enable row level security;

create policy "Authenticated users can view solutions"
  on public.solutions for select
  using (auth.uid() is not null);

create policy "Users can insert own solutions"
  on public.solutions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own solutions"
  on public.solutions for update
  using (auth.uid() = user_id);

create index idx_solutions_question on public.solutions (question_id, vote_count desc);

-- ── Solution Votes ───────────────────────────────────────────────

create table public.solution_votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  solution_id uuid references public.solutions(id) on delete cascade not null,
  vote smallint not null check (vote in (1, -1)),
  unique(user_id, solution_id)
);

alter table public.solution_votes enable row level security;

create policy "Authenticated users can view votes"
  on public.solution_votes for select
  using (auth.uid() is not null);

create policy "Users can insert own votes"
  on public.solution_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own votes"
  on public.solution_votes for update
  using (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.solution_votes for delete
  using (auth.uid() = user_id);

-- Trigger to maintain vote_count on solutions
create or replace function public.update_solution_vote_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.solutions
    set vote_count = vote_count + new.vote
    where id = new.solution_id;
  elsif tg_op = 'UPDATE' then
    update public.solutions
    set vote_count = vote_count - old.vote + new.vote
    where id = new.solution_id;
  elsif tg_op = 'DELETE' then
    update public.solutions
    set vote_count = vote_count - old.vote
    where id = old.solution_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger solution_vote_count_trigger
  after insert or update or delete on public.solution_votes
  for each row execute function public.update_solution_vote_count();

-- ── Profile read policy for display names ────────────────────────

create policy "Authenticated users can view display names"
  on public.profiles for select
  using (auth.uid() is not null);
