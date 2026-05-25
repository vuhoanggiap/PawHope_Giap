import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { user, unreadCount } = usePublicAuth();
  if (!user) return null;

  return (
    <Link
      to="/account/notifications"
      className="public-touch-target relative rounded-full text-[#2c5f51] transition-colors hover:bg-[#fdfaf5]"
      aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
    >
      <Bell size={22} />
      {unreadCount > 0 ? (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1",
            "flex items-center justify-center rounded-full bg-[#f6931d] text-white text-[10px] font-bold"
          )}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
