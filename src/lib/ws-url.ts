/** WebSocket endpoint derived from VITE_API_URL (e.g. http://localhost:8082/ws). */
export function getWsUrl(): string {
  const api = import.meta.env.VITE_API_URL ?? "http://localhost:8082/api/v1";
  const origin = api.replace(/\/api\/v1\/?$/, "");
  return `${origin}/ws`;
}
