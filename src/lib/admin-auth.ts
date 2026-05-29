import { apiFetch } from "@/lib/api-client";

export type StaffRole = "ADMIN" | "VOLUNTEER";

export interface AdminUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: StaffRole;
}

type LoginResDto = {
  token: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
};

const SESSION_KEY = "pawshope_admin_session";
const ACCESS_TOKEN_KEY = "accessToken";

export function canAccessAdmin(role?: string) {
  const r = role?.toUpperCase();
  return r === "ADMIN" || r === "VOLUNTEER";
}

export function isAdmin(role?: string) {
  return role?.toUpperCase() === "ADMIN";
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser | null> {
  try {
    const res = await apiFetch<LoginResDto>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!canAccessAdmin(res.role)) return null;

    localStorage.setItem(ACCESS_TOKEN_KEY, res.token);

    const user: AdminUser = {
      userId: res.userId,
      username: res.username,
      fullName: res.fullName,
      email: res.email,
      role: res.role as StaffRole,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

export function getStoredAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}