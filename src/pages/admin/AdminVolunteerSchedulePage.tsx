import { useState } from "react";
import { AdminField, AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  mockScheduleWindows,
  mockShifts,
  mockVolunteerSchedules,
} from "@/data/admin-mock";

export function AdminVolunteerSchedulePage() {
  const [tab, setTab] = useState("registrations");
  const [schedules, setSchedules] = useState(mockVolunteerSchedules);
  const [windowId, setWindowId] = useState(mockScheduleWindows[0]?.window_id ?? 1);

  const filtered = schedules.filter((s) => s.window_id === windowId);
  const selectedWindow = mockScheduleWindows.find((w) => w.window_id === windowId);

  return (
    <div>
      <AdminPageHeader
        title="Volunteer schedule"
        description="Shift templates, registration windows, and volunteer week sign-ups."
        badge="Admin"
      />

      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "registrations", label: "Registrations" },
          { id: "windows", label: "Windows" },
          { id: "shifts", label: "Shifts" },
        ]}
        className="mb-6"
      />

      {tab === "registrations" ? (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-500">Registration window</label>
              <select
                value={windowId}
                onChange={(e) => setWindowId(Number(e.target.value))}
                className={adminInputClass("min-w-[240px]")}
              >
                {mockScheduleWindows.map((w) => (
                  <option key={w.window_id} value={w.window_id}>
                    {w.title}
                  </option>
                ))}
              </select>
            </div>
            {selectedWindow ? (
              <p className="text-sm text-slate-400">
                Open {selectedWindow.open_from} → {selectedWindow.open_until} ·{" "}
                <StatusBadge value={selectedWindow.status} />
              </p>
            ) : null}
          </div>

          <AdminDataTable
            rows={filtered.map((s) => ({
              id: s.schedule_id,
              volunteer: s.volunteer_name,
              week: s.week_label,
              shift: s.shift_name,
              status: <StatusBadge value={s.status} />,
              note: s.note || "—",
              action: (
                <select
                  value={s.status}
                  onChange={(e) =>
                    setSchedules((prev) =>
                      prev.map((row) =>
                        row.schedule_id === s.schedule_id ? { ...row, status: e.target.value } : row
                      )
                    )
                  }
                  className={adminInputClass("h-9 min-w-[140px] text-xs")}
                >
                  {["PENDING", "APPROVED", "REJECTED"].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              ),
            }))}
            columns={[
              { key: "id", label: "ID" },
              { key: "volunteer", label: "Volunteer" },
              { key: "week", label: "Week" },
              { key: "shift", label: "Shift" },
              { key: "status", label: "Status" },
              { key: "note", label: "Note" },
              { key: "action", label: "Review" },
            ]}
          />
        </>
      ) : null}

      {tab === "windows" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {mockScheduleWindows.map((w) => (
            <AdminPanel key={w.window_id} title={w.title}>
              <AdminFieldGrid cols={2}>
                <AdminField label="Week" value={`${w.week_start} → ${w.week_end}`} />
                <AdminField label="Status" value={<StatusBadge value={w.status} />} />
                <AdminField label="Opens" value={w.open_from} />
                <AdminField label="Closes" value={w.open_until} />
              </AdminFieldGrid>
            </AdminPanel>
          ))}
        </div>
      ) : null}

      {tab === "shifts" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {mockShifts.map((shift) => (
            <AdminPanel key={shift.shift_id} title={shift.shift_name}>
              <AdminFieldGrid>
                <AdminField label="Hours" value={`${shift.start_time} – ${shift.end_time}`} />
                <AdminField label="Description" value={shift.description} />
              </AdminFieldGrid>
            </AdminPanel>
          ))}
        </div>
      ) : null}
    </div>
  );
}
