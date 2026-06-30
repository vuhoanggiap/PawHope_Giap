import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client";

export interface AdoptionMeeting {
  meetingId: number;
  adoptionId: number;
  staffId: number;
  meetingDatetime: string;
  meetingLocation: string;
  status: string; 
  result: string;
  housingCheckResult: string;
  experienceEvaluation: string;
  note: string;
  createdAt: string;
}

export function useAdoptionMeetings() {
  const [meetings, setMeetings] = useState<AdoptionMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AdoptionMeeting[]>("/adoption_meetings");
      setMeetings(data);
    } catch (e: any) {
      setError(e instanceof ApiError ? e.message : "Unable to load the meeting list.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiFetch(`/adoption_meetings/${id}/status?status=${status}`, {
        method: "PATCH",
      });
      await fetchMeetings(); 
      return true;
    } catch (e) {
      console.error("Error updating meeting status:", e);
      return false;
    }
  };

  const updateResult = async (id: number, result: string, note: string = "") => {
    try {
      const safeNote = encodeURIComponent(note);
      await apiFetch(`/adoption_meetings/${id}/result?result=${result}&note=${safeNote}`, {
        method: "PATCH",
      });
      await fetchMeetings(); 
      return true;
    } catch (e) {
      console.error("Error updating meeting result:", e);
      return false;
    }
  };

  useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

    const requestReschedule = async (id: number, proposedSlots: string) => {
    try {
      await apiFetch(`/adoption_meetings/${id}/reschedule_request`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposedSlots), 
      });
      return true;
    } catch (e) {
      console.error("Error sending reschedule request:", e);
      return false;
    }
  };

  return { 
    meetings, 
    loading, 
    error, 
    refetch: fetchMeetings, 
    updateStatus, 
    updateResult,
    requestReschedule
  };
}