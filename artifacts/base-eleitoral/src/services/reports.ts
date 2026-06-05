import type { Json, ReportHistory } from "@/types/database";
import { createCrudService } from "./supabaseCrud";

export const reportHistoryService = createCrudService("report_history");

export async function listReportHistory(): Promise<ReportHistory[]> {
  return reportHistoryService.list();
}

export async function registerReportHistory(input: {
  campaignId?: string | null;
  reportName: string;
  reportType: string;
  filters: Json;
  generatedBy?: string | null;
  status?: string;
  fileUrl?: string | null;
}): Promise<ReportHistory> {
  return reportHistoryService.create({
    campaign_id: input.campaignId ?? "00000000-0000-4000-8000-000000000001",
    report_name: input.reportName,
    report_type: input.reportType,
    filters: input.filters,
    generated_by: input.generatedBy ?? null,
    status: input.status ?? "Gerado",
    file_url: input.fileUrl ?? null,
  });
}
