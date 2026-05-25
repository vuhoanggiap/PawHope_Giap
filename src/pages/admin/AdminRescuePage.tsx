import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminFilterPill, AdminSearchInput, adminInputClass } from "@/components/admin/AdminControls";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getStaffName, mockRescueReports, mockStaff } from "@/data/admin-mock";
import { formatEnum } from "@/lib/adminFormat";
import { ExternalLink } from "lucide-react";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "RESCUED", "FAILED"] as const;

export function AdminRescuePage() {
  const [reports, setReports] = useState(mockRescueReports);
  const [selectedId, setSelectedId] = useState<number | null>(mockRescueReports[0]?.report_id ?? null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.tracking_code.toLowerCase().includes(q) ||
        r.reporter_name.toLowerCase().includes(q) ||
        r.location_text.toLowerCase().includes(q)
      );
    });
  }, [reports, filterStatus, search]);

  const selected = reports.find((r) => r.report_id === selectedId) ?? null;

  const updateSelected = (patch: Record<string, unknown>) => {
    if (!selected) return;
    setReports((prev) =>
      prev.map((r) =>
        r.report_id === selected.report_id
          ? { ...r, ...patch, updated_at: new Date().toISOString().slice(0, 16).replace("T", " ") }
          : r
      ) as typeof prev
    );
  };

  return (
    <div>
      <AdminPageHeader
        title="Rescue reports"
        description="Full case details, assignment, and status workflow."
      />

      <div className="mb-4 flex flex-wrap gap-2">
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
            onRowClick={(row) => setSelectedId(row.__id as number)}
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
                  <div className="flex gap-2">
                    <StatusBadge value={selected.urgency_level} />
                    <StatusBadge value={selected.status} />
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
                  <AdminField label="Logged-in user" value={selected.user_id ? `#${selected.user_id}` : "Guest"} />
                  <AdminField label="Location" value={selected.location_text} />
                  <AdminField label="Injury" value={formatEnum(selected.injury_type)} />
                  <AdminField label="Temperament" value={formatEnum(selected.temperament)} />
                  <AdminField label="Behavior" value={formatEnum(selected.behavior)} />
                  <AdminField label="Created" value={selected.created_at} />
                  <AdminField label="Updated" value={selected.updated_at} />
                </AdminFieldGrid>
                <AdminField label="Additional note" value={selected.additional_note} className="mt-4" />
              </AdminPanel>

              <AdminPanel title="Assignment & status">
                <AdminFieldGrid>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Assigned to</p>
                    <select
                      value={selected.assigned_to ?? ""}
                      onChange={(e) =>
                        updateSelected({
                          assigned_to: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className={adminInputClass()}
                    >
                      <option value="">Unassigned</option>
                      {mockStaff
                        .filter((s) => s.role === "VOLUNTEER" || s.role === "ADMIN")
                        .map((s) => (
                          <option key={s.user_id} value={s.user_id}>
                            {s.full_name}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Current: {getStaffName(selected.assigned_to)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                    <select
                      value={selected.status}
                      onChange={(e) => updateSelected({ status: e.target.value })}
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
                  <p className="text-xs text-emerald-400 mt-4 flex items-center gap-2">
                    <ExternalLink size={14} />
                    Next step: create pet profile linked to report #{selected.report_id}
                    <Link to="/admin/pets" className="underline">
                      Go to Pets
                    </Link>
                  </p>
                ) : null}
              </AdminPanel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
