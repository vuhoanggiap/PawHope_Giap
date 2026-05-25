import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Dog,
  HeartHandshake,
  LifeBuoy,
  Wallet,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminDashboardStats } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

export function AdminDashboardPage() {
  const location = useLocation();
  const forbidden = (location.state as { forbidden?: boolean } | null)?.forbidden;

  const s = adminDashboardStats;

  const statCards = [
    {
      label: "Rescue pending",
      value: s.rescue.pending,
      sub: `${s.rescue.inProgress} in progress`,
      icon: LifeBuoy,
      tint: "text-sky-400 bg-sky-400/15 ring-sky-400/20",
      to: "/admin/rescue",
    },
    {
      label: "Pets available",
      value: s.pets.available,
      sub: `${s.pets.inCare} in care total`,
      icon: Dog,
      tint: "text-emerald-400 bg-emerald-400/15 ring-emerald-400/20",
      to: "/admin/pets",
    },
    {
      label: "Adoptions pending",
      value: s.adoptions.pending,
      sub: `${s.adoptions.inReview} in review`,
      icon: HeartHandshake,
      tint: "text-violet-400 bg-violet-400/15 ring-violet-400/20",
      to: "/admin/adoptions",
    },
    {
      label: "Donations (VND)",
      value: (s.donations.totalVnd / 1_000_000).toFixed(1) + "M",
      sub: `${s.donations.count} transactions`,
      icon: Wallet,
      tint: "text-amber-400 bg-amber-400/15 ring-amber-400/20",
      to: "/admin/donations",
    },
  ];

  const pipeline = [
    { label: "Pending", val: s.rescue.pending, color: "bg-amber-400", text: "text-amber-400" },
    { label: "In progress", val: s.rescue.inProgress, color: "bg-sky-400", text: "text-sky-400" },
    { label: "Rescued", val: s.rescue.rescued, color: "bg-emerald-400", text: "text-emerald-400" },
    { label: "Failed", val: s.rescue.failed, color: "bg-red-400", text: "text-red-400" },
  ];

  const pipelineTotal = pipeline.reduce((sum, item) => sum + item.val, 0) || 1;

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of sanctuary operations. Data is mock preview until team API is connected."
        badge="UI preview"
      />

      {forbidden ? (
        <p className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          You do not have permission to access that page.
        </p>
      ) : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, sub, icon: Icon, tint, to }) => (
          <Link key={to} to={to} className="group block h-full">
            <div className="admin-stat-card h-full p-5">
              <div className="relative flex items-start justify-between">
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <div className={cn("rounded-xl p-2.5 ring-1", tint)}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="relative mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
              <p className="relative mt-1 text-xs text-slate-500">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3 className="font-medium text-white">Rescue pipeline</h3>
          </div>
          <div className="space-y-5 p-5">
            <div className="admin-progress-track flex h-2.5 overflow-hidden rounded-full">
              {pipeline.map(({ label, val, color }) =>
                val > 0 ? (
                  <div
                    key={label}
                    className={cn("admin-progress-fill", color)}
                    style={{ width: `${(val / pipelineTotal) * 100}%` }}
                    title={`${label}: ${val}`}
                  />
                ) : null
              )}
            </div>
            <div className="space-y-3 text-sm">
              {pipeline.map(({ label, val, text }) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-white/[0.04] py-2 last:border-0"
                >
                  <span className="text-slate-400">{label}</span>
                  <span className={cn("font-semibold tabular-nums", text)}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3 className="font-medium text-white">Quick actions</h3>
            <Bell className="text-slate-500" size={18} />
          </div>
          <div className="space-y-1 p-3">
            {[
              { to: "/admin/rescue", label: "Review rescue reports" },
              { to: "/admin/adoptions", label: "Process adoption applications" },
              { to: "/admin/volunteers", label: "Volunteer applications" },
              { to: "/admin/notifications", label: `${s.notifications.unread} unread notifications` },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="admin-quick-action group">
                {label}
                <ArrowRight
                  size={16}
                  className="text-slate-600 transition-colors group-hover:text-[#f6931d]"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
