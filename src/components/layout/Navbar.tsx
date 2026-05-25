import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, PawPrint, User, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { NotificationBell } from "@/components/public/NotificationBell";
import { CartButton } from "@/components/public/CartButton";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { cn } from "@/lib/utils";

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/adopt", label: "Adopt" },
  { to: "/rescue", label: "Rescue" },
  { to: "/shop", label: "Shop" },
  { to: "/donate", label: "Donate" },
  { to: "/blog", label: "Learn" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = usePublicAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 py-3 shadow-sm backdrop-blur-sm sm:py-4">
      <div className="public-container flex items-center justify-between gap-3">
        <Link to="/" className="group flex min-w-0 items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2c5f51] shadow-md transition-all group-hover:scale-110 group-hover:rotate-12 sm:h-10 sm:w-10">
            <PawPrint size={22} className="fill-[#f6931d] text-[#f6931d] sm:h-[26px] sm:w-[26px]" />
          </div>
          <div className="flex min-w-0 flex-col -space-y-1">
            <span className="truncate text-lg font-black tracking-tighter text-[#2c5f51] sm:text-2xl">
              PAWSHOPENET
            </span>
            <span className="hidden pl-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f6931d] sm:block">
              Rescue & Adopt
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 font-bold uppercase text-gray-600 lg:flex xl:gap-6 xl:text-sm">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap text-xs transition-colors hover:text-[#f6931d] xl:text-sm",
                  isActive && "text-[#f6931d]"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <CartButton />
          <NotificationBell />
          {user ? (
            <Button
              asChild
              variant="outline"
              className="hidden rounded-full border-[#2c5f51]/20 px-4 font-bold text-[#2c5f51] sm:inline-flex lg:px-6"
            >
              <Link to="/account">
                <User size={16} className="mr-2" />
                Account
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="hidden rounded-full bg-[#f6931d] px-6 font-bold text-white shadow-lg transition-all hover:bg-orange-600 active:scale-95 sm:inline-flex lg:px-8"
            >
              <Link to="/login">Sign in</Link>
            </Button>
          )}
          <button
            type="button"
            className="public-touch-target rounded-lg text-[#2c5f51] hover:bg-gray-100 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="space-y-1 border-t bg-white px-4 py-4 lg:hidden">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-lg px-4 py-3 text-sm font-bold uppercase text-gray-600 hover:bg-[#fdfaf5] hover:text-[#f6931d]",
                  isActive && "bg-[#fdfaf5] text-[#f6931d]"
                )
              }
            >
              {label}
            </NavLink>
          ))}
          {user ? (
            <Link
              to="/account"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-4 py-3 text-sm font-bold uppercase text-[#2c5f51]"
            >
              My account
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-4 py-3 text-sm font-bold uppercase text-[#f6931d]"
            >
              Sign in
            </Link>
          )}
        </div>
      ) : null}
    </header>
  );
};
