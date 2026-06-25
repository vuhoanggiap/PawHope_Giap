import { useEffect, useState, useRef, memo } from "react"; // 🌟 Thêm useRef và memo
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LifeBuoy,
  Dog,
  Warehouse,
  HeartHandshake,
  Wallet,
  ShoppingBag,
  Package,
  Receipt,
  Users,
  UserPlus,
  Bell,
  PawPrint,
  LogOut,
  ExternalLink,
  Settings,
  Mail,
  CalendarDays,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import { clearAdminSession, getStoredAdmin, type StaffRole } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  onlyRoles?: StaffRole[];
  showBadge?: boolean;
};

const allLinks: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/rescue", label: "Rescue", icon: LifeBuoy },
  { to: "/admin/pets", label: "Pets", icon: Dog },
  { to: "/admin/kennels", label: "Kennels", icon: Warehouse },
  { to: "/admin/adoptions", label: "Adoptions", icon: HeartHandshake, showBadge: true },
  { to: "/admin/products", label: "Products", icon: Package, onlyRoles: ["ADMIN"] },
  { to: "/admin/donations", label: "Donations", icon: Wallet, onlyRoles: ["ADMIN"] },
  { to: "/admin/my-schedule", label: "My schedule", icon: CalendarCheck, onlyRoles: ["VOLUNTEER"] },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, onlyRoles: ["ADMIN"] },
  { to: "/admin/expenses", label: "Expenses", icon: Receipt, onlyRoles: ["ADMIN"] },
  { to: "/admin/users", label: "Users", icon: Users, onlyRoles: ["ADMIN"] },
  { to: "/admin/volunteers", label: "Volunteers", icon: UserPlus, onlyRoles: ["ADMIN"] },
  { to: "/admin/volunteer-schedule", label: "Schedule", icon: CalendarDays, onlyRoles: ["ADMIN"] },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings, onlyRoles: ["ADMIN"] },
  { to: "/admin/email-logs", label: "Email logs", icon: Mail, onlyRoles: ["ADMIN"] },
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

// 🌟 Dùng memo để bao bọc toàn bộ Component
export const AdminSidebar = memo(function AdminSidebar({ mobileOpen, onNavigate }: AdminSidebarProps) {
  const navigate = useNavigate();
  const user = getStoredAdmin();
  const links = linksForRole(user?.role);

  const [pendingCount, setPendingCount] = useState<number>(0);
  
  // 🌟 KHÓA CHẶN 1: Dùng useRef để giữ kết nối không bị khởi tạo lại kể cả khi component cha bắt ép re-render
  const stompClientRef = useRef<Client | null>(null);

  const fetchPendingCount = () => {
    apiFetch("/adoptions/count-pending")
      .then((res: any) => {
        const count = typeof res === "number" ? res : res?.data || 0;
        setPendingCount(count);
      })
      .catch((err) => console.error("Failed to fetch pending count", err));
  };

  useEffect(() => {
    fetchPendingCount();

    // 🌟 KHÓA CHẶN 2: Nếu đã có một kết nối đang chạy rồi thì bỏ qua không tạo thêm kết nối mới
    if (stompClientRef.current) return;

    const socket = new SockJS("http://localhost:8082/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("AdminSidebar WebSocket connected safely.");
        stompClient.subscribe("/topic/adoptions/workflow", () => {
          fetchPendingCount(); 
        });
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient; // Lưu vào ref

    return () => {
      // Tuyệt đối không ngắt kết nối bừa bãi khi re-render thông thường
    };
  }, []); 

  function logout() {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
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
        {links.map(({ to, label, icon: Icon, end, showBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => 
              cn(
                "admin-nav-link relative flex items-center gap-3 pr-12 transition-none", 
                isActive && "admin-nav-link-active"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            <span className="truncate">{label}</span>

            {showBadge && pendingCount > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f6931d] px-1.5 text-[10px] font-bold text-white shadow-sm select-none">
                {pendingCount}
              </span>
            )}
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
}); // 🌟 Đóng gói memo ở đây