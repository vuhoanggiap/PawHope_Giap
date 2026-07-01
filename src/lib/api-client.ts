import { clearAuthToken, getAuthToken } from "@/lib/auth-session";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";
export const USE_MOCK = false;

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
  return parseApiResponse<T>(`${API_BASE}${path}`, init, true);
}

export async function apiFetchFormData<T>(
  path: string,
  formData: FormData,
  method = "POST"
): Promise<T> {
  return parseApiResponse<T>(`${API_BASE}${path}`, { method, body: formData }, false);
}

async function parseApiResponse<T>(
  url: string,
  init: RequestInit | undefined,
  jsonBody: boolean
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = jsonBody
    ? {
        "Content-Type": "application/json",
        ...(init?.headers as Record<string, string> | undefined),
      }
    : { ...(init?.headers as Record<string, string> | undefined) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (res.status === 401 && token) {
    clearAuthToken();
  }

  const rawText = await res.text();
  let body: any = null;

  if (rawText) {
    try {
      body = JSON.parse(rawText);
    } catch {
      if (res.ok) return rawText as any;
      throw new ApiError("Data formatting error from the server", undefined, res.status);
    }
  } else if (res.ok) {
    return true as any;
  }

  if (!res.ok) {
    throw new ApiError(body?.messenge ?? `API Error ${res.status}`, body?.code, res.status);
  }

  if (body && typeof body === "object" && "code" in body) {
    const successCodes = [API_SUCCESS_CODE, "200", "0", "SUCCESS"];

    if (!successCodes.includes(String(body.code).toUpperCase())) {
      throw new ApiError(body.messenge ?? "Request rejected", String(body.code), res.status);
    }

    if (body.data === null || body.data === undefined) {
      return true as any;
    }

    return body.data as T;
  }

  return body as T;
}