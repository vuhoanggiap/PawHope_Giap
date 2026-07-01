import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminFilterPill, AdminSearchInput, adminInputClass } from "@/components/admin/AdminControls";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockRescueReports } from "@/data/admin-mock";
import { ApiError } from "@/lib/api-client";
import { useRescueRealtime } from "@/hooks/useRescueRealtime";
import { getStaffName, loadRescueAssignees, loadRescueReports, patchRescueReport, removeRescueReport, type AdminRescueRow } from "@/lib/admin/admin-data";
import { staffIsAdmin, getStaffUser } from "@/lib/admin/admin-role";
import { formatEnum } from "@/lib/adminFormat";
import { ExternalLink, Trash2, PawPrint } from "lucide-react"; 

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "RESCUED", "FAILED"] as const;
type ScopeFilter = "ALL" | "MINE";

export function AdminRescuePage() {
  const staff = getStaffUser();
  const isAdminUser = staffIsAdmin();
  const navigate = useNavigate(); 
  
  const [reports, setReports] = useState<AdminRescueRow[]>(mockRescueReports as AdminRescueRow[]);
  const [assignees, setAssignees] = useState<{ user_id: number; full_name: string; role: string }[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(mockRescueReports[0]?.report_id ?? null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(isAdminUser ? "ALL" : "MINE");
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refreshReports = useCallback(() => {
    void loadRescueReports().then((list) => {
      setReports(list);
      setSelectedId((prev) => {
        if (prev != null && list.some((r) => r.report_id === prev)) return prev;
        return list[0]?.report_id ?? null;
      });
    });
  }, []);

  useEffect(() => {
    refreshReports();
    void loadRescueAssignees().then(setAssignees);
  }, [refreshReports]);

  useRescueRealtime("/topic/rescue/admin", refreshReports);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (scopeFilter === "MINE" && staff?.userId && r.assigned_to !== staff.userId) return false;
      if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.tracking_code.toLowerCase().includes(q) ||
        r.reporter_name.toLowerCase().includes(q) ||
        r.location_text.toLowerCase().includes(q)
      );
    });
  }, [reports, filterStatus, search, scopeFilter, staff?.userId]);

  const selected = reports.find((r) => r.report_id === selectedId) ?? null;
  const canAssign = selected?.status === "PENDING" && selected.assigned_to == null;

  const runAction = async (fn: () => Promise<void>) => {
    if (!selected) return;
    setSaving(true);
    setActionError(null);
    try {
      await fn();
      refreshReports();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Action failed";
      setActionError(msg);
      refreshReports();
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = (userId: number) => {
    if (!selected || !userId) return;
    void runAction(() => patchRescueReport(selected.report_id, selected, { assigned_to: userId }));
  };

  const handleStatus = (status: string) => {
    if (!selected || status === selected.status) return;
    void runAction(() => patchRescueReport(selected.report_id, selected, { status }));
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`Delete rescue report ${selected.tracking_code}?`)) return;
    void runAction(async () => {
      await removeRescueReport(selected.report_id);
      setSelectedId(null);
    });
  };

  const handleCreatePet = () => {
    if (!selected) return;
    navigate("/admin/pets/create", {
      state: {
        fromReportId: selected.report_id,
        imageUrl: selected.image_url,
        description: `Rescue notes: ${selected.additional_note || "Do not have"}\nTemperament: ${formatEnum(selected.temperament)} - ${formatEnum(selected.behavior)}\nLocation found: ${selected.location_text}`
      }
    });
  };

  return (
    <div>
      <AdminPageHeader title="Rescue reports" description="Full case details, assignment, and status workflow."/>

      {actionError ? (
        <div className="admin-panel mb-4 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {actionError}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["ALL", "MINE"] as const).map((s) => (
          <AdminFilterPill
            key={s}
            active={scopeFilter === s}
            onClick={() => setScopeFilter(s)}
          >
            {s === "ALL" ? "All reports" : "Assigned to me"}
          </AdminFilterPill>
        ))}
        {["ALL", ...STATUS_OPTIONS].map((s) => (
          <AdminFilterPill
            key={s}
            active={filterStatus === s}
            onClick={() => setFilterStatus(s)}
          >
            {s === "ALL" ? "All" : formatEnum(s)}
          </AdminFilterPill>
        ))}
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search code, reporter, location..."
          className="ml-auto"
        />
      </div>

      <div className="grid xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <AdminDataTable
            rows={filtered.map((r) => ({
              code: r.tracking_code,
              urgency: r.urgency_level,
              status: r.status,
              reporter: r.reporter_name,
              __id: r.report_id,
            }))}
            columns={[
              { key: "code", label: "Code" },
              { key: "urgency", label: "Urgency" },
              { key: "status", label: "Status" },
              { key: "reporter", label: "Reporter" },
            ]}
            onRowClick={(row) => {
              setSelectedId(row.__id as number);
              setActionError(null);
            }}
          />
        </div>

        <div className="xl:col-span-3 space-y-4">
          {!selected ? (
            <AdminPanel title="Report detail">
              <p className="text-sm text-slate-500">Select a report from the table.</p>
            </AdminPanel>
          ) : (
            <>
              <AdminPanel
                title={selected.tracking_code}
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={selected.urgency_level} />
                    <StatusBadge value={selected.status} />
                    {isAdminUser ? (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    ) : null}
                  </div>
                }
              >
                {selected.image_url ? (
                  <img
                    src={selected.image_url}
                    alt=""
                    className="mb-4 max-h-48 w-full rounded-xl border border-white/[0.06] object-cover"
                  />
                ) : null}
                <AdminFieldGrid cols={3}>
                  <AdminField label="Reporter" value={selected.reporter_name} />
                  <AdminField label="Phone" value={selected.reporter_phone} />
                  <AdminField
                    label="Logged-in user"
                    value={selected.user_id ? `#${selected.user_id}` : "Guest"}
                  />
                  <AdminField label="Location" value={selected.location_text} />
                  <AdminField label="Injury" value={formatEnum(selected.injury_type)} />
                  <AdminField label="Temperament" value={formatEnum(selected.temperament)} />
                  <AdminField label="Behavior" value={formatEnum(selected.behavior)} />
                  <AdminField label="Created" value={selected.created_at} />
                  <AdminField label="Updated" value={selected.updated_at} />
                </AdminFieldGrid>
                <AdminField label="Additional note" value={selected.additional_note} className="mt-4" />
                <Link
                  to={`/rescue/track/${encodeURIComponent(selected.tracking_code)}`}
                  className="inline-block mt-3 text-sm text-[#f6931d] hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open public track page →
                </Link>
              </AdminPanel>

              <AdminPanel title="Assignment & status">
                <AdminFieldGrid>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Assigned to</p>
                    {isAdminUser ? (
                      <select
                        value={selected.assigned_to ?? ""}
                        disabled={!canAssign || saving}
                        onChange={(e) => {
                          const id = e.target.value ? Number(e.target.value) : null;
                          if (id) handleAssign(id);
                        }}
                        className={adminInputClass()}
                      >
                        <option value="">
                          {canAssign ? "Select volunteer / admin" : "—"}
                        </option>
                        {assignees.map((s) => (
                          <option key={s.user_id} value={s.user_id}>
                            {s.full_name} ({formatEnum(s.role)})
                          </option>
                        ))}
                      </select>
                    ) : canAssign && staff?.userId ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleAssign(staff.userId)}
                        className="admin-filter-pill-active text-xs disabled:opacity-50"
                      >
                        Accept this case
                      </button>
                    ) : (
                      <p className="text-sm text-slate-400">—</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Current: {getStaffName(selected.assigned_to)}
                      {!canAssign && selected.assigned_to
                        ? " · Assignment is locked after accept."
                        : !canAssign && !selected.assigned_to
                          ? " · Only PENDING unassigned reports can be assigned."
                          : ""}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                    <select
                      value={selected.status}
                      disabled={saving}
                      onChange={(e) => handleStatus(e.target.value)}
                      className={adminInputClass()}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {formatEnum(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </AdminFieldGrid>                
                {selected.status === "RESCUED" ? (
                  <div className="mt-6 pt-4 border-t border-emerald-500/20 flex flex-col items-start gap-3">
                    <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                      <ExternalLink size={16} />
                      Rescue successful! Next step: Create pet profile.
                    </p>
                    <button
                      onClick={handleCreatePet}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <PawPrint size={16} />
                      Create Pet Profile
                    </button>
                  </div>
                ) : null}
              </AdminPanel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}