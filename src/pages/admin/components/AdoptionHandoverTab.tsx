import { useState, useRef, useEffect } from "react";
import { AdminPanel, AdminFieldGrid, AdminField } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { apiFetch, ApiError, API_BASE } from "@/lib/api-client";
import { formatEnum } from "@/lib/adminFormat";
import { Box, X, CheckCircle, Upload, ImageIcon, MapPin, CalendarCheck, Loader2 } from "lucide-react"; 

const SHELTER_LOCATIONS = [
  { 
    id: "hanoi_pet_adoption", 
    name: "Hanoi Pet Adoption Shelter. Address: Alley 15, Cot Moc Street, Doai Phuong, Hanoi, Vietnam"
  },
  { 
    id: "saigon_time_rescue", 
    name: "Saigon Time Animal Rescue Station. Address: District 6 Center, Ho Chi Minh City, Vietnam"
  }
];

const AVAILABLE_ITEMS = [
  { id: "vax_record", label: "Vaccination Record" },
  { id: "collar", label: "Collar" },
  { id: "kibbles", label: "Bedding / Kibbles" },
  { id: "cage", label: "Carrier Cage" },
];

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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState("");
  const [completingHandoverId, setCompletingHandoverId] = useState<number | null>(null);
  const [completeNote, setCompleteNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [locationType, setLocationType] = useState<"SHELTER" | "CUSTOM">("SHELTER");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  useEffect(() => {
    const combinedItems = [...selectedItems];
    if (customItem.trim()) {
      combinedItems.push(customItem.trim());
    }
    setHandoverItems(combinedItems.join(", "));
  }, [selectedItems, customItem]);

  useEffect(() => {
    if (locationType !== "CUSTOM" || handoverLocation.trim().length < 4) {
      setAddressSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(handoverLocation)}&addressdetails=1&limit=5&countrycodes=vn`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          const suggestions = data.map((item: any) => item.display_name);
          setAddressSuggestions(suggestions);
        }
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [handoverLocation, locationType]);

  const handleCheckboxChange = (label: string) => {
    setSelectedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleScheduleHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverLocation) {
      alert("Please select or enter a handover location!");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

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
      setSelectedItems([]); setCustomItem("");
      onWorkflowReload();
    } catch (error: any) {
      setMessage("Error scheduling handover: " + (error instanceof ApiError ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFinalizeComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingHandoverId) return;
    if (!selectedFile) {
      alert("Please upload/take a handover proof photo!");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (completeNote) {
      formData.append("completionNote", completeNote);
    }

    try {
      const token = localStorage.getItem("token") || 
                    localStorage.getItem("accessToken") || 
                    localStorage.getItem("auth_token") || 
                    "";

      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/adoption_handovers/${completingHandoverId}/complete`, {
        method: "PATCH",
        headers: {
          "Authorization": authHeader 
        },
        body: formData
      });

      if (!response.ok) {
        console.error("Token gửi đi hiện tại là:", authHeader);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
      }

      setMessage("Handover completed and photo uploaded successfully!");
      setCompletingHandoverId(null);
      setCompleteNote("");
      setSelectedFile(null);
      setPreviewUrl("");
      onWorkflowReload(); 
    } catch (error: any) {
      setMessage("Failed to complete handover: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleApproveReschedule = async (handoverId: number) => {
    if (!window.confirm("Confirm and approve this alternative handover schedule proposal? An confirmation email will be sent automatically.")) return;
    
    setIsSubmitting(true);
    setMessage(null);
    try {
      await apiFetch(`/adoption_handovers/${handoverId}/status?status=CONFIRMED`, {
        method: "PATCH"
      });
      setMessage("Alternative handover proposal approved! Confirmation email triggered.");
      onWorkflowReload();
    } catch (error: any) {
      setMessage("Failed to approve schedule: " + (error instanceof ApiError ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApproved = adoptionStatus?.toUpperCase() === "APPROVED" || adoptionStatus?.toUpperCase() === "COMPLETED";
  const isHandoverLocked = currentHandovers.some(
    (h) => h.adopterConfirmed === true || h.status?.toUpperCase() === "COMPLETED"
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-white">Handover Schedule</h3>
        
        {isHandoverLocked ? (
          <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 font-medium">
            Schedule locked · Adover has confirmed this handover arrangement
          </span>
        ) : isApproved ? (
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
          <span className="text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            ⚠️ Application must be APPROVED to schedule handover
          </span>
        )}
      </div>

      {completingHandoverId && (
        <AdminPanel title="Complete Handover Process & Upload Proof">
          <form onSubmit={handleFinalizeComplete} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Handover Photo (Required)</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                {previewUrl ? (
                  <div className="relative border border-slate-700 rounded-lg overflow-hidden h-40 bg-slate-900 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(""); }} className="absolute top-2 right-2 bg-red-600/80 p-1 rounded-full text-white hover:bg-red-700 transition"><X size={14} /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-slate-700 hover:border-green-500 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition bg-slate-900/40">
                    <Upload size={24} />
                    <span className="text-xs">Click to upload handover photo proof</span>
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Handover Notes (Optional)</label>
                <textarea value={completeNote} onChange={(e) => setCompleteNote(e.target.value)} className={`${adminInputClass()} h-40 resize-none`} placeholder="Write details about pet's health status during handover or final agreement..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => { setCompletingHandoverId(null); setPreviewUrl(""); setSelectedFile(null); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg">Cancel</button>
              <button type="submit" disabled={isSubmitting || !selectedFile} className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">{isSubmitting ? "Processing..." : <><CheckCircle size={14} /> Submit & Close</>}</button>
            </div>
          </form>
        </AdminPanel>
      )}

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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs uppercase tracking-wide text-slate-500">Location</label>
                  <div className="flex bg-slate-800 rounded-md p-0.5 border border-slate-700 scale-90 origin-right">
                    <button type="button" onClick={() => { setLocationType("SHELTER"); setHandoverLocation(""); }} className={`px-2 py-0.5 text-[10px] font-semibold rounded ${locationType === "SHELTER" ? "bg-[#2c5f51] text-white" : "text-slate-400 hover:text-white"}`}>Our Shelters</button>
                    <button type="button" onClick={() => { setLocationType("CUSTOM"); setHandoverLocation(""); }} className={`px-2 py-0.5 text-[10px] font-semibold rounded ${locationType === "CUSTOM" ? "bg-[#2c5f51] text-white" : "text-slate-400 hover:text-white"}`}>Custom Maps</button>
                  </div>
                </div>
                {locationType === "SHELTER" ? (
                  <select value={handoverLocation} onChange={(e) => setHandoverLocation(e.target.value)} className={adminInputClass()} required>
                    <option value="">-- Choose a shelter address --</option>
                    {SHELTER_LOCATIONS.map((loc) => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                  </select>
                ) : (
                  <div className="relative w-full">
                    <input 
                      type="text" 
                      required 
                      list="handover-address-suggestions"
                      placeholder="Type address to find... (e.g. 15 Pham Van Dong)" 
                      value={handoverLocation} 
                      onChange={(e) => setHandoverLocation(e.target.value)} 
                      className={adminInputClass()} 
                    />
                    {isSearchingAddress && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Loader2 className="animate-spin" size={14} />
                      </div>
                    )}
                    <datalist id="handover-address-suggestions">
                      {addressSuggestions.map((suggestion, idx) => (
                        <option key={idx} value={suggestion} />
                      ))}
                    </datalist>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Items Given</label>
                <div className="p-3 bg-slate-900/60 border border-slate-700/80 rounded-xl space-y-2">
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {AVAILABLE_ITEMS.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                        <input type="checkbox" checked={selectedItems.includes(item.label)} onChange={() => handleCheckboxChange(item.label)} className="accent-[#2c5f51] h-3.5 w-3.5 rounded border-slate-700" />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <input type="text" placeholder="Nhập thêm đồ dùng khác (nếu có)..." value={customItem} onChange={(e) => setCustomItem(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-300 focus:outline-none focus:border-amber-500" />
                </div>
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
              <AdminField 
                label="Location" 
                value={
                  h.pickupLocation?.startsWith("http") ? (
                    <a href={h.pickupLocation} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1">
                      <MapPin size={12} /> View on Google Maps
                    </a>
                  ) : (
                    h.pickupLocation || "—"
                  )
                } 
              />
              <AdminField label="Status" value={<StatusBadge value={h.status} />} />
              <AdminField label="Handled by" value={`Staff #${h.staffId}`} />
              <AdminField label="Adopter Confirmed" value={h.adopterConfirmed ? "Yes" : "No"} />
              
              <div className="flex items-center">
                {h.status?.toUpperCase() === "RESCHEDULED" ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleApproveReschedule(h.handoverId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f6931d] hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-all shadow-md animate-pulse"
                  >
                    <CalendarCheck size={14} /> Approve & Confirm
                  </button>
                ) : h.status?.toUpperCase() === "SCHEDULED" || h.status?.toUpperCase() === "CONFIRMED" ? (
                  <button
                    type="button"
                    onClick={() => setCompletingHandoverId(h.handoverId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/30 rounded-lg text-xs font-semibold transition-all"
                  >
                    <CheckCircle size={14} /> Mark as Completed
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 italic">Process Finished</span>
                )}
              </div>
            </AdminFieldGrid>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/40">
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <AdminField label="Items given" value={h.itemsGiven || "—"} />
                <AdminField label="Note" value={h.completionNote || "—"} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                  <ImageIcon size={12} /> Handover Photo Proof
                </label>
                {h.handoverPhotoUrl ? (
                  <a href={h.handoverPhotoUrl} target="_blank" rel="noreferrer" className="block relative border border-slate-700 rounded-lg overflow-hidden h-20 w-32 bg-slate-900 group hover:border-orange-400 transition">
                    <img src={h.handoverPhotoUrl} alt="Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white transition">View Full</div>
                  </a>
                ) : (
                  <span className="text-xs text-slate-600 italic">No photo attached</span>
                )}
              </div>
            </div>
          </AdminPanel>
        ))
      )}
    </div>
  );
}