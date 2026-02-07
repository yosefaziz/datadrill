-- Remove avatar_url, add birth_year
alter table public.profiles drop column if exists avatar_url;
alter table public.profiles add column if not exists birth_year smallint;

-- Update the signup trigger to stop setting avatar_url
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  return new;
end;
$$ language plpgsql security definer;
