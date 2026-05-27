import { apiFetch } from "@/lib/api-client";
import { mapAdoptionRes, type AdoptionResDto } from "@/lib/api/mappers";
import type { PublicAdoption } from "@/data/public-mock";
import { fetchPetById } from "@/lib/api/pets-api";

export type CreateAdoptionBody = {
  petId: number;
  userId: number;
  housingType?: string;
  reason?: string;
};

async function enrichAdoption(dto: AdoptionResDto): Promise<PublicAdoption> {
  try {
    const pet = await fetchPetById(dto.petId);
    return mapAdoptionRes(dto, { name: pet.name, imageUrl: pet.imageUrl });
  } catch {
    return mapAdoptionRes(dto);
  }
}

export async function fetchAdoptionsByUser(userId: number): Promise<PublicAdoption[]> {
  const list = await apiFetch<AdoptionResDto[]>(`/adoptions/user/${userId}`);
  return Promise.all(list.map(enrichAdoption));
}

export async function fetchAdoptionById(adoptionId: number): Promise<PublicAdoption> {
  const dto = await apiFetch<AdoptionResDto>(`/adoptions/${adoptionId}`);
  return enrichAdoption(dto);
}

export async function createAdoption(body: CreateAdoptionBody): Promise<PublicAdoption> {
  const dto = await apiFetch<AdoptionResDto>("/adoptions", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return enrichAdoption(dto);
}

export async function fetchAllAdoptions() {
  return apiFetch<AdoptionResDto[]>("/adoptions");
}

export async function approveAdoption(adoptionId: number, processedBy: number) {
  return apiFetch<AdoptionResDto>(
    `/adoptions/${adoptionId}/approve?processedBy=${processedBy}`,
    { method: "PATCH" }
  );
}

export async function rejectAdoption(adoptionId: number, processedBy: number, note?: string) {
  const q = new URLSearchParams({ processedBy: String(processedBy) });
  if (note) q.set("note", note);
  return apiFetch<AdoptionResDto>(`/adoptions/${adoptionId}/reject?${q}`, { method: "PATCH" });
}

export async function updateAdoptionPaymentStatus(adoptionId: number, paymentStatus: string) {
  return apiFetch<AdoptionResDto>(
    `/adoptions/${adoptionId}/payment-status?paymentStatus=${encodeURIComponent(paymentStatus)}`,
    { method: "PATCH" }
  );
}

export async function completeAdoption(adoptionId: number) {
  return apiFetch<AdoptionResDto>(`/adoptions/${adoptionId}/complete`, { method: "PATCH" });
}

export async function cancelAdoption(adoptionId: number) {
  return apiFetch<AdoptionResDto>(`/adoptions/${adoptionId}/cancel`, { method: "PATCH" });
}
