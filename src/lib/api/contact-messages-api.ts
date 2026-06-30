import { apiFetch } from "@/lib/api-client";

export type ContactMessageResDto = {
  messageId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export async function fetchContactMessages() {
  return apiFetch<ContactMessageResDto[]>("/contact_messages");
}

export async function updateContactMessageStatus(
  id: number,
  status: string
) {
  return apiFetch<ContactMessageResDto>(
    `/contact_messages/${id}?status=${status}`,
    {
      method: "PUT",
    }
  );
}