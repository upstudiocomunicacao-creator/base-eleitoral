import { downloadBlob } from "./exportCsv";

export type ImportModuleKey = "leaders" | "supporters" | "prospects" | "electoral_zones" | "field_agenda" | "demands";

export type ImportField = {
  key: string;
  label: string;
  required?: boolean;
  aliases?: string[];
};

export type ImportModuleConfig = {
  key: ImportModuleKey;
  label: string;
  table: ImportModuleKey;
  duplicateFields: string[][];
  fields: ImportField[];
  templateHeaders: string[];
};

export const importModules: ImportModuleConfig[] = [
  {
    key: "leaders",
    label: "Lideranças",
    table: "leaders",
    duplicateFields: [["phone"], ["full_name", "neighborhood"]],
    fields: [
      field("full_name", "Nome completo", true, "nome_completo", "nome"),
      field("political_nickname", "Apelido político", false, "apelido_politico", "apelido"),
      field("phone", "Telefone", true, "telefone", "whatsapp"),
      field("email", "E-mail", false, "email"),
      field("leader_type", "Tipo de liderança", true, "tipo_lideranca", "tipo"),
      field("status", "Status", true),
      field("cep", "CEP", false),
      field("street", "Rua", false, "rua"),
      field("number", "Número", false, "numero"),
      field("complement", "Complemento", false),
      field("neighborhood", "Bairro", true, "bairro"),
      field("city", "Cidade", true, "cidade"),
      field("state", "Estado", true, "estado", "uf"),
      field("territory_region", "Região de atuação", false, "regiao_atuacao"),
      field("internal_responsible", "Responsável interno", false, "responsavel_interno"),
      field("registered_supporters", "Apoiadores cadastrados", false, "apoiadores_cadastrados"),
      field("estimated_direct_supporters", "Apoiadores estimados diretos", false, "apoiadores_estimados_diretos"),
      field("estimated_indirect_supporters", "Apoiadores estimados indiretos", false, "apoiadores_estimados_indiretos"),
      field("declared_votes", "Votos declarados", false, "votos_declarados", "votos_estimados"),
      field("validated_votes", "Votos validados", false, "votos_validados"),
      field("confidence_level", "Grau de confiança", true, "grau_confianca"),
      field("estimate_source", "Fonte da estimativa", false, "fonte_estimativa"),
      field("proof_type", "Comprovação", false, "comprovacao"),
      field("next_action", "Próxima ação", false, "proxima_acao"),
      field("notes", "Observações", false, "observacoes"),
    ],
    templateHeaders: ["nome_completo", "apelido_politico", "telefone", "email", "tipo_lideranca", "status", "cep", "rua", "numero", "complemento", "bairro", "cidade", "estado", "regiao_atuacao", "responsavel_interno", "apoiadores_cadastrados", "apoiadores_estimados_diretos", "apoiadores_estimados_indiretos", "votos_declarados", "votos_validados", "grau_confianca", "fonte_estimativa", "comprovacao", "proxima_acao", "observacoes"],
  },
  {
    key: "supporters",
    label: "Apoiadores / Pessoas",
    table: "supporters",
    duplicateFields: [["phone"], ["full_name", "neighborhood"]],
    fields: [
      field("full_name", "Nome completo", true, "nome_completo", "nome"),
      field("nickname", "Apelido", false, "apelido"),
      field("phone", "Telefone", true, "telefone", "whatsapp"),
      field("email", "E-mail", false, "email"),
      field("cep", "CEP", false),
      field("street", "Rua", false, "rua"),
      field("number", "Número", false, "numero"),
      field("complement", "Complemento", false),
      field("neighborhood", "Bairro", true, "bairro"),
      field("city", "Cidade", true, "cidade"),
      field("state", "Estado", true, "estado"),
      field("reference_point", "Referência", false, "referencia"),
      field("leader_name", "Liderança", false, "lideranca"),
      field("person_type", "Tipo de pessoa", true, "tipo_pessoa"),
      field("political_status", "Status político", true, "status_politico"),
      field("data_confidence", "Nível de confiança", true, "nivel_confianca"),
      field("source", "Fonte do cadastro", true, "fonte_cadastro"),
      field("last_contact", "Último contato", false, "ultimo_contato"),
      field("next_action", "Próxima ação", false, "proxima_acao"),
      field("next_action_date", "Data próxima ação", false, "data_proxima_acao"),
      field("lgpd_consent", "Consentimento LGPD", false, "consentimento_lgpd"),
      field("notes", "Observações", false, "observacoes"),
    ],
    templateHeaders: ["nome_completo", "apelido", "telefone", "email", "cep", "rua", "numero", "complemento", "bairro", "cidade", "estado", "referencia", "lideranca", "tipo_pessoa", "status_politico", "nivel_confianca", "fonte_cadastro", "ultimo_contato", "proxima_acao", "data_proxima_acao", "consentimento_lgpd", "observacoes"],
  },
  {
    key: "prospects",
    label: "Prospecção",
    table: "prospects",
    duplicateFields: [["contact_name", "phone"], ["contact_name", "neighborhood"]],
    fields: [
      field("contact_name", "Nome do contato", true, "nome_contato", "nome"),
      field("phone", "Telefone", false, "telefone"),
      field("neighborhood", "Bairro", true, "bairro"),
      field("city", "Cidade", true, "cidade"),
      field("funnel_stage", "Etapa do funil", true, "etapa_funil"),
      field("origin", "Origem", true, "origem"),
      field("priority", "Prioridade", true, "prioridade"),
      field("confidence_level", "Grau de confiança", true, "grau_confianca"),
      field("internal_responsible", "Responsável interno", false, "responsavel_interno"),
      field("next_action", "Próxima ação", false, "proxima_acao"),
      field("next_action_date", "Data próxima ação", false, "data_proxima_acao"),
      field("notes", "Observações", false, "observacoes"),
    ],
    templateHeaders: ["nome_contato", "telefone", "bairro", "cidade", "etapa_funil", "origem", "prioridade", "grau_confianca", "responsavel_interno", "proxima_acao", "data_proxima_acao", "observacoes"],
  },
  {
    key: "electoral_zones",
    label: "Zonas Eleitorais",
    table: "electoral_zones",
    duplicateFields: [["zone_number", "section_number", "voting_place"]],
    fields: [
      field("zone_number", "Zona eleitoral", true, "zona_eleitoral", "zona"),
      field("section_number", "Seção eleitoral", false, "secao_eleitoral", "secao"),
      field("voting_place", "Local de votação", true, "local_votacao"),
      field("cep", "CEP", false),
      field("street", "Rua", false, "rua"),
      field("number", "Número", false, "numero"),
      field("complement", "Complemento", false),
      field("neighborhood", "Bairro", true, "bairro"),
      field("city", "Cidade", true, "cidade"),
      field("state", "Estado", true, "estado"),
      field("voters_count", "Número de eleitores", true, "numero_eleitores", "eleitores"),
      field("historical_votes", "Histórico de votação", false, "historico_votacao"),
      field("vote_goal", "Meta de votos", true, "meta_votos"),
      field("estimated_campaign_votes", "Votos estimados", false, "votos_estimados"),
      field("validated_votes", "Votos validados", false, "votos_validados"),
      field("regional_responsible", "Responsável região", false, "responsavel_regiao"),
      field("priority", "Prioridade", true, "prioridade"),
      field("status", "Status", true),
      field("notes", "Observações", false, "observacoes"),
    ],
    templateHeaders: ["zona_eleitoral", "secao_eleitoral", "local_votacao", "cep", "rua", "numero", "complemento", "bairro", "cidade", "estado", "numero_eleitores", "historico_votacao", "meta_votos", "votos_estimados", "votos_validados", "responsavel_regiao", "prioridade", "status", "observacoes"],
  },
  {
    key: "field_agenda",
    label: "Agenda de Campo",
    table: "field_agenda",
    duplicateFields: [["title", "action_date", "neighborhood"]],
    fields: [
      field("title", "Título", true, "titulo"),
      field("action_type", "Tipo de ação", true, "tipo_acao"),
      field("action_date", "Data", true, "data"),
      field("neighborhood", "Bairro", true, "bairro"),
      field("city", "Cidade", true, "cidade"),
      field("state", "Estado", true, "estado"),
      field("status", "Status", true),
      field("priority", "Prioridade", true, "prioridade"),
      field("internal_responsible", "Responsável interno", false, "responsavel_interno"),
      field("estimated_public", "Público estimado", false, "publico_estimado"),
      field("result", "Resultado", false, "resultado"),
      field("notes", "Observações", false, "observacoes"),
    ],
    templateHeaders: ["titulo", "tipo_acao", "data", "bairro", "cidade", "estado", "status", "prioridade", "responsavel_interno", "publico_estimado", "resultado", "observacoes"],
  },
  {
    key: "demands",
    label: "Demandas",
    table: "demands",
    duplicateFields: [["title", "person_name", "neighborhood"]],
    fields: [
      field("title", "Título", true, "titulo"),
      field("description", "Descrição", true, "descricao"),
      field("person_name", "Pessoa", false, "pessoa"),
      field("phone", "Telefone", false, "telefone"),
      field("category", "Categoria", true, "categoria"),
      field("priority", "Prioridade", true, "prioridade"),
      field("status", "Status", true),
      field("neighborhood", "Bairro", true, "bairro"),
      field("city", "Cidade", true, "cidade"),
      field("state", "Estado", true, "estado"),
      field("opening_date", "Data de abertura", true, "data_abertura"),
      field("return_date", "Data de retorno", false, "data_retorno"),
      field("internal_responsible", "Responsável interno", false, "responsavel_interno"),
      field("next_action", "Próxima ação", false, "proxima_acao"),
      field("notes", "Observações", false, "observacoes"),
    ],
    templateHeaders: ["titulo", "descricao", "pessoa", "telefone", "categoria", "prioridade", "status", "bairro", "cidade", "estado", "data_abertura", "data_retorno", "responsavel_interno", "proxima_acao", "observacoes"],
  },
];

export function getImportModule(key: ImportModuleKey) {
  return importModules.find((item) => item.key === key) ?? importModules[0];
}

export function downloadImportTemplate(moduleKey: ImportModuleKey) {
  const config = getImportModule(moduleKey);
  const csv = `\uFEFF${config.templateHeaders.join(";")}\n`;
  const filename = `modelo-${config.key}-base-eleitoral-360.csv`;
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
}

function field(key: string, label: string, required = false, ...aliases: string[]): ImportField {
  return { key, label, required, aliases: [key, label, ...aliases] };
}
