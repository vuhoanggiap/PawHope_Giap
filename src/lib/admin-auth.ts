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

export function loginAdmin(username: string, password: string): AdminUser | null {
  const account = DEMO_ACCOUNTS[username.trim().toLowerCase()];
  if (!account || account.password !== password) return null;
  localStorage.setItem(SESSION_KEY, JSON.stringify(account.user));
  return account.user;
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
}
