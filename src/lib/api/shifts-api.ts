import { apiFetch } from "@/lib/api-client";

export type ShiftResDto = {
  shiftId: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
};

export type ShiftReq = {
  shiftName: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
};

export async function fetchShifts() {
  return apiFetch<ShiftResDto[]>("/shifts");
}

export async function createShift(req: ShiftReq) {
  return apiFetch<ShiftResDto>("/shifts", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function updateShift(id: number, req: ShiftReq) {
  return apiFetch<ShiftResDto>(`/shifts/${id}`, {
    method: "PUT", // Trùng khớp với @PutMapping("/{id}") bên Spring Boot của bạn
    body: JSON.stringify(req),
  });
}

export async function deleteShift(id: number) {
  return apiFetch<string>(`/shifts/${id}`, {
    method: "DELETE", // Trùng khớp với @DeleteMapping("/{id}") bên Spring Boot của bạn
  });
}