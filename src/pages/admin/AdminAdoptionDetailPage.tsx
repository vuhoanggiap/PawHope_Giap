import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAdoptions } from "@/data/admin-mock";
import { applyAdoptionAction, getStaffName, loadAdoptionFollowups, loadAdoptions } from "@/lib/admin/admin-data";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { staffIsAdmin } from "@/lib/admin/admin-role";
import { formatEnum } from "@/lib/adminFormat";
import { ArrowLeft } from "lucide-react";
import { AdoptionMeetingsTab } from "./components/AdoptionMeetingsTab";
import { AdoptionHandoverTab } from "./components/AdoptionHandoverTab";
import { AdoptionFollowupsTab } from "./components/AdoptionFollowupsTab";
import { useAdoptionHandovers } from "@/hooks/useAdoptionHandovers";
import { useAdoptionMeetings } from "@/hooks/useAdoptionMeetings";

type FollowupRow = Awaited<ReturnType<typeof loadAdoptionFollowups>>[number];

export function AdminAdoptionDetailPage() {
  const canEditWorkflow = staffIsAdmin();
  const { id } = useParams();
  const adoptionId = Number(id);
  const [adoption, setAdoption] = useState(() => mockAdoptions.find((a) => a.adoption_id === adoptionId));
  const [followups, setFollowups] = useState<FollowupRow[]>([]);
  const [tab, setTab] = useState("application");
  const [message, setMessage] = useState<string | null>(null);
  const { handovers, refetch: refetchHandovers, completeHandover } = useAdoptionHandovers();
  const { meetings: apiMeetings, refetch: refetchMeetings, updateResult } = useAdoptionMeetings();
  const [displayMeetings, setDisplayMeetings] = useState<any[]>([]);
  const currentHandovers = handovers.filter(h => h.adoptionId === adoptionId);

  useEffect(() => {
    if (apiMeetings) {
      setDisplayMeetings(apiMeetings.filter(m => m.adoptionId === adoptionId));
    }
  }, [apiMeetings, adoptionId]);

  const reloadAdoption = useCallback(() => {
    void loadAdoptions().then((list) => {
      setAdoption(list.find((a) => a.adoption_id === adoptionId));
    });
  }, [adoptionId]);

  const reloadWorkflow = useCallback(() => {
    void loadAdoptionFollowups(adoptionId).then(setFollowups);
    refetchHandovers();
    refetchMeetings(); 
  }, [adoptionId, refetchHandovers, refetchMeetings]);

  useEffect(() => {
    reloadAdoption();
    reloadWorkflow();
  }, [reloadAdoption, reloadWorkflow]);

  const runAction = (action: Parameters<typeof applyAdoptionAction>[1], extra?: { paymentStatus?: string }) => {
    setMessage(null);
    if (USE_MOCK) {
      setMessage("Action saved locally (mock mode).");
      return;
    }
    void applyAdoptionAction(adoptionId, action, extra)
      .then(() => {
        setMessage("Updated successfully.");
        reloadAdoption();
        reloadWorkflow();
      })
      .catch((e) => setMessage(e instanceof ApiError ? e.message : "Action failed"));
  };

  const getStaffId = () => {
    const sessionStr = localStorage.getItem("pawshope_admin_session");
    return sessionStr ? JSON.parse(sessionStr).userId : 1;
  };

  const handleEvaluateMeeting = async (meetingId: number, result: "PASSED" | "FAILED") => {
    const actionName = result === "PASSED" ? "PASSED" : "FAILED";
    if (window.confirm(`Confirm evaluation for this applicant as ${actionName}?`)) {
      const note = window.prompt("Enter evaluation notes (Optional):", "") || "";
      const success = await updateResult(meetingId, result, note);
      
      if (success) {
        setDisplayMeetings(prev => prev.map(m => 
          (m.meetingId === meetingId) ? { ...m, result: result, status: "COMPLETED" } : m
        ));

        if (result === "PASSED") {
          try {
            await applyAdoptionAction(adoptionId, "approve");
            setMessage("Interview marked as PASSED and Application has been automatically APPROVED! Handover is now unlocked.");
          } catch (approveErr) {
            setMessage("Interview marked as PASSED. Please click Approve manually on the Application tab.");
          }
        } else {
          setMessage(`Evaluation ${result} saved successfully!`);
        }
        reloadAdoption();
        reloadWorkflow();
      } else {
        setMessage("Error updating interview result.");
      }
    }
  };

  if (!adoption) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Application not found.</p>
        <Link to="/admin/adoptions" className="text-[#f6931d] text-sm mt-4 inline-block">← Back</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/adoptions" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Back to adoptions
      </Link>

      <AdminPageHeader title={adoption.application_code} description={`Pet: ${adoption.pet_name}`} />

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-[#2c5f51]/20 border border-[#2c5f51]/50 text-[#3d6b5c] font-medium text-sm">
          {message}
        </div>
      )}

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
          { id: "meetings", label: `Meetings (${displayMeetings.length})` },
          { id: "handover", label: `Handover (${currentHandovers.length})` },
          { id: "followups", label: `Follow-ups (${followups.length})` },
        ]}
        className="mb-6"
      />

      {tab === "application" && (
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
              <AdminField label="Status" value={formatEnum(adoption.status)} />
              <AdminField label="Review status" value={formatEnum(adoption.review_status)} />
              <AdminField label="Processed by" value={getStaffName(adoption.processed_by)} />
              <AdminField label="Adoption fee" value={`${adoption.adoption_fee.toLocaleString()} ₫`} />
              {canEditWorkflow ? (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Payment status</p>
                  <select value={adoption.payment_status} onChange={(e) => runAction("payment", { paymentStatus: e.target.value })} className={adminInputClass()} disabled={USE_MOCK}>
                    {["UNPAID", "PENDING", "PAID", "REFUNDED"].map((s) => (
                      <option key={s} value={s}>{formatEnum(s)}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <AdminField label="Payment status" value={formatEnum(adoption.payment_status)} />
              )}
              <AdminField label="Paid at" value={adoption.paid_at ?? "—"} />
            </AdminFieldGrid>
            
            {canEditWorkflow && (
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-700/50">
                {adoption.status !== "APPROVED" && adoption.status !== "COMPLETED" && adoption.status !== "REJECTED" && adoption.status !== "CANCELLED" && (
                  displayMeetings.some((m) => m.result === "PASSED") ? (
                    <button type="button" onClick={() => runAction("approve")} className="px-4 py-1.5 bg-[#2c5f51] hover:bg-green-700 text-white text-xs font-semibold rounded-full transition-colors shadow-lg">
                      ✓ Approve
                    </button>
                  ) : (
                    <button type="button" onClick={() => setTab("meetings")} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-full transition-all shadow-md active:scale-95">
                      Schedule Interview (Go to Meetings)
                    </button>
                  )
                )}

                {adoption.status === "APPROVED" && (
                  <button type="button" onClick={() => runAction("complete")} className="px-4 py-1.5 bg-[#f6931d] hover:bg-orange-600 text-white text-xs font-semibold rounded-full transition-colors shadow-lg">
                    Complete Adoption
                  </button>
                )}

                {adoption.status !== "COMPLETED" && adoption.status !== "CANCELLED" && adoption.status !== "REJECTED" && (
                  <>
                    <button type="button" onClick={() => runAction("reject")} className="px-4 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 border border-red-500/30 text-xs font-semibold rounded-full transition-colors">
                      ✕ Reject
                    </button>
                    <button type="button" onClick={() => runAction("cancel")} className="px-4 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600 text-xs font-semibold rounded-full transition-colors">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}
          </AdminPanel>
        </div>
      )}

      {tab === "meetings" && (
        <AdoptionMeetingsTab
          adoptionId={adoptionId}
          displayMeetings={displayMeetings}
          onEvaluateMeeting={handleEvaluateMeeting}
          onWorkflowReload={reloadWorkflow}
          getStaffId={getStaffId}
          setMessage={setMessage}
        />
      )}

      {tab === "handover" && (
        <AdoptionHandoverTab
          adoptionId={adoptionId}
          adoptionStatus={adoption.status}
          currentHandovers={currentHandovers}
          onCompleteHandover={completeHandover}
          onWorkflowReload={reloadWorkflow}
          getStaffId={getStaffId}
          setMessage={setMessage}
        />
      )}

      {tab === "followups" && (
        <AdoptionFollowupsTab
          adoptionId={adoptionId}
          applicantEmail={adoption.applicant_email}
          petName={adoption.pet_name}
          followups={followups}
          currentHandovers={currentHandovers} 
          onWorkflowReload={reloadWorkflow}
          getStaffId={getStaffId}
        />
      )}
    </div>
  );
}