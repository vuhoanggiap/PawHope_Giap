import { clearAdminSession } from "@/lib/admin-auth";
import { clearAuthToken } from "@/lib/auth-session";
import { clearPublicSession } from "@/lib/public-auth";

/** Bump when encoding/session shape changes — clears stale localStorage text. */
const SESSION_ENCODING_VERSION = 2;
const VERSION_KEY = "pawshope_encoding_v";

export function migrateEncodingSessions() {
  try {
    if (localStorage.getItem(VERSION_KEY) === String(SESSION_ENCODING_VERSION)) return;
    clearPublicSession();
    clearAdminSession();
    clearAuthToken();
    localStorage.setItem(VERSION_KEY, String(SESSION_ENCODING_VERSION));
  } catch {
    /* ignore */
  }
}
