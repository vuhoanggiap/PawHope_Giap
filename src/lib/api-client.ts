import { clearAuthToken, getAuthToken } from "@/lib/auth-session";

/** Spring Boot API — set VITE_API_URL and VITE_USE_MOCK=false when backend is live. */
export const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

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

  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    if (!res.ok) {
      throw new ApiError(`API ${res.status}`, undefined, res.status);
    }
    throw new ApiError("Invalid JSON response", undefined, res.status);
  }

  if (!res.ok) {
    throw new ApiError(
      body?.messenge ?? `API ${res.status}`,
      body?.code,
      res.status
    );
  }

  if (body.code !== API_SUCCESS_CODE) {
    throw new ApiError(body.messenge ?? "Request failed", body.code, res.status);
  }

  return body.data;
}