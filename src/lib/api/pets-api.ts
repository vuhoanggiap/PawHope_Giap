import { apiFetch } from "@/lib/api-client";
import { mapPetRes, type PetResDto } from "@/lib/api/mappers";
import type { MockPet } from "@/data/mock";

export async function fetchPets(): Promise<MockPet[]> {
  const list = await apiFetch<PetResDto[]>("/pets");
  return list.map(mapPetRes);
}

export async function fetchPetById(petId: number): Promise<MockPet> {
  const dto = await apiFetch<PetResDto>(`/pets/${petId}`);
  return mapPetRes(dto);
}

export async function fetchAdoptablePets(): Promise<MockPet[]> {
  const list = await fetchPets();
  return list.filter((p) => p.status === "AVAILABLE_FOR_ADOPTION");
}
