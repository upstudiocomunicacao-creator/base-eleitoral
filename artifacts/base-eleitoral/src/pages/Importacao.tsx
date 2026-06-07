import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  Download,
  FileSpreadsheet,
  History,
  Loader2,
  Rows3,
  ShieldAlert,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import {
  generateErrorCsv,
  importRowsToSupabase,
  isImportsSupabaseReady,
  listImportHistory,
  parseImportFile,
  saveImportHistory,
  validateImportRows,
  type DuplicateStrategy,
  type ImportReadResult,
  type ImportValidationResult,
} from "@/services/imports";
import { downloadBlob } from "@/utils/exportCsv";
import { downloadImportTemplate, getImportModule, importModules, type ImportModuleKey } from "@/utils/importTemplates";
import type { ImportHistory } from "@/types/database";

const steps = ["Tipo", "Arquivo", "Mapeamento", "Validação", "Importação"];

export default function Importacao() {
  const { profile } = useAuth();
  const canImport = hasPermission(profile, "importacao_dados", "import");
  const [moduleKey, setModuleKey] = useState<ImportModuleKey>("leaders");
  const [file, setFile] = useState<File | null>(null);
  const [readResult, setReadResult] = useState<ImportReadResult | null>(null);
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>("ignore");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<null | Awaited<ReturnType<typeof importRowsToSupabase>>>(null);

  const config = useMemo(() => getImportModule(moduleKey), [moduleKey]);
  const stats = validation?.stats ?? { total: readResult?.rawRows.length ?? 0, valid: 0, errors: 0, duplicates: 0 };

  useEffect(() => {
    void loadHistory();
  }, []);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      setHistory(await listImportHistory());
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleFile(nextFile: File) {
    setFile(nextFile);
    setReadResult(null);
    setValidation(null);
    setLastResult(null);
    setError(null);
    setLoading(true);
    try {
      const parsed = await parseImportFile(nextFile, moduleKey);
      setReadResult(parsed);
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleValidate() {
    if (!readResult) return;
    setLoading(true);
    setError(null);
    try {
      const result = await validateImportRows(moduleKey, readResult.rawRows, readResult.mapping);
      setValidation(result);
      setStep(3);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!validation || !file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await importRowsToSupabase(moduleKey, validation.rows, duplicateStrategy);
      setLastResult(result);
      await saveImportHistory({
        userProfileId: profile?.id ?? null,
        importType: config.label,
        fileName: file.name,
        result,
        status: result.errorRows ? "Concluída com erros" : "Concluída",
        errors: validation.rows.filter((item) => item.status === "error").map((item) => ({ row: item.index + 2, errors: item.errors })),
      }).catch(() => undefined);
      toast({ title: "Importação concluída", description: `${result.importedRows} registro(s) enviados ao Supabase.` });
      setStep(4);
      void loadHistory();
    } catch (err) {
      setError(getErrorMessage(err));
      toast({ title: "Erro na importação", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function resetFlow(nextModule = moduleKey) {
    setModuleKey(nextModule);
    setFile(null);
    setReadResult(null);
    setValidation(null);
    setLastResult(null);
    setError(null);
    setStep(0);
  }

  if (!canImport) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Importação" title="Importação de Dados" description="Carga em massa de coordenações, lideranças, apoio estimado, votos e localização territorial." />
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-5 text-amber-900">
            <ShieldAlert className="mt-1 h-5 w-5" />
            <div>
              <div className="font-extrabold">Acesso restrito</div>
              <p className="mt-1 text-sm font-medium">Seu perfil não possui permissão para importar dados. Solicite acesso a um administrador.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Importação de Dados"
        title="Assistente de Importação CSV/XLSX"
        description="Valide cadastros territoriais, revise duplicidades e salve dados em massa no Supabase com segurança."
        actions={<Button variant="outline" onClick={() => resetFlow()}><UploadCloud className="h-4 w-4" /> Nova importação</Button>}
      />

      {!isImportsSupabaseReady() ? <Warning message="Supabase não está configurado. Configure as chaves antes de importar." /> : null}
      {error ? <Warning danger message={error} /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <MetricCard label="Importações" value={history.length} icon={History} tone="blue" loading={historyLoading} />
        <MetricCard label="Importados" value={history.reduce((total, item) => total + item.imported_rows, 0)} icon={DatabaseZap} tone="emerald" loading={historyLoading} />
        <MetricCard label="Com erro" value={stats.errors} icon={XCircle} tone="red" />
        <MetricCard label="Última" value={history[0] ? new Date(history[0].created_at).toLocaleDateString("pt-BR") : "-"} icon={FileSpreadsheet} tone="indigo" loading={historyLoading} />
        <MetricCard label="Tipos" value={importModules.length} icon={Rows3} tone="violet" />
        <MetricCard label="Pendentes" value={file && !lastResult ? 1 : 0} icon={UploadCloud} tone="amber" />
        <MetricCard label="Duplicados" value={stats.duplicates} icon={AlertTriangle} tone="orange" />
        <MetricCard label="Validados" value={stats.valid} icon={CheckCircle2} tone="green" />
      </section>

      <ProgressSteps active={step} />

      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <ModuleSelector value={moduleKey} onChange={(value) => resetFlow(value)} />
          <TemplatesPanel />
          <DuplicatePanel value={duplicateStrategy} onChange={setDuplicateStrategy} disabled={!validation?.stats.duplicates} />
        </aside>

        <div className="space-y-4">
          <UploadPanel file={file} loading={loading} onFile={handleFile} />
          {readResult ? <MappingPanel result={readResult} moduleKey={moduleKey} onChange={(mapping) => setReadResult({ ...readResult, mapping })} onValidate={handleValidate} loading={loading} /> : null}
          {validation ? <PreviewPanel validation={validation} onImport={handleImport} onDownloadErrors={() => downloadBlob(generateErrorCsv(validation.rows), `erros-importacao-${moduleKey}.csv`, "text/csv;charset=utf-8")} loading={loading} /> : null}
          {lastResult ? <ResultPanel result={lastResult} /> : null}
        </div>
      </section>

      <HistoryTable history={history} loading={historyLoading} />
    </div>
  );
}

function ProgressSteps({ active }: { active: number }) {
  return (
    <Card className="premium-card">
      <CardContent className="grid gap-2 p-4 sm:grid-cols-5">
        {steps.map((label, index) => (
          <div key={label} className={`rounded-lg px-3 py-2 text-sm font-bold ${index <= active ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-400"}`}>
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm">{index + 1}</span>
            {label}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ModuleSelector({ value, onChange }: { value: ImportModuleKey; onChange: (value: ImportModuleKey) => void }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">1. Escolher tipo de carga</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {importModules.map((item) => (
          <button key={item.key} type="button" onClick={() => onChange(item.key)} className={`w-full rounded-lg border p-3 text-left text-sm font-bold transition ${value === item.key ? "border-blue-200 bg-blue-50 text-blue-800" : "border-slate-100 bg-white text-slate-700 hover:bg-slate-50"}`}>
            {item.label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function TemplatesPanel() {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">Modelos de planilha</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {importModules.map((item) => (
          <Button key={item.key} variant="outline" className="w-full justify-start" onClick={() => downloadImportTemplate(item.key)}>
            <Download className="h-4 w-4" /> Modelo {item.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function DuplicatePanel({ value, onChange, disabled }: { value: DuplicateStrategy; onChange: (value: DuplicateStrategy) => void; disabled: boolean }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">Duplicidades</CardTitle></CardHeader>
      <CardContent>
        <select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value as DuplicateStrategy)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold">
          <option value="ignore">Ignorar duplicados</option>
          <option value="update">Atualizar duplicados</option>
          <option value="import">Importar mesmo assim</option>
          <option value="cancel">Cancelar importação</option>
        </select>
        <p className="mt-2 text-xs font-medium text-slate-500">A regra usa telefone, nome+bairro ou chaves eleitorais conforme o módulo.</p>
      </CardContent>
    </Card>
  );
}

function UploadPanel({ file, loading, onFile }: { file: File | null; loading: boolean; onFile: (file: File) => Promise<void> }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (nextFile) void onFile(nextFile);
  };
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) void onFile(nextFile);
  };
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">2. Upload do arquivo</CardTitle></CardHeader>
      <CardContent>
        <label onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-6 py-10 text-center transition hover:bg-blue-50">
          {loading ? <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-600" /> : <UploadCloud className="mb-3 h-8 w-8 text-blue-600" />}
          <div className="font-extrabold text-slate-900">{file ? file.name : "Arraste CSV/XLSX aqui ou clique para escolher"}</div>
          <p className="mt-1 text-sm font-medium text-slate-500">Formatos aceitos: .csv, .xlsx</p>
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleChange} />
        </label>
      </CardContent>
    </Card>
  );
}

function MappingPanel({ result, moduleKey, onChange, onValidate, loading }: { result: ImportReadResult; moduleKey: ImportModuleKey; onChange: (mapping: ImportReadResult["mapping"]) => void; onValidate: () => Promise<void>; loading: boolean }) {
  const config = getImportModule(moduleKey);
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">3. Mapeamento de colunas</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          {result.headers.map((header) => (
            <label key={header} className="block rounded-lg border border-slate-100 bg-white p-3">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-400">{header}</span>
              <select value={result.mapping[header] ?? "ignore"} onChange={(event) => onChange({ ...result.mapping, [header]: event.target.value })} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm font-semibold">
                <option value="ignore">Ignorar coluna</option>
                {config.fields.map((field) => <option key={field.key} value={field.key}>{field.label}{field.required ? " *" : ""}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="flex justify-end"><Button onClick={onValidate} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Validar dados</Button></div>
      </CardContent>
    </Card>
  );
}

function PreviewPanel({ validation, onImport, onDownloadErrors, loading }: { validation: ImportValidationResult; onImport: () => Promise<void>; onDownloadErrors: () => void; loading: boolean }) {
  const headers = Object.keys(validation.rows[0]?.mapped ?? {}).slice(0, 8);
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="flex flex-col gap-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">4. Prévia e validação</CardTitle>
        <div className="flex flex-wrap gap-2">
          <StatusPill label={`${validation.stats.valid} válidos`} tone="green" />
          <StatusPill label={`${validation.stats.errors} erros`} tone={validation.stats.errors ? "red" : "slate"} />
          <StatusPill label={`${validation.stats.duplicates} duplicados`} tone={validation.stats.duplicates ? "amber" : "slate"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Status</TableHead>{headers.map((head) => <TableHead key={head}>{head}</TableHead>)}<TableHead>Erros</TableHead></TableRow></TableHeader>
            <TableBody>
              {validation.rows.slice(0, 12).map((row) => (
                <TableRow key={row.index}>
                  <TableCell><StatusPill label={row.status === "valid" ? "Válido" : row.status === "duplicate" ? "Duplicado" : "Erro"} tone={row.status === "valid" ? "green" : row.status === "duplicate" ? "amber" : "red"} /></TableCell>
                  {headers.map((head) => <TableCell key={head}>{String(row.mapped[head] ?? "-")}</TableCell>)}
                  <TableCell className="min-w-60 text-xs text-red-700">{row.errors.join(" | ") || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onDownloadErrors} disabled={!validation.stats.errors}><Download className="h-4 w-4" /> Baixar erros CSV</Button>
          <Button onClick={onImport} disabled={loading || validation.stats.valid + validation.stats.duplicates === 0}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />} Confirmar importação</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultPanel({ result }: { result: Awaited<ReturnType<typeof importRowsToSupabase>> }) {
  return (
    <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
      <CardContent className="grid gap-3 p-5 sm:grid-cols-5">
        <ResultItem label="Total lido" value={result.totalRows} />
        <ResultItem label="Importados" value={result.importedRows} />
        <ResultItem label="Ignorados" value={result.ignoredRows} />
        <ResultItem label="Com erro" value={result.errorRows} />
        <ResultItem label="Duplicados" value={result.duplicateRows} />
      </CardContent>
    </Card>
  );
}

function ResultItem({ label, value }: { label: string; value: number }) {
  return <div><div className="text-2xl font-extrabold text-emerald-900">{value.toLocaleString("pt-BR")}</div><div className="text-xs font-bold uppercase text-emerald-700">{label}</div></div>;
}

function HistoryTable({ history, loading }: { history: ImportHistory[]; loading: boolean }) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader><CardTitle className="text-base">Histórico de importações</CardTitle></CardHeader>
      <CardContent className="p-0">
        {loading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div> : history.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>{["Data", "Tipo", "Arquivo", "Total", "Importados", "Erros", "Duplicados", "Status"].map((head) => <TableHead key={head}>{head}</TableHead>)}</TableRow></TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="font-bold">{item.import_type}</TableCell>
                    <TableCell>{item.file_name}</TableCell>
                    <TableCell>{item.total_rows}</TableCell>
                    <TableCell>{item.imported_rows}</TableCell>
                    <TableCell>{item.error_rows}</TableCell>
                    <TableCell>{item.duplicate_rows}</TableCell>
                    <TableCell><StatusPill label={item.status} tone={item.status.includes("erro") ? "red" : "green"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : <EmptyState title="Nenhuma importação registrada" description="O histórico será preenchido depois da primeira carga." icon={History} />}
      </CardContent>
    </Card>
  );
}

function Warning({ message, danger = false }: { message: string; danger?: boolean }) {
  return <Card className={`${danger ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"} shadow-sm`}><CardContent className="flex items-start gap-3 p-4"><AlertTriangle className="mt-0.5 h-5 w-5" /><p className="text-sm font-semibold">{message}</p></CardContent></Card>;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message);
  return "Erro inesperado na importação.";
}
