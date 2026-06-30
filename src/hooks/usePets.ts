import { useCallback, useEffect, useState } from "react";
import type { MockPet } from "@/data/mock";
import { mockPets } from "@/data/mock";
import { USE_MOCK, apiFetch, ApiError } from "@/lib/api-client";


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
      const data = await apiFetch<any[]>("/pets/adoptable");
      
      const formattedPets: MockPet[] = data.map((pet: any) => ({
        ...pet,
        id: pet.id || pet.petId,
        breed: pet.breed || "Unknown",
        ageYears: pet.ageMonths ? Math.round((pet.ageMonths / 12) * 10) / 10 : 0,
        imageUrl: pet.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500",
        description: pet.description || "No information available yet.."
      } as MockPet));

      setPets(formattedPets);
    } catch (e: any) {
      setError(e instanceof ApiError ? e.message : "Unable to load the list of pets.");
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

export function useAllPets() {
  const [pets, setPets] = useState<MockPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiFetch<any[]>("/pets");
      
      const formattedPets: MockPet[] = data.map((pet: any) => ({
        ...pet,
        id: pet.id || pet.petId,
        breed: pet.breed || "Unknown",
        ageYears: pet.ageMonths ? Math.round((pet.ageMonths / 12) * 10) / 10 : 0,
        imageUrl: pet.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500",
        description: pet.description || "No information available yet.."
      } as MockPet));

      setPets(formattedPets);
    } catch (e: any) {
      setError(e instanceof ApiError ? e.message : "Unable to load the list of pets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllPets();
  }, [fetchAllPets]);

  return { pets, loading, error, refetch: fetchAllPets };
}