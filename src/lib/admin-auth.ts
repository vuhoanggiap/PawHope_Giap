import { apiFetch } from "@/lib/api-client";

export type StaffRole = "ADMIN" | "VOLUNTEER";

export interface AdminUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: StaffRole;
}

// Bổ sung thêm accessToken để đề phòng backend trả về tên biến khác
type LoginResDto = {
  token?: string; 
  accessToken?: string;
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

// Đổi tên tham số thành emailOrUsername cho chuẩn với UI
export async function loginAdmin(emailOrUsername: string, password: string): Promise<AdminUser | null> {
  try {
    const res = await apiFetch<LoginResDto>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ 
        username: emailOrUsername, // 👈 Đã đổi key thành 'username' để Spring Boot hiểu
        password: password 
      }),
    });

    // Nếu không có quyền Admin hoặc Volunteer thì từ chối
    if (!canAccessAdmin(res.role)) return null;

    // Lấy token (hỗ trợ cả 2 chuẩn tên biến thường gặp)
    const validToken = res.token || res.accessToken;
    if (validToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, validToken);
    }

    const user: AdminUser = {
      userId: res.userId,
      username: res.username,
      fullName: res.fullName,
      email: res.email,
      role: res.role as StaffRole,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Admin login error:", error);
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