-- Base Eleitoral 360 - clean duplicate user profiles.
-- Keeps the oldest profile for each auth_user_id and removes repeated rows.
-- Run in Supabase SQL Editor before adding the unique index.

with duplicated_profiles as (
  select
    id,
    row_number() over (
      partition by auth_user_id
      order by created_at asc, id asc
    ) as row_number
  from users_profiles
  where auth_user_id is not null
)
delete from users_profiles
where id in (
  select id
  from duplicated_profiles
  where row_number > 1
);

-- Prevent the same Supabase Auth user from receiving more than one public profile.
create unique index if not exists users_profiles_auth_user_id_unique
on users_profiles(auth_user_id)
where auth_user_id is not null;

-- Quick check.
select
  auth_user_id,
  email,
  count(*) as total_profiles
from users_profiles
where auth_user_id is not null
group by auth_user_id, email
having count(*) > 1;
