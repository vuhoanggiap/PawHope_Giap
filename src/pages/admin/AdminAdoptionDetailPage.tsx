import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  getStaffName,
  mockAdoptionFollowups,
  mockAdoptionHandovers,
  mockAdoptionMeetings,
  mockAdoptions,
} from "@/data/admin-mock";
import { formatEnum } from "@/lib/adminFormat";
import { ArrowLeft } from "lucide-react";

export function AdminAdoptionDetailPage() {
  const { id } = useParams();
  const adoptionId = Number(id);
  const initial = mockAdoptions.find((a) => a.adoption_id === adoptionId);
  const [adoption, setAdoption] = useState(initial);
  const [tab, setTab] = useState("application");

  const meetings = mockAdoptionMeetings.filter((m) => m.adoption_id === adoptionId);
  const handovers = mockAdoptionHandovers.filter((h) => h.adoption_id === adoptionId);
  const followups = mockAdoptionFollowups.filter((f) => f.adoption_id === adoptionId);

  if (!adoption) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Application not found.</p>
        <Link to="/admin/adoptions" className="text-[#f6931d] text-sm mt-4 inline-block">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/adoptions" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Back to adoptions
      </Link>

      <AdminPageHeader title={adoption.application_code} description={`Pet: ${adoption.pet_name}`} />

      <div className="flex flex-wrap gap-2 mb-6">
        <StatusBadge value={adoption.status} />
        <StatusBadge value={adoption.priority_level} />
        <StatusBadge value={adoption.review_status} />
        <StatusBadge value={adoption.payment_status} />
      </div>

      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "application", label: "Application" },
          { id: "meetings", label: `Meetings (${meetings.length})` },
          { id: "handover", label: `Handover (${handovers.length})` },
          { id: "followups", label: `Follow-ups (${followups.length})` },
        ]}
        className="mb-6"
      />

      {tab === "application" ? (
        <div className="space-y-4">
          <AdminPanel title="Applicant">
            <AdminFieldGrid cols={3}>
              <AdminField label="Name" value={adoption.applicant_name} />
              <AdminField label="Email" value={adoption.applicant_email} />
              <AdminField label="Phone" value={adoption.applicant_phone} />
              <AdminField label="Address" value={adoption.applicant_address} />
              <AdminField label="Housing" value={formatEnum(adoption.housing_type)} />
              <AdminField label="Apply date" value={adoption.apply_date} />
            </AdminFieldGrid>
          </AdminPanel>

          <AdminPanel title="Experience & commitment">
            <AdminFieldGrid cols={3}>
              <AdminField label="Pet experience" value={adoption.has_pet_experience ? "Yes" : "No"} />
              <AdminField label="Current pets" value={adoption.current_pets} />
              <AdminField label="Work schedule" value={adoption.working_schedule} />
              <AdminField label="Family agreement" value={adoption.family_agreement ? "Yes" : "No"} />
              <AdminField label="Financial commitment" value={adoption.financial_commitment ? "Yes" : "No"} />
            </AdminFieldGrid>
            <AdminField label="Reason to adopt" value={adoption.reason} className="mt-4" />
          </AdminPanel>

          <AdminPanel title="Staff review">
            <AdminFieldGrid cols={3}>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                <select
                  value={adoption.status}
                  onChange={(e) => setAdoption({ ...adoption, status: e.target.value })}
                  className={adminInputClass()}
                >
                  {[
                    "PENDING",
                    "MEETING_SCHEDULED",
                    "INTERVIEWING",
                    "APPROVED",
                    "REJECTED",
                    "HANDOVER_SCHEDULED",
                    "COMPLETED",
                    "CANCELLED",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {formatEnum(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Review status</p>
                <select
                  value={adoption.review_status}
                  onChange={(e) => setAdoption({ ...adoption, review_status: e.target.value })}
                  className={adminInputClass()}
                >
                  {["NORMAL", "NEED_MORE_INFO", "SUSPICIOUS", "PRIORITY"].map((s) => (
                    <option key={s} value={s}>
                      {formatEnum(s)}
                    </option>
                  ))}
                </select>
              </div>
              <AdminField label="Processed by" value={getStaffName(adoption.processed_by)} />
              <AdminField label="Adoption fee" value={`${adoption.adoption_fee.toLocaleString()} ₫`} />
              <AdminField label="Payment" value={formatEnum(adoption.payment_status)} />
              <AdminField label="Paid at" value={adoption.paid_at ?? "—"} />
            </AdminFieldGrid>
            <AdminField label="Missing info note" value={adoption.missing_info_note || "—"} className="mt-4" />
            <AdminField label="Internal notes" value={adoption.notes || "—"} className="mt-4" />
          </AdminPanel>
        </div>
      ) : null}

      {tab === "meetings" ? (
        <div className="space-y-4">
          <AdminPanel title="Schedule meeting (preview)">
            <AdminFieldGrid cols={3}>
              <AdminField label="Date & time" value="—" />
              <AdminField label="Location" value="—" />
              <AdminField label="Staff" value="—" />
            </AdminFieldGrid>
          </AdminPanel>
          {meetings.map((m) => (
            <AdminPanel key={m.meeting_id} title={`Meeting · ${m.meeting_datetime}`}>
              <AdminFieldGrid cols={3}>
                <AdminField label="Staff" value={m.staff_name} />
                <AdminField label="Location" value={m.meeting_location} />
                <AdminField label="Status" value={<StatusBadge value={m.status} />} />
                <AdminField label="Result" value={<StatusBadge value={m.result} />} />
              </AdminFieldGrid>
              <AdminField label="Note" value={m.note} className="mt-3" />
            </AdminPanel>
          ))}
        </div>
      ) : null}

      {tab === "handover" ? (
        <div className="space-y-4">
          {handovers.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No handover scheduled yet.</p>
          ) : (
            handovers.map((h) => (
              <AdminPanel key={h.handover_id} title={`Handover · ${formatEnum(h.handover_method)}`}>
                <AdminFieldGrid cols={3}>
                  <AdminField label="Pickup" value={h.pickup_datetime} />
                  <AdminField label="Location" value={h.pickup_location} />
                  <AdminField label="Handled by" value={h.handled_by} />
                  <AdminField label="Status" value={<StatusBadge value={h.status} />} />
                  <AdminField label="Adopter confirmed" value={h.adopter_confirmed ? "Yes" : "No"} />
                  <AdminField label="Completed" value={h.completed_at ?? "—"} />
                </AdminFieldGrid>
                <AdminField label="Items given" value={h.items_given} className="mt-3" />
                <AdminField label="Completion note" value={h.completion_note} className="mt-3" />
              </AdminPanel>
            ))
          )}
        </div>
      ) : null}

      {tab === "followups" ? (
        <div className="space-y-4">
          {followups.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No follow-ups yet.</p>
          ) : (
            followups.map((f) => (
              <AdminPanel key={f.followup_id} title={`Follow-up · ${f.followup_date}`}>
                <AdminFieldGrid cols={3}>
                  <AdminField label="Type" value={formatEnum(f.followup_type)} />
                  <AdminField label="Status" value={<StatusBadge value={f.status} />} />
                  <AdminField label="Pet condition" value={formatEnum(f.pet_condition)} />
                  <AdminField label="Next follow-up" value={f.next_followup_date ?? "—"} />
                </AdminFieldGrid>
                <AdminField label="Adopter feedback" value={f.adopter_feedback} className="mt-3" />
                <AdminField label="Staff note" value={f.staff_note} className="mt-3" />
              </AdminPanel>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
