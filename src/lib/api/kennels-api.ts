import { apiFetch } from "@/lib/api-client";

export type KennelResDto = {
  kennelId: number;
  name: string;
  capacity: number;
  description?: string;
};

export async function fetchKennels() {
  return apiFetch<KennelResDto[]>("/kennels");
}

export async function createKennel(body: {
  name: string;
  capacity: number;
  description?: string;
}) {
  return apiFetch<KennelResDto>("/kennels", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateKennel(
  kennelId: number,
  body: {
    name: string;
    capacity: number;
    description?: string;
  }
) {
  return apiFetch<KennelResDto>(`/kennels/${kennelId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteKennel(kennelId: number) {
  return apiFetch(`/kennels/${kennelId}`, {
    method: "DELETE",
  });
}