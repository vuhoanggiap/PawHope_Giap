import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Gift,
  HeartHandshake,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  Phone,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";

const links = [
  { to: "/account", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/account/adoptions", label: "Adoptions", icon: HeartHandshake },
  { to: "/account/orders", label: "Orders", icon: ShoppingBag },
  { to: "/account/donations", label: "Donations", icon: Gift },
  { to: "/account/rescue-reports", label: "Rescue reports", icon: LifeBuoy },
  { to: "/account/notifications", label: "Notifications", icon: ClipboardList, badge: "unread" as const },
  { to: "/cart", label: "Cart", icon: ShoppingCart, badge: "cart" as const },
  { to: "/account/profile", label: "Profile", icon: User },
];

export function RequirePublicAuth() {
  const { user } = usePublicAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

function userInitials(name?: string, email?: string) {
  return (name || email || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AccountLayout() {
  const { user, logout, unreadCount, cartCount } = usePublicAuth();

  return (
    <section className="public-section soft-section-cream min-h-[60vh]">
      <div className="public-container">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <div className="min-w-0">
            <p className="soft-label mb-1">My account</p>
            <h1 className="soft-heading-lg text-xl sm:text-2xl md:text-3xl">
              Hello, {user?.fullName || user?.email || "User"}
            </h1>
            <p className="soft-subtext mt-1 text-sm">
              Your hub for adoptions, shop orders, donations, rescue reports, and alerts.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

        {user ? (
          <div className="soft-card mb-6 overflow-hidden p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2c5f51] to-[#3d6b5c] text-lg font-bold text-white shadow-md shadow-[#2c5f51]/20">
                  {userInitials(user.fullName, user.email)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#2c5f51]">
                    {user.fullName || user.email || "User"}
                  </p>
                  <p className="soft-subtext truncate text-sm">
                    @{user.username || "user"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5a6b60]">
                    <span className="inline-flex items-center gap-1">
                      <Mail size={12} className="shrink-0 text-[#a8b8ae]" />
                      {user.email || "No email"}
                    </span>
                    {user.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={12} className="shrink-0 text-[#a8b8ae]" />
                        {user.phone}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {cartCount > 0 ? (
                  <Link
                    to="/cart"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#fef0df] px-3 py-1.5 text-xs font-semibold text-[#c97a12]"
                  >
                    <ShoppingCart size={14} /> {cartCount} in cart
                  </Link>
                ) : null}
                {unreadCount > 0 ? (
                  <Link
                    to="/account/notifications"
                    className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700"
                  >
                    <ClipboardList size={14} /> {unreadCount} unread
                  </Link>
                ) : null}
                <Link
                  to="/account/profile"
                  className="inline-flex items-center rounded-full border border-[#2c5f51]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#3d6b5c] hover:border-[#f6931d]/30"
                >
                  Edit profile
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
          <aside className="lg:col-span-1">
            <nav className="soft-card account-nav-scroll p-2">
              {links.map(({ to, label, icon: Icon, end, badge }) => {
                const count =
                  badge === "unread" ? unreadCount : badge === "cart" ? cartCount : 0;

                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        "account-nav-item transition-colors",
                        isActive
                          ? "bg-[#2c5f51] text-white shadow-md shadow-[#2c5f51]/15"
                          : "text-[#5a6b60] hover:bg-[#f3f9f6] hover:text-[#2c5f51]"
                      )
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{label}</span>
                    {count > 0 ? (
                      <span
                        className={cn(
                          "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                          badge === "cart" ? "bg-[#f6931d] text-white" : "bg-violet-500 text-white"
                        )}
                      >
                        {count > 9 ? "9+" : count}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </nav>
            <Link
              to="/adopt"
              className="mt-4 block text-center text-sm font-medium text-[#f6931d] hover:underline"
            >
              Browse adoptable pets →
            </Link>
          </aside>
          <div className="min-w-0 lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}
