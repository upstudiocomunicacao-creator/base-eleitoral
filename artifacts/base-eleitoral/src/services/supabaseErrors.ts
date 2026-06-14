export type SupabaseErrorContext = {
  tableName?: string;
  setupSql?: string;
  fallbackMessage?: string;
};

export function createSupabaseServiceError(error: unknown, context: SupabaseErrorContext = {}): Error {
  const message = getSupabaseErrorMessage(error);

  if (isSchemaCacheError(message)) {
    return new Error(buildSchemaCacheMessage(message, context));
  }

  if (isRowLevelSecurityError(message)) {
    return new Error(
      `O Supabase recusou esta alteração por regra de permissão. Verifique se o usuário tem acesso ao módulo e se as políticas RLS estão ativas. Detalhe: ${message}`,
    );
  }

  if (isMissingTableError(message)) {
    return new Error(buildMissingTableMessage(message, context));
  }

  if (message) return new Error(message);
  return new Error(context.fallbackMessage ?? "Não foi possível concluir a operação no Supabase.");
}

export function getSupabaseErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return "";

  const details = error as {
    message?: unknown;
    details?: unknown;
    hint?: unknown;
    code?: unknown;
  };

  return [details.message, details.details, details.hint, details.code]
    .filter(Boolean)
    .map(String)
    .join(" ");
}

export function isSchemaCacheError(messageOrError: unknown): boolean {
  const normalized = normalizeErrorText(messageOrError);
  return (
    normalized.includes("schema cache")
    || normalized.includes("could not find")
    || normalized.includes("pgrst204")
    || normalized.includes("pgrst205")
  );
}

export function isRowLevelSecurityError(messageOrError: unknown): boolean {
  const normalized = normalizeErrorText(messageOrError);
  return normalized.includes("row-level security") || normalized.includes("rls");
}

export function isMissingTableError(messageOrError: unknown): boolean {
  const normalized = normalizeErrorText(messageOrError);
  return normalized.includes("does not exist") || normalized.includes("relation") || normalized.includes("pgrst205");
}

function normalizeErrorText(messageOrError: unknown): string {
  const message = typeof messageOrError === "string" ? messageOrError : getSupabaseErrorMessage(messageOrError);
  return message.toLowerCase();
}

function buildSchemaCacheMessage(message: string, context: SupabaseErrorContext) {
  const tableText = context.tableName ? `A tabela ${context.tableName}` : "Uma tabela do Supabase";
  const setupText = context.setupSql ? ` Rode ${context.setupSql} no SQL Editor do Supabase e tente novamente.` : " Recarregue o schema do Supabase e tente novamente.";
  return `${tableText} ainda precisa receber campos ou recarregar o cache da API.${setupText} Detalhe: ${message}`;
}

function buildMissingTableMessage(message: string, context: SupabaseErrorContext) {
  const tableText = context.tableName ? `A tabela ${context.tableName}` : "Uma tabela necessária";
  const setupText = context.setupSql ? ` Rode ${context.setupSql} no SQL Editor do Supabase e tente novamente.` : " Verifique o schema no Supabase.";
  return `${tableText} ainda não está disponível na API do Supabase.${setupText} Detalhe: ${message}`;
}
