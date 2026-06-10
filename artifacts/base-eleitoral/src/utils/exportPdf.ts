import type { ReportPreviewData } from "@/services/reportGenerator";
import { getReportFileName } from "./exportCsv";

export async function exportReportPdf(report: ReportPreviewData) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: report.definition.id === "lideranca" ? "landscape" : "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 42;
  let y = 42;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Base Eleitoral 360", margin, y);
  y += 24;

  pdf.setFontSize(13);
  pdf.text(report.definition.title, margin, y);
  y += 18;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, margin, y);
  y += 14;
  pdf.text(`Período: ${report.period}`, margin, y);
  y += 14;
  pdf.text(`Filtros: ${report.appliedFilters}`, margin, y, { maxWidth: pageWidth - margin * 2 });
  y += 28;

  y = addSection(pdf, "Resumo executivo", report.executiveSummary, margin, y, pageWidth);
  y += 8;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Indicadores principais", margin, y);
  y += 16;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  report.metrics.slice(0, 8).forEach((item, index) => {
    const x = margin + (index % 2) * 250;
    if (index > 0 && index % 2 === 0) y += 16;
    pdf.text(`${item.label}: ${item.value}`, x, y);
  });
  y += 32;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(report.definition.id === "lideranca" ? "Cadastros e subordinados" : "Tabela resumida", margin, y);
  y += 16;
  y = addTable(pdf, report.rows, margin, y, pageWidth, report.definition.id);
  y += 12;

  y = addSection(pdf, "Recomendações estratégicas", report.recommendations.map((item) => `- ${item}`).join("\n"), margin, y, pageWidth);

  pdf.setFontSize(8);
  pdf.setTextColor(100);
  pdf.text(`Base Eleitoral 360 - ${new Date().toLocaleString("pt-BR")}`, margin, pdf.internal.pageSize.getHeight() - 28);
  pdf.save(getReportFileName(report, "pdf"));
}

function addSection(pdf: InstanceType<(typeof import("jspdf"))["jsPDF"]>, title: string, body: string, margin: number, y: number, pageWidth: number) {
  pdf.setTextColor(15);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(title, margin, y);
  y += 15;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const lines = pdf.splitTextToSize(body, pageWidth - margin * 2);
  pdf.text(lines, margin, y);
  return y + lines.length * 12 + 10;
}

function addTable(pdf: InstanceType<(typeof import("jspdf"))["jsPDF"]>, rows: Array<Record<string, string | number>>, margin: number, y: number, pageWidth: number, reportId: string) {
  if (!rows.length) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Sem dados para o recorte atual.", margin, y);
    return y + 18;
  }

  const preferredHeaders = ["Nível", "Cadastro", "Coordenação", "Cidade", "Bairro", "Apoio total", "Votos mínimos", "Custo total (R$)"];
  const rowHeaders = Object.keys(rows[0]);
  const headers = reportId === "lideranca"
    ? preferredHeaders.filter((header) => rowHeaders.includes(header))
    : rowHeaders.slice(0, 5);
  const columnWidth = (pageWidth - margin * 2) / headers.length;
  const pageHeight = pdf.internal.pageSize.getHeight();

  const printHeader = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(reportId === "lideranca" ? 7 : 8);
    headers.forEach((header, index) => pdf.text(header, margin + index * columnWidth, y, { maxWidth: columnWidth - 6 }));
    y += 14;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(reportId === "lideranca" ? 7 : 8);
  };

  pdf.setFont("helvetica", "bold");
  printHeader();
  rows.forEach((row, rowIndex) => {
    if (y > pageHeight - 54) {
      pdf.addPage();
      y = 42;
      printHeader();
    }
    headers.forEach((header, index) => {
      const value = String(row[header] ?? "-");
      pdf.setFont("helvetica", rowIndex === 0 && reportId === "lideranca" ? "bold" : "normal");
      pdf.text(value.slice(0, reportId === "lideranca" ? 34 : 28), margin + index * columnWidth, y, { maxWidth: columnWidth - 6 });
    });
    y += 13;
  });
  return y;
}
