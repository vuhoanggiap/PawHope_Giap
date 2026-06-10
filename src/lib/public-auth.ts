import { loginWithEmail, registerAccount } from "@/lib/api/auth-api";
import { USE_MOCK } from "@/lib/api-client";
import { updateUser } from "@/lib/api/users-api";
import { clearAuthToken, setAuthToken } from "@/lib/auth-session";

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

function saveSession(user: PublicUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function loginIdentifierToEmail(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return trimmed;
  const demo = DEMO_ACCOUNTS[trimmed.toLowerCase()];
  return demo?.user.email ?? trimmed;
}

export async function loginPublic(
  identifier: string,
  password: string
): Promise<PublicUser | null> {
  const key = identifier.trim().toLowerCase();

  if (USE_MOCK) {
    const demo = DEMO_ACCOUNTS[key];
    if (demo && demo.password === password) {
      saveSession(demo.user);
      return demo.user;
    }
    const registered = loadRegisteredUsers().find(
      (u) => u.username.toLowerCase() === key || u.email.toLowerCase() === key
    );
    if (registered && registered.password === password) {
      const { password: _, ...user } = registered;
      saveSession(user);
      return user;
    }
    return null;
  }

  const email = loginIdentifierToEmail(identifier);
  try {
    const res = await loginWithEmail(email, password);
    if (res.role?.toUpperCase() !== "USER") return null;
    setAuthToken(res.token);
    const user: PublicUser = {
      userId: res.userId,
      username: res.username,
      fullName: res.fullName,
      email: res.email,
      phone: res.phone,
      role: "USER",
    };
    saveSession(user);
    return user;
  } catch {
    return null;
  }
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
    if (username.length < 5) return null;
    try {
      await registerAccount({
        username,
        password: input.password,
        fullName: input.fullName.trim(),
        email,
        phone: input.phone?.trim(),
      });
      return loginPublic(email, input.password);
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
  saveSession(session);
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
      saveSession(fromApi);
      return fromApi;
    } catch {
      /* local fallback */
    }
  }

  saveSession(updated);
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
  clearAuthToken();
}

export function looksLikeBrokenEncoding(text: string): boolean {
  return /[β╖╣╗╝]|Ã©|Ã¨|Ã­|Ã³|Ãº|Ã |Â©|â€|á»|áº/.test(text);
}
