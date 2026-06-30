import { apiFetch } from "@/lib/api-client";

export type VolunteerApplicationBody = {
  userId?: number;
  full_name: string;             
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
  has_transport?: number;         
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

export type VolunteerInterviewResDto = {
  interviewId: number;
  applicationId: number;
  interviewerId: number;
  interviewerName: string;
  interviewDatetime: string;
  meetingType: string;
  meetingLink?: string;
  locationText?: string;
  status: string;
  result: string;
  evaluationNote?: string;
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

export async function updateApplicationStatusApi(
  id: number, 
  status: string, 
  reviewerId: number, 
  rejectionReason?: string
) {
  const reasonParam = rejectionReason ? `&rejectionReason=${encodeURIComponent(rejectionReason)}` : "";
  return apiFetch<VolunteerApplicationResDto>(
    `/volunteer_applications/${id}/status?status=${status}&reviewerId=${reviewerId}${reasonParam}`,
    { method: "PATCH" }
  );
}

export async function updateInterviewResultApi(
  id: number, 
  result: string, 
  evaluationNote?: string
) {
  const noteParam = evaluationNote ? `&evaluationNote=${encodeURIComponent(evaluationNote)}` : "";
  return apiFetch<any>(
    `/volunteer_interviews/${id}/result?result=${result}${noteParam}`,
    { method: "PATCH" }
  );
}

export async function fetchVolunteerInterviews() {
  return apiFetch<VolunteerInterviewResDto[]>(
    "/volunteer_interviews"
  );
}

export async function createVolunteerInterview(body: {
  applicationId: number;
  interviewerId: number;
  interviewDatetime: string;
  meetingType: string;
  meetingLink?: string;
  locationText?: string;
  status?: string;
}) {
  return apiFetch<VolunteerInterviewResDto>(
    "/volunteer_interviews",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export async function updateVolunteerInterview(
  id: number,
  body: any
) {
  return apiFetch<VolunteerInterviewResDto>(
    `/volunteer_interviews/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}

export async function updateInterviewStatusApi(
  id: number,
  status: string
) {
  return apiFetch(
    `/volunteer_interviews/${id}/status?status=${status}`,
    {
      method: "PATCH",
    }
  );
}

export async function deleteVolunteerInterview(
  id:number
){
  return apiFetch(
      `/volunteer_interviews/${id}`,
      {
          method:"DELETE"
      }
  );
}