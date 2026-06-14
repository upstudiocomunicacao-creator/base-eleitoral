import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Database, ImportHistory, Json } from "@/types/database";
import { DEFAULT_CAMPAIGN_ID } from "./leaders";
import { parseSpreadsheetFile } from "@/utils/importParsers";
import { buildAutoMapping, buildImportStats, mapRowsToFields, validateRows, type ColumnMapping, type ImportValidationRow } from "@/utils/importValidators";
import { getImportModule, type ImportModuleKey } from "@/utils/importTemplates";
import { createSupabaseServiceError } from "./supabaseErrors";

export type DuplicateStrategy = "ignore" | "update" | "import" | "cancel";

export type ImportReadResult = {
  headers: string[];
  rawRows: Array<Record<string, string>>;
  mapping: ColumnMapping;
};

export type ImportValidationResult = {
  rows: ImportValidationRow[];
  stats: ReturnType<typeof buildImportStats>;
};

export type ImportExecutionResult = {
  totalRows: number;
  importedRows: number;
  ignoredRows: number;
  errorRows: number;
  duplicateRows: number;
};

type TableName = ImportModuleKey;
type InsertPayload<T extends TableName> = Database["public"]["Tables"][T]["Insert"];

export function isImportsSupabaseReady() {
  return isSupabaseConfigured;
}

export async function parseImportFile(file: File, moduleKey: ImportModuleKey): Promise<ImportReadResult> {
  const parsed = await parseSpreadsheetFile(file);
  const mapping = buildAutoMapping(parsed.headers, getImportModule(moduleKey));
  return { headers: parsed.headers, rawRows: parsed.rows, mapping };
}

export function mapColumnsToFields(rawRows: Array<Record<string, string>>, mapping: ColumnMapping) {
  return mapRowsToFields(rawRows, mapping);
}

export async function validateImportRows(moduleKey: ImportModuleKey, rawRows: Array<Record<string, string>>, mapping: ColumnMapping): Promise<ImportValidationResult> {
  const config = getImportModule(moduleKey);
  const existingRows = await listExistingRows(moduleKey);
  const rows = validateRows(config, rawRows, mapColumnsToFields(rawRows, mapping), existingRows);
  return { rows, stats: buildImportStats(rows) };
}

export async function detectDuplicates(moduleKey: ImportModuleKey, rows: Array<Record<string, string>>, mapping: ColumnMapping) {
  return (await validateImportRows(moduleKey, rows, mapping)).rows.filter((item) => item.status === "duplicate");
}

export async function importRowsToSupabase(moduleKey: ImportModuleKey, rows: ImportValidationRow[], strategy: DuplicateStrategy): Promise<ImportExecutionResult> {
  if (strategy === "cancel") throw new Error("Importação cancelada.");

  const supabase = getSupabaseClient();
  const validRows = rows.filter((item) => item.status === "valid" || (item.status === "duplicate" && strategy !== "ignore"));
  const insertRows = validRows
    .filter((item) => item.status === "valid" || strategy === "import" || !item.existingId)
    .map((item) => sanitizePayload(moduleKey, item.mapped));
  const updateRows = validRows.filter((item) => item.status === "duplicate" && strategy === "update" && item.existingId);

  let importedRows = 0;

  if (insertRows.length) {
    const { error, data } = await supabase.from(moduleKey).insert(insertRows as InsertPayload<typeof moduleKey>[]).select("id");
    if (error) throw createImportError(error, moduleKey);
    importedRows += data?.length ?? insertRows.length;
  }

  for (const row of updateRows) {
    const { error } = await supabase.from(moduleKey).update(sanitizePayload(moduleKey, row.mapped) as never).eq("id", row.existingId as string);
    if (error) throw createImportError(error, moduleKey);
    importedRows += 1;
  }

  return {
    totalRows: rows.length,
    importedRows,
    ignoredRows: rows.filter((item) => item.status === "duplicate" && strategy === "ignore").length,
    errorRows: rows.filter((item) => item.status === "error").length,
    duplicateRows: rows.filter((item) => item.status === "duplicate").length,
  };
}

export async function saveImportHistory(input: {
  campaignId?: string | null;
  userProfileId?: string | null;
  importType: string;
  fileName: string;
  result: ImportExecutionResult;
  status: string;
  errors?: Json | null;
}): Promise<ImportHistory> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("import_history")
    .insert({
      campaign_id: input.campaignId ?? DEFAULT_CAMPAIGN_ID,
      user_profile_id: input.userProfileId ?? null,
      import_type: input.importType,
      file_name: input.fileName,
      total_rows: input.result.totalRows,
      imported_rows: input.result.importedRows,
      error_rows: input.result.errorRows,
      duplicate_rows: input.result.duplicateRows,
      status: input.status,
      errors: input.errors ?? null,
    })
    .select("*")
    .single();

  if (error) throw createImportHistoryError(error);
  return data;
}

export async function listImportHistory(): Promise<ImportHistory[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("import_history").select("*").order("created_at", { ascending: false });
  if (error) throw createImportHistoryError(error);
  return data ?? [];
}

export function generateErrorCsv(rows: ImportValidationRow[]) {
  const errorRows = rows.filter((item) => item.status === "error" || item.errors.length);
  const headers = ["linha", "status", "erros", ...Object.keys(errorRows[0]?.raw ?? {})];
  const csvRows = [
    headers,
    ...errorRows.map((item) => [
      String(item.index + 2),
      item.status,
      item.errors.join(" | "),
      ...Object.keys(errorRows[0]?.raw ?? {}).map((header) => item.raw[header] ?? ""),
    ]),
  ];
  return `\uFEFF${csvRows.map((row) => row.map(escapeCsv).join(";")).join("\n")}`;
}

async function listExistingRows(moduleKey: ImportModuleKey): Promise<Array<Record<string, unknown>>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(moduleKey).select("*");
  if (error) throw createImportError(error, moduleKey);
  return (data ?? []) as Array<Record<string, unknown>>;
}

function createImportError(error: unknown, tableName: ImportModuleKey) {
  return createSupabaseServiceError(error, {
    tableName,
    setupSql: "supabase/schema.sql",
    fallbackMessage: "Não foi possível importar os registros para o Supabase.",
  });
}

function createImportHistoryError(error: unknown) {
  return createSupabaseServiceError(error, {
    tableName: "import_history",
    setupSql: "supabase/schema.sql",
    fallbackMessage: "Não foi possível registrar o histórico da importação.",
  });
}

function sanitizePayload(moduleKey: ImportModuleKey, payload: Record<string, string | number | boolean | null>) {
  const allowed = allowedFields[moduleKey];
  const next: Record<string, string | number | boolean | null> = { campaign_id: DEFAULT_CAMPAIGN_ID };
  Object.entries(payload).forEach(([key, value]) => {
    if (allowed.has(key)) next[key] = value;
  });
  applyDefaults(moduleKey, next);
  return next;
}

function applyDefaults(moduleKey: ImportModuleKey, payload: Record<string, string | number | boolean | null>) {
  if (moduleKey === "leaders") {
    payload.geographic_precision ??= "Baixa";
    payload.registered_supporters ??= 0;
    payload.estimated_direct_supporters ??= 0;
    payload.estimated_indirect_supporters ??= 0;
    payload.declared_votes ??= 0;
    payload.validated_votes ??= 0;
  }
}

const allowedFields: Record<ImportModuleKey, Set<string>> = {
  leaders: new Set([
    "campaign_id",
    "full_name",
    "political_nickname",
    "phone",
    "email",
    "leader_type",
    "status",
    "cep",
    "street",
    "number",
    "complement",
    "neighborhood",
    "city",
    "state",
    "territory_region",
    "geographic_precision",
    "internal_responsible",
    "registered_supporters",
    "estimated_direct_supporters",
    "estimated_indirect_supporters",
    "declared_votes",
    "validated_votes",
    "confidence_level",
    "estimate_source",
    "proof_type",
    "latitude",
    "longitude",
    "next_action",
    "notes",
  ]),
};

function escapeCsv(value: string) {
  if (/[;"\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
