import { clearAuthToken, getAuthToken } from "@/lib/auth-session";

/** Spring Boot API — set VITE_API_URL and VITE_USE_MOCK=false when backend is live. */
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8082/api/v1";
export const USE_MOCK = false;

/** Backend success code (StatusCode.SUCCESS). */
export const API_SUCCESS_CODE = "0000";

export type ApiResponse<T> = {
  code: string;
  messenge: string;
  data: T;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401 && token) {
    clearAuthToken();
  }

  // 1. Đọc dữ liệu thô (Text) để tránh sập (Crash) khi parse JSON
  const rawText = await res.text();
  let body: any = null;

  if (rawText) {
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      // Nếu không phải JSON mà HTTP 200 OK -> Trả thẳng về chuỗi thô
      if (res.ok) return rawText as any;
      throw new ApiError("Lỗi định dạng dữ liệu từ Server", undefined, res.status);
    }
  } else if (res.ok) {
    // Nếu Backend trả về rỗng hoàn toàn nhưng 200 OK -> Tính là true
    return true as any; 
  }

  // 2. Bắt các lỗi HTTP Status đỏ (400, 500)
  if (!res.ok) {
    throw new ApiError(body?.messenge ?? `API Error ${res.status}`, body?.code, res.status);
  }

  // 3. Xử lý thông minh cấu trúc ResponseHandler của Spring Boot
  if (body && typeof body === "object" && "code" in body) {
    // Tập hợp các mã có thể coi là thành công
    const successCodes = [API_SUCCESS_CODE, "200", "0", "SUCCESS"];
    
    // Nếu mã Code không nằm trong danh sách thành công -> Báo lỗi
    if (!successCodes.includes(String(body.code).toUpperCase())) {
      throw new ApiError(body.messenge ?? "Yêu cầu bị từ chối", String(body.code), res.status);
    }

    // 🎯 ĐÂY LÀ CHÌA KHÓA: Trị tận gốc bẫy "data: null"
    // Nếu Backend thành công nhưng data rỗng, ép trả về true để Context React không bị nhận false oan uổng
    if (body.data === null || body.data === undefined) {
      return true as any;
    }

    return body.data as T;
  }

  // 4. Nếu là cấu trúc lạ, trả về nguyên bản
  return body as T;
}