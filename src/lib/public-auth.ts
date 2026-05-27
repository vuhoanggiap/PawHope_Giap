import { USE_MOCK } from "@/lib/api-client";
import { registerUser, updateUser } from "@/lib/api/users-api";

export type PublicRole = "USER";

export interface PublicUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: PublicRole;
}

const SESSION_KEY = "pawshope_public_session";
const USERS_KEY = "pawshope_public_users";
const API_CREDENTIALS_KEY = "pawshope_api_credentials";

const DEMO_ACCOUNTS: Record<string, { password: string; user: PublicUser }> = {
  user1: {
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

type ApiCredential = { password: string; user: PublicUser };

function loadApiCredentials(): Record<string, ApiCredential> {
  return readJson<Record<string, ApiCredential>>(API_CREDENTIALS_KEY, {});
}

function saveApiCredential(username: string, password: string, user: PublicUser) {
  const all = loadApiCredentials();
  all[username.toLowerCase()] = { password, user };
  writeJson(API_CREDENTIALS_KEY, all);
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

export function loginPublic(username: string, password: string): PublicUser | null {
  const key = username.trim().toLowerCase();
  const demo = DEMO_ACCOUNTS[key];
  if (demo && demo.password === password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(demo.user));
    return demo.user;
  }
  if (!USE_MOCK) {
    const apiUser = loadApiCredentials()[key];
    if (apiUser && apiUser.password === password) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(apiUser.user));
      return apiUser.user;
    }
  }
  const registered = loadRegisteredUsers().find((u) => u.username.toLowerCase() === key);
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
  if (!username || input.password.length < 6) return null;
  if (DEMO_ACCOUNTS[username]) return null;

  if (!USE_MOCK) {
    if (username.length < 5) return null;
    try {
      const user = await registerUser({
        username,
        passwordHash: input.password,
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        phone: input.phone?.trim(),
      });
      saveApiCredential(username, input.password, user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  }

  const users = loadRegisteredUsers();
  if (users.some((u) => u.username.toLowerCase() === username || u.email === input.email.trim())) {
    return null;
  }
  const user: StoredUser = {
    userId: Date.now(),
    username,
    fullName: input.fullName.trim(),
    email: input.email.trim(),
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
      /* local fallback */
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
}
