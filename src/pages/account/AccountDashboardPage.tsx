import { Link } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { formatPublicEnum } from "@/data/public-mock";
import { getUserAdoptions, getUserNotifications, getUserRescueReports } from "@/lib/public-store";
import { getCartSubtotal, getUserOrders } from "@/lib/public-commerce";
import { formatVnd } from "@/lib/formatVnd";
import { Bell, ChevronRight, HeartHandshake, LifeBuoy, Search, ShoppingBag, ShoppingCart } from "lucide-react";

export function AccountDashboardPage() {
  const { user, cartCount } = usePublicAuth();
  if (!user) return null;

  const adoptions = getUserAdoptions(user.userId);
  const rescues = getUserRescueReports(user.userId);
  const notifications = getUserNotifications(user.userId);
  const unread = notifications.filter((n) => !n.is_read).length;
  const orders = getUserOrders(user.userId);
  const cartSubtotal = getCartSubtotal(user.userId);

  const activeAdoptions = adoptions.filter((a) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(a.status));
  const latestOrder = orders[0];
  const latestAdoption = adoptions[0];
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

        {latestOrder || latestAdoption || recentNotifications.length > 0 ? (
          <div className="space-y-3">
            {latestOrder ? (
              <Link
                to={`/account/orders/${latestOrder.order_id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#2c5f51]/[0.06] p-4 transition-colors hover:border-[#f6931d]/25"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#a8b8ae]">Latest order</p>
                  <p className="font-semibold text-[#2c5f51]">Order #{latestOrder.order_id}</p>
                  <p className="soft-subtext text-sm">
                    {latestOrder.created_at} · {formatPublicEnum(latestOrder.order_status)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#3d6b5c]">{formatVnd(latestOrder.total_amount)}</span>
                  <ChevronRight className="text-gray-300" size={18} />
                </div>
              </Link>
            ) : null}

            {latestAdoption ? (
              <Link
                to={`/account/adoptions/${latestAdoption.adoption_id}`}
                className="flex items-center gap-4 rounded-2xl border border-[#2c5f51]/[0.06] p-4 transition-colors hover:border-[#f6931d]/25"
              >
                <img src={latestAdoption.pet_image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#a8b8ae]">Latest adoption</p>
                  <p className="font-semibold text-[#2c5f51]">{latestAdoption.pet_name}</p>
                  <p className="soft-subtext text-sm">
                    {latestAdoption.application_code} · {formatPublicEnum(latestAdoption.status)}
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
