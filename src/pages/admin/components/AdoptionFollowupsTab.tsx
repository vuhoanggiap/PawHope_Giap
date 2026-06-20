import { useState, useEffect } from "react";
import { AdminPanel, AdminFieldGrid, AdminField } from "@/components/admin/AdminDetailUi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminInputClass } from "@/components/admin/AdminControls"; 
import { formatEnum } from "@/lib/adminFormat";
import { apiFetch } from "@/lib/api-client";
import { CalendarPlus, X, Image as ImageIcon } from "lucide-react"; 

interface AdoptionFollowupsTabProps {
  adoptionId: number;
  applicantEmail: string; 
  petName: string;        
  followups: any[];
  onWorkflowReload: () => void;
  getStaffId: () => number;
}

export function AdoptionFollowupsTab({
  adoptionId,
  applicantEmail,
  petName,
  followups,
  onWorkflowReload,
  getStaffId,
}: AdoptionFollowupsTabProps) {
  
  const [showForm, setShowForm] = useState(false);
  const [followupDate, setFollowupDate] = useState("");
  const [followupType, setFollowupType] = useState("PHONE_CALL");
  const [petCondition, setPetCondition] = useState("GOOD");
  const [nextFollowupDate, setNextFollowupDate] = useState(""); 
  const [adopterFeedback, setAdoptionFeedback] = useState("");
  const [staffNote, setStaffNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TỰ ĐỘNG NHẢY LỊCH KỲ TỚI (+6 THÁNG) KHÔNG CẦN NHẬP TAY
  useEffect(() => {
    if (followupDate) {
      const dateParts = followupDate.split("-");
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; 
        const day = parseInt(dateParts[2], 10);
        
        const currentTargetDate = new Date(year, month, day);
        currentTargetDate.setMonth(currentTargetDate.getMonth() + 6); 
        
        const yyyy = currentTargetDate.getFullYear();
        const mm = String(currentTargetDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentTargetDate.getDate()).padStart(2, '0');
        
        setNextFollowupDate(`${yyyy}-${mm}-${dd}`);
      }
    } else {
      setNextFollowupDate("");
    }
  }, [followupDate]);

  const handleSubmitFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupDate) return;

    setIsSubmitting(true);
    try {
      // 1. Lưu bản ghi theo dõi vào Database
      await apiFetch("/adoption_followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          adoptionId: adoptionId,
          followup_date: followupDate, 
          followup_type: followupType,
          pet_condition: petCondition,
          next_followup_date: nextFollowupDate || null,
          adopter_feedback: adopterFeedback || null,
          staff_note: staffNote || null,
          photo_url: photoUrl || null,
          createdBy: getStaffId(), 
          status: "SCHEDULED" 
        })
      });

      // 2. TỰ ĐỘNG BẮN EMAIL NHẮC NHỞ KHÁCH HÀNG ĐẾN KỲ BÁO CÁO CẬP NHẬT TÌNH HÌNH
      if (applicantEmail) {
        try {
          await apiFetch("/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: applicantEmail,
              subject: `[PawsHope] Action Required: Periodic Follow-up Schedule for ${petName}`,
              content: `Dear Adopter,\n\nAs part of our commitment to the lifelong well-being of our rescued animals, a new periodic follow-up has been scheduled for ${petName}.\n\nScheduled Review Date: ${followupDate}\n\nWhen the date arrives, please log into your account, visit your Adoption Detail page, and fill out the brief update form with your feedback and a current photo of ${petName}.\n\nThank you for giving them a wonderful forever home!\n\nBest regards,\nPawsHope Team`,
            }),
          });
        } catch (emailErr) {
          console.error("Automated notification email failed to dispatch:", emailErr);
        }
      }
      
      setFollowupDate("");
      setFollowupType("PHONE_CALL");
      setPetCondition("GOOD");
      setNextFollowupDate("");
      setAdoptionFeedback("");
      setStaffNote("");
      setPhotoUrl("");
      setShowForm(false);
      onWorkflowReload();
    } catch (error) {
      alert("An error occurred while saving the follow-up schedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Follow-up History</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#f6931d] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all"
        >
          <span className="flex items-center gap-2">
            {showForm ? <X key="close-f-ico" size={16} /> : <CalendarPlus key="open-f-ico" size={16} />}
            <span>{showForm ? "Close Form" : "Schedule New"}</span>
          </span>
        </button>
      </div>

      {showForm && (
        <AdminPanel title="Schedule New Follow-up Record">
          <form onSubmit={handleSubmitFollowup} className="space-y-4">
            <AdminFieldGrid cols={3}>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Follow-up Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  required 
                  value={followupDate} 
                  onChange={(e) => setFollowupDate(e.target.value)} 
                  onClick={(e) => e.currentTarget.showPicker?.()} 
                  className={adminInputClass()} 
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Follow-up Type</label>
                <select value={followupType} onChange={(e) => setFollowupType(e.target.value)} className={adminInputClass()}>
                  <option value="PHONE_CALL">Phone Call</option>
                  <option value="HOME_VISIT">Home Visit</option>
                  <option value="ONLINE_CHAT">Online Chat</option>
                  <option value="MESSAGE">Message</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Pet Condition</label>
                <select value={petCondition} onChange={(e) => setPetCondition(e.target.value)} className={adminInputClass()}>
                  <option value="GOOD">Good (Khỏe mạnh)</option>
                  <option value="NORMAL">Normal (Bình thường)</option>
                  <option value="SICK">Sick (Bị ốm/Bệnh)</option>
                </select>
              </div>
            </AdminFieldGrid>

            <AdminFieldGrid cols={2}>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Next Follow-up Date (🔄 Auto-calculated +6 Months)
                </label>
                <input 
                  type="date" 
                  disabled
                  value={nextFollowupDate} 
                  className={`${adminInputClass()} bg-slate-800 text-slate-400 cursor-not-allowed border-slate-700`} 
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                  <ImageIcon size={14} /> Photo URL / Link (Evidence)
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: https://image-link.com/pet.jpg..." 
                  value={photoUrl} 
                  onChange={(e) => setPhotoUrl(e.target.value)} 
                  className={adminInputClass()} 
                />
              </div>
            </AdminFieldGrid>

            <AdminFieldGrid cols={2}>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Adopter Feedback</label>
                <textarea 
                  rows={2}
                  placeholder="Feedback from pet owner..."
                  value={adopterFeedback} 
                  onChange={(e) => setAdoptionFeedback(e.target.value)} 
                  className={adminInputClass()} 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Staff Note (Internal)</label>
                <textarea 
                  rows={2}
                  placeholder="Internal notes for shelter staff..."
                  value={staffNote} 
                  onChange={(e) => setStaffNote(e.target.value)} 
                  className={adminInputClass()} 
                />
              </div>
            </AdminFieldGrid>
            
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#2c5f51] hover:bg-green-800 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors">
                {isSubmitting ? "Saving..." : "Confirm Schedule"}
              </button>
            </div>
          </form>
        </AdminPanel>
      )}

      {followups.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">No follow-ups logged.</p>
      ) : (
        followups.map((f) => (
          <AdminPanel key={f.followup_id} title={`Follow-up Date · ${f.followup_date}`}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <AdminFieldGrid cols={3}>
                  <AdminField label="Type" value={formatEnum(f.followup_type)} />
                  <AdminField label="Status" value={<StatusBadge value={f.status} />} />
                  <AdminField label="Pet condition" value={formatEnum(f.pet_condition)} />
                  <AdminField label="Next follow-up" value={f.next_followup_date || "—"} />
                </AdminFieldGrid>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <AdminField label="Adopter feedback" value={f.adopter_feedback || "—"} />
                  <AdminField label="Staff note" value={f.staff_note || "—"} />
                </div>
              </div>

              {f.photo_url && f.photo_url.trim() !== "" && (
                <div className="w-full lg:w-48 flex flex-col items-start lg:items-end">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Evidence Photo</p>
                  <img src={f.photo_url} alt="Follow up" className="w-full sm:w-40 h-28 object-cover rounded-xl border border-slate-700 shadow-md bg-slate-800" />
                </div>
              )}
            </div>
          </AdminPanel>
        ))
      )}
    </div>
  );
}