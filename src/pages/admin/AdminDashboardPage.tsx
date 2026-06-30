import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Bell } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminDashboardStats as defaultStats } from "@/data/admin-mock";
import { apiFetch, USE_MOCK } from "@/lib/api-client";
import { getDashboardQuickActions, getDashboardStatCards, getStaffUser} from "@/lib/admin/admin-role";
import { loadDashboardStats } from "@/lib/admin/admin-data";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function AdminDashboardPage() {
  const location = useLocation();
  const forbidden = (location.state as { forbidden?: boolean } | null)?.forbidden;
  const staff = getStaffUser();
  const role = staff?.role;

  const [todayFollowups, setTodayFollowups] = useState<any[]>([]);

  const [s, setS] = useState(defaultStats);
  
useEffect(() => {
    if (role !== "VOLUNTEER") {
      void loadDashboardStats().then(setS);
    }
  }, [role]);

  useEffect(() => {
    if (role === "VOLUNTEER") {
      setTodayFollowups([]); 
      return;
    }

    apiFetch("/adoption_followups/today")
      .then((res: any) => {
        if (res && res.data) {
          setTodayFollowups(res.data);
        }
      })
      .catch((err) => {
        if (err?.status === 403 || err?.message?.includes('403')) {
          console.warn("Skipping follow-up loading due to insufficient access permissions..");
          return;
        }
        console.error("Error loading today's follow-up list:", err);
      });
  }, [role]);

  const statCards = getDashboardStatCards(s, role);
  const quickActions = getDashboardQuickActions(s.notifications.unread, role);

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
        description={
          role === "VOLUNTEER"
            ? USE_MOCK
              ? "Volunteer overview (mock mode)."
              : "Volunteer overview."
            : USE_MOCK
              ? "Overview with sample data (mock mode)."
              : "Overview of Paws Hope"
        }
        badge={USE_MOCK ? "Mock" : ""}
      />

      {forbidden ? (
        <p className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          You do not have permission to access that page.
        </p>
      ) : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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
            {quickActions.map(({ to, label }) => (
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
        <div className="admin-panel mt-6">
          <div className="admin-panel-header">
            <h3 className="font-medium text-white">Today's Scheduled Follow-ups ({todayFollowups.length})</h3>
          </div>
          <div className="p-5">
            {todayFollowups.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No follow-ups scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todayFollowups.map((f) => (
                  <div 
                    key={f.followup_id || f.followupId} 
                    className="flex items-center justify-between border-b border-white/[0.04] pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        Adoption #{f.adoption_id || f.adoptionId}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Type: <span className="text-[#f6931d]">{f.followup_type || f.followupType}</span>
                      </p>
                    </div>
                    <Link 
                      to={`/admin/adoptions/${f.adoption_id || f.adoptionId}`} 
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-medium transition-colors"
                    >
                      View details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}