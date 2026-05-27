import { apiFetch } from "@/lib/api-client";

export type PetMedicalRecordResDto = {
  medicalId: number;
  petId: number;
  recordType: string;
  recordDate?: string;
  nextDueDate?: string;
  description?: string;
  createdBy?: number;
  createdAt?: string;
};

export type PetStatusLogResDto = {
  logId: number;
  petId: number;
  oldStatus?: string;
  newStatus: string;
  note?: string;
  updatedBy?: number;
  updatedAt?: string;
};

export async function fetchPetMedicalRecords() {
  return apiFetch<PetMedicalRecordResDto[]>("/pet_medical_records");
}

export async function fetchPetMedicalByPet(petId: number) {
  return apiFetch<PetMedicalRecordResDto[]>(`/pet_medical_records/pet/${petId}`);
}

export async function fetchPetStatusLogs() {
  return apiFetch<PetStatusLogResDto[]>("/pet_status_logs");
}

export async function fetchPetStatusLogsByPet(petId: number) {
  return apiFetch<PetStatusLogResDto[]>(`/pet_status_logs/pet/${petId}`);
}
