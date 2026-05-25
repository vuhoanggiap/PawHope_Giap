import {
  LayoutDashboard,
  LifeBuoy,
  Dog,
  Warehouse,
  HeartHandshake,
  Wallet,
  ShoppingBag,
  Receipt,
  Users,
  UserPlus,
  Bell,
  PawPrint,
  LogOut,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearAdminSession, getStoredAdmin, type StaffRole } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  onlyRoles?: StaffRole[];
};

const allLinks: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/rescue", label: "Rescue", icon: LifeBuoy },
  { to: "/admin/pets", label: "Pets", icon: Dog },
  { to: "/admin/kennels", label: "Kennels", icon: Warehouse },
  { to: "/admin/adoptions", label: "Adoptions", icon: HeartHandshake },
  { to: "/admin/donations", label: "Donations", icon: Wallet },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, onlyRoles: ["ADMIN"] },
  { to: "/admin/expenses", label: "Expenses", icon: Receipt, onlyRoles: ["ADMIN"] },
  { to: "/admin/users", label: "Users", icon: Users, onlyRoles: ["ADMIN"] },
  { to: "/admin/volunteers", label: "Volunteers", icon: UserPlus, onlyRoles: ["ADMIN"] },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
];

function linksForRole(role?: string) {
  if (!role) return allLinks.filter((l) => !l.onlyRoles);
  const r = role.toUpperCase() as StaffRole;
  if (r !== "ADMIN" && r !== "VOLUNTEER") return allLinks.filter((l) => !l.onlyRoles);
  return allLinks.filter((l) => !l.onlyRoles || l.onlyRoles.includes(r));
}

interface AdminSidebarProps {
  mobileOpen: boolean;
  onNavigate: () => void;
}

export function AdminSidebar({ mobileOpen, onNavigate }: AdminSidebarProps) {
  const navigate = useNavigate();
  const user = getStoredAdmin();
  const links = linksForRole(user?.role);

  function logout() {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  }

  return (
    <aside
      className={cn(
        "admin-sidebar fixed top-0 z-50 flex h-screen w-64 shrink-0 flex-col transition-transform duration-300 md:sticky md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.06] p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2c5f51] to-[#234a40] shadow-lg shadow-[#2c5f51]/20">
          <PawPrint className="h-6 w-6 fill-[#f6931d] text-[#f6931d]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-wide text-white">PAWSHOPENET</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f6931d]">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => cn("admin-nav-link", isActive && "admin-nav-link-active")}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/[0.06] p-3">
        {user ? (
          <div className="admin-user-chip">
            <p className="truncate font-semibold text-slate-100">{user.fullName}</p>
            <p className="truncate text-slate-500">{user.role}</p>
          </div>
        ) : null}
        <Link
          to="/"
          className="admin-nav-link"
          onClick={onNavigate}
        >
          <ExternalLink className="h-4 w-4" />
          Public site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="admin-nav-link w-full text-red-400 hover:bg-red-950/30 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
