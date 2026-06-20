import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { apiFetch } from "@/lib/api-client";
import { formatVnd } from "@/lib/formatVnd";
import { getCartSubtotal } from "@/lib/public-commerce"; // Đã loại bỏ import thừa gây lỗi warning
import { Bell, ChevronRight, HeartHandshake, LifeBuoy, Search, ShoppingBag, ShoppingCart, CalendarClock } from "lucide-react";

// --- LIVE DATABASE INTERFACES ---
interface BackendAdoption {
  id?: number; 
  adoption_id?: number;
  adoptionId?: number; 
  application_code: string;
  pet_name: string;
  pet_image: string;
  status: string;
  apply_date: string;
}

interface BackendRescueReport {
  id: number; 
  status: string;
}

interface BackendNotification {
  noti_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

interface BackendOrder {
  order_id: number;
  order_status: string;
  created_at: string;
  total_amount: number;
}

const formatEnumLabel = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace(/_/g, " ");
};

const safeGetAdoptionId = (adoption: BackendAdoption | undefined): number => {
  if (!adoption) return 0;
  return adoption.id || adoption.adoption_id || (adoption as any).adoptionId || 0;
};

export function AccountDashboardPage() {
  const { user, cartCount } = usePublicAuth();
  
  const [adoptions, setAdoptions] = useState<BackendAdoption[]>([]);
  const [rescues, setRescues] = useState<BackendRescueReport[]>([]);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [latestMeeting, setLatestMeeting] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;

    void Promise.all([
      apiFetch<BackendAdoption[]>(`/adoptions/user/${user.userId}`).catch(() => []),
      apiFetch<BackendRescueReport[]>(`/rescue_reports/user/${user.userId}`)
        .catch(() => apiFetch<BackendRescueReport[]>(`/rescue-reports/user/${user.userId}`).catch(() => [])),
      apiFetch<BackendNotification[]>(`/notifications/user/${user.userId}`).catch(() => []),
      apiFetch<BackendOrder[]>(`/orders/user/${user.userId}`).catch(() => []),
    ]).then(([adoptionList, rescueList, notiList, orderList]) => {
      
      // Đẩy tất cả các đơn chưa đóng (active) lên trên đầu để ưu tiên quét lịch hẹn
      const sortedAdoptions = (adoptionList || []).sort((a, b) => {
        const isFinalA = ["COMPLETED", "REJECTED", "CANCELLED"].includes(a.status.toUpperCase());
        const isFinalB = ["COMPLETED", "REJECTED", "CANCELLED"].includes(b.status.toUpperCase());
        if (isFinalA && !isFinalB) return 1;
        if (!isFinalA && isFinalB) return -1;
        return 0;
      });

      setAdoptions(sortedAdoptions);
      setRescues(rescueList || []);
      setNotifications(notiList || []);
      setOrders(orderList || []);

      if (sortedAdoptions.length > 0) {
        const targetAdoptionId = safeGetAdoptionId(sortedAdoptions[0]);

        if (targetAdoptionId > 0) {
          apiFetch(`/adoption_meetings/adoption/${targetAdoptionId}`)
            .then((res: any) => {
              const meetingsArray = Array.isArray(res) ? res : res ? [res] : [];
              
              if (meetingsArray.length > 0) {
                const sortedMeetings = [...meetingsArray].sort((m1: any, m2: any) => {
                  const priority: Record<string, number> = { "RESCHEDULED": 1, "SCHEDULED": 2, "CONFIRMED": 3, "CANCELLED": 4 };
                  return (priority[m1.status.toUpperCase()] || 5) - (priority[m2.status.toUpperCase()] || 5);
                });
                setLatestMeeting(sortedMeetings[0]);
              }
            })
            .catch((e) => console.log("No interview schedule found for this adoption id", e));
        }
      }
    }).catch((err) => {
      console.error("Dashboard global handler error:", err);
    });
  }, [user]);

  if (!user) return null;

  const unread = notifications.filter((n) => !n.is_read).length;
  const cartSubtotal = getCartSubtotal(user.userId);

  const activeAdoptions = adoptions.filter((a) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(a.status.toUpperCase()));
  const latestOrder = orders[0];
  const latestAdoption = adoptions[0]; 
  const latestRescue = rescues[0]; 
  const recentNotifications = notifications.slice(0, 3);

  const cards = [
    {
      label: "Active adoptions",
      value: activeAdoptions.length,
      icon: HeartHandshake,
      to: "/account/adoptions",
      tint: "bg-[#fef0df] text-[#c97a12]",
    },
    {
      label: "Shop orders",
      value: orders.length,
      icon: ShoppingBag,
      to: "/account/orders",
      tint: "bg-sky-100 text-sky-700",
    },
    {
      label: "Rescue reports",
      value: rescues.length,
      icon: LifeBuoy,
      to: "/account/rescue-reports",
      tint: "bg-[#e6f2ec] text-[#3d6b5c]",
    },
    {
      label: "Unread alerts",
      value: unread,
      icon: Bell,
      to: "/account/notifications",
      tint: "bg-violet-100 text-violet-700",
    },
  ];

  return (
    <div className="space-y-6">
      {cartCount > 0 ? (
        <Link
          to="/cart"
          className="soft-card-hover flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef0df] text-[#c97a12]">
              <ShoppingCart size={22} />
            </div>
            <div>
              <p className="font-semibold text-[#2c5f51]">You have {cartCount} item(s) in your cart</p>
              <p className="soft-subtext text-sm">Subtotal {formatVnd(cartSubtotal)} · Ready for checkout</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#f6931d]">
            View cart <ChevronRight size={16} />
          </span>
        </Link>
      ) : null}

      <div className="soft-card p-6 md:p-8">
        <h2 className="soft-heading mb-2 text-lg">Quick overview</h2>
        <p className="soft-subtext mb-6 text-sm">
          A snapshot of your adoptions, orders, rescue reports, and unread alerts.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, to, tint }) => (
            <Link
              key={to}
              to={to}
              className="rounded-2xl border border-[#2c5f51]/[0.06] bg-white/80 p-5 transition-shadow hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
                <Icon size={20} />
              </div>
              <p className="mt-3 text-2xl font-bold text-[#2c5f51]">{value}</p>
              <p className="soft-subtext text-sm">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="soft-card p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="soft-heading text-lg">Recent activity</h2>
            <p className="soft-subtext text-sm">Latest updates across your account.</p>
          </div>
        </div>

        {latestOrder || latestAdoption || recentNotifications.length > 0 || latestMeeting || latestRescue ? (
          <div className="space-y-3">
            
            {/* 1. Interview Schedule Notification Banner */}
            {latestMeeting && latestAdoption && (
              <Link
                to={`/account/adoptions/${safeGetAdoptionId(latestAdoption)}`}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50/40 p-4 transition-all hover:border-orange-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <CalendarClock size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Interview Schedule Update</p>
                    <p className="font-semibold text-[#2c5f51]">Interview for pet: {latestAdoption.pet_name}</p>
                    <p className="soft-subtext text-sm mt-0.5">
                      Status: <span className="font-bold uppercase text-orange-600">{latestMeeting.status}</span> · Time: {new Date(latestMeeting.meetingDatetime).toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f6931d] whitespace-nowrap">
                  View Appointment <ChevronRight size={14} />
                </span>
              </Link>
            )}

            {latestOrder ? (
              <Link
                to={`/account/orders/${latestOrder.order_id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#2c5f51]/[0.06] p-4 transition-colors hover:border-[#f6931d]/25"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#a8b8ae]">Latest order</p>
                  <p className="font-semibold text-[#2c5f51]">Order #{latestOrder.order_id}</p>
                  <p className="soft-subtext text-sm">
                    {latestOrder.created_at} · {formatEnumLabel(latestOrder.order_status)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#3d6b5c]">{formatVnd(latestOrder.total_amount)}</span>
                  <ChevronRight className="text-gray-300" size={18} />
                </div>
              </Link>
            ) : null}

            {/* 🌟 ĐÃ KHẮC PHỤC LẶP: Thêm điều kiện !latestMeeting để ẩn thẻ này khi banner cam đang hiện */}
            {latestAdoption && !latestMeeting ? (
              <Link
                to={`/account/adoptions/${safeGetAdoptionId(latestAdoption)}`}
                className="flex items-center gap-4 rounded-2xl border border-[#2c5f51]/[0.06] p-4 transition-colors hover:border-[#f6931d]/25"
              >
                <img src={latestAdoption.pet_image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#a8b8ae]">Latest adoption</p>
                  <p className="font-semibold text-[#2c5f51]">{latestAdoption.pet_name}</p>
                  <p className="soft-subtext text-sm">
                    {latestAdoption.application_code} · {formatEnumLabel(latestAdoption.status)}
                  </p>
                </div>
                <ChevronRight className="shrink-0 text-gray-300" size={18} />
              </Link>
            ) : null}

            {latestRescue ? (
              <Link
                to={`/account/rescue-reports`}
                className="flex items-center gap-4 rounded-2xl border border-[#2c5f51]/[0.06] p-4 transition-colors hover:border-[#f6931d]/25"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e6f2ec] text-[#3d6b5c] shrink-0">
                  <LifeBuoy size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#a8b8ae]">Latest rescue report</p>
                  <p className="font-semibold text-[#2c5f51] truncate">
                    Report #{latestRescue.id || "Unknown"}
                  </p>
                  <p className="soft-subtext text-sm">
                    {formatEnumLabel(latestRescue.status)}
                  </p>
                </div>
                <ChevronRight className="shrink-0 text-gray-300" size={18} />
              </Link>
            ) : null}

            {recentNotifications.map((n) => (
              <div
                key={n.noti_id}
                className={`rounded-2xl border p-4 ${n.is_read ? "border-transparent bg-white/60" : "border-[#f6931d]/15 bg-[#fffbf7]"}`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-[#a8b8ae]">Notification</p>
                <p className="mt-1 text-sm leading-relaxed text-[#3d6b5c]">{n.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-[#a8b8ae]">{n.created_at}</span>
                  {n.link ? (
                    <Link to={n.link} className="text-xs font-medium text-[#f6931d] hover:underline">
                      View details →
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#2c5f51]/15 py-10 text-center soft-subtext">
            <p>No recent activity yet.</p>
            <p className="mt-2 text-sm">Apply to adopt, shop for merch, or report a rescue to see updates here.</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/rescue/track" className="soft-card-hover flex items-center gap-4 p-6 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f2ec] text-[#3d6b5c]">
            <Search size={22} />
          </div>
          <div>
            <p className="font-semibold text-[#2c5f51] transition-colors group-hover:text-[#f6931d]">
              Track a rescue code
            </p>
            <p className="soft-subtext text-sm">Look up status with your tracking number.</p>
          </div>
        </Link>
        <Link to="/shop" className="soft-card-hover flex items-center gap-4 p-6 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="font-semibold text-[#2c5f51] transition-colors group-hover:text-[#f6931d]">
              Support shop
            </p>
            <p className="soft-subtext text-sm">Merch that funds rescue work.</p>
          </div>
        </Link>
        <Link to="/donate" className="soft-card-hover flex items-center gap-4 p-6 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef0df] text-[#c97a12]">
            <HeartHandshake size={22} />
          </div>
          <div>
            <p className="font-semibold text-[#2c5f51] transition-colors group-hover:text-[#f6931d]">
              Make a donation
            </p>
            <p className="soft-subtext text-sm">Support campaigns or give supplies.</p>
          </div>
        </Link>
        <Link to="/rescue" className="soft-card-hover flex items-center gap-4 p-6 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f2ec] text-[#3d6b5c]">
            <LifeBuoy size={22} />
          </div>
          <div>
            <p className="font-semibold text-[#2c5f51] transition-colors group-hover:text-[#f6931d]">
              Report an animal in need
            </p>
            <p className="soft-subtext text-sm">Submit a new rescue report.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}