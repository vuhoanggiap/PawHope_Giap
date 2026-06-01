import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAdoptions } from "@/data/admin-mock";
import {
  applyAdoptionAction,
  getStaffName,
  loadAdoptionFollowups,
  loadAdoptions,
} from "@/lib/admin/admin-data";
import { apiFetch, ApiError, USE_MOCK } from "@/lib/api-client";
import { staffIsAdmin } from "@/lib/admin/admin-role";
import { formatEnum } from "@/lib/adminFormat";
import { ArrowLeft, CalendarPlus, X, Box, CheckCircle, XCircle } from "lucide-react";

// Import Hooks thật từ Backend
import { useAdoptionHandovers } from "@/hooks/useAdoptionHandovers";
import { useAdoptionMeetings } from "@/hooks/useAdoptionMeetings";

type FollowupRow = Awaited<ReturnType<typeof loadAdoptionFollowups>>[number];

export function AdminAdoptionDetailPage() {
  const canEditWorkflow = staffIsAdmin();
  const { id } = useParams();
  const adoptionId = Number(id);
  
  const [adoption, setAdoption] = useState(
    () => mockAdoptions.find((a) => a.adoption_id === adoptionId)
  );
  
  const [followups, setFollowups] = useState<FollowupRow[]>([]);
  const [tab, setTab] = useState("application");
  const [message, setMessage] = useState<string | null>(null);

  // --- HOOKS KẾT NỐI API THẬT ---
  const { 
    handovers, 
    refetch: refetchHandovers, 
    completeHandover 
  } = useAdoptionHandovers();

  const {
    meetings: apiMeetings,
    refetch: refetchMeetings,
    updateResult
  } = useAdoptionMeetings();

  // Lọc dữ liệu API theo Đơn hiện tại
  const currentHandovers = handovers.filter(h => h.adoptionId === adoptionId);
  const currentMeetings = apiMeetings.filter(m => m.adoptionId === adoptionId);

  // --- STATE FOR FORMS ---
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingNote, setMeetingNote] = useState("");

  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [handoverMethod, setHandoverMethod] = useState("PICKUP");
  const [handoverDate, setHandoverDate] = useState("");
  const [handoverLocation, setHandoverLocation] = useState("");
  const [handoverItems, setHandoverItems] = useState("");
  const [handoverNote, setHandoverNote] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadAdoption = useCallback(() => {
    void loadAdoptions().then((list) => {
      setAdoption(list.find((a) => a.adoption_id === adoptionId));
    });
  }, [adoptionId]);

  const reloadWorkflow = useCallback(() => {
    void loadAdoptionFollowups(adoptionId).then(setFollowups);
    refetchHandovers();
    refetchMeetings(); // Gọi API lấy Lịch phỏng vấn mới nhất
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

  // --- XỬ LÝ LỊCH PHỎNG VẤN ---
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await apiFetch("/adoption_meetings", {
        method: "POST",
        body: JSON.stringify({
          adoptionId: adoptionId,
          staffId: getStaffId(),
          meetingDatetime: meetingDate,
          meetingLocation: meetingLocation,
          note: meetingNote
        }),
      });
      setMessage("Interview scheduled successfully! An email has been sent.");
      setShowMeetingForm(false);
      setMeetingDate(""); setMeetingLocation(""); setMeetingNote("");
      reloadWorkflow();
    } catch (error: any) {
      setMessage("Error: " + (error instanceof ApiError ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // NÚT ĐÁNH GIÁ PHỎNG VẤN TRỰC TIẾP TRONG CHI TIẾT
  const handleEvaluateMeeting = async (meetingId: number, result: "PASSED" | "FAILED") => {
    const actionName = result === "PASSED" ? "ĐẠT (PASSED)" : "KHÔNG ĐẠT (FAILED)";
    if (window.confirm(`Xác nhận đánh giá ứng viên ${actionName}? Hệ thống sẽ gửi email tự động.`)) {
      const note = window.prompt("Nhập ghi chú đánh giá (Tùy chọn):", "") || "";
      const success = await updateResult(meetingId, result, note);
      if (success) {
        setMessage(`Đánh giá ${result} thành công! Email đã được gửi.`);
        reloadWorkflow();
      } else {
        setMessage("Lỗi khi cập nhật kết quả phỏng vấn.");
      }
    }
  };

  // --- XỬ LÝ LỊCH BÀN GIAO ---
  const handleScheduleHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await apiFetch("/adoption_handovers", {
        method: "POST",
        body: JSON.stringify({
        adoptionId: adoptionId,
        handledBy: getStaffId(),       // Đổi staffId -> handledBy
        pickupDatetime: handoverDate,
        pickupLocation: handoverLocation,
        handoverMethod: handoverMethod,
        itemsGiven: handoverItems,
        completionNote: handoverNote   // Đổi note -> completionNote
        }),
      });
      setMessage("Handover scheduled successfully!");
      setShowHandoverForm(false);
      setHandoverDate(""); setHandoverLocation(""); setHandoverItems(""); setHandoverNote("");
      reloadWorkflow();
    } catch (error: any) {
      setMessage("Error scheduling handover: " + (error instanceof ApiError ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteHandover = async (handoverId: number) => {
    if (window.confirm("Xác nhận Đã Bàn Giao Thú Cưng thành công?")) {
      const note = window.prompt("Ghi chú bàn giao (Tùy chọn):", "");
      const success = await completeHandover(handoverId, note || "");
      if (success) {
        setMessage("Bàn giao hoàn tất!");
      } else {
        setMessage("Có lỗi khi cập nhật trạng thái bàn giao.");
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

      {message ? (
        <div className="mb-6 p-4 rounded-xl bg-[#2c5f51]/20 border border-[#2c5f51]/50 text-[#3d6b5c] font-medium text-sm">
          {message}
        </div>
      ) : null}

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
          { id: "meetings", label: `Meetings (${currentMeetings.length})` },
          { id: "handover", label: `Handover (${currentHandovers.length})` },
          { id: "followups", label: `Follow-ups (${followups.length})` },
        ]}
        className="mb-6"
      />

      {/* --- TAB: APPLICATION --- */}
      {tab === "application" ? (
        <div className="space-y-4">
          {/* CÁC PANEL CŨ GIỮ NGUYÊN BÊN TRONG NÀY... */}
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
                  <p className="text-xs uppercase tracking-wide text-slate-500">Payment status</p>
                  <select
                    value={adoption.payment_status}
                    onChange={(e) => runAction("payment", { paymentStatus: e.target.value })}
                    className={adminInputClass()}
                    disabled={USE_MOCK}
                  >
                    {["UNPAID", "PENDING", "PAID", "REFUNDED"].map((s) => (
                      <option key={s} value={s}>
                        {formatEnum(s)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <AdminField label="Payment status" value={formatEnum(adoption.payment_status)} />
              )}
              <AdminField label="Paid at" value={adoption.paid_at ?? "—"} />
            </AdminFieldGrid>
            
            {canEditWorkflow ? (
              <div className="flex flex-wrap gap-2 mt-4">
                <button type="button" onClick={() => runAction("approve")} className="admin-filter-pill-active text-xs">Approve</button>
                <button type="button" onClick={() => runAction("reject")} className="admin-filter-pill text-xs">Reject</button>
                <button type="button" onClick={() => runAction("complete")} className="admin-filter-pill text-xs">Complete</button>
                <button type="button" onClick={() => runAction("cancel")} className="admin-filter-pill text-xs">Cancel</button>
              </div>
            ) : null}
          </AdminPanel>
        </div>
      ) : null}

      {/* --- TAB: MEETINGS --- */}
      {tab === "meetings" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-white">Meeting List</h3>
            <button
              onClick={() => setShowMeetingForm(!showMeetingForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#f6931d] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all"
            >
              {showMeetingForm ? <X size={16} /> : <CalendarPlus size={16} />}
              {showMeetingForm ? "Close Form" : "Schedule New"}
            </button>
          </div>

          {showMeetingForm && (
            <AdminPanel title="Schedule New Interview Meeting">
              <form onSubmit={handleScheduleMeeting} className="space-y-4">
                <AdminFieldGrid cols={2}>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Meeting Time</label>
                    <input type="datetime-local" required value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className={adminInputClass()} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Location</label>
                    <input type="text" required placeholder="Ex: Rescue Station Base 1..." value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)} className={adminInputClass()} />
                  </div>
                </AdminFieldGrid>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Note for applicant (optional)</label>
                  <textarea value={meetingNote} onChange={(e) => setMeetingNote(e.target.value)} className={adminInputClass()} placeholder="Documents to bring..." />
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#2c5f51] hover:bg-green-800 text-white font-semibold rounded-lg disabled:opacity-50">
                    {isSubmitting ? "Saving..." : "Confirm Schedule"}
                  </button>
                </div>
              </form>
            </AdminPanel>
          )}

          {currentMeetings.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No meetings on record.</p>
          ) : (
            currentMeetings.map((m) => (
              <AdminPanel key={m.meetingId} title={`Meeting · ${new Date(m.meetingDatetime).toLocaleString('en-US')}`}>
                <AdminFieldGrid cols={3}>
                  <AdminField label="Staff" value={`Staff #${m.staffId}`} />
                  <AdminField label="Location" value={m.meetingLocation} />
                  <AdminField label="Status" value={<StatusBadge value={m.status} />} />
                  <AdminField label="Result" value={<StatusBadge value={m.result} />} />
                  
                  {/* --- NÚT ĐÁNH GIÁ (CHỈ HIỂN THỊ KHI PENDING) --- */}
                  {m.result === "PENDING" && m.status !== "CANCELLED" ? (
                    <div className="col-span-3 mt-2 flex items-center gap-3 border-t border-slate-700/50 pt-4">
                      <span className="text-sm font-medium text-slate-400 mr-2">Evaluate Interview:</span>
                      <button
                        onClick={() => handleEvaluateMeeting(m.meetingId, "PASSED")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c5f51] hover:bg-green-700 text-white border border-[#2c5f51] rounded-lg text-xs font-semibold transition-all"
                      >
                        <CheckCircle size={14} /> Mark PASSED
                      </button>
                      <button
                        onClick={() => handleEvaluateMeeting(m.meetingId, "FAILED")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-lg text-xs font-semibold transition-all"
                      >
                        <XCircle size={14} /> Mark FAILED
                      </button>
                    </div>
                  ) : null}

                </AdminFieldGrid>
                {/* Thay thế phần note cũ bằng đoạn này */}
                <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase mb-1">Meeting Notes / Reschedule Proposals</p>
                  <p className="text-sm text-slate-200 whitespace-pre-line">{m.note || "No notes."}</p>
                  
                  {/* Nếu status là RESCHEDULED, hiển thị nút để Admin chốt lịch mới */}
                  {m.status === "RESCHEDULED" && (
                    <button 
                      onClick={async () => {
                        const newTime = prompt("Nhập thời gian mới (YYYY-MM-DDTHH:MM):", new Date().toISOString().slice(0, 16));
                        if (newTime) {
                          try {
                            await apiFetch(`/adoption_meetings/${m.meetingId}/reschedule-confirm`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ newDatetime: newTime })
                            });
                            alert("Lịch đã được cập nhật thành công!");
                            reloadWorkflow();
                          } catch (err) {
                            alert("Có lỗi xảy ra khi xác nhận lịch!");
                          }
                        }
                      }}
                      className="mt-2 text-xs font-bold text-[#f6931d] hover:text-white flex items-center gap-1"
                    >
                      ⚙️ Cập nhật lại lịch chính thức
                    </button>
                  )}
                </div>
              </AdminPanel>
            ))
          )}
        </div>
      ) : null}

      {/* --- TAB: HANDOVERS --- */}
      {tab === "handover" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-white">Handover Schedule</h3>
            {adoption.status === "APPROVED" || adoption.status === "COMPLETED" ? (
              <button
                onClick={() => setShowHandoverForm(!showHandoverForm)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2c5f51] hover:bg-green-800 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#2c5f51]/20"
              >
                {showHandoverForm ? <X size={16} /> : <Box size={16} />}
                {showHandoverForm ? "Close Form" : "Schedule Handover"}
              </button>
            ) : (
              <span className="text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                ⚠️ Application must be APPROVED to schedule handover
              </span>
            )}
          </div>

          {showHandoverForm && (
            <AdminPanel title="Schedule Pet Handover">
              <form onSubmit={handleScheduleHandover} className="space-y-4">
                <AdminFieldGrid cols={2}>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Handover Method</label>
                    <select 
                      value={handoverMethod} 
                      onChange={(e) => setHandoverMethod(e.target.value)} 
                      className={adminInputClass()}
                    >
                      <option value="AT_SHELTER">Đón tại trạm (AT_SHELTER)</option>
                      <option value="HOME_VISIT">Giao tận nhà (HOME_VISIT)</option>
                      <option value="MEETUP_POINT">Điểm hẹn (MEETUP_POINT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Date & Time</label>
                    <input type="datetime-local" required value={handoverDate} onChange={(e) => setHandoverDate(e.target.value)} className={adminInputClass()} />
                  </div>
                </AdminFieldGrid>
                
                <AdminFieldGrid cols={2}>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Location</label>
                    <input type="text" required placeholder="Địa chỉ giao/nhận..." value={handoverLocation} onChange={(e) => setHandoverLocation(e.target.value)} className={adminInputClass()} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Items Given</label>
                    <input type="text" placeholder="Sổ tiêm, vòng cổ, hạt..." value={handoverItems} onChange={(e) => setHandoverItems(e.target.value)} className={adminInputClass()} />
                  </div>
                </AdminFieldGrid>

                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Internal Note</label>
                  <textarea value={handoverNote} onChange={(e) => setHandoverNote(e.target.value)} className={adminInputClass()} placeholder="Ghi chú thêm..." />
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#f6931d] hover:bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-50">
                    {isSubmitting ? "Saving..." : "Confirm Schedule"}
                  </button>
                </div>
              </form>
            </AdminPanel>
          )}

          {currentHandovers.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No handover scheduled yet.</p>
          ) : (
            currentHandovers.map((h) => (
              <AdminPanel key={h.handoverId} title={`Handover · ${formatEnum(h.handoverMethod)}`}>
                <AdminFieldGrid cols={3}>
                  <AdminField label="Date/Time" value={new Date(h.pickupDatetime).toLocaleString('en-US')} />
                  <AdminField label="Location" value={h.pickupLocation} />
                  <AdminField label="Status" value={<StatusBadge value={h.status} />} />
                  <AdminField label="Handled by" value={`Staff #${h.staffId}`} />
                  <AdminField label="Adopter Confirmed" value={h.adopterConfirmed ? "Yes ✅" : "No ⏳"} />
                  
                  {h.status === "SCHEDULED" ? (
                    <div className="flex items-center">
                      <button
                        onClick={() => handleCompleteHandover(h.handoverId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/30 rounded-lg text-xs font-semibold transition-all"
                      >
                        <CheckCircle size={14} /> Mark as Completed
                      </button>
                    </div>
                  ) : (
                     <AdminField label="Action" value={<span className="text-xs text-slate-500">Already Completed</span>} />
                  )}
                </AdminFieldGrid>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <AdminField label="Items given" value={h.itemsGiven || "—"} />
                  <AdminField label="Note" value={h.note || "—"} />
                </div>
              </AdminPanel>
            ))
          )}
        </div>
      ) : null}

     {/* --- TAB: FOLLOWUPS --- */}
      {tab === "followups" ? (
        <div className="space-y-3">
          {/* 1. NÚT NÀY PHẢI NẰM NGOÀI MAP VÀ ĐIỀU KIỆN RỖNG ĐỂ LUÔN HIỆN */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Follow-up History</h3>
            <button
              onClick={() => {
                  const nextDate = prompt("Nhập ngày theo dõi tiếp theo (YYYY-MM-DD):");
                  if (nextDate) {
                    apiFetch("/adoption_followups", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ 
                          adoptionId: adoptionId,
                          followup_date: nextDate,
                          followup_type: "PHONE_CALL",
                          createdBy: getStaffId(), // Đừng quên trường này!
                          status: "SCHEDULED" 
                      })
                    }).then(() => reloadWorkflow());
                  }
              }}
              className="px-4 py-2 bg-[#f6931d] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg"
            >
              + New Follow-up
            </button>
          </div>

          {/* 2. HIỂN THỊ DANH SÁCH */}
          {followups.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No follow-ups logged.</p>
          ) : (
            followups.map((f) => (
              <AdminPanel key={f.followup_id} title={`Follow-up · ${f.followup_date}`}>
                <AdminFieldGrid cols={3}>
                  <AdminField label="Type" value={formatEnum(f.followup_type)} />
                  <AdminField label="Status" value={<StatusBadge value={f.status} />} />
                  <AdminField label="Pet condition" value={formatEnum(f.pet_condition)} />
                  <AdminField label="Next follow-up" value={f.next_followup_date ?? "—"} />
                </AdminFieldGrid>
                <AdminField label="Adopter feedback" value={f.adopter_feedback || "—"} className="mt-3" />
                <AdminField label="Staff note" value={f.staff_note || "—"} className="mt-3" />

                {/* CÁC NÚT THAO TÁC (CONFIRM/COMPLETE/CANCEL) VẪN NẰM TRONG MAP */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  {/* ... các nút Confirm/Complete/Cancel của bạn ở đây ... */}
                </div>
              </AdminPanel>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}