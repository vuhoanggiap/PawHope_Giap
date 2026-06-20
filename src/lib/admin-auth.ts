import { loginWithEmail } from "@/lib/api/auth-api";
import { ApiError, API_BASE, USE_MOCK } from "@/lib/api-client";
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

// Hàm này tự chuyển đổi các chữ rút gọn thành email mẫu.
// 🛠️ BẠN CÓ THỂ ĐỔI "admin@pawshope.net" THÀNH EMAIL THẬT TRONG DB CỦA BẠN TẠI ĐÂY
function loginIdentifierToEmail(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return trimmed;
  
  // Nếu gõ "admin", đổi thành email tương ứng (Hãy chỉnh lại cho khớp với email admin trong DB của bạn)
  if (trimmed.toLowerCase() === "admin") return "admin@pawshope.com"; 
  
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
    localStorage.setItem(SESSION_KEY, JSON.stringify(account.user));
    return account.user;
  }

  const email = loginIdentifierToEmail(identifier);
  try {
    // 1. Gọi hàm fetch sang Spring Boot
    const res = await loginWithEmail(email, password);
    
    // 2. Không dùng res.data nữa, sử dụng trực tiếp res vì hệ thống đã tự bóc tách lớp vỏ API
    const role = staffFromRole(res.role);
    if (!role) {
      throw new ApiError(
        "This account is not staff (ADMIN or VOLUNTEER). Use the public login page."
      );
    }
    
    // 3. Lưu Token vào Session bảo mật
    setAuthToken(res.token);
    
    // 4. Đồng bộ map dữ liệu sang Interface React
    const user: AdminUser = {
      userId: res.userId,
      username: res.username,
      fullName: res.fullName, // Nếu Java trả về full_name thì đổi thành res.full_name
      email: res.email,
      role,
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      `Cannot reach API at ${API_BASE}. Start Spring Boot and MySQL, then try again.`
    );
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
  clearAuthToken();
}