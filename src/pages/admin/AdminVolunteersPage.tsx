import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  getStaffName,
  mockVolunteerApplications,
  mockVolunteerInterviews,
} from "@/data/admin-mock";
import { formatEnum } from "@/lib/adminFormat";

export function AdminVolunteersPage() {
  const [apps, setApps] = useState(mockVolunteerApplications);
  const [selectedId, setSelectedId] = useState(apps[0]?.application_id ?? null);
  const selected = apps.find((a) => a.application_id === selectedId);
  const interviews = selected
    ? mockVolunteerInterviews.filter((i) => i.application_id === selected.application_id)
    : [];

  return (
    <div>
      <AdminPageHeader
        title="Volunteer applications"
        description="Full application review, interviews, and approval workflow."
        badge="Admin"
      />

      <div className="grid xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-2">
          {apps.map((app) => (
            <button
              key={app.application_id}
              type="button"
              onClick={() => setSelectedId(app.application_id)}
              className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                selectedId === app.application_id
                  ? "border-[#2c5f51]/50 bg-[#2c5f51]/15 shadow-lg shadow-[#2c5f51]/10"
                  : "admin-card hover:border-[#f6931d]/20"
              }`}
            >
              <div className="flex justify-between gap-2">
                <p className="font-medium text-white">{app.full_name}</p>
                <StatusBadge value={app.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{app.email} · {app.applied_at}</p>
            </button>
          ))}
        </div>

        <div className="xl:col-span-3 space-y-4">
          {!selected ? (
            <AdminPanel title="Application detail">
              <p className="text-sm text-slate-500">Select an application.</p>
            </AdminPanel>
          ) : (
            <>
              <AdminPanel title={selected.full_name}>
                <AdminFieldGrid cols={3}>
                  <AdminField label="Email" value={selected.email} />
                  <AdminField label="Phone" value={selected.phone} />
                  <AdminField label="Date of birth" value={selected.date_of_birth} />
                  <AdminField label="Occupation" value={selected.occupation} />
                  <AdminField label="Has transport" value={selected.has_transport ? "Yes" : "No"} />
                  <AdminField label="Applied" value={selected.applied_at} />
                  <AdminField label="Available days" value={selected.available_days.join(", ")} />
                  <AdminField
                    label="Preferred tasks"
                    value={selected.preferred_tasks.map(formatEnum).join(", ")}
                  />
                  <AdminField label="Linked user" value={selected.user_id ? `#${selected.user_id}` : "—"} />
                </AdminFieldGrid>
                <AdminField label="Address" value={selected.address} className="mt-4" />
                <AdminField label="Skills" value={selected.skills} className="mt-4" />
                <AdminField label="Animal experience" value={selected.experience_with_animals} className="mt-4" />
                <AdminField label="Reason to join" value={selected.reason_to_join} className="mt-4" />
              </AdminPanel>

              <AdminPanel title="Review">
                <AdminFieldGrid>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                    <select
                      value={selected.status}
                      onChange={(e) =>
                        setApps((prev) =>
                          prev.map((a) =>
                            a.application_id === selected.application_id
                              ? { ...a, status: e.target.value }
                              : a
                          )
                        )
                      }
                      className={adminInputClass()}
                    >
                      {["PENDING", "INTERVIEW_SCHEDULED", "INTERVIEWED", "APPROVED", "REJECTED"].map((s) => (
                        <option key={s} value={s}>{formatEnum(s)}</option>
                      ))}
                    </select>
                  </div>
                  <AdminField label="Reviewed by" value={getStaffName(selected.reviewed_by)} />
                  <AdminField label="Reviewed at" value={selected.reviewed_at ?? "—"} />
                </AdminFieldGrid>
                <div className="mt-4 space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Rejection reason</p>
                  <textarea
                    defaultValue={selected.rejection_reason}
                    className={adminInputClass("min-h-[80px] py-3")}
                    placeholder="If rejected, explain why..."
                  />
                </div>
              </AdminPanel>

              <AdminPanel title={`Interviews (${interviews.length})`}>
                {interviews.length === 0 ? (
                  <p className="text-sm text-slate-500">No interview scheduled.</p>
                ) : (
                  interviews.map((iv) => (
                    <AdminFieldGrid key={iv.interview_id} cols={3}>
                      <AdminField label="When" value={iv.interview_datetime} />
                      <AdminField label="Type" value={formatEnum(iv.meeting_type)} />
                      <AdminField label="Interviewer" value={iv.interviewer_name} />
                      <AdminField label="Status" value={<StatusBadge value={iv.status} />} />
                      <AdminField label="Result" value={<StatusBadge value={iv.result} />} />
                      <AdminField
                        label={iv.meeting_type === "ONLINE" ? "Meeting link" : "Location"}
                        value={iv.meeting_link || iv.location_text || "—"}
                      />
                    </AdminFieldGrid>
                  ))
                )}
              </AdminPanel>

              <AdminPanel title="Volunteer schedule">
                <p className="text-sm text-slate-400 mb-3">
                  Review shift sign-ups, registration windows, and approval status.
                </p>
                <Link to="/admin/volunteer-schedule" className="admin-btn-secondary inline-flex gap-2">
                  Open schedule manager →
                </Link>
              </AdminPanel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
