import { apiFetch } from "@/lib/api-client";

export type EmailLogResDto = {
  emailId: number;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  body?: string;
  emailType: string;
  relatedTable?: string;
  relatedId?: number;
  status: string;
  errorMessage?: string;
  sentBy?: number;
  sentAt?: string;
};

export async function fetchEmailLogs() {
  return apiFetch<EmailLogResDto[]>("/email_logs");
}
