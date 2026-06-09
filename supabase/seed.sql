insert into campaigns (
  id, name, system_name, candidate_name, candidate_number, office, party, coalition, main_state, main_city,
  election_year, general_responsible, contact_phone, contact_email, general_vote_goal, validated_vote_goal, supporter_goal, leader_goal,
  start_date, election_date, status, notes
) values (
  '00000000-0000-4000-8000-000000000001',
  'Campanha Maricá 2026',
  'Base Eleitoral 360',
  'Candidato Exemplo',
  '00000',
  'Vereador',
  'Partido Modelo',
  'Coligação Modelo',
  'RJ',
  'Maricá',
  2026,
  'Coordenacao Geral',
  '(21) 99999-0000',
  'contato@campanha.local',
  7410,
  7410,
  5000,
  180,
  '2026-05-01',
  '2026-10-04',
  'active',
  'Campanha fictícia para desenvolvimento do Base Eleitoral 360.'
) on conflict (id) do nothing;

insert into municipalities (campaign_id, name, state, region, status, priority, coordinator_name, notes) values
('00000000-0000-4000-8000-000000000001','Maricá','RJ','Leste Metropolitano','Forte','Manter','Coordenação Maricá','Município base'),
('00000000-0000-4000-8000-000000000001','Niterói','RJ','Leste Metropolitano','Em crescimento','Alta','Coordenação RJ','Prospecção qualificada'),
('00000000-0000-4000-8000-000000000001','São Gonçalo','RJ','Leste Metropolitano','Baixa cobertura','Crítica','Coordenação RJ','Ampliar lideranças locais'),
('00000000-0000-4000-8000-000000000001','Itaboraí','RJ','Leste Metropolitano','Em crescimento','Alta','Equipe Territorial','Presença inicial'),
('00000000-0000-4000-8000-000000000001','Rio de Janeiro','RJ','Capital','Baixa cobertura','Alta','Coordenação Capital','Segmentar regiões'),
('00000000-0000-4000-8000-000000000001','Saquarema','RJ','Baixadas Litorâneas','Prioritário','Alta','Equipe Campo','Ativar núcleo local'),
('00000000-0000-4000-8000-000000000001','Araruama','RJ','Baixadas Litorâneas','Em crescimento','Média','Equipe Campo','Base inicial');

insert into neighborhoods (campaign_id, municipality_id, name, city, state, region, estimated_voters, priority, status, notes)
select '00000000-0000-4000-8000-000000000001', m.id, b.name, 'Maricá', 'RJ', b.region, b.voters, b.priority, b.status, 'Bairro mockado'
from municipalities m
cross join (values
('Centro','Região Central',12000,'Manter','Forte'),
('Itaipuaçu','Litoral Norte',28000,'Alta','Baixa cobertura'),
('Inoã','Eixo Rodoviário',18000,'Alta','Oportunidade'),
('São José do Imbassaí','Interior',10000,'Média','Em crescimento'),
('Araçatiba','Região Central',8200,'Média','Em crescimento'),
('Flamengo','Interior',7600,'Crítica','Sem liderança'),
('Mumbuca','Região Central',6900,'Média','Em crescimento'),
('Barra de Maricá','Litoral Sul',9400,'Alta','Baixa cobertura'),
('Cordeirinho','Litoral Sul',5400,'Baixa','Prioritário'),
('Guaratiba','Litoral Sul',8800,'Média','Forte'),
('Jardim Atlântico','Litoral Norte',22000,'Crítica','Crítico'),
('Recanto','Litoral Norte',6100,'Crítica','Sem liderança'),
('Barroco','Interior',9800,'Manter','Forte')
) as b(name, region, voters, priority, status)
where m.name = 'Maricá';

insert into leaders (
  campaign_id, full_name, political_nickname, phone, email, leader_type, status,
  neighborhood, city, state, territory_region, geographic_precision, internal_responsible,
  registered_supporters, estimated_direct_supporters, estimated_indirect_supporters,
  declared_votes, validated_votes, confidence_level, estimate_source, proof_type,
  last_update, next_action, notes
) values
('00000000-0000-4000-8000-000000000001','Mariana Costa','Mariana do Centro','(21) 99999-1001','mariana@example.com','Comunitária','Ativa','Centro','Maricá','RJ','Região Central','Alta','Equipe Centro',180,420,300,800,420,'Alto','Histórico','Lista','2026-06-05','Reunião semanal','Liderança mockada'),
('00000000-0000-4000-8000-000000000001','Cláudia Menezes','Cláudia Itaipuaçu','(21) 99999-1002','claudia@example.com','Regional','Ativa','Itaipuaçu','Maricá','RJ','Litoral Norte','Média alta','Coordenação Geral',120,260,210,520,180,'Médio','Reunião','Evento','2026-06-05','Caminhada','Liderança mockada'),
('00000000-0000-4000-8000-000000000001','Rafael Almeida','Rafa Inoã','(21) 99999-1003','rafael@example.com','Territorial','Atenção','Inoã','Maricá','RJ','Eixo Rodoviário','Média','Equipe Territorial',80,180,120,400,130,'Médio','WhatsApp','Grupo WhatsApp','2026-06-04','Mutirão de validação','Liderança mockada');

insert into supporters (
  campaign_id, full_name, nickname, phone, email, neighborhood, city, state,
  geographic_precision, person_type, political_status, data_confidence, source,
  internal_responsible, last_contact, next_action, next_action_date, lgpd_consent, notes
) values
('00000000-0000-4000-8000-000000000001','Ana Paula','Ana','(21) 98888-0001','ana@example.com','Centro','Maricá','RJ','Alta','Apoiador confirmado','Confirmado','Alto','Liderança','Equipe Centro','2026-06-03','Confirmar presença','2026-06-08',true,'Apoiador mockado'),
('00000000-0000-4000-8000-000000000001','João Batista','João','(21) 98888-0002',null,'Itaipuaçu','Maricá','RJ','Média','Simpatizante','Simpatizante','Médio','Evento','Cláudia Menezes','2026-06-02','Retorno WhatsApp','2026-06-07',true,'Apoiador mockado'),
('00000000-0000-4000-8000-000000000001','Patrícia Lima','Paty','(21) 98888-0003',null,'Inoã','Maricá','RJ','Média alta','Multiplicador','Voto validado','Alto','Reunião','Rafael Almeida','2026-06-04','Cadastrar indicados','2026-06-09',true,'Apoiador mockado');

insert into prospects (
  campaign_id, contact_name, phone, neighborhood, city, funnel_stage, origin,
  priority, confidence_level, internal_responsible, last_contact, next_action,
  next_action_date, last_result, notes
) values
('00000000-0000-4000-8000-000000000001','Débora Cristina','(21) 97777-0001','Itaipuaçu','Maricá','Primeiro atendimento','WhatsApp','Alta','Médio','Cláudia Menezes','2026-06-04','Retornar ligação','2026-06-06','Pediu retorno','Prospect mockado'),
('00000000-0000-4000-8000-000000000001','Renato Souza','(21) 97777-0002','São José do Imbassaí','Maricá','Apoiador confirmado','Liderança','Média','Alto','Equipe Territorial','2026-06-03','Validar voto','2026-06-08','Confirmou apoio','Prospect mockado');

insert into electoral_zones (
  campaign_id, zone_number, section_number, voting_place, neighborhood, city, state,
  voters_count, vote_goal, estimated_campaign_votes, validated_votes, regional_responsible,
  priority, status, notes
) values
('00000000-0000-4000-8000-000000000001','55','102','C.E. Elisiário Matta','Centro','Maricá','RJ',2810,180,210,124,'Mariana Costa','Média','Ativa','Zona mockada'),
('00000000-0000-4000-8000-000000000001','55','118','E.M. Darcy Ribeiro','Itaipuaçu','Maricá','RJ',3420,220,190,88,'Cláudia Menezes','Crítica','Ativa','Zona mockada'),
('00000000-0000-4000-8000-000000000001','55','219','C.E. Jardim Atlântico','Jardim Atlântico','Maricá','RJ',3120,230,160,66,'Cláudia Menezes','Crítica','Revisar dados','Zona mockada');

insert into demands (
  campaign_id, title, description, person_name, phone, category, priority, status,
  neighborhood, city, state, opening_date, return_date, next_action,
  result, internal_responsible, notes
) values
('00000000-0000-4000-8000-000000000001','Fila de atendimento na unidade de saúde','Solicitação local de saúde','Maria Helena','(21) 96666-0001','Saúde','Crítica','Em andamento','Centro','Maricá','RJ','2026-05-26','2026-06-04','Retorno com liderança','Aguardando encaminhamento','Equipe Centro','Demanda mockada'),
('00000000-0000-4000-8000-000000000001','Iluminação pública na rua principal','Pedido de iluminação','Carlos Roberto','(21) 96666-0002','Iluminação pública','Alta','Aguardando retorno','Flamengo','Maricá','RJ','2026-05-28','2026-06-02','Retornar ao morador','Pendente','Equipe Campo','Demanda mockada');

insert into field_agenda (
  campaign_id, title, action_type, action_date, start_time, end_time, location,
  neighborhood, city, state, internal_responsible, estimated_public, actual_public,
  objective, status, priority, result, next_step, notes
) values
('00000000-0000-4000-8000-000000000001','Reunião com lideranças do Centro','Reunião com liderança','2026-06-06','09:00','10:30','Associação de moradores','Centro','Maricá','RJ','Equipe Centro',35,null,'Validar base territorial','Agendada','Alta',null,'Confirmar equipe','Agenda mockada'),
('00000000-0000-4000-8000-000000000001','Caminhada em Itaipuaçu','Caminhada','2026-06-07','16:00','18:00','Praça do Barroco','Itaipuaçu','Maricá','RJ','Cláudia Menezes',160,null,'Ampliar presença','Agendada','Crítica',null,'Preparar material','Agenda mockada');

insert into report_history (campaign_id, report_name, report_type, filters, generated_by, status)
values
('00000000-0000-4000-8000-000000000001','Relatório Semanal Executivo','Executivo','{"periodo":"ultimos_7_dias"}','Coordenação Geral','Gerado');
