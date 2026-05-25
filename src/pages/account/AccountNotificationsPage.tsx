import { Link } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { getUserNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/public-store";
import { cn } from "@/lib/utils";

export function AccountNotificationsPage() {
  const { user, refresh } = usePublicAuth();
  if (!user) return null;

  const items = getUserNotifications(user.userId);
  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="soft-card p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="soft-heading text-lg">Notifications</h2>
          <p className="soft-subtext text-sm">{unread} unread</p>
        </div>
        {unread > 0 ? (
          <button
            type="button"
            onClick={() => {
              markAllNotificationsRead(user.userId);
              refresh();
            }}
            className="text-sm font-medium text-[#f6931d] hover:underline"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-center py-12 soft-subtext">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.noti_id}
              className={cn(
                "p-4 rounded-2xl border transition-colors",
                n.is_read
                  ? "border-transparent bg-white/50 opacity-70"
                  : "border-[#f6931d]/20 bg-[#fffbf7] shadow-sm"
              )}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <p className="text-sm text-[#3d6b5c] leading-relaxed">{n.message}</p>
                {!n.is_read ? (
                  <button
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.noti_id);
                      refresh();
                    }}
                    className="text-xs font-medium text-[#f6931d] hover:underline shrink-0"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-[#a8b8ae] mt-2">{n.created_at}</p>
              {n.link ? (
                <Link to={n.link} className="text-xs font-medium text-[#2c5f51] mt-2 inline-block hover:underline">
                  View details →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
