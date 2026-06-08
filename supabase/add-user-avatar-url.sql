alter table users_profiles
add column if not exists avatar_url text;

notify pgrst, 'reload schema';
