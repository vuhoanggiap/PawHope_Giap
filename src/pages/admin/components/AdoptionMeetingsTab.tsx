import { useState, useEffect } from "react";
import { AdminPanel, AdminFieldGrid, AdminField } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { apiFetch } from "@/lib/api-client";
import { CalendarPlus, X, CheckCircle, XCircle, Calendar, Clock, ChevronDown, MapPin, Video, Phone } from "lucide-react";

const SHELTER_LOCATIONS = [
  { 
    id: "hanoi_pet_adoption", 
    name: "Hanoi Pet Adoption Shelter. Address: No 10 Dan Phuong, Ha Noi, Vietnam"
  },
  { 
    id: "saigon_time_rescue", 
    name: "Saigon Time Animal Rescue Station. Address: District 6 Center, Ho Chi Minh City, Vietnam"
  }
];

const HOUR_OPTIONS = ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];
const MINUTE_OPTIONS = ["00", "15", "30", "45"];

interface AdoptionMeetingsTabProps {
  adoptionId: number;
  displayMeetings: any[];
  onEvaluateMeeting: (meetingId: number, result: "PASSED" | "FAILED") => Promise<void>;
  onWorkflowReload: () => void;
  getStaffId: () => number;
  setMessage: (msg: string | null) => void;
}

export function AdoptionMeetingsTab({
  adoptionId,
  displayMeetings,
  onEvaluateMeeting,
  onWorkflowReload,
  getStaffId,
  setMessage,
}: AdoptionMeetingsTabProps) {
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingNote, setMeetingNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCreatePicker, setOpenCreatePicker] = useState(false);
  const [internalDate, setInternalDate] = useState("");
  const [internalHour, setInternalHour] = useState("08");
  const [internalMinute, setInternalMinute] = useState("00");
  const [rescheduleData, setRescheduleData] = useState<{ id: number; dateStr: string; date: string; hour: string; minute: string } | null>(null);
  const [openReschedulePicker, setOpenReschedulePicker] = useState(false);
  const [locationType, setLocationType] = useState<"SHELTER" | "ONLINE">("SHELTER");
  const [onlinePlatform, setOnlinePlatform] = useState("GOOGLE_MEET");
  const [onlineLink, setOnlineLink] = useState("");
  const [zaloPhone, setZaloPhone] = useState("");

  useEffect(() => {
    if (locationType === "ONLINE") {
      if (onlinePlatform === "GOOGLE_MEET") {
        setMeetingLocation(`ONLINE - Google Meet Link: ${onlineLink || "—"}`);
      } else {
        setMeetingLocation(`ONLINE - Zalo Interview. Phone Number to connect: ${zaloPhone || "—"}`);
      }
    }
  }, [locationType, onlinePlatform, onlineLink, zaloPhone]);

  const formatDisplayDateTime = (isoStr: string) => {
    if (!isoStr) return "--- Click to select date & time ---";
    try {
      const [d, t] = isoStr.split("T");
      const [y, m, day] = d.split("-");
      const [h, min] = t.split(":");
      return `${day}/${m}/${y}   ➔   ${h}:${min}`;
    } catch {
      return isoStr;
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate) {
      alert("Please select appointment date and time first!");
      return;
    }
    if (!meetingLocation || meetingLocation.includes("—")) {
      alert("Please enter complete platform details / links for the interview!");
      return;
    }

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
          note: meetingNote,
        }),
      });
      setMessage("Interview scheduled successfully! An email has been sent.");
      setShowMeetingForm(false);
      setMeetingDate(""); setMeetingLocation(""); setMeetingNote("");
      setOnlineLink(""); setZaloPhone("");
      onWorkflowReload();
    } catch (error: any) {
      setMessage("Error scheduling interview: " + (error?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMeetingLocked = displayMeetings.some(
    (m) => m.status?.toUpperCase() === "CONFIRMED" || m.status?.toUpperCase() === "COMPLETED"
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-white">Meeting List</h3>
        
        {isMeetingLocked ? (
          <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 font-medium">
            Schedule locked · Applicant has confirmed or finished the interview process
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowMeetingForm(!showMeetingForm);
              setOpenCreatePicker(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#f6931d] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all"
          >
            <span className="flex items-center gap-2">
              {showMeetingForm ? <X key="close-m-ico" size={16} /> : <CalendarPlus key="open-m-ico" size={16} />}
              <span>{showMeetingForm ? "Close Form" : "Schedule New"}</span>
            </span>
          </button>
        )}
      </div>

      {showMeetingForm && !isMeetingLocked && (
        <AdminPanel title="Schedule New Interview Meeting">
          <form onSubmit={handleScheduleMeeting} className="space-y-4">
            <AdminFieldGrid cols={2}>
              <div className="relative flex flex-col">
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Meeting Time</label>
                <div
                  onClick={() => setOpenCreatePicker(!openCreatePicker)}
                  className={`${adminInputClass()} cursor-pointer flex items-center justify-between bg-slate-900 border border-slate-700 text-white min-h-[40px] rounded-lg px-3 hover:border-amber-500 transition-colors`}
                >
                  <span className={meetingDate ? "text-amber-400 font-semibold text-sm" : "text-slate-400 text-sm"}>
                    {formatDisplayDateTime(meetingDate)}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={15} />
                    <ChevronDown size={14} className={`transition-transform duration-200 ${openCreatePicker ? "rotate-180 text-amber-500" : ""}`} />
                  </div>
                </div>

                {openCreatePicker && (
                  <div className="mt-3 w-full bg-slate-800/80 border border-slate-600 rounded-xl p-4 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                      <span className="text-xs font-bold text-[#f6931d] uppercase flex items-center gap-1"><Calendar size={14} /> Pick Schedule</span>
                      <button type="button" onClick={() => setOpenCreatePicker(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">1. Choose Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={internalDate}
                          onChange={(e) => setInternalDate(e.target.value)}
                          className={`${adminInputClass()} bg-slate-900 focus:border-amber-500`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase mb-1">2. Hour</label>
                          <select value={internalHour} onChange={(e) => setInternalHour(e.target.value)} className={`${adminInputClass()} bg-slate-900 text-white focus:border-amber-500`}>
                            {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h} h</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase mb-1">3. Minute</label>
                          <select value={internalMinute} onChange={(e) => setInternalMinute(e.target.value)} className={`${adminInputClass()} bg-slate-900 text-white focus:border-amber-500`}>
                            {MINUTE_OPTIONS.map(m => <option key={m} value={m}>{m} m</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!internalDate}
                      onClick={() => {
                        if (!internalDate) return;
                        setMeetingDate(`${internalDate}T${internalHour}:${internalMinute}:00`);
                        setOpenCreatePicker(false);
                      }}
                      className="w-full py-2.5 bg-[#2c5f51] hover:bg-green-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={14} /> Done & Apply Time
                    </button>
                  </div>
                )}
              </div>
\
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs uppercase tracking-wide text-slate-500">Location</label>
                  <div className="flex bg-slate-800 rounded-md p-0.5 border border-slate-700 scale-90 origin-right">
                    <button
                      type="button"
                      onClick={() => { setLocationType("SHELTER"); setMeetingLocation(""); }}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${locationType === "SHELTER" ? "bg-[#2c5f51] text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      At Shelter
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLocationType("ONLINE"); setMeetingLocation(""); }}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${locationType === "ONLINE" ? "bg-[#2c5f51] text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Online Interview
                    </button>
                  </div>
                </div>

                {locationType === "SHELTER" ? (
                  <select
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    className={adminInputClass()}
                    required
                  >
                    <option value="">-- Choose a shelter address --</option>
                    {SHELTER_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={onlinePlatform}
                      onChange={(e) => { setOnlinePlatform(e.target.value); setOnlineLink(""); setZaloPhone(""); }}
                      className={adminInputClass()}
                    >
                      <option value="GOOGLE_MEET">Google Meet (Provide URL link)</option>
                      <option value="ZALO">Zalo Chat (Provide Phone number)</option>
                    </select>

                    {onlinePlatform === "GOOGLE_MEET" ? (
                      <input
                        type="url"
                        required
                        placeholder="Paste Google Meet meeting link here (https://meet.google.com/...)"
                        value={onlineLink}
                        onChange={(e) => setOnlineLink(e.target.value)}
                        className={adminInputClass()}
                      />
                    ) : (
                      <input
                        type="text"
                        required
                        pattern="[0-9]*"
                        placeholder="Enter Zalo phone number for applicant to connect..."
                        value={zaloPhone}
                        onChange={(e) => setZaloPhone(e.target.value)}
                        className={adminInputClass()}
                      />
                    )}
                  </div>
                )}
              </div>
            </AdminFieldGrid>
            
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Note for applicant (optional)</label>
              <textarea value={meetingNote} onChange={(e) => setMeetingNote(e.target.value)} className={adminInputClass()} placeholder="Documents to bring..." />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isSubmitting || !meetingDate} className="px-6 py-2 bg-[#2c5f51] hover:bg-green-800 text-white font-semibold rounded-lg disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Confirm Schedule"}
              </button>
            </div>
          </form>
        </AdminPanel>
      )}

      {displayMeetings.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">No meetings on record.</p>
      ) : (
        displayMeetings.map((m) => (
          <AdminPanel key={m.meetingId} title={`Meeting · ${new Date(m.meetingDatetime).toLocaleString('en-US')}`}>
            <AdminFieldGrid cols={3}>
              <AdminField label="Staff" value={`Staff #${m.staffId}`} />
              <AdminField 
                label="Location" 
                value={
                  m.meetingLocation?.startsWith("http") || m.meetingLocation?.includes("Google Meet") ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1"><Video size={12} className="text-blue-400" /> Google Meet</span>
                      {m.meetingLocation.includes("https://") ? (
                        <a href={m.meetingLocation.substring(m.meetingLocation.indexOf("https://"))} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-break text-xs">
                          Join Meeting Room ➔
                        </a>
                      ) : (
                        <span className="text-sm text-slate-200">{m.meetingLocation}</span>
                      )}
                    </div>
                  ) : m.meetingLocation?.includes("Zalo") ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1"><Phone size={12} className="text-teal-400" /> Zalo Interview</span>
                      <span className="text-sm text-teal-400 font-semibold">{m.meetingLocation.replace("ONLINE - Zalo Interview. Phone Number to connect:", "📞")}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1">
                      <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>{m.meetingLocation || "—"}</span>
                    </div>
                  )
                } 
              />
              <AdminField label="Status" value={<StatusBadge value={m.status} />} />
              <AdminField label="Result" value={<StatusBadge value={m.result} />} />
              
              {m.result?.toUpperCase() === "PENDING" && m.status?.toUpperCase() !== "CANCELLED" ? (
                <div className="col-span-3 mt-2 flex items-center gap-3 border-t border-slate-700/50 pt-4">
                  {m.status?.toUpperCase() === "CONFIRMED" ? (
                    <>
                      <span className="text-sm font-medium text-slate-400 mr-2">Evaluate Interview:</span>
                      <button
                        type="button"
                        onClick={() => onEvaluateMeeting(m.meetingId, "PASSED")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c5f51] hover:bg-green-700 text-white border border-[#2c5f51] rounded-lg text-xs font-semibold transition-all"
                      >
                        <CheckCircle size={14} /> Mark PASSED
                      </button>
                      <button
                        type="button"
                        onClick={() => onEvaluateMeeting(m.meetingId, "FAILED")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-lg text-xs font-semibold transition-all"
                      >
                        <XCircle size={14} /> Mark FAILED
                      </button>
                    </>
                  ) : m.status?.toUpperCase() === "SCHEDULED" ? (
                    <span className="text-xs font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                      ⏳ Awaiting adopter's attendance confirmation before evaluation.
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
                      ⚠️ Please approve or update the official schedule proposal below first.
                    </span>
                  )}
                </div>
              ) : null}
            </AdminFieldGrid>

            <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 uppercase mb-1">Meeting Notes / Reschedule Proposals</p>
              <p className="text-sm text-slate-200 whitespace-pre-line">{m.note || "No notes."}</p>
              
              {m.status?.toUpperCase() === "RESCHEDULED" && (
                <div className="mt-3 border-t border-slate-700/50 pt-3">
                  {rescheduleData && rescheduleData.id === m.meetingId ? (
                    <div className="flex flex-col gap-2 relative max-w-sm">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        Select new official date & time:
                      </label>
                      
                      <div
                        onClick={() => setOpenReschedulePicker(!openReschedulePicker)}
                        className={`${adminInputClass()} cursor-pointer flex items-center justify-between bg-slate-900 border border-slate-700 text-white min-h-[40px] rounded-lg px-3 hover:border-amber-500 transition-colors`}
                      >
                        <span className={rescheduleData.dateStr ? "text-amber-400 font-semibold text-sm" : "text-slate-400 text-sm"}>
                          {rescheduleData.dateStr ? formatDisplayDateTime(rescheduleData.dateStr) : "--- Click to select ---"}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={15} />
                          <ChevronDown size={14} className={`transition-transform duration-200 ${openReschedulePicker ? "rotate-180 text-amber-500" : ""}`} />
                        </div>
                      </div>

                      {openReschedulePicker && (
                        <div className="mt-2 w-full bg-slate-800/80 border border-slate-600 rounded-xl p-4 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase mb-1">1. Choose Date</label>
                              <input
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                value={rescheduleData.date}
                                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                className={`${adminInputClass()} bg-slate-900`}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-slate-400 uppercase mb-1">2. Hour</label>
                                <select value={rescheduleData.hour} onChange={(e) => setRescheduleData({ ...rescheduleData, hour: e.target.value })} className={`${adminInputClass()} bg-slate-900 text-white`}>
                                  {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h} h</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 uppercase mb-1">3. Minute</label>
                                <select value={rescheduleData.minute} onChange={(e) => setRescheduleData({ ...rescheduleData, minute: e.target.value })} className={`${adminInputClass()} bg-slate-900 text-white`}>
                                  {MINUTE_OPTIONS.map(m => <option key={m} value={m}>{m} m</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!rescheduleData.date}
                            onClick={() => {
                              if (!rescheduleData.date) return;
                              setRescheduleData({
                                ...rescheduleData,
                                dateStr: `${rescheduleData.date}T${rescheduleData.hour}:${rescheduleData.minute}:00`
                              });
                              setOpenReschedulePicker(false);
                            }}
                            className="w-full py-2 bg-[#2c5f51] hover:bg-green-700 text-white text-xs font-bold rounded-lg disabled:opacity-40"
                          >
                            Apply Selection
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button
                          disabled={!rescheduleData.dateStr}
                          onClick={async () => {
                            if (!rescheduleData.dateStr) return;
                            try {
                              await apiFetch(`/adoption_meetings/${m.meetingId}/reschedule-confirm`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ 
                                  meetingDatetime: rescheduleData.dateStr,
                                  newDatetime: rescheduleData.dateStr 
                                })
                              });
                              
                              alert("Schedule updated successfully!");
                              setRescheduleData(null);
                              setOpenReschedulePicker(false);
                              onWorkflowReload();
                            } catch (err) {
                              alert("An error occurred while confirming the schedule!");
                            }
                          }}
                          className="px-4 py-2 bg-[#f6931d] hover:bg-orange-600 text-white text-xs font-bold rounded-md transition-colors disabled:opacity-40"
                        >
                          Save Official Schedule
                        </button>
                        <button type="button" onClick={() => { setRescheduleData(null); setOpenReschedulePicker(false); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-md transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        setRescheduleData({ id: m.meetingId, dateStr: "", date: "", hour: "08", minute: "00" });
                        setOpenReschedulePicker(false);
                      }}
                      className="text-xs font-bold text-[#f6931d] hover:text-white flex items-center gap-1 transition-colors"
                    >
                      Update official schedule
                    </button>
                  )}
                </div>
              )}
            </div>
          </AdminPanel>
        ))
      )}
    </div>
  );
}