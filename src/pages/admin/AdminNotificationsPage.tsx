import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockNotifications } from "@/data/admin-mock";
import { formatEnum } from "@/lib/adminFormat";

const TYPE_LINKS: Record<string, string> = {
  RESCUE_ASSIGNED: "/admin/rescue",
  ADOPTION_MEETING: "/admin/adoptions",
  ADOPTION_HANDOVER: "/admin/adoptions",
  ADOPTION_FOLLOWUP: "/admin/adoptions",
  VOLUNTEER_RESULT: "/admin/volunteers",
  ORDER_STATUS: "/admin/orders",
  DONATION: "/admin/donations",
};

export function AdminNotificationsPage() {
  const [items, setItems] = useState(mockNotifications);
  const [selectedId, setSelectedId] = useState(items[0]?.noti_id ?? null);
  const selected = items.find((n) => n.noti_id === selectedId);

  return (
    <div>
      <AdminPageHeader title="Notifications" description="Staff alerts with links to related records." />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {items.map((n) => (
            <button
              key={n.noti_id}
              type="button"
              onClick={() => setSelectedId(n.noti_id)}
              className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                selectedId === n.noti_id
                  ? "border-[#2c5f51]/50 bg-[#2c5f51]/15 shadow-lg shadow-[#2c5f51]/10"
                  : n.is_read
                    ? "admin-card opacity-60"
                    : "admin-card border-[#f6931d]/20 shadow-md shadow-[#f6931d]/5"
              }`}
            >
              <p className={`text-sm font-medium ${!n.is_read ? "text-white" : ""}`}>{n.message}</p>
              <p className="text-xs text-slate-500 mt-1">
                {formatEnum(n.type)} · User #{n.user_id} · {n.created_at}
              </p>
            </button>
          ))}
        </div>

        {selected ? (
          <AdminPanel
            title="Notification detail"
            action={
              !selected.is_read ? (
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) =>
                      prev.map((i) => (i.noti_id === selected.noti_id ? { ...i, is_read: true } : i))
                    )
                  }
                  className="admin-filter-pill-active text-xs"
                >
                  Mark read
                </button>
              ) : (
                <span className="text-xs text-slate-500">Read</span>
              )
            }
          >
            <AdminFieldGrid>
              <AdminField label="ID" value={selected.noti_id} />
              <AdminField label="Recipient user ID" value={selected.user_id} />
              <AdminField label="Type" value={<StatusBadge value={selected.type} />} />
              <AdminField label="Related ID" value={selected.related_id ?? "—"} />
              <AdminField label="Created" value={selected.created_at} />
              <AdminField label="Read" value={selected.is_read ? "Yes" : "No"} />
            </AdminFieldGrid>
            <AdminField label="Message" value={selected.message} className="mt-4" />
            {TYPE_LINKS[selected.type] ? (
              <Link
                to={TYPE_LINKS[selected.type]}
                className="inline-block mt-4 text-sm text-[#f6931d] hover:underline"
              >
                Open related module →
              </Link>
            ) : null}
          </AdminPanel>
        ) : null}
      </div>
    </div>
  );
}
