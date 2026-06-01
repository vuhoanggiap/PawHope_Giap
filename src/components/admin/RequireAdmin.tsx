import { Navigate, Outlet, useLocation } from "react-router-dom";
import { USE_MOCK } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-session";
import { canAccessAdmin, clearAdminSession, getStoredAdmin } from "@/lib/admin-auth";
import { looksLikeBrokenEncoding } from "@/lib/public-auth";

export function RequireAdmin() {
  const user = getStoredAdmin();
  const location = useLocation();

  if (!USE_MOCK && user && !getAuthToken()) {
    clearAdminSession();
  }

  if (
    user &&
    (looksLikeBrokenEncoding(user.fullName) || looksLikeBrokenEncoding(user.email))
  ) {
    clearAdminSession();
  }

  if (!user || !canAccessAdmin(user.role) || (!USE_MOCK && !getAuthToken())) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
