import { Navigate, Outlet, useLocation } from "react-router-dom";
import { canAccessAdmin, getStoredAdmin } from "@/lib/admin-auth";

export function RequireAdmin() {
  const user = getStoredAdmin();
  const location = useLocation();

  if (!user || !canAccessAdmin(user.role)) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
