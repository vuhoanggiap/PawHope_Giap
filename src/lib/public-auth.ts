import { apiFetch, USE_MOCK } from "@/lib/api-client";
import { registerUser, updateUser } from "@/lib/api/users-api";

export type PublicRole = "USER" | "VOLUNTEER" | "ADMIN";

export interface PublicUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: PublicRole;
}

type LoginResDto = {
  token: string;
  userId?: number;
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: PublicRole;
};

const SESSION_KEY = "pawshope_public_session";
const USERS_KEY = "pawshope_public_users";
const ACCESS_TOKEN_KEY = "accessToken";

const DEMO_ACCOUNTS: Record<string, { password: string; user: PublicUser }> = {
  "jane@example.com": {
    password: "user123",
    user: {
      userId: 101,
      username: "user1",
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+84 912 345 678",
      role: "USER",
    },
  },
};

interface StoredUser extends PublicUser {
  password: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadRegisteredUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_KEY, []);
}

function saveRegisteredUsers(users: StoredUser[]) {
  writeJson(USERS_KEY, users);
}

// ============== SỬA LẠI ĐỂ GỬI USERNAME LÊN BE ==============
export async function loginPublic(emailOrUsername: string, password: string): Promise<PublicUser | null> {
  const key = emailOrUsername.trim().toLowerCase();

  if (!USE_MOCK) {
    try {
      const res = await apiFetch<LoginResDto>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: key, // Sửa 'email' thành 'username' để khớp với Spring Boot
          password,
        }),
      });

      localStorage.setItem(ACCESS_TOKEN_KEY, res.token);

      const user: PublicUser = {
        userId: res.userId ?? 0,
        username: res.username ?? key,
        fullName: res.fullName ?? res.username ?? key,
        email: res.email ?? key,
        phone: res.phone,
        role: res.role ?? "USER",
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  }

  // Luồng Mock
  const demo = DEMO_ACCOUNTS[key];
  if (demo && demo.password === password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(demo.user));
    return demo.user;
  }

  const registered = loadRegisteredUsers().find((u) => u.email.toLowerCase() === key || u.username.toLowerCase() === key);
  if (registered && registered.password === password) {
    const { password: _, ...user } = registered;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  return null;
}

export async function registerPublic(input: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
}): Promise<PublicUser | null> {
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();

  if (!username || input.password.length < 6) return null;

  if (!USE_MOCK) {
    try {
      const user = await registerUser({
        username,
        passwordHash: input.password,
        fullName: input.fullName.trim(),
        email,
        phone: input.phone?.trim(),
      });

      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  }

  const users = loadRegisteredUsers();

  if (users.some((u) => u.username.toLowerCase() === username || u.email.toLowerCase() === email)) {
    return null;
  }

  const user: StoredUser = {
    userId: Date.now(),
    username,
    fullName: input.fullName.trim(),
    email,
    phone: input.phone?.trim(),
    role: "USER",
    password: input.password,
  };

  users.push(user);
  saveRegisteredUsers(users);

  const { password: _, ...session } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getStoredPublicUser(): PublicUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

export async function updatePublicProfile(
  patch: Partial<Pick<PublicUser, "fullName" | "email" | "phone">>
): Promise<PublicUser | null> {
  const current = getStoredPublicUser();
  if (!current) return null;

  const updated = { ...current, ...patch };

  if (!USE_MOCK) {
    try {
      const fromApi = await updateUser(current.userId, {
        username: current.username,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
      });

      localStorage.setItem(SESSION_KEY, JSON.stringify(fromApi));
      return fromApi;
    } catch {
      // local fallback
    }
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));

  const users = loadRegisteredUsers();
  const idx = users.findIndex((u) => u.userId === current.userId);

  if (idx >= 0) {
    users[idx] = { ...users[idx], ...patch };
    saveRegisteredUsers(users);
  }

  return updated;
}

export function clearPublicSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}