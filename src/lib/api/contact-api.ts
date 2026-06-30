import { apiFetch } from "@/lib/api-client";

export type ContactMessageBody = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function submitContactMessage(body: ContactMessageBody) {
  return apiFetch<any>("/contact_messages", {
    method: "POST",
    body: JSON.stringify(body),
  });
}