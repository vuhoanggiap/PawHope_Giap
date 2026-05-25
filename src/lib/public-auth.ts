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
};

interface StoredUser extends PublicUser {
  password: string;
}

function loadRegisteredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loginPublic(username: string, password: string): PublicUser | null {
  const key = username.trim().toLowerCase();
  const demo = DEMO_ACCOUNTS[key];
  if (demo && demo.password === password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(demo.user));
    return demo.user;
  }
  const registered = loadRegisteredUsers().find((u) => u.username.toLowerCase() === key);
  if (registered && registered.password === password) {
    const { password: _, ...user } = registered;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function registerPublic(input: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
}): PublicUser | null {
  const username = input.username.trim().toLowerCase();
  if (!username || input.password.length < 6) return null;
  if (DEMO_ACCOUNTS[username]) return null;
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

export function updatePublicProfile(patch: Partial<Pick<PublicUser, "fullName" | "email" | "phone">>) {
  const current = getStoredPublicUser();
  if (!current) return null;
  const updated = { ...current, ...patch };
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
