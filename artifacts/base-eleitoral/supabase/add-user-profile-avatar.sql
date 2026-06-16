alter table public.users_profiles
  add column if not exists avatar_url text;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
