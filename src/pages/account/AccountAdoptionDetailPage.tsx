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
import { ArrowLeft, CalendarClock, CalendarDays, X } from "lucide-react";

// --- CẤU HÌNH 4 KHUNG GIỜ CÓ KÈM START TIME ĐỂ SO SÁNH ---
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

  const { requestReschedule } = useAdoptionMeetings();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleShift, setRescheduleShift] = useState("");

  const loadMeetingData = () => {
    if (!id) return;
    apiFetch(`/adoption_meetings/adoption/${id}`)
      .then((meetings: any) => {
        if (meetings && meetings.length > 0) {
          setMeetingInfo(meetings[meetings.length - 1]);
        }
      })
      .catch((e) => console.log("No meeting scheduled yet", e));
  };

  useEffect(() => {
    if (!user || !id) return;
    void loadAdoptionById(user.userId, Number(id)).then(setAdoption);
    loadMeetingData();
  }, [user, id]);

  // --- HÀM KIỂM TRA KHUNG GIỜ ĐÃ QUA CHƯA ---
  const isSlotDisabled = (startTimeStr: string) => {
    if (!rescheduleDate) return false;
    
    const now = new Date();
    const selectedDate = new Date(rescheduleDate);
    
    // Kiểm tra xem ngày chọn có phải là hôm nay không
    const isToday = 
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();
      
    if (!isToday) return false; // Nếu ngày tương lai thì không khóa giờ
    
    // Nếu là hôm nay, kiểm tra xem giờ hiện tại đã vượt qua startTime của ca chưa
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    return now > slotTime;
  };

  // Tự động reset lại shift nếu khách chọn ngày khác mà ca đang chọn bị quá hạn
  useEffect(() => {
    if (rescheduleShift) {
      const selectedShiftObj = TIME_SHIFTS.find(s => s.id === rescheduleShift);
      if (selectedShiftObj && isSlotDisabled(selectedShiftObj.startTime)) {
        setRescheduleShift(""); // Reset lựa chọn
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rescheduleDate]);

  const handleSubmitReschedule = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // LOG ĐỂ KIỂM TRA
  console.log("Current meetingInfo:", meetingInfo); 

  // Dùng toán tử || để lấy ID dù Backend trả về kiểu nào
  const targetMeetingId = meetingInfo?.meetingId || meetingInfo?.meeting_id;
  
  if (!targetMeetingId) {
    alert("Error: Missing Meeting ID. Check Console logs.");
    return;
  }

    setIsSubmitting(true);
    const shiftLabel = TIME_SHIFTS.find(s => s.id === rescheduleShift)?.label;
    const proposedText = `Customer requested reschedule:\nDate: ${rescheduleDate}\nTime: ${rescheduleShift} (${shiftLabel})`;

    const success = await requestReschedule(targetMeetingId, proposedText);
    
    if (success) {
      setSuccessMsg("Your reschedule request has been sent to Admin successfully!");
      setShowModal(false);
      loadMeetingData();
    } else {
      alert("Failed to send request. Check Backend API or Console!");
    }
    setIsSubmitting(false);
  };

  if (!user) return null;
  if (!adoption) return null;

  const failed = adoption.status === "REJECTED" || adoption.status === "CANCELLED";
  const activeIndex = adoptionStatusIndex(adoption.status);

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

        {meetingInfo && (
          <div className="mb-8 p-5 bg-[#2c5f51]/10 border border-[#2c5f51]/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2 text-sm text-[#3d6b5c]">
              <h3 className="font-bold text-[#2c5f51] flex items-center gap-2 text-base">
                <CalendarClock size={20} className="text-[#f6931d]" /> 
                Interview / Assessment Schedule
              </h3>
              <p><strong>Current Status:</strong> <span className={`font-semibold uppercase ${meetingInfo.status === 'RESCHEDULED' ? 'text-amber-500' : 'text-[#f6931d]'}`}>{meetingInfo.status}</span></p>
              <p><strong>Time:</strong> {new Date(meetingInfo.meetingDatetime).toLocaleString('en-US')}</p>
              <p><strong>Location:</strong> {meetingInfo.meetingLocation}</p>
              {meetingInfo.note && <p className="text-xs text-gray-500 bg-white/80 p-2 rounded-lg mt-1 border border-dashed border-[#2c5f51]/30 whitespace-pre-line"><strong>Note / Log:</strong> {meetingInfo.note}</p>}
            </div>

            {meetingInfo.status === "SCHEDULED" && (
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => alert("Thank you for confirming your attendance! See you there.")}
                  className="flex-1 md:flex-none px-4 py-2 bg-[#2c5f51] hover:bg-green-800 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Confirm Attend
                </button>
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex-1 md:flex-none px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold rounded-xl text-sm transition-all"
                >
                  Reschedule Request
                </button>
              </div>
            )}
          </div>
        )}

        <h3 className="font-semibold text-[#2c5f51] mb-4">Progress</h3>
        <StatusTimeline
          steps={adoptionProgressSteps.map((s) => ({ id: s.status, label: s.label, description: s.description }))}
          activeIndex={failed ? 0 : Math.max(activeIndex, 0)}
          failed={failed}
          failedLabel={adoption.status === "REJECTED" ? "This application was not approved." : "This application was cancelled."}
        />
      </div>

      {/* --- MODAL CHỌN LỊCH MỚI CÓ DISABLE GIỜ QUÁ HẠN --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative animate-scale-up">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <CalendarDays className="text-[#f6931d]" />
              <h3 className="text-lg font-bold text-[#2c5f51]">Propose Alternative Time</h3>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Please select a new date and your preferred time slot. Our staff will review and re-confirm the schedule with you.
            </p>

            <form onSubmit={handleSubmitReschedule} className="space-y-4">
              
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                {/* CHỌN NGÀY */}
                <div>
                  <label className="block text-sm font-bold text-[#2c5f51] mb-2">Select Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" required 
                    min={new Date().toISOString().split('T')[0]} 
                    value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} 
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#2c5f51] bg-white" 
                  />
                </div>

                {/* CHỌN GIỜ CÓ DISABLE */}
                <div>
                  <label className="block text-sm font-bold text-[#2c5f51] mb-2">Select Time Slot <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SHIFTS.map((shift) => {
                      const disabled = isSlotDisabled(shift.startTime);
                      
                      return (
                        <button
                          key={shift.id} 
                          type="button"
                          disabled={disabled}
                          onClick={() => setRescheduleShift(shift.id)}
                          className={`py-2.5 px-2 text-center rounded-lg border transition-all ${
                            disabled
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                              : rescheduleShift === shift.id 
                                ? "bg-[#f6931d] border-[#f6931d] text-white shadow-md" 
                                : "bg-white border-gray-200 text-gray-600 hover:border-[#f6931d]"
                          }`}
                        >
                          <div className="font-semibold text-sm">{shift.id} {disabled && "(Passed)"}</div>
                          <div className={`text-[11px] mt-0.5 ${disabled ? "text-gray-400" : rescheduleShift === shift.id ? "text-orange-100" : "text-gray-400"}`}>{shift.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || !rescheduleShift} className="flex-1 py-3 bg-[#f6931d] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {isSubmitting ? "Sending..." : "Submit Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}