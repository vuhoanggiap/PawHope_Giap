import { loginWithEmail } from "@/lib/api/auth-api";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { clearAuthToken, setAuthToken } from "@/lib/auth-session";

export type StaffRole = "ADMIN" | "VOLUNTEER";

export interface AdminUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: StaffRole;
}

const SESSION_KEY = "pawshope_admin_session";

const DEMO_ACCOUNTS: Record<string, { password: string; user: AdminUser }> = {
  admin: {
    password: "admin123",
    user: {
      userId: 1,
      username: "admin",
      fullName: "System Admin",
      email: "admin@pawshope.net",
      role: "ADMIN",
    },
  },
  volunteer1: {
    password: "volunteer123",
    user: {
      userId: 2,
      username: "volunteer1",
      fullName: "Lan Nguyen",
      email: "volunteer1@pawshope.net",
      role: "VOLUNTEER",
    },
  },
};

export function canAccessAdmin(role?: string) {
  const r = role?.toUpperCase();
  return r === "ADMIN" || r === "VOLUNTEER";
}

export function isAdmin(role?: string) {
  return role?.toUpperCase() === "ADMIN";
}

function staffFromRole(role: string): StaffRole | null {
  const r = role.toUpperCase();
  if (r === "ADMIN" || r === "VOLUNTEER") return r;
  return null;
}

function loginIdentifierToEmail(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return trimmed;
  const demo = DEMO_ACCOUNTS[trimmed.toLowerCase()];
  return demo?.user.email ?? trimmed;
}

export async function loginAdmin(
  identifier: string,
  password: string
): Promise<AdminUser | null> {
  const key = identifier.trim().toLowerCase();

  if (USE_MOCK) {
    const account = DEMO_ACCOUNTS[key];
    if (!account || account.password !== password) return null;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(account.user));
    return account.user;
  }

  const email = loginIdentifierToEmail(identifier);
  try {
    const res = await loginWithEmail(email, password);
    const role = staffFromRole(res.role);
    if (!role) {
      throw new ApiError(
        "This account is not staff (ADMIN or VOLUNTEER). Use the public login page."
      );
    }
    setAuthToken(res.token);
    const user: AdminUser = {
      userId: res.userId,
      username: res.username,
      fullName: res.fullName,
      email: res.email,
      role,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      `Lost connection to the server. Please try again in a few minutes.`
    );
  }
}

export function getStoredAdmin(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
  clearAuthToken();
}