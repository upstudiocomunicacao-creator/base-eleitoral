alter table campaigns
  add column if not exists system_name text,
  add column if not exists general_responsible text,
  add column if not exists contact_phone text,
  add column if not exists contact_email text;

update campaigns
set
  system_name = coalesce(system_name, 'Base Eleitoral 360'),
  general_responsible = coalesce(general_responsible, 'Coordenacao Geral'),
  contact_phone = coalesce(contact_phone, '(21) 99999-0000'),
  contact_email = coalesce(contact_email, 'contato@campanha.local')
where id = '00000000-0000-4000-8000-000000000001';

notify pgrst, 'reload schema';
