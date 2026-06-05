import type { ReportFilters, ReportPreviewData } from "@/services/reportGenerator";
import { getReportFileName } from "./exportCsv";

export async function exportReportExcel(report: ReportPreviewData, filters: ReportFilters) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ["Base Eleitoral 360"],
    ["Relatório", report.definition.title],
    ["Tipo", report.definition.type],
    ["Gerado em", new Date().toLocaleString("pt-BR")],
    ["Período", report.period],
    ["Filtros", report.appliedFilters],
    [],
    ["Resumo executivo"],
    [report.executiveSummary],
    [],
    ["Indicadores"],
    ...report.metrics.map((item) => [item.label, item.value]),
    [],
    ["Recomendações"],
    ...report.recommendations.map((item) => [item]),
  ]), "Resumo");

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.rows.length ? report.rows : [{ Status: "Sem dados para o recorte atual" }]), "Dados");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(Object.entries(filters).map(([campo, valor]) => ({ Campo: campo, Valor: valor }))), "Filtros");

  XLSX.writeFile(workbook, getReportFileName(report, "xlsx"));
}
