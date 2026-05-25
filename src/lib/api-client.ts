/** Ready for team API — set VITE_API_URL and VITE_USE_MOCK=false when backend is live. */
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}
