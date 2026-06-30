import { apiFetch } from "@/lib/api-client";

export type VolunteerInterviewReq = {
  applicationId: number;
  interviewerId: number;
  interviewDatetime: string;
  meetingType: string;
  meetingLink?: string;
  locationText?: string;
  status?: string;
  result?: string;
  evaluationNote?: string;
};

export type VolunteerInterviewResDto = {
  interviewId: number;
  applicationId: number;
  interviewerId: number;
  interviewerName?: string;

  interviewDatetime: string;

  meetingType: string;

  meetingLink?: string;
  locationText?: string;

  status: string;
  result: string;

  evaluationNote?: string;
};

export async function fetchVolunteerInterviews() {
  return apiFetch<VolunteerInterviewResDto[]>(
    "/volunteer_interviews"
  );
}

export async function createVolunteerInterview(
  body: VolunteerInterviewReq
) {
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
  body: VolunteerInterviewReq
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
  return apiFetch<VolunteerInterviewResDto>(
    `/volunteer_interviews/${id}/status?status=${status}`,
    {
      method: "PATCH",
    }
  );
}

export async function updateInterviewResultApi(
  id: number,
  result: string,
  evaluationNote?: string
) {
  const note =
    evaluationNote
      ? `&evaluationNote=${encodeURIComponent(evaluationNote)}`
      : "";

  return apiFetch<VolunteerInterviewResDto>(
    `/volunteer_interviews/${id}/result?result=${result}${note}`,
    {
      method: "PATCH",
    }
  );
}