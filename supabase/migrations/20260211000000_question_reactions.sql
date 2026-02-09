-- Question reactions: like/dislike per question

create table public.question_reactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id text not null,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz default now(),
  unique(user_id, question_id)
);

alter table public.question_reactions enable row level security;

-- Anyone can read reaction counts (public visibility)
create policy "Anyone can view reactions"
  on public.question_reactions for select
  using (true);

create policy "Users can insert own reactions"
  on public.question_reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reactions"
  on public.question_reactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on public.question_reactions for delete
  using (auth.uid() = user_id);

create index idx_reactions_question on public.question_reactions (question_id);
create index idx_reactions_user_question on public.question_reactions (user_id, question_id);
