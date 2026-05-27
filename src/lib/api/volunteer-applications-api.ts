import { apiFetch } from "@/lib/api-client";

export type VolunteerApplicationBody = {
  userId?: number;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  experienceWithAnimals?: string;
  reasonToJoin?: string;
  availableDays?: string;
  preferredTasks?: string;
};

export type VolunteerApplicationResDto = {
  applicationId: number;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  skills?: string;
  experienceWithAnimals?: string;
  reasonToJoin?: string;
  availableDays?: string;
  preferredTasks?: string;
  hasTransport?: boolean;
  status: string;
  reviewedBy?: number;
  reviewedAt?: string;
  rejectionReason?: string;
  appliedAt?: string;
};

export async function submitVolunteerApplication(body: VolunteerApplicationBody) {
  return apiFetch<VolunteerApplicationResDto>("/volunteer_applications", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchVolunteerApplications() {
  return apiFetch<VolunteerApplicationResDto[]>("/volunteer_applications");
}
