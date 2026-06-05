import type { ReportPreviewData } from "@/services/reportGenerator";

export function exportReportCsv(report: ReportPreviewData) {
  const rows = [
    ["Base Eleitoral 360"],
    [report.definition.title],
    ["Gerado em", new Date().toLocaleString("pt-BR")],
    ["Período", report.period],
    ["Filtros", report.appliedFilters],
    [],
    ["Resumo executivo"],
    [report.executiveSummary],
    [],
    ["Indicadores"],
    ...report.metrics.map((item) => [item.label, String(item.value)]),
    [],
    ["Dados"],
    ...tableToRows(report.rows),
    [],
    ["Recomendações"],
    ...report.recommendations.map((item) => [item]),
  ];

  downloadBlob(toCsv(rows), getReportFileName(report, "csv"), "text/csv;charset=utf-8");
}

export function getReportFileName(report: ReportPreviewData, extension: string) {
  const slug = report.definition.title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const date = new Date().toISOString().slice(0, 10);
  return `base-eleitoral-360-${slug}-${date}.${extension}`;
}

export function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function tableToRows(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return [["Sem dados"]];
  const headers = Object.keys(rows[0]);
  return [headers, ...rows.map((row) => headers.map((header) => String(row[header] ?? "")))];
}

function toCsv(rows: string[][]) {
  return `\uFEFF${rows.map((row) => row.map(escapeCell).join(";")).join("\n")}`;
}

function escapeCell(value: string) {
  const clean = String(value ?? "");
  if (/[;"\n\r]/.test(clean)) return `"${clean.replace(/"/g, '""')}"`;
  return clean;
}
