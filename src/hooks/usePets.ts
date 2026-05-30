import { useCallback, useEffect, useState } from "react";
import type { MockPet } from "@/data/mock";
import { mockPets } from "@/data/mock";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { fetchAdoptablePets } from "@/lib/api/pets-api";

export function useAdoptablePets() {
  const [pets, setPets] = useState<MockPet[]>(() => (USE_MOCK ? mockPets : []));
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (USE_MOCK) {
      setPets(mockPets);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setPets(await fetchAdoptablePets());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load pets");
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { pets, loading, error, reload };
}
