import { apiFetch } from "@/lib/api-client";
import { mapRescueReportRes, type RescueReportResDto } from "@/lib/api/mappers";
import type { PublicRescueReport } from "@/data/public-mock";

export type CreateRescueReportBody = {
  userId?: number;
  reporterName: string;
  reporterPhone: string;
  locationText: string;
  urgencyLevel: string;
  injuryType: string;
  temperament: string;
  behavior: string;
  additionalNote?: string;
  imageUrl?: string;
};

export async function fetchRescueByTrackingCode(code: string): Promise<PublicRescueReport> {
  const dto = await apiFetch<RescueReportResDto>(
    `/rescue_reports/tracking/${encodeURIComponent(code.trim())}`
  );
  return mapRescueReportRes(dto);
}

export async function createRescueReport(body: CreateRescueReportBody): Promise<PublicRescueReport> {
  const dto = await apiFetch<RescueReportResDto>("/rescue_reports", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapRescueReportRes(dto);
}

export async function fetchAllRescueReports(): Promise<PublicRescueReport[]> {
  const list = await apiFetch<RescueReportResDto[]>("/rescue_reports");
  return list.map(mapRescueReportRes);
}

export async function fetchRescueById(reportId: number): Promise<PublicRescueReport> {
  const dto = await apiFetch<RescueReportResDto>(`/rescue_reports/${reportId}`);
  return mapRescueReportRes(dto);
}

export async function deleteRescueReport(reportId: number) {
  await apiFetch<string>(`/rescue_reports/${reportId}`, { method: "DELETE" });
}

export async function acceptRescueReport(reportId: number, userId: number) {
  return apiFetch<RescueReportResDto>(`/rescue_reports/${reportId}/accept?userId=${userId}`, {
    method: "PATCH",
  });
}

export async function updateRescueReportStatus(reportId: number, status: string) {
  return apiFetch<RescueReportResDto>(
    `/rescue_reports/${reportId}/status?status=${encodeURIComponent(status)}`,
    { method: "PATCH" }
  );
}

export type AdminRescueReportResDto = RescueReportResDto & { reportId: number; assignedTo?: number };
