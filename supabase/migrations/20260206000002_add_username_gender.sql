-- Add username and gender columns to profiles
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists gender text;

-- Case-insensitive unique index on username
create unique index if not exists profiles_username_unique on public.profiles (lower(username));

-- RPC to check username availability without needing SELECT on other profiles
create or replace function public.check_username_available(requested_username text)
returns boolean as $$
begin
  return not exists (
    select 1 from public.profiles
    where lower(username) = lower(requested_username)
  );
end;
$$ language plpgsql security definer;
