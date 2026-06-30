import { apiFetch } from "@/lib/api-client";

export type LoginResDto = {
  token: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
};

export type RegisterBody = {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
};

export async function loginWithEmail(email: string, password: string) {
  return apiFetch<LoginResDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ 
      username: email.trim(), 
      password: password 
    }),
  });
}

export async function registerAccount(body: RegisterBody) {
  return apiFetch<boolean>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username: body.username.trim(),
      password: body.password,
      fullName: body.fullName.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || undefined,
    }),
  });
}