import { apiFetch } from "@/lib/api-client";

export type WindowResDto = {
  windowId: number;
  weekStartDate: string;
  weekEndDate: string;
  openAt: string;
  closeAt: string;
  status: string;
  createdBy: number | null;
  createdAt: string;
};

export type ApiScheduleWindow = {
  window_id: number;
  title: string;
  week_start: string;
  week_end: string;
  open_from: string;
  open_until: string;
  status: string;
};

export type WindowReq = {
  weekStartDate: string;
  weekEndDate: string;
  openAt: string;
  closeAt: string;
  status: string;
  createdBy: number;
};

function formatDateTime(value: string) {
  if (!value) return "";
  return value.replace("T", " ").slice(0, 16);
}

function mapWindow(dto: WindowResDto): ApiScheduleWindow {
  return {
    window_id: dto.windowId,
    title: `Week ${dto.weekStartDate} – ${dto.weekEndDate}`,
    week_start: dto.weekStartDate,
    week_end: dto.weekEndDate,
    open_from: formatDateTime(dto.openAt),
    open_until: formatDateTime(dto.closeAt),
    status: dto.status,
  };
}

export async function fetchScheduleWindows() {
  const list = await apiFetch<WindowResDto[]>("/volunteer_schedule_windows");
  return list.map(mapWindow);
}

export async function createScheduleWindow(req: WindowReq) {
  const res = await apiFetch<WindowResDto>("/volunteer_schedule_windows", {
    method: "POST",
    body: JSON.stringify(req),
  });

  return mapWindow(res);
}

export async function updateScheduleWindow(id: number, req: WindowReq) {
  const res = await apiFetch<WindowResDto>(
    `/volunteer_schedule_windows/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(req),
    }
  );

  return mapWindow(res);
}

export async function updateScheduleWindowStatus(id: number, status: string) {
  const res = await apiFetch<WindowResDto>(
    `/volunteer_schedule_windows/${id}/status?status=${status}`,
    {
      method: "PATCH",
    }
  );

  return mapWindow(res);
}

export async function deleteScheduleWindow(id: number) {
  return apiFetch(`/volunteer_schedule_windows/${id}`, {
    method: "DELETE",
  });
}