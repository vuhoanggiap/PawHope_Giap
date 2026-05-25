import { Navigate, Outlet } from "react-router-dom";
import { getStoredAdmin, type StaffRole } from "@/lib/admin-auth";

interface RequireRoleProps {
  roles: StaffRole[];
}

export function RequireRole({ roles }: RequireRoleProps) {
  const user = getStoredAdmin();
  const allowed = user && roles.includes(user.role);

  if (!allowed) {
    return <Navigate to="/admin" replace state={{ forbidden: true }} />;
  }

  return <Outlet />;
}
