import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client";

export interface AdoptionHandover {
  handoverId: number;
  adoptionId: number;
  staffId: number;
  handoverMethod: string; 
  pickupDatetime: string;
  pickupLocation: string;
  status: string; 
  adopterConfirmed: boolean;
  itemsGiven: string;
  note: string;
  createdAt: string;
  staffName?: string; 
}

export function useAdoptionHandovers() {
  const [handovers, setHandovers] = useState<AdoptionHandover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHandovers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AdoptionHandover[]>("/adoption_handovers");
      setHandovers(data);
    } catch (e: any) {
      setError(e instanceof ApiError ? e.message : "Unable to load the handover list.");
    } finally {
      setLoading(false);
    }
  }, []);

  const completeHandover = async (id: number, completionNote: string = "") => {
    try {
      const safeNote = encodeURIComponent(completionNote);
      await apiFetch(`/adoption_handovers/${id}/complete?completionNote=${safeNote}`, {
        method: "PATCH",
      });
      await fetchHandovers();
      return true;
    } catch (e) {
      console.error("Error completing handover:", e);
      return false;
    }
  };

  useEffect(() => {
    void fetchHandovers();
  }, [fetchHandovers]);

  return { 
    handovers, 
    loading, 
    error, 
    refetch: fetchHandovers, 
    completeHandover 
  };
}