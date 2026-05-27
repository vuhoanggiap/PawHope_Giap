import { apiFetch } from "@/lib/api-client";

export type AdoptionMeetingResDto = {
  meetingId: number;
  adoptionId: number;
  staffId?: number;
  meetingDatetime?: string;
  meetingLocation?: string;
  status?: string;
  result?: string;
  housingCheckResult?: string;
  experienceEvaluation?: string;
  note?: string;
  createdAt?: string;
};

export async function fetchMeetingsByAdoption(adoptionId: number) {
  return apiFetch<AdoptionMeetingResDto[]>(`/adoption_meetings/adoption/${adoptionId}`);
}
