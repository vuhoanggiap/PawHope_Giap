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

/**
 * Sử dụng lại apiFetch gốc của dự án nhưng đổi tên trường gửi đi thành 'username'
 * Đã sửa từ 'public' thành 'export' để đúng cú pháp TypeScript
 */
export async function loginWithEmail(email: string, password: string) {
  return apiFetch<LoginResDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ 
      username: email.trim(), // KHỚP 100% VỚI 'private String username' trong LoginReq của Java
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