import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getStoredAdmin } from "@/lib/admin-auth";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { formatEnum } from "@/lib/adminFormat";
import { CheckCircle2, Calendar } from "lucide-react";
import {
  createVolunteerScheduleWeek,
  createVolunteerSchedule,
  deleteVolunteerSchedule,
  submitVolunteerScheduleWeek,
  loadMyScheduleBundleReal,
  fetchVolunteerSchedulesByWindow, 
} from "@/lib/api/volunteer-schedule-api";

export function AdminMySchedulePage() {
  const staff = getStoredAdmin();
  const userId = staff?.userId ?? 0;
  const [windows, setWindows] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [registered, setRegistered] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]); 
  const [windowId, setWindowId] = useState<number | null>(null);
  const [viewWeekId, setViewWeekId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    if (!userId) return;
    void loadMyScheduleBundleReal(userId)
      .then((b) => {
        const fetchedWindows = b?.windows || [];
        const fetchedShifts = b?.shifts || [];
        const fetchedWeeks = b?.weeks || [];
        const fetchedRegistered = b?.shiftsRegistered || [];

        const sortedWindows = [...fetchedWindows].sort((a, b) => (b.weekStartDate || "").localeCompare(a.weekStartDate || ""));
        const sortedWeeks = [...fetchedWeeks].sort((a, b) => (b.weekStartDate || "").localeCompare(a.weekStartDate || ""));

        setWindows(sortedWindows);
        setShifts(fetchedShifts);
        setWeeks(sortedWeeks);
        setRegistered(fetchedRegistered);
        
        setWindowId((prev) => {
          if (prev != null && sortedWindows.some((w) => w.windowId === prev)) return prev;
          const open = sortedWindows.find((w) => w.status === "OPEN");
          return open?.windowId ?? sortedWindows[0]?.windowId ?? null;
        });
      })
      .catch((err) => {
        console.error("Bundle Loader failed:", err);
        setWindows([]);
        setShifts([]);
        setWeeks([]);
        setRegistered([]);
        setError("Failed to sync your personalized schedule profile.");
      });
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (windowId) {
      fetchVolunteerSchedulesByWindow(windowId)
        .then((data) => {
          setAllSchedules(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("API ByWindow error:", err);
          setAllSchedules([]);
        });
    } else {
      setAllSchedules([]);
    }
  }, [windowId]);

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      if (windowId) {
        fetchVolunteerSchedulesByWindow(windowId)
          .then((data) => {
            setAllSchedules(Array.isArray(data) ? data : []);
          })
          .catch(() => setAllSchedules([]));
      }

      loadMyScheduleBundleReal(userId)
        .then((b) => {
          const fetchedWeeks = (b?.weeks || []).sort((a: any, b: any) => 
            (b.weekStartDate || "").localeCompare(a.weekStartDate || "")
          );
          setWeeks(fetchedWeeks);
          setRegistered(b?.shiftsRegistered || []);
        })
        .catch((err) => {
          console.error("Polling background sync error:", err);
          if (err?.status === 401 || err?.status === 403 || String(err).includes("401") || String(err).includes("403")) {
            clearInterval(interval);
          }
        });
    }, 4000);

    return () => clearInterval(interval);
  }, [userId, windowId]);

  const selectedWindow = windows.find((w) => w.windowId === windowId);
  const weekForWindow = weeks.find((w) => w.windowId === windowId);
  
  const weekShifts = useMemo(
    () => registered.filter((s) => s.weekId === weekForWindow?.weekId),
    [registered, weekForWindow?.weekId]
  );
  
  const canEditWeek = weekForWindow?.status === "DRAFT" || weekForWindow?.status === "REJECTED";
  const isWindowOpen = selectedWindow?.status === "OPEN";

  const viewWeekShifts = useMemo(
    () => registered.filter((s) => s.weekId === viewWeekId),
    [registered, viewWeekId]
  );
  const selectedViewWeek = weeks.find((w) => w.weekId === viewWeekId);

  useEffect(() => {
    if (weeks.length > 0 && !viewWeekId) {
      const todayStr = new Date().toISOString().slice(0, 10);

      const currentApprovedWeek = weeks.find((w) => {
        return w.status === "APPROVED" && todayStr >= w.weekStartDate &&  todayStr <= w.weekEndDate;
      });

      if (currentApprovedWeek) {
        setViewWeekId(currentApprovedWeek.weekId);
      } else {
        const approvedWeeks = weeks.filter((w) => w.status === "APPROVED");
        if (approvedWeeks.length > 0) {
          setViewWeekId(approvedWeeks[0].weekId);
        } else {
          setViewWeekId(weeks[0].weekId);
        }
      }
    }
  }, [weeks, viewWeekId]);

  function getWeekDates(startDate: string) {
    if (!startDate) return [];
    try {
      const [year, month, day] = startDate.split("-").map(Number);
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(year, month - 1, day);
        date.setDate(date.getDate() + index);
        
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        
        return `${y}-${m}-${d}`;
      });
    } catch {
      return [];
    }
  }

  const registerWeekDates = selectedWindow?.weekStartDate ? getWeekDates(selectedWindow.weekStartDate) : [];
  const viewWeekDates = selectedViewWeek?.weekStartDate ? getWeekDates(selectedViewWeek.weekStartDate) : [];

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await fn();
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };
  const handleRegisterWeek = () => {
    if (!windowId || !userId || !isWindowOpen || busy) return; 

    const isAlreadyActivated = weeks.some((w) => w.windowId === windowId);
    if (isAlreadyActivated) return;

    void run(async () => {
      await createVolunteerScheduleWeek({ windowId, userId });
      setError(null);
    });
  };

  const handleToggleShiftOnGrid = async (date: string, sId: number) => {
    if (!weekForWindow || !isWindowOpen) return;
    const existing = weekShifts.find(s => s.workDate === date && s.shiftId === sId);
    
    setError(null);
    setMessage(null);

    if (existing) {
      setRegistered(prev => prev.filter(s => s.scheduleId !== existing.scheduleId));
      setAllSchedules(prev => prev.filter(s => !(s.workDate === date && s.shiftId === sId && s.userId === userId)));

      try {
        await deleteVolunteerSchedule(existing.scheduleId);
        void loadMyScheduleBundleReal(userId).then(b => setRegistered(b?.shiftsRegistered || []));
        if (windowId) void fetchVolunteerSchedulesByWindow(windowId).then(data => setAllSchedules(data || []));
      } catch (e) {
        reload();
        setError("Failed to remove shift. Please try again.");
      }
    } else {
      const fakeId = Date.now();
      const newShiftFake = { scheduleId: fakeId, weekId: weekForWindow.weekId, userId, shiftId: sId, workDate: date };
      
      setRegistered(prev => [...prev, newShiftFake]);
      setAllSchedules(prev => [...prev, newShiftFake]);

      try {
        const res = await createVolunteerSchedule({
          weekId: weekForWindow.weekId,
          userId,
          shiftId: sId,
          workDate: date,
        });
        
        if (res && res.scheduleId) {
          setRegistered(prev => prev.map(s => s.scheduleId === fakeId ? res : s));
          setAllSchedules(prev => prev.map(s => s.scheduleId === fakeId ? res : s));
        }
      } catch (e) {
        reload();
        setError(e instanceof ApiError ? e.message : "Failed to log shift registration.");
      }
    }
  };

  const handleSubmitWeek = () => {
    if (!weekForWindow || !isWindowOpen) return;
    const isConfirmed = window.confirm(
      `Are you sure you want to submit your schedule for this week? Once submitted, \nyou will NOT be able to modify your selected shifts.`
    );
    if (isConfirmed) {
      void run(async () => {
        await submitVolunteerScheduleWeek(weekForWindow.weekId);
      });
    }
  };

  if (!staff) {
    return <p className="text-slate-400">Please sign in to manage your schedule planner.</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="My Schedule"
        description="Register for open windows, log flexible availability shifts, and monitor your active planner slots."
        badge={USE_MOCK ? "Mock" : "Volunteer"}
      />

      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminPanel title="Select Registration Window">
          <div className="space-y-3">
            <label className="text-xs text-slate-400 uppercase tracking-wider">Available Schedule Windows</label>
            <select
              value={windowId || ""}
              onChange={(e) => setWindowId(Number(e.target.value))}
              className={adminInputClass("w-full")}
            >
              {windows.length === 0 ? (
                <option value="">No open windows found</option>
              ) : (
                <option value="">-- Choose a week --</option>
              )}
              {windows.map((w) => (
                <option key={w.windowId} value={w.windowId}>
                  Week: {w.weekStartDate} ({w.status})
                </option>
              ))}
            </select>
            {selectedWindow && (
              <p className="text-xs text-slate-500 mt-1 italic">
                Closing Deadline: {selectedWindow.closeAt?.slice(0, 10) || "N/A"}
              </p>
            )}
          </div>
        </AdminPanel>

        <div className="lg:col-span-2">
          {selectedWindow ? (
            <AdminPanel title="Weekly Schedule Actions">
              <AdminFieldGrid cols={2} key={selectedWindow.windowId}>
                <AdminField label="Working Duration" value={`${selectedWindow.weekStartDate || "—"} — ${selectedWindow.weekEndDate || "—"}`} />
                <AdminField label="Your Registration Status" value={weekForWindow ? <StatusBadge value={weekForWindow.status} /> : "Inactive"} />
                <AdminField label="Total Selected Shifts" value={`${weekShifts.length} shifts`} />
              </AdminFieldGrid>

              {!isWindowOpen ? (
                <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center text-amber-400 text-sm italic">
                  This registration window is currently {selectedWindow.status}. Submissions are locked.
                </div>
              ) : !weekForWindow ? (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-700 text-center bg-slate-900/20">
                  <p className="text-sm text-slate-400 mb-3">You haven't activated a volunteer profile card for this week yet.</p>
                  <button
                    type="button"
                    disabled={busy} 
                    onClick={handleRegisterWeek}
                    className={`admin-btn-primary text-sm px-5 py-2 ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {busy ? "Activating..." : "Activate Registration for This Week"}
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {canEditWeek ? (
                    <div className="rounded-xl border border-white/[0.06] p-3 bg-slate-900/40">
                      {weekForWindow?.status === "REJECTED" && (
                        <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400">
                          <strong className="block mb-1 text-sm font-semibold">Your schedule has been rejected:</strong>
                          <p className="italic">{"Reasons for rejection: " + (weekForWindow.rejectionReason || "No specific reason.")}</p>
                          <span className="block mt-2 text-[10px] text-slate-500">
                            Please review the rejection reason and adjust your selected shifts accordingly before resubmitting.
                            </span>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mb-3">Check shifts to log availability or uncheck to clear:</p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="text-slate-500 border-b border-white/[0.05]">
                              <th className="py-2 text-left">Date</th>
                              {shifts.filter(s => s.shiftId !== 4).map(s => (
                                <th key={s.shiftId} className="py-2 px-1 text-center font-normal">
                                  <div className="flex flex-col items-center">
                                    <span className="font-semibold text-slate-300">{s.shiftName}</span>
                                    {s.startTime && s.endTime && (
                                      <span className="text-[10px] text-slate-500 font-normal">
                                        ({s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)})
                                      </span>
                                    )}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {registerWeekDates.map(date => (
                              <tr key={date}>
                                <td className="py-2 text-slate-300 font-medium whitespace-nowrap">{date.slice(5)}</td>
                                {shifts.filter(s => s.shiftId !== 4).map(s => {
                                  const loggedShift = weekShifts.find(ws => ws.workDate === date && ws.shiftId === s.shiftId);
                                  const isChecked = !!loggedShift;
                                  
                                  const shiftAssignments = Array.isArray(allSchedules) 
                                    ? allSchedules.filter(item => item.workDate === date && item.shiftId === s.shiftId)
                                    : [];
                                  
                                  const currentShiftTotal = shiftAssignments.length;
                                  const isShiftFull = currentShiftTotal >= 3 && !isChecked;
                                  const hasAdminAssigned = s.shiftId === 4 && shiftAssignments.length > 0;

                                  return (
                                    <td key={s.shiftId} className="py-2 px-1 text-center">
                                      {hasAdminAssigned ? (
                                        <span className="text-[10px] text-amber-500 font-medium italic bg-amber-500/10 px-1.5 py-0.5 rounded">Admin</span>
                                      ) : (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={isShiftFull} 
                                            onChange={() => handleToggleShiftOnGrid(date, s.shiftId)}
                                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer disabled:opacity-20"
                                          />
                                          <span className={`text-[9px] ${currentShiftTotal >= 3 ? "text-amber-500 font-medium" : "text-slate-500"}`}>
                                            {currentShiftTotal}/3
                                          </span>
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          disabled={busy || weekShifts.length === 0}
                          onClick={handleSubmitWeek}
                          className="admin-btn-primary text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Weekly Schedule for Approval
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-400/80 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 italic">
                      This schedule roster is currently {formatEnum(weekForWindow.status)} — Modifications are now locked.
                    </p>
                  )}
                </div>
              )}
            </AdminPanel>
          ) : null}
        </div>
      </div>

      <AdminPanel title="Official Schedule Lookup">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <Calendar size={16} className="text-emerald-400" />
            Official assigned schedule ledger tracks across submitted/approved periods
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500"> Roster Week:</span>
            <select
              value={viewWeekId || ""}
              onChange={(e) => setViewWeekId(Number(e.target.value))}
              className={adminInputClass("text-xs min-w-[240px]")}
            >
              {weeks.length === 0 ? (
                <option value="">(No registered periods logged)</option>
              ) : (
                weeks.map((w) => (
                  <option key={w.weekId} value={w.weekId}>
                    Week: {w.weekStartDate} → {w.weekEndDate} ({w.status})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {!selectedViewWeek || viewWeekShifts.length === 0 || selectedViewWeek.status !== "APPROVED" ? (
          <p className="text-sm text-slate-500 py-6 text-center italic">
            {selectedViewWeek?.status === "DRAFT" && 
              "Your schedule roster for this week is still in Draft status. Please press 'Submit Weekly Schedule for Approval' above to officially submit."}
            {selectedViewWeek?.status === "SUBMITTED" && 
              "Your schedule has been submitted and is currently pending administrator review. Please check back later."}
            {selectedViewWeek?.status === "REJECTED" && 
              "Your schedule roster was rejected. Please review the feedback, adjust your shifts above, and re-submit."}
            {(!selectedViewWeek || (selectedViewWeek.status === "APPROVED" && viewWeekShifts.length === 0)) &&
              "No logged shift records matched this account for the selected approved period."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Duty Date</th>
                  {shifts.filter((s) => s.shiftId !== 4).map((s) => (
                    <th key={s.shiftId} className="px-4 py-3 whitespace-nowrap font-medium">
                      {s.shiftName} <span className="text-[10px] text-slate-500 font-normal">({s.startTime?.slice(0,5)} - {s.endTime?.slice(0,5)})</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {viewWeekDates.map((date) => (
                  <tr key={date} className="hover:bg-white/[0.01]">
                    <td className="px-4 py-4 font-semibold text-slate-300 whitespace-nowrap">{date}</td>
                    {shifts.filter((s) => s.shiftId !== 4).map((s) => {
                      const hasMatch = viewWeekShifts.some(ws => ws.workDate === date && ws.shiftId === s.shiftId);
                      return (
                        <td key={s.shiftId} className="px-4 py-4">
                          {hasMatch ? (
                            <div className="flex flex-col items-start gap-1">
                              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-400 shadow-sm shadow-emerald-900/20 backdrop-blur-sm transition-all hover:border-emerald-500/50">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                <span>Confirmed</span>
                              </div>
                              {s.startTime && s.endTime && (
                                <span className="text-[11px] text-slate-400 font-medium pl-1.5">
                                  {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-start gap-1 select-none">
                              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.02] bg-white/[0.01] px-2.5 py-1 text-xs text-slate-600">
                                <span className="h-1 w-1 rounded-full bg-slate-700/60"></span>
                                <span>Off</span>
                              </div>
                              {s.startTime && s.endTime && (
                                <span className="text-[10px] text-slate-600 font-normal pl-1.5 italic">
                                  {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}