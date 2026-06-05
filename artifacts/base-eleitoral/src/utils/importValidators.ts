import type { ImportModuleConfig } from "./importTemplates";

export type ColumnMapping = Record<string, string>;

export type ImportValidationRow = {
  index: number;
  raw: Record<string, string>;
  mapped: Record<string, string | number | boolean | null>;
  status: "valid" | "error" | "duplicate";
  errors: string[];
  duplicateKey?: string;
  existingId?: string;
};

export function buildAutoMapping(headers: string[], config: ImportModuleConfig): ColumnMapping {
  const mapping: ColumnMapping = {};
  headers.forEach((header) => {
    const normalizedHeader = normalize(header);
    const match = config.fields.find((field) => field.aliases?.some((alias) => normalize(alias) === normalizedHeader));
    if (match) mapping[header] = match.key;
  });
  return mapping;
}

export function mapRowsToFields(rows: Array<Record<string, string>>, mapping: ColumnMapping) {
  return rows.map((row) => {
    const mapped: Record<string, string> = {};
    Object.entries(mapping).forEach(([source, target]) => {
      if (!target || target === "ignore") return;
      mapped[target] = row[source] ?? "";
    });
    return mapped;
  });
}

export function validateRows(config: ImportModuleConfig, rawRows: Array<Record<string, string>>, mappedRows: Array<Record<string, string>>, existingRows: Array<Record<string, unknown>> = []): ImportValidationRow[] {
  const seen = new Set<string>();
  const existingKeys = buildExistingKeys(config, existingRows);

  return mappedRows.map((row, index) => {
    const errors: string[] = [];
    config.fields.filter((field) => field.required).forEach((field) => {
      if (!String(row[field.key] ?? "").trim()) errors.push(`Campo obrigatório ausente: ${field.label}`);
    });
    if ("phone" in row && row.phone && !isValidPhone(String(row.phone))) errors.push("Telefone inválido");

    const duplicateKey = makeDuplicateKey(config, row);
    const isDuplicate = duplicateKey ? seen.has(duplicateKey) || existingKeys.has(duplicateKey) : false;
    const existingId = duplicateKey ? existingKeys.get(duplicateKey) : undefined;
    if (duplicateKey) seen.add(duplicateKey);

    return {
      index,
      raw: rawRows[index],
      mapped: normalizeMappedPayload(config.key, row),
      status: errors.length ? "error" : isDuplicate ? "duplicate" : "valid",
      errors,
      duplicateKey,
      existingId,
    };
  });
}

export function buildImportStats(rows: ImportValidationRow[]) {
  return {
    total: rows.length,
    valid: rows.filter((item) => item.status === "valid").length,
    errors: rows.filter((item) => item.status === "error").length,
    duplicates: rows.filter((item) => item.status === "duplicate").length,
  };
}

export function makeDuplicateKey(config: ImportModuleConfig, row: Record<string, string | number | boolean | null>) {
  const fields = config.duplicateFields.find((group) => group.every((field) => String(row[field] ?? "").trim()));
  if (!fields) return "";
  return fields.map((field) => normalize(String(row[field] ?? ""))).join("|");
}

function buildExistingKeys(config: ImportModuleConfig, rows: Array<Record<string, unknown>>) {
  const map = new Map<string, string>();
  rows.forEach((row) => {
    const key = makeDuplicateKey(config, row as Record<string, string | number | boolean | null>);
    if (key) map.set(key, String(row.id ?? ""));
  });
  return map;
}

function normalizeMappedPayload(moduleKey: string, row: Record<string, string>) {
  const numericFields = new Set(["registered_supporters", "estimated_direct_supporters", "estimated_indirect_supporters", "declared_votes", "validated_votes", "voters_count", "historical_votes", "vote_goal", "estimated_campaign_votes", "estimated_public", "actual_public"]);
  const dateFields = new Set(["action_date", "opening_date", "return_date", "next_action_date", "last_contact"]);
  const payload: Record<string, string | number | boolean | null> = {};

  Object.entries(row).forEach(([key, value]) => {
    const clean = String(value ?? "").trim();
    if (!clean) {
      payload[key] = null;
      return;
    }
    if (numericFields.has(key)) {
      payload[key] = Number(clean.replace(/\./g, "").replace(",", ".")) || 0;
      return;
    }
    if (key === "lgpd_consent") {
      payload[key] = ["sim", "true", "1", "s"].includes(normalize(clean));
      return;
    }
    if (dateFields.has(key)) {
      payload[key] = normalizeDate(clean);
      return;
    }
    payload[key] = clean;
  });

  if (moduleKey === "leaders") payload.geographic_precision ??= "Baixa";
  if (moduleKey === "supporters") payload.geographic_precision ??= "Baixa";
  if (moduleKey === "supporters") payload.lgpd_consent ??= true;
  return payload;
}

function normalizeDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return value;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").toLowerCase();
}
