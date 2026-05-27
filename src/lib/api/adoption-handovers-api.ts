import { apiFetch } from "@/lib/api-client";

export type AdoptionHandoverResDto = {
  handoverId: number;
  adoptionId: number;
  handledBy?: number;
  pickupDatetime?: string;
  pickupLocation?: string;
  handoverMethod?: string;
  status?: string;
  adopterConfirmed?: boolean;
  itemsGiven?: string;
  handoverPhotoUrl?: string;
  completionNote?: string;
  completedAt?: string;
  createdAt?: string;
};

export async function fetchHandoversByAdoption(adoptionId: number) {
  return apiFetch<AdoptionHandoverResDto[]>(`/adoption_handovers/adoption/${adoptionId}`);
}
