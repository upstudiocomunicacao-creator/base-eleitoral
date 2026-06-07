import { downloadBlob } from "./exportCsv";

export type ImportModuleKey = "leaders";

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
    label: "Cadastros territoriais",
    table: "leaders",
    duplicateFields: [["phone"], ["full_name", "city", "neighborhood"]],
    fields: [
      field("full_name", "Nome completo", true, "nome_completo", "nome"),
      field("political_nickname", "Apelido político", false, "apelido_politico", "apelido"),
      field("phone", "Telefone/WhatsApp", true, "telefone", "whatsapp"),
      field("email", "E-mail", false, "email"),
      field("leader_type", "Papel no organograma", true, "tipo_lideranca", "papel", "funcao"),
      field("status", "Status", true),
      field("cep", "CEP", false),
      field("street", "Rua", false, "rua"),
      field("number", "Número", false, "numero"),
      field("complement", "Complemento", false),
      field("neighborhood", "Bairro", true, "bairro"),
      field("city", "Cidade", true, "cidade", "municipio"),
      field("state", "Estado", true, "estado", "uf"),
      field("territory_region", "Região ou distrito", false, "regiao_atuacao", "regiao", "distrito"),
      field("geographic_precision", "Precisão geográfica", false, "precisao_geografica"),
      field("internal_responsible", "Responsável interno", false, "responsavel_interno"),
      field("registered_supporters", "Apoio estimado base", false, "apoio_estimado", "apoiadores_cadastrados"),
      field("estimated_direct_supporters", "Apoio estimado direto", false, "apoio_direto", "apoiadores_estimados_diretos"),
      field("estimated_indirect_supporters", "Apoio estimado indireto", false, "apoio_indireto", "apoiadores_estimados_indiretos"),
      field("declared_votes", "Votos declarados", false, "votos_declarados", "votos_estimados"),
      field("validated_votes", "Votos validados", false, "votos_validados"),
      field("confidence_level", "Grau de confiança", true, "grau_confianca"),
      field("estimate_source", "Fonte da estimativa", false, "fonte_estimativa"),
      field("proof_type", "Comprovação", false, "comprovacao"),
      field("latitude", "Latitude", false, "lat"),
      field("longitude", "Longitude", false, "lng", "lon"),
      field("next_action", "Próxima ação", false, "proxima_acao"),
      field("notes", "Observações", false, "observacoes"),
    ],
    templateHeaders: [
      "nome_completo",
      "apelido_politico",
      "telefone",
      "email",
      "papel",
      "status",
      "cep",
      "rua",
      "numero",
      "complemento",
      "bairro",
      "cidade",
      "estado",
      "regiao_ou_distrito",
      "precisao_geografica",
      "responsavel_interno",
      "apoio_estimado_base",
      "apoio_estimado_direto",
      "apoio_estimado_indireto",
      "votos_declarados",
      "votos_validados",
      "grau_confianca",
      "fonte_estimativa",
      "comprovacao",
      "latitude",
      "longitude",
      "proxima_acao",
      "observacoes",
    ],
  },
];

export function getImportModule(key: ImportModuleKey) {
  return importModules.find((item) => item.key === key) ?? importModules[0];
}

export function downloadImportTemplate(moduleKey: ImportModuleKey) {
  const config = getImportModule(moduleKey);
  const csv = `\uFEFF${config.templateHeaders.join(";")}\n`;
  const filename = "modelo-cadastros-territoriais-base-eleitoral-360.csv";
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
}

function field(key: string, label: string, required = false, ...aliases: string[]): ImportField {
  return { key, label, required, aliases: [key, label, ...aliases] };
}
