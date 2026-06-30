import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockVolunteerApplications } from "@/data/admin-mock";
import { getStaffName,  loadVolunteerApplications,  updateVolunteerApplicationStatus, 
  loadVolunteerInterviews, createInterviewAdmin, updateInterviewStatus, updateInterviewResult
} from "@/lib/admin/admin-data";
import { formatEnum } from "@/lib/adminFormat";
import { getStoredAdmin } from "@/lib/admin-auth";

type VolunteerAppRow = Awaited<ReturnType<typeof loadVolunteerApplications>>[number];

export function AdminVolunteersPage() {
  const [apps, setApps] = useState<VolunteerAppRow[]>(
    mockVolunteerApplications as VolunteerAppRow[]
  );
  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(
    mockVolunteerApplications[0]?.application_id ?? null
  );
  const [loading, setLoading] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    interviewDatetime: "",
    meetingType: "ONLINE",
    meetingLink: "",
    locationText: "",
  });

  useEffect(() => {
    void loadVolunteerApplications().then((list) => {
      setApps(list);
      setSelectedId((prev) => prev ?? list[0]?.application_id ?? null);
    });
    void loadVolunteerInterviews().then(setInterviews);
  }, []);

  const selected = apps.find((a) => a.application_id === selectedId);
  
  const applicationInterviews = selected
    ? interviews.filter((i) => i.application_id === selected.application_id)
    : [];

  const reload = async () => {
    const list = await loadVolunteerApplications();
    setApps(list);

    if (selectedId) {
      const current = list.find((x) => x.application_id === selectedId);
      if (!current && list.length > 0) {
        setSelectedId(list[0].application_id);
      }
    }
  };

  const reloadInterviews = async () => {
    const ivList = await loadVolunteerInterviews();
    setInterviews(ivList);
  };

  const getAvailableStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING":
        return ["PENDING", "INTERVIEW_SCHEDULED"];
      case "INTERVIEW_SCHEDULED":
        return ["INTERVIEW_SCHEDULED", "INTERVIEWED"];
      case "INTERVIEWED":
        return ["INTERVIEWED", "APPROVED", "REJECTED"];
      case "APPROVED":
        return ["APPROVED"];
      case "REJECTED":
        return ["REJECTED"];
      default:
        return [currentStatus];
    }
  };

  const handleStatusChange = async (nextStatus: string) => {
    if (!selected) return;
    if (nextStatus === selected.status) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to change status from ${formatEnum(selected.status)} to ${formatEnum(nextStatus)}?`
    );
    if (!isConfirmed) return;

    try {
      setLoading(true);
      const admin = getStoredAdmin();

      await updateVolunteerApplicationStatus(
        selected.application_id,
        nextStatus,
        admin?.userId ?? 1,
        nextStatus === "REJECTED" ? selected.rejection_reason : undefined
      );

      await reload();
    } catch (err) {
      console.error(err);
      alert("Update status failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewStatusChange = async (interviewId: number, status: string) => {
    try {
      setLoading(true);
      await updateInterviewStatus(interviewId, status);
      await reloadInterviews();
    } catch (err) {
      console.error(err);
      alert("Update interview status failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewResultChange = async (interviewId: number, result: string) => {
    try {
      setLoading(true);
      const note = prompt("Enter evaluation note (optional):") ?? "";
      await updateInterviewResult(interviewId, result, note);
      await reloadInterviews();
    } catch (err) {
      console.error(err);
      alert("Update interview result failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      const admin = getStoredAdmin();

      await createInterviewAdmin({
        applicationId: selected.application_id,
        interviewerId: admin?.userId ?? 1,
        interviewDatetime: scheduleForm.interviewDatetime,
        meetingType: scheduleForm.meetingType,
        meetingLink: scheduleForm.meetingType === "ONLINE" ? scheduleForm.meetingLink : undefined,
        locationText: scheduleForm.meetingType === "OFFLINE" ? scheduleForm.locationText : undefined,
        status: "SCHEDULED",
        result: "PENDING",
      });

      await reloadInterviews();
      setOpenSchedule(false);
      setScheduleForm({
        interviewDatetime: "",
        meetingType: "ONLINE",
        meetingLink: "",
        locationText: "",
      });
    } catch (err) {
      console.error(err);
      alert("Create interview failed");
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-xs text-slate-500 mt-1">
                {app.email} · {app.applied_at}
              </p>
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
                      disabled={loading || selected.status === "APPROVED" || selected.status === "REJECTED"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={adminInputClass()}
                    >
                      {getAvailableStatuses(selected.status).map((s) => (
                        <option key={s} value={s}>
                          {formatEnum(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <AdminField label="Reviewed by" value={getStaffName(selected.reviewed_by)} />
                  <AdminField label="Reviewed at" value={selected.reviewed_at ?? "—"} />
                </AdminFieldGrid>
                <div className="mt-4 space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Rejection reason</p>
                  <textarea
                    value={selected.rejection_reason}
                    disabled={selected.status === "APPROVED" || selected.status === "REJECTED"}
                    onChange={(e) =>
                      setApps((prev) =>
                        prev.map((a) =>
                          a.application_id === selected.application_id
                            ? { ...a, rejection_reason: e.target.value }
                            : a
                        )
                      )
                    }
                    className={adminInputClass("min-h-[80px] py-3")}
                    placeholder="If rejected, explain why..."
                  />
                </div>
              </AdminPanel>

              <AdminPanel 
                title={`Interviews (${applicationInterviews.length})`}
                action={
                  !(selected.status === "APPROVED" || selected.status === "REJECTED") && (
                    <button
                      type="button"
                      onClick={() => setOpenSchedule(true)}
                      className="admin-btn-primary text-xs py-1 px-3"
                    >
                      + Schedule Interview
                    </button>
                  )
                }
              >
                {applicationInterviews.length === 0 ? (
                  <p className="text-sm text-slate-500">No interview scheduled.</p>
                ) : (
                  <div className="space-y-6 divide-y divide-slate-800">
                    {applicationInterviews.map((iv, idx) => (
                      <div key={iv.interview_id} className={idx > 0 ? "pt-6" : ""}>
                        <AdminFieldGrid cols={3}>
                          <AdminField label="When" value={iv.interview_datetime} />
                          <AdminField label="Type" value={formatEnum(iv.meeting_type)} />
                          <AdminField label="Interviewer" value={iv.interviewer_name || getStaffName(iv.interviewer_id)} />

                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                            <select
                              value={iv.status}
                              disabled={loading || selected.status === "APPROVED" || selected.status === "REJECTED"}
                              onChange={(e) => handleInterviewStatusChange(iv.interview_id, e.target.value)}
                              className={adminInputClass("py-1 text-xs")}
                            >
                              {["SCHEDULED", "COMPLETED", "CANCELLED"].map((s) => (
                                <option key={s} value={s}>{formatEnum(s)}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Result</p>
                            <select
                              value={iv.result}
                              disabled={loading || selected.status === "APPROVED" || selected.status === "REJECTED"}
                              onChange={(e) => handleInterviewResultChange(iv.interview_id, e.target.value)}
                              className={adminInputClass("py-1 text-xs")}
                            >
                              {["PENDING", "PASSED", "FAILED"].map((r) => (
                                <option key={r} value={r}>{formatEnum(r)}</option>
                              ))}
                            </select>
                          </div>

                          <AdminField
                            label={iv.meeting_type === "ONLINE" ? "Meeting link" : "Location"}
                            value={iv.meeting_link || iv.location_text || "—"}
                          />
                        </AdminFieldGrid>
                        {iv.evaluation_note && (
                          <div className="mt-2 text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                            <strong>Note:</strong> {iv.evaluation_note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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

      {openSchedule && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] p-6 rounded-xl w-[500px] space-y-3 border border-slate-800">
            <h2 className="text-lg font-semibold text-white">Schedule Interview</h2>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Date & Time</label>
              <input
                type="datetime-local"
                className={adminInputClass()}
                value={scheduleForm.interviewDatetime}
                onChange={(e) =>
                  setScheduleForm((p) => ({ ...p, interviewDatetime: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Meeting Type</label>
              <select
                className={adminInputClass()}
                value={scheduleForm.meetingType}
                onChange={(e) =>
                  setScheduleForm((p) => ({ ...p, meetingType: e.target.value }))
                }
              >
                <option value="ONLINE">ONLINE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            {scheduleForm.meetingType === "ONLINE" ? (
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Meeting Link</label>
                <input
                  className={adminInputClass()}
                  placeholder="https://zoom.us/j/..."
                  value={scheduleForm.meetingLink}
                  onChange={(e) =>
                    setScheduleForm((p) => ({ ...p, meetingLink: e.target.value }))
                  }
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Location Text</label>
                <input
                  className={adminInputClass()}
                  placeholder="No 10, Dan Phuong, Ha Noi."
                  value={scheduleForm.locationText}
                  onChange={(e) =>
                    setScheduleForm((p) => ({ ...p, locationText: e.target.value }))
                  }
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={loading}
                onClick={() => setOpenSchedule(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                disabled={loading || !scheduleForm.interviewDatetime}
                onClick={handleCreateInterview}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}