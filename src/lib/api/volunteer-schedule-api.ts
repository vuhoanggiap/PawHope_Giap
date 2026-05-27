import { apiFetch } from "@/lib/api-client";

export type ShiftResDto = {
  shiftId: number;
  shiftName: string;
  startTime?: string;
  endTime?: string;
  crossesMidnight?: boolean;
};

export type VolunteerScheduleWindowResDto = {
  windowId: number;
  weekStartDate?: string;
  weekEndDate?: string;
  openAt?: string;
  closeAt?: string;
  status: string;
};

export type VolunteerScheduleWeekResDto = {
  weekId: number;
  windowId?: number;
  userId?: number;
  weekStartDate?: string;
  weekEndDate?: string;
  status: string;
};

export type VolunteerScheduleResDto = {
  scheduleId: number;
  weekId?: number;
  userId?: number;
  shiftId?: number;
  workDate?: string;
  registeredAt?: string;
};

export async function fetchShifts() {
  return apiFetch<ShiftResDto[]>("/shifts");
}

export async function fetchScheduleWindows() {
  return apiFetch<VolunteerScheduleWindowResDto[]>("/volunteer_schedule_windows");
}

export async function fetchScheduleWeeks() {
  return apiFetch<VolunteerScheduleWeekResDto[]>("/volunteer_schedule_weeks");
}

export async function fetchVolunteerSchedules() {
  return apiFetch<VolunteerScheduleResDto[]>("/volunteer_schedules");
}

export async function createVolunteerScheduleWeek(body: { windowId: number; userId: number }) {
  return apiFetch<VolunteerScheduleWeekResDto>("/volunteer_schedule_weeks", {
    method: "POST",
    body: JSON.stringify({ windowId: body.windowId, userId: body.userId }),
  });
}

export async function submitVolunteerScheduleWeek(weekId: number) {
  return apiFetch<VolunteerScheduleWeekResDto>(`/volunteer_schedule_weeks/${weekId}/submit`, {
    method: "PATCH",
  });
}

export async function createVolunteerSchedule(body: {
  weekId: number;
  userId: number;
  shiftId: number;
  workDate: string;
}) {
  return apiFetch<VolunteerScheduleResDto>("/volunteer_schedules", {
    method: "POST",
    body: JSON.stringify({
      weekId: body.weekId,
      userId: body.userId,
      shiftId: body.shiftId,
      workDate: body.workDate,
    }),
  });
}

export async function deleteVolunteerSchedule(scheduleId: number) {
  return apiFetch<string>(`/volunteer_schedules/${scheduleId}`, { method: "DELETE" });
}
