import { useState } from "react";
import { AdminPanel, AdminFieldGrid, AdminField } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatEnum } from "@/lib/adminFormat";
import { Box, X, CheckCircle } from "lucide-react";

interface AdoptionHandoverTabProps {
  adoptionId: number;
  adoptionStatus: string;
  currentHandovers: any[];
  onCompleteHandover: (handoverId: number, note: string) => Promise<boolean>;
  onWorkflowReload: () => void;
  getStaffId: () => number;
  setMessage: (msg: string | null) => void;
}

export function AdoptionHandoverTab({
  adoptionId,
  adoptionStatus,
  currentHandovers,
  onCompleteHandover,
  onWorkflowReload,
  getStaffId,
  setMessage,
}: AdoptionHandoverTabProps) {
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [handoverMethod, setHandoverMethod] = useState("PICKUP");
  const [handoverDate, setHandoverDate] = useState("");
  const [handoverLocation, setHandoverLocation] = useState("");
  const [handoverItems, setHandoverItems] = useState("");
  const [handoverNote, setHandoverNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScheduleHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // VÁ LỖI GIÂY CHO BASE: Tự động bù đuôi :00 nếu chuỗi datetime-local chỉ dài 16 ký tự giống tab Meetings
    const finalFormattedDate = handoverDate.length === 16 
      ? `${handoverDate}:00` 
      : handoverDate;

    try {
      await apiFetch("/adoption_handovers", {
        method: "POST",
        body: JSON.stringify({
          adoptionId: adoptionId,
          handledBy: getStaffId(),       
          pickupDatetime: finalFormattedDate,
          pickupLocation: handoverLocation,
          handoverMethod: handoverMethod,
          itemsGiven: handoverItems,
          completionNote: handoverNote   
        }),
      });
      setMessage("Handover scheduled successfully!");
      setShowHandoverForm(false);
      setHandoverDate(""); setHandoverLocation(""); setHandoverItems(""); setHandoverNote("");
      onWorkflowReload();
    } catch (error: any) {
      setMessage("Error scheduling handover: " + (error instanceof ApiError ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerCompleteHandover = async (handoverId: number) => {
    if (window.confirm("Confirm that the pet handover has been completed successfully?")) {
      const note = window.prompt("Handover notes (Optional):", "") || "";
      const success = await onCompleteHandover(handoverId, note);
      if (success) {
        setMessage("Handover completed!");
        onWorkflowReload();
      } else {
        setMessage("An error occurred while updating handover status.");
      }
    }
  };

  const isApproved = adoptionStatus?.toUpperCase() === "APPROVED" || adoptionStatus?.toUpperCase() === "COMPLETED";

  // 🌟 CHỐT CHẶN BẢO MẬT: Kiểm tra xem khách đã chốt lịch phỏng vấn (adopterConfirmed) hoặc đã hoàn tất quy trình chưa
  const isHandoverLocked = currentHandovers.some(
    (h) => h.adopterConfirmed === true || h.status?.toUpperCase() === "COMPLETED"
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-white">Handover Schedule</h3>
        
        {/* ĐIỀU KIỆN HIỂN THỊ BA TẦNG THÔNG MINH */}
        {isHandoverLocked ? (
          // TẦNG 1: Khóa cứng và ẩn nút bấm nếu khách hàng đã bấm đồng ý/xác nhận đón cún
          <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 font-medium">
            ✅ Schedule locked · Adover has confirmed this handover arrangement
          </span>
        ) : isApproved ? (
          // TẦNG 2: Mở nút bấm cho Admin đặt lịch thoải mái nếu hồ sơ ở trạng thái APPROVED
          <button
            type="button"
            onClick={() => setShowHandoverForm(!showHandoverForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2c5f51] hover:bg-green-800 text-white text-sm font-semibold rounded-lg transition-all shadow-lg"
          >
            <span className="flex items-center gap-2">
              {showHandoverForm ? <X key="close-h-ico" size={16} /> : <Box key="open-h-ico" size={16} />}
              <span>{showHandoverForm ? "Close Form" : "Schedule Handover"}</span>
            </span>
          </button>
        ) : (
          // TẦNG 3: Khóa hiển thị cảnh báo nếu đơn chưa hoàn tất vòng phỏng vấn
          <span className="text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            ⚠️ Application must be APPROVED to schedule handover
          </span>
        )}
      </div>

      {showHandoverForm && !isHandoverLocked && (
        <AdminPanel title="Schedule Pet Handover">
          <form onSubmit={handleScheduleHandover} className="space-y-4">
            <AdminFieldGrid cols={2}>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Handover Method</label>
                <select value={handoverMethod} onChange={(e) => setHandoverMethod(e.target.value)} className={adminInputClass()}>
                  <option value="PICKUP">Pick up at shelter (AT_SHELTER)</option>
                  <option value="HOME_VISIT">Home delivery (HOME_VISIT)</option>
                  <option value="MEETUP_POINT">Meetup point (MEETUP_POINT)</option>
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
                <input type="text" required placeholder="Handover address..." value={handoverLocation} onChange={(e) => setHandoverLocation(e.target.value)} className={adminInputClass()} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Items Given</label>
                <input type="text" placeholder="Vaccination record, collar, kibbles..." value={handoverItems} onChange={(e) => setHandoverItems(e.target.value)} className={adminInputClass()} />
              </div>
            </AdminFieldGrid>

            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Internal Note</label>
              <textarea value={handoverNote} onChange={(e) => setHandoverNote(e.target.value)} className={adminInputClass()} placeholder="Additional notes..." />
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
              
              {h.status?.toUpperCase() === "SCHEDULED" ? (
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => triggerCompleteHandover(h.handoverId)}
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
  );
}