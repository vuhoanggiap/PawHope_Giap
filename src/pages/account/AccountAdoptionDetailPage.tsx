import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusTimeline } from "@/components/public/StatusTimeline";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { apiFetch } from "@/lib/api-client";
import { useAdoptionMeetings } from "@/hooks/useAdoptionMeetings"; 
import {
  adoptionProgressSteps,
  formatPublicEnum,
  adoptionStatusIndex,
  type PublicAdoption,
} from "@/data/public-mock";
import { loadAdoptionById } from "@/lib/public-store";
import { ArrowLeft, CalendarClock, CalendarDays, X, CheckCircle, Clock } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const TIME_SHIFTS = [
  { id: "Morning", label: "08:30 - 11:30", startTime: "08:30" },
  { id: "Noon", label: "11:30 - 14:00", startTime: "11:30" },
  { id: "Afternoon", label: "14:00 - 17:00", startTime: "14:00" },
  { id: "Evening", label: "17:00 - 20:00", startTime: "17:00" },
];

export function AccountAdoptionDetailPage() {
  const { id } = useParams();
  const { user } = usePublicAuth();
  const [adoption, setAdoption] = useState<PublicAdoption | undefined>();
  
  const [meetingInfo, setMeetingInfo] = useState<any | null>(null);
  const [handoverInfo, setHandoverInfo] = useState<any | null>(null);
  const [followupInfo, setFollowupInfo] = useState<any | null>(null);

  const { requestReschedule } = useAdoptionMeetings();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleShift, setRescheduleShift] = useState("");

  // State phục vụ riêng cho Modal Đổi lịch Handover
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverRescheduleDate, setHandoverRescheduleDate] = useState("");
  const [handoverRescheduleShift, setHandoverRescheduleShift] = useState("");

  const [userFeedback, setUserFeedback] = useState("");
  const [userPhotoUrl, setUserPhotoUrl] = useState("");

  const loadWorkflowSchedules = () => {
    if (!id) return;
    
    apiFetch(`/adoption_meetings/adoption/${id}`)
      .then((meetings: any) => {
        const meetingsArray = Array.isArray(meetings) ? meetings : meetings?.data ? meetings.data : meetings ? [meetings] : [];
        if (meetingsArray.length > 0) {
          const sorted = [...meetingsArray].sort((a: any, b: any) => (b.meetingId || b.id || 0) - (a.meetingId || a.id || 0));
          setMeetingInfo(sorted[0]);
        }
      })
      .catch((e) => console.log("No meeting scheduled yet", e));

    apiFetch(`/adoption_handovers/adoption/${id}`)
      .then((handovers: any) => {
        const handoversArray = Array.isArray(handovers) ? handovers : handovers?.data ? handovers.data : handovers ? [handovers] : [];
        if (handoversArray.length > 0) {
          const sorted = [...handoversArray].sort((a: any, b: any) => (b.handoverId || b.id || 0) - (a.handoverId || a.id || 0));
          setHandoverInfo(sorted[0]);
        }
      })
      .catch((e) => console.log("No handover configured yet", e));

    apiFetch(`/adoption_followups/adoption/${id}`)
      .then((followups: any) => {
        const followupsArray = Array.isArray(followups) ? followups : followups?.data ? followups.data : followups ? [followups] : [];
        if (followupsArray.length > 0) {
          const sorted = [...followupsArray].sort((a: any, b: any) => {
            const idA = a.followupId || a.followup_id || a.id || 0;
            const idB = b.followupId || b.followup_id || b.id || 0;
            return idB - idA;
          });
          setFollowupInfo(sorted[0]);
        }
      })
      .catch((e) => console.log("No follow-up records found", e));
  };

  // 🌟 ĐỒNG BỘ WEBSOCKET: Tự động cập nhật UI tức thì khi Admin ấn Approve & Confirm
  useEffect(() => {
    if (!id) return;

    const socket = new SockJS("http://localhost:8082/ws"); // Điều chỉnh đúng port backend của bạn
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket Broker successfully!");
        stompClient.subscribe(`/topic/adoption/${id}`, (message: any) => { // 🌟 Thêm kiểu ": any" ở đây
        if (message.body === "HANDOVER_UPDATED") {
          console.log("Received notification from admin. Refreshing workflow...");
          loadWorkflowSchedules(); 
        }
      });
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    void loadAdoptionById(user.userId, Number(id)).then(setAdoption);
    loadWorkflowSchedules();
  }, [user, id]);

  const handleConfirmAttend = async () => {
    const isUserAgreed = window.confirm("Are you sure you want to confirm this interview schedule?");
    if (!isUserAgreed) return;

    const targetMeetingId = meetingInfo?.meetingId || meetingInfo?.meeting_id || meetingInfo?.id;
    if (!targetMeetingId) return;

    setIsSubmitting(true);
    try {
      await apiFetch(`/adoption_meetings/${targetMeetingId}/confirm`, { method: "PATCH" });
      setMeetingInfo((prev: any) => prev ? { ...prev, status: "CONFIRMED" } : null);
      setSuccessMsg("You have successfully confirmed your attendance!");
      loadWorkflowSchedules(); 
    } catch (error) {
      alert("Failed to confirm attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmHandover = async () => {
    if (!handoverInfo) return;
    const targetHandoverId = handoverInfo.handoverId || handoverInfo.handover_id || handoverInfo.id;
    if (!targetHandoverId) return;

    const isUserAgreed = window.confirm("Confirm that you agree with this pet handover schedule?");
    if (!isUserAgreed) return;

    setIsSubmitting(true);
    try {
      await apiFetch(`/adoption_handovers/${targetHandoverId}/confirm-adopter`, { method: "PATCH" });
      setHandoverInfo((prev: any) => prev ? { ...prev, adopterConfirmed: true } : null);
      setSuccessMsg("Handover schedule confirmed successfully!");
      loadWorkflowSchedules(); 
    } catch (error) {
      alert("Failed to confirm handover schedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitHandoverReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverInfo) return;
    const targetHandoverId = handoverInfo.handoverId || handoverInfo.handover_id || handoverInfo.id;
    if (!targetHandoverId) return;

    setIsSubmitting(true);
    const shiftLabel = TIME_SHIFTS.find(s => s.id === handoverRescheduleShift)?.label;
    const proposedText = `Customer requested handover reschedule:\nDate: ${handoverRescheduleDate}\nTime: ${handoverRescheduleShift} (${shiftLabel})`;

    try {
      // 🌟 FIXED PATH: Sử dụng đúng định dạng url gạch dưới và không có tiền tố lặp thừa
      await apiFetch(`/adoption_handovers/${targetHandoverId}/reschedule-request?note=${encodeURIComponent(proposedText)}`, {
        method: "PATCH",
      });
      setHandoverInfo((prev: any) => prev ? { ...prev, status: "RESCHEDULED" } : null);
      setShowHandoverModal(false);
      setSuccessMsg("Handover reschedule request submitted successfully!");
      loadWorkflowSchedules();
    } catch (error) {
      alert("Failed to submit handover reschedule request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSubmitFollowupReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupInfo || !userFeedback) return;

    const targetFollowupId = followupInfo.followupId || followupInfo.followup_id || followupInfo.id;
    if (!targetFollowupId) return;

    setIsSubmitting(true);
    try {
      await apiFetch(`/adoption_followups/${targetFollowupId}/submit-report`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adopter_feedback: userFeedback,
          photo_url: userPhotoUrl || null,
          pet_condition: "GOOD"
        })
      });

      setFollowupInfo((prev: any) => prev ? { ...prev, status: "COMPLETED", adopter_feedback: userFeedback, photo_url: userPhotoUrl } : null);
      setSuccessMsg("Thank you! Your pet follow-up report has been submitted successfully.");
      setUserFeedback(""); 
      setUserPhotoUrl("");
      loadWorkflowSchedules();
    } catch (err) {
      alert("Failed to submit your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSlotDisabled = (dateStr: string, startTimeStr: string) => {
    if (!dateStr) return false;
    const now = new Date();
    const selectedDate = new Date(dateStr);
    if (selectedDate.getDate() !== now.getDate() || selectedDate.getMonth() !== now.getMonth() || selectedDate.getFullYear() !== now.getFullYear()) return false;
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const slotTime = new Date(); slotTime.setHours(hours, minutes, 0, 0);
    return now > slotTime;
  };

  useEffect(() => {
    if (rescheduleShift) {
      const selectedShiftObj = TIME_SHIFTS.find(s => s.id === rescheduleShift);
      if (selectedShiftObj && isSlotDisabled(rescheduleDate, selectedShiftObj.startTime)) {
        setRescheduleShift("");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rescheduleDate]);

  useEffect(() => {
    if (handoverRescheduleShift) {
      const selectedShiftObj = TIME_SHIFTS.find(s => s.id === handoverRescheduleShift);
      if (selectedShiftObj && isSlotDisabled(handoverRescheduleDate, selectedShiftObj.startTime)) {
        setHandoverRescheduleShift("");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handoverRescheduleDate]);

  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetMeetingId = meetingInfo?.meetingId || meetingInfo?.meeting_id || meetingInfo?.id;
    if (!targetMeetingId) return;

    setIsSubmitting(true);
    const shiftLabel = TIME_SHIFTS.find(s => s.id === rescheduleShift)?.label;
    const proposedText = `Customer requested reschedule:\nDate: ${rescheduleDate}\nTime: ${rescheduleShift} (${shiftLabel})`;

    const success = await requestReschedule(targetMeetingId, proposedText);
    if (success) {
      setMeetingInfo((prev: any) => prev ? { ...prev, status: "RESCHEDULED" } : null);
      setShowModal(false);
      loadWorkflowSchedules();
    } else {
      alert("Failed to send request.");
    }
    setIsSubmitting(false);
  };

  if (!user) return null;
  if (!adoption) return null;

  const failed = adoption.status === "REJECTED" || adoption.status === "CANCELLED";
  const activeIndex = adoptionStatusIndex(adoption.status);
  const currentMeetingStatus = meetingInfo?.status?.toUpperCase() || "";
  const currentHandoverStatus = handoverInfo?.status?.toUpperCase() || "";
  const currentFollowupStatus = followupInfo?.status?.toUpperCase() || "";

  return (
    <div className="space-y-6">
      <Link to="/account/adoptions" className="inline-flex items-center gap-2 text-sm font-medium text-[#f6931d] hover:underline">
        <ArrowLeft size={16} /> All adoptions
      </Link>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium text-sm">
          {successMsg}
        </div>
      )}

      <div className="soft-card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <img src={adoption.pet_image} alt="" className="w-full sm:w-40 h-40 rounded-2xl object-cover" />
          <div>
            <p className="soft-label">Application</p>
            <h2 className="text-2xl font-bold text-[#2c5f51]">{adoption.pet_name}</h2>
            <p className="soft-subtext text-sm mt-1">{adoption.application_code}</p>
            <p className="text-sm mt-3">
              Status: <span className="font-semibold text-[#3d6b5c]">{formatPublicEnum(adoption.status)}</span>
            </p>
          </div>
        </div>

        {/* --- BANNER 1: LỊCH HẸN PHỎNG VẤN GẶP MẶT --- */}
        {meetingInfo && (
          <div className="mb-4 p-5 bg-[#2c5f51]/10 border border-[#2c5f51]/30 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2 text-sm text-[#3d6b5c] flex-1">
              <h3 className="font-bold text-[#2c5f51] flex items-center gap-2 text-base">
                <CalendarClock size={20} className="text-[#f6931d]" /> Interview / Assessment Schedule
              </h3>
              <p>
                <strong>Current Status:</strong>{" "}
                <span className={`font-semibold uppercase ${
                  currentMeetingStatus === 'CONFIRMED' || currentMeetingStatus === 'COMPLETED' ? 'text-green-600' : currentMeetingStatus === 'RESCHEDULED' ? 'text-amber-500' : 'text-[#f6931d]'
                }`}>
                  {meetingInfo.status}
                </span>
              </p>
              <p><strong>Time:</strong> {new Date(meetingInfo.meetingDatetime).toLocaleString('en-US')}</p>
              <p><strong>Location:</strong> {meetingInfo.meetingLocation}</p>
            </div>

            {currentMeetingStatus === "SCHEDULED" ? (
              <div className="flex flex-wrap gap-2 w-full lg:w-auto shrink-0">
                <button disabled={isSubmitting} onClick={handleConfirmAttend} className="flex-1 lg:flex-none px-4 py-2 bg-[#2c5f51] hover:bg-green-800 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 white-space-nowrap">{isSubmitting ? "Confirming..." : "Confirm Attend"}</button>
                <button disabled={isSubmitting} onClick={() => setShowModal(true)} className="flex-1 lg:flex-none px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold rounded-xl text-sm transition-all disabled:opacity-50 white-space-nowrap">Reschedule Request</button>
              </div>
            ) : currentMeetingStatus === "CONFIRMED" ? (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold shadow-sm"><CheckCircle size={16} /> Schedule Confirmed (Locked)</div>
            ) : currentMeetingStatus === "COMPLETED" ? (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold shadow-sm"><CheckCircle size={16} /> ✓ Interview Evaluation Finished</div>
            ) : (
              <div className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">⏳ Awaiting Admin response for alternative schedule...</div>
            )}
          </div>
        )}

        {/* --- BANNER ĐỢI ADMIN TẠO LỊCH BÀN GIAO --- */}
        {!handoverInfo && (adoption.status === "APPROVED" || currentMeetingStatus === "COMPLETED") && (
          <div className="mb-4 p-5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3 animate-fade-in">
            <Clock className="text-sky-500 shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-bold text-sky-800">Application Approved!</h3>
              <p className="text-xs text-sky-700 mt-1">Please wait a moment. The shelter is arranging the pet handover and delivery schedule for you.</p>
            </div>
          </div>
        )}

        {/* --- BANNER 2: LỊCH BÀN GIAO ĐÓN VẬT NUÔI --- */}
        {handoverInfo && (
          <div className="mb-4 p-5 bg-sky-50 border border-sky-200 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 animate-fade-in">
            <div className="space-y-2 text-sm text-sky-800 flex-1">
              <h3 className="font-bold text-sky-900 flex items-center gap-2 text-base">
                <CalendarClock size={20} className="text-[#f6931d]" /> Pet Handover & Delivery Schedule
              </h3>
              <p><strong>Handover Status:</strong> <span className="font-bold uppercase text-sky-600">{handoverInfo.status}</span></p>
              <p><strong>Method:</strong> {formatPublicEnum(handoverInfo.handoverMethod || "PICKUP")}</p>
              <p><strong>Time:</strong> {new Date(handoverInfo.pickupDatetime || handoverInfo.pickup_datetime).toLocaleString('en-US')}</p>
              <p><strong>Location:</strong> {handoverInfo.pickupLocation || handoverInfo.pickup_location}</p>
            </div>

            {/* 🌟 CHUẨN HÓA LOGIC RENDER: Tách nút Confirm và nút Đổi lịch biệt lập, cài chốt chặn bảo mật */}
            {currentHandoverStatus === "SCHEDULED" || (currentHandoverStatus === "CONFIRMED" && !handoverInfo.adopterConfirmed && !handoverInfo.adopter_confirmed) ? (
              <div className="flex flex-wrap gap-2 w-full lg:w-auto shrink-0">
                
                {/* Nút Confirm hiển thị khi Admin tạo lịch (SCHEDULED) hoặc khi Admin duyệt lịch đổi (CONFIRMED) */}
                <button disabled={isSubmitting} onClick={handleConfirmHandover} className="flex-1 lg:flex-none px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-all shadow-md white-space-nowrap">
                  {isSubmitting ? "Processing..." : "Confirm This Schedule"}
                </button>
                
                {/* 🌟 CHỐT CHẶN: Chỉ hiển thị nút yêu cầu đổi lịch khi trạng thái là SCHEDULED (Chưa từng đổi) */}
                {currentHandoverStatus === "SCHEDULED" && (
                  <button disabled={isSubmitting} onClick={() => setShowHandoverModal(true)} className="flex-1 lg:flex-none px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold rounded-xl text-sm transition-all disabled:opacity-50 white-space-nowrap">
                    Reschedule Request
                  </button>
                )}
                
              </div>
            ) : handoverInfo.adopterConfirmed || handoverInfo.adopter_confirmed ? (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold shadow-sm">
                <CheckCircle size={16} /> Handover Confirmed by You (Waiting Delivery)
              </div>
            ) : currentHandoverStatus === "COMPLETED" ? (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold shadow-sm">
                ✅ Handover Process Finished
              </div>
            ) : (
              /* Trạng thái RESCHEDULED: Khách đã đổi lịch, đang chờ Admin duyệt */
              <div className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                ⏳ Awaiting Admin response for alternative handover schedule...
              </div>
            )}
          </div>
        )}

        {/* --- BANNER ĐỢI ADMIN TẠO LỊCH THEO DÕI --- */}
        {!followupInfo && (adoption.status === "COMPLETED" || handoverInfo?.status?.toUpperCase() === "COMPLETED") && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 animate-fade-in">
            <Clock className="text-amber-500 shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-bold text-amber-800">Handover Completed!</h3>
              <p className="text-xs text-amber-700 mt-1">The pet is now with you. The shelter will schedule a periodic follow-up to check on the pet's well-being soon.</p>
            </div>
          </div>
        )}

        {/* --- BANNER 3: LỊCH THEO DÕI ĐỊNH KỲ VÀ KHUNG GỬI BÁO CÁO CỦA KHÁCH --- */}
        {followupInfo && (
          <div className="mb-8 p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-4 animate-fade-in">
            <div className="text-sm text-amber-900 space-y-1">
              <h3 className="font-bold flex items-center gap-2 text-base text-amber-800">
                <CalendarDays size={20} className="text-[#f6931d]" /> Periodic Follow-up Progress
              </h3>
              <p><strong>Scheduled Review Date:</strong> <span className="font-semibold text-orange-600">{followupInfo.followup_date}</span></p>
              <p><strong>Contact Method:</strong> {formatPublicEnum(followupInfo.followup_type || "")}</p>
            </div>

            {currentFollowupStatus === "SCHEDULED" ? (
              <form onSubmit={handleUserSubmitFollowupReport} className="p-4 bg-white rounded-xl border border-amber-200 space-y-3">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Submit Update Report for {adoption.pet_name}:</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">How is the pet doing? (Eating, health, behavior) <span className="text-red-500">*</span></label>
                  <textarea required rows={2} value={userFeedback} onChange={(e) => setUserFeedback(e.target.value)} placeholder="Provide detailed health and adaptation feedback here..." className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 bg-slate-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Evidence Photo URL (Optional)</label>
                  <input type="text" value={userPhotoUrl} onChange={(e) => setUserPhotoUrl(e.target.value)} placeholder="Paste any public link image of the pet here..." className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 bg-slate-50/50" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting || !userFeedback} className="px-5 py-1.5 bg-[#f6931d] hover:bg-orange-600 text-white font-bold rounded-xl text-xs disabled:opacity-50 transition-colors">Submit Report</button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-green-50/70 border border-green-200 rounded-xl space-y-2 text-xs text-green-800">
                <p className="font-bold flex items-center gap-1 text-sm text-green-700">✓ Periodic Follow-up Report Finished</p>
                <p><strong>Your Feedback:</strong> {followupInfo.adopter_feedback}</p>
                {followupInfo.photo_url && (
                  <p><strong>Photo Evidence:</strong> <a href={followupInfo.photo_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">Click here to open verification photo</a></p>
                )}
              </div>
            )}
          </div>
        )}

        <h3 className="font-semibold text-[#2c5f51] mb-4">Progress</h3>
        <StatusTimeline steps={adoptionProgressSteps.map((s) => ({ id: s.status, label: s.label, description: s.description }))} activeIndex={failed ? 0 : Math.max(activeIndex, 0)} failed={failed} failedLabel={adoption.status === "REJECTED" ? "This application was not approved." : "This application was cancelled."} />
      </div>

      {/* --- MODAL CHỌN LỊCH MỚI PHÒNG VẤN (MEETING) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative animate-scale-up">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <div className="flex items-center gap-2 border-b pb-3 mb-4"><CalendarDays className="text-[#f6931d]" /><h3 className="text-lg font-bold text-[#2c5f51]">Propose Alternative Time</h3></div>
            <form onSubmit={handleSubmitReschedule} className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2c5f51] mb-2">Select Date <span className="text-red-500">*</span></label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#2c5f51] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2c5f51] mb-2">Select Time Slot <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SHIFTS.map((shift) => {
                      const disabled = isSlotDisabled(rescheduleDate, shift.startTime);
                      return (
                        <button key={shift.id} type="button" disabled={disabled} onClick={() => setRescheduleShift(shift.id)} className={`py-2.5 px-2 text-center rounded-lg border transition-all ${disabled ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60" : rescheduleShift === shift.id ? "bg-[#f6931d] border-[#f6931d] text-white shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-[#f6931d]"}`}>
                          <div className="font-semibold text-sm">{shift.id} {disabled && "(Passed)"}</div>
                          <div className={`text-[11px] mt-0.5 ${disabled ? "text-gray-400" : rescheduleShift === shift.id ? "text-orange-100" : "text-gray-400"}`}>{shift.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || !rescheduleShift} className="flex-1 py-3 bg-[#f6931d] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">{isSubmitting ? "Sending..." : "Submit Proposal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CHỌN LỊCH MỚI BÀN GIAO (HANDOVER) --- */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative animate-scale-up">
            <button onClick={() => setShowHandoverModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <div className="flex items-center gap-2 border-b pb-3 mb-4"><CalendarDays className="text-sky-600" /><h3 className="text-lg font-bold text-sky-900">Propose Alternative Handover Time</h3></div>
            <form onSubmit={handleSubmitHandoverReschedule} className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                <div>
                  <label className="block text-sm font-bold text-sky-900 mb-2">Select Handover Date <span className="text-red-500">*</span></label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={handoverRescheduleDate} onChange={(e) => setHandoverRescheduleDate(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-600 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-sky-900 mb-2">Select Time Slot <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SHIFTS.map((shift) => {
                      const disabled = isSlotDisabled(handoverRescheduleDate, shift.startTime);
                      return (
                        <button key={`h-shift-${shift.id}`} type="button" disabled={disabled} onClick={() => setHandoverRescheduleShift(shift.id)} className={`py-2.5 px-2 text-center rounded-lg border transition-all ${disabled ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60" : handoverRescheduleShift === shift.id ? "bg-sky-600 border-sky-600 text-white shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-sky-600"}`}>
                          <div className="font-semibold text-sm">{shift.id} {disabled && "(Passed)"}</div>
                          <div className={`text-[11px] mt-0.5 ${disabled ? "text-gray-400" : handoverRescheduleShift === shift.id ? "text-sky-100" : "text-gray-400"}`}>{shift.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowHandoverModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || !handoverRescheduleShift} className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">{isSubmitting ? "Sending..." : "Submit Proposal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}