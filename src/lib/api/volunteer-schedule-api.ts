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
  windowId: number;
  weekId: number;
  userId: number;
  volunteerName: string;
  shiftId: number;
  shiftName: string;
  workDate: string;       
  registeredAt: string;   
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

export async function createVolunteerScheduleWeek(body: {
  windowId: number;
  userId: number;
}) {
  return apiFetch<VolunteerScheduleWeekResDto>("/volunteer_schedule_weeks", {
    method: "POST",
    body: JSON.stringify({
      windowId: body.windowId,
      userId: body.userId,
    }),
  });
}

export async function submitVolunteerScheduleWeek(weekId: number) {
  return apiFetch<VolunteerScheduleWeekResDto>(
    `/volunteer_schedule_weeks/${weekId}/submit`,
    {
      method: "PATCH", 
    }
  );
}

export async function fetchVolunteerSchedules() {
  return apiFetch<VolunteerScheduleResDto[]>("/volunteer_schedules");
}

export async function fetchVolunteerSchedulesByWindow(windowId: number) {
  return apiFetch<VolunteerScheduleResDto[]>(`/volunteer_schedules/window/${windowId}`);
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
  return apiFetch<string>(`/volunteer_schedules/${scheduleId}`, {
    method: "DELETE",
  });
}

export async function loadMyScheduleBundleReal(userId: number) {
  const [shifts, windows, weeks, allSchedules] = await Promise.all([
    fetchShifts(),
    fetchScheduleWindows(),
    fetchScheduleWeeks(),
    fetchVolunteerSchedules()
  ]);

  const myWeeks = weeks.filter((w: any) => w.userId === userId);
  const mySchedules = allSchedules.filter((s: any) => s.userId === userId);

  return {
    shifts,
    windows,
    weeks: myWeeks,
    shiftsRegistered: mySchedules
  };
}

export async function createVolunteerScheduleWindow(body: {
  weekStartDate: string;
  status: string;
}) {
  const res = await apiFetch<any>("/volunteer_schedule_windows", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res?.data;
}

export async function updateVolunteerScheduleWindow(windowId: number, body: {
  weekStartDate: string;
  status: string;
}) {
  const res = await apiFetch<any>(`/volunteer_schedule_windows/${windowId}`, {
    method: "PUT", 
    body: JSON.stringify(body),
  });
  return res?.data;
}

export async function approveVolunteerWeek(weekId: number) {
  return await apiFetch<any>(`/volunteer_schedule_weeks/${weekId}/approve`, {
    method: "PUT",
  });
}

export async function rejectVolunteerWeek(weekId: number, reason: string) {
  return await apiFetch<any>(`/volunteer_schedule_weeks/${weekId}/reject`, {
    method: "PUT",
    body: JSON.stringify({ rejectionReason: reason }), 
  });
}