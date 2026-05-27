import { apiFetch } from "@/lib/api-client";

export type AdoptionFollowupResDto = {
  followupId: number;
  adoptionId: number;
  followupDate?: string;
  followupType?: string;
  status?: string;
  confirmedAt?: string;
  completedAt?: string;
  petCondition?: string;
  adopterFeedback?: string;
  staffNote?: string;
  photoUrl?: string;
  nextFollowupDate?: string;
  createdBy?: number;
  createdAt?: string;
};

export async function fetchFollowupsByAdoption(adoptionId: number) {
  return apiFetch<AdoptionFollowupResDto[]>(`/adoption_followups/adoption/${adoptionId}`);
}
