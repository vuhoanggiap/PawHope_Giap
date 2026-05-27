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

export async function updateKennel(kennelId: number, body: Omit<KennelResDto, "kennelId">) {
  return apiFetch<KennelResDto>(`/kennels/${kennelId}`, {
    method: "PUT",
    body: JSON.stringify({
      kennelId,
      name: body.name,
      capacity: body.capacity,
      description: body.description,
    }),
  });
}
