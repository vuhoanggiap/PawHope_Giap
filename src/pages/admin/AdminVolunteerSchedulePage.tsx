import { useEffect, useState } from "react";
import { AdminField, AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockScheduleWindows, mockVolunteerSchedules } from "@/data/admin-mock";
import { fetchShifts,  createShift,  updateShift,  deleteShift,  type ShiftResDto } from "@/lib/api/shifts-api"; 
import {  fetchScheduleWindows,  fetchVolunteerSchedules, createVolunteerScheduleWindow,  updateVolunteerScheduleWindow,
  approveVolunteerWeek, rejectVolunteerWeek
} from "@/lib/api/volunteer-schedule-api"; 

export function AdminVolunteerSchedulePage() {
  const [tab, setTab] = useState("registrations");
  const [windows, setWindows] = useState<any[]>([]);
  const [shifts, setShifts] = useState<ShiftResDto[]>([]); 
  const [schedules, setSchedules] = useState<any[]>([]);
  const [windowId, setWindowId] = useState<number>(1);
  const [editingShiftId, setEditingShiftId] = useState<number | null>(null);
  const [shiftForm, setShiftForm] = useState({
    shiftName: "",
    startTime: "",
    endTime: "",
    crossesMidnight: false,
  });

  const [editingWindowId, setEditingWindowId] = useState<number | null>(null);
  const [windowForm, setWindowForm] = useState({
    weekStartDate: "",
    weekEndDate: "",
    openAt: "",
    closeAt: "",
    status: "NOT_OPEN",
  });

  const [monthPage, setMonthPage] = useState(0);

  const loadData = () => {
    fetchShifts()
      .then((data: any) => {
        setShifts(data || []);
      })
      .catch(() => setShifts([]));

    fetchScheduleWindows()
      .then((res: any) => {
        const data = res?.data ? res.data : res;

        const sortedData = data ? [...data].sort((a, b) => {
          const statusOrder: Record<string, number> = { OPEN: 1, NOT_OPEN: 2, CLOSED: 3 };
          const orderA = statusOrder[a.status] || 99;
          const orderB = statusOrder[b.status] || 99;
          
          if (orderA !== orderB) {
            return orderA - orderB; 
          }
          return (b.weekStartDate || "").localeCompare(a.weekStartDate || "");
        }) : [];

        setWindows(sortedData);

        if (sortedData.length > 0) {
          setWindowId((prev) => {
            if (prev && sortedData.some(w => w.windowId === prev)) return prev;
            return sortedData[0].windowId;
          });
        }
      })
      .catch(() => setWindows(mockScheduleWindows));

    fetchVolunteerSchedules()
      .then((res: any) => {
        const data = res?.data ? res.data : res;
        setSchedules(data || []);
      })
      .catch(() => setSchedules(mockVolunteerSchedules));
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      fetchVolunteerSchedules()
        .then((res: any) => {
          const data = res?.data ? res.data : res;
          if (data) setSchedules(data);
        })
        .catch((err) => console.error("Polling sync error:", err));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = schedules.filter((s) => s.windowId === windowId);
  const selectedWindow = windows.find((w) => w.windowId === windowId);

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

  const weekDates = selectedWindow ? getWeekDates(selectedWindow.weekStartDate) : [];

  const groupedWindows = windows.reduce((acc: Record<string, any[]>, window) => {
    const month = window.weekStartDate.slice(0, 7); 
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(window);
    return acc;
  }, {});

  const months = Object.keys(groupedWindows).sort().reverse();

  const currentMonth = months[monthPage];

  const currentWindows = groupedWindows[currentMonth] || [];

  async function handleSaveShift() {
    try {
      if (!shiftForm.shiftName || !shiftForm.startTime || !shiftForm.endTime) {
        alert("Please fill in all shift fields!");
        return;
      }

      const formattedStartTime = shiftForm.startTime.length === 5 ? `${shiftForm.startTime}:00` : shiftForm.startTime;
      const formattedEndTime = shiftForm.endTime.length === 5 ? `${shiftForm.endTime}:00` : shiftForm.endTime;

      const payload = {
        shiftName: shiftForm.shiftName,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        crossesMidnight: shiftForm.crossesMidnight,
      };

      let savedShift: ShiftResDto;

      if (editingShiftId === null) {
        savedShift = await createShift(payload);
        setShifts((prev) => [...prev, savedShift]);
        alert("Created new shift successfully!");
      } else {
        savedShift = await updateShift(editingShiftId, payload);
        setShifts((prev) =>
          prev.map((s) => (s.shiftId === savedShift.shiftId ? savedShift : s))
        );
        alert("Updated shift successfully!");
      }
      setShiftForm({ shiftName: "", startTime: "", endTime: "", crossesMidnight: false });
      editingShiftId !== null && setEditingShiftId(null);
    } catch (error) {
      alert("Failed to save shift.");
    }
  }

  function handleEditShift(shift: ShiftResDto) {
    setEditingShiftId(shift.shiftId);
    setShiftForm({
      shiftName: shift.shiftName,
      startTime: shift.startTime ? shift.startTime.slice(0, 5) : "",
      endTime: shift.endTime ? shift.endTime.slice(0, 5) : "",
      crossesMidnight: !!shift.crossesMidnight,
    });
  }

  async function handleSaveWindow() {
    try {
      if (!windowForm.weekStartDate) {
        alert("Please select a Week Start Date!");
        return;
      }

      const payload = {
        weekStartDate: windowForm.weekStartDate,
        status: windowForm.status,
      };

      if (editingWindowId === null) {
        await createVolunteerScheduleWindow(payload);
        alert("Created registration window successfully!");
      } else {
        await updateVolunteerScheduleWindow(editingWindowId, payload);
        alert("Updated registration window successfully!");
      }

      setWindowForm({ weekStartDate: "", weekEndDate: "", openAt: "", closeAt: "", status: "NOT_OPEN" });
      setEditingWindowId(null);
      loadData();
    } catch (error) {
      alert("Failed to save registration window.");
    }
  }

  function toDateTimeLocal(value: string) {
    return value ? value.slice(0, 16) : "";
  }

  function handleEditWindow(window: any) {
    setEditingWindowId(window.windowId);
    setWindowForm({
      weekStartDate: window.weekStartDate,
      weekEndDate: window.weekEndDate || "",
      openAt: toDateTimeLocal(window.openAt),
      closeAt: toDateTimeLocal(window.closeAt),
      status: window.status,
    });
  }

  async function handleDeleteWindow(id: number) {
    try {
      setWindows((prev) => prev.filter((w) => w.windowId !== id));
      alert("Deleted registration window successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete registration window!");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Volunteer schedule"
        description="Shift templates, registration windows, and volunteer week sign-ups."
        badge="Admin"
      />

      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "registrations", label: "Registrations" },
          { id: "windows", label: "Windows" },
          { id: "shifts", label: "Shifts" },
        ]}
        className="mb-6"
      />

      {tab === "registrations" ? (
        <>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Registration window
              </label>
              <select
                value={windowId}
                onChange={(e) => setWindowId(Number(e.target.value))}
                className={adminInputClass("min-w-[240px]")}
              >
                {windows.map((w) => (
                  <option key={w.windowId} value={w.windowId}>
                    {w.title || `Week Starting: ${w.weekStartDate}`}
                  </option>
                ))}
              </select>
            </div>

            {selectedWindow ? (
              <p className="text-sm text-slate-400">
                Open {selectedWindow.openAt?.slice(0, 10)} → {selectedWindow.closeAt?.slice(0, 10)} ·{" "}
                <StatusBadge value={selectedWindow.status} />
              </p>
            ) : null}
          </div>

          {(() => {
            const uniqueSubmissions = Array.from(
              new Map(
                filtered
                  .filter((s) => s.weekStatus === "SUBMITTED" && s.weekId)
                  .map((item) => [item.weekId, item])
              ).values()
            );

            if (uniqueSubmissions.length === 0) return null;

            return (
              <AdminPanel title="This week's application is on the pending list for approval.">
                <div className="divide-y divide-slate-800">
                  {uniqueSubmissions.map((v: any) => (
                    <div key={v.weekId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div>
                        <span className="font-semibold text-slate-200 text-sm">{v.volunteerName}</span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Selected: {filtered.filter((s) => s.weekId === v.weekId).length} shifts this week
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`Confirm APPROVAL of the entire weekly schedule for ${v.volunteerName}?`)) {
                              try {
                                await approveVolunteerWeek(v.weekId);
                                alert("Successfully approved!");
                                loadData();
                              } catch (err) {
                                alert("Failed to approve schedule.");
                              }
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          Approve Week
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const reason = window.prompt("Enter the reason for rejecting this week's schedule:");
                            if (reason !== null) {
                              try {
                                await rejectVolunteerWeek(v.weekId, reason);
                                alert("Successfully rejected the schedule.");
                                loadData();
                              } catch (err) {
                                alert("Failed to reject the schedule.");
                              }
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          Reject Week
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminPanel>
            );
          })()}

          <div className="overflow-x-auto rounded-2xl border border-slate-800 mt-6">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  {shifts.filter((s) => s.shiftId !== 4).map((shift) => (
                    <th key={shift.shiftId} className="px-4 py-3 font-medium text-slate-400">
                      {shift.shiftName}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {weekDates.map((date) => (
                  <tr key={date} className="hover:bg-slate-900/20">
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-300">
                      {date}
                    </td>

                    {shifts.filter((s) => s.shiftId !== 4).map((shift) => {
                      const volunteers = filtered.filter(
                        (s) => s.workDate === date && s.shiftName === shift.shiftName
                      );
                      return (
                        <td key={shift.shiftId} className="min-w-[180px] px-4 py-4 align-top">
                          {volunteers.length > 0 ? (
                            <div className="space-y-2">
                              {volunteers.map((v) => {
                                const currentStatus = v.weekStatus || "SUBMITTED";
                                return (
                                  <div key={v.scheduleId} className="rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 shadow-sm">
                                    <div className="font-semibold text-slate-200 text-xs">{v.volunteerName}</div>
                                    <div className="mt-1.5">
                                      <StatusBadge value={currentStatus} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-700">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {tab === "windows" ? (
        <div className="space-y-6">
          <AdminPanel title={editingWindowId ? "Update registration window" : "Create registration window"}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Week Start Date (Monday)</label>
                <input
                  type="date"
                  value={windowForm.weekStartDate}
                  onChange={(e) => setWindowForm((prev) => ({ ...prev, weekStartDate: e.target.value }))}
                  className={adminInputClass()}
                />
              </div>
              {editingWindowId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Override Status (Optional)</label>
                  <select
                    value={windowForm.status}
                    onChange={(e) => setWindowForm((prev) => ({ ...prev, status: e.target.value }))}
                    className={adminInputClass()}
                  >
                    <option value="NOT_OPEN">NOT_OPEN</option>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleSaveWindow} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">
                {editingWindowId ? "Update Window" : "Create Window"}
              </button>
              {editingWindowId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingWindowId(null);
                    setWindowForm({ weekStartDate: "", weekEndDate: "", openAt: "", closeAt: "", status: "NOT_OPEN" });
                  }}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white"
                >
                  Cancel
                </button>
              )}
            </div>
          </AdminPanel>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <button
              type="button"
              disabled={monthPage === 0}
              onClick={() => setMonthPage((prev) => prev - 1)}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Previous
            </button>

            <span className="font-semibold text-slate-300">
              {currentMonth || "No Data"}
            </span>

            <button
              type="button"
              disabled={monthPage === months.length - 1}
              onClick={() => setMonthPage((prev) => prev + 1)}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {currentWindows.map((w) => (
              <AdminPanel key={w.windowId} title={w.title || `Window #${w.windowId}`}>
                <AdminFieldGrid cols={2}>
                  <AdminField label="Week Duration" value={`${w.weekStartDate} → ${w.weekEndDate}`} />
                  <AdminField label="System Status" value={<StatusBadge value={w.status} />} />
                  <AdminField label="Registration Opens" value={w.openAt?.replace("T", " | ").slice(0, 18)} />
                  <AdminField label="Registration Closes" value={w.closeAt?.replace("T", " | ").slice(0, 18)} />
                </AdminFieldGrid>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => handleEditWindow(w)} className="rounded-lg bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600">
                    Edit
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete this window? This action cannot be undone.`)) {
                        handleDeleteWindow(w.windowId);
                      }
                    }} 
                    className="rounded-lg bg-red-500/80 px-3 py-2 text-xs text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </AdminPanel>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "shifts" ? (
        <div className="space-y-6">
          <AdminPanel title={editingShiftId ? "Update shift" : "Create shift"}>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Shift name</label>
                <input
                  value={shiftForm.shiftName}
                  onChange={(e) => setShiftForm((prev) => ({ ...prev, shiftName: e.target.value }))}
                  placeholder="Morning shift"
                  className={adminInputClass()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Start time</label>
                <input
                  type="time"
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className={adminInputClass()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">End time</label>
                <input
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  className={adminInputClass()}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button 
                type="button" 
                onClick={handleSaveShift} 
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
              >
                {editingShiftId ? "Update" : "Create"}
              </button>

              {editingShiftId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingShiftId(null);
                    setShiftForm({ shiftName: "", startTime: "", endTime: "", crossesMidnight: false });
                  }}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white"
                >
                  Cancel
                </button>
              )}
            </div>
          </AdminPanel>

          <div className="grid gap-4 md:grid-cols-3">
            {shifts.map((shift) => (
              <AdminPanel key={shift.shiftId} title={shift.shiftName}>
                <AdminFieldGrid>
                  <AdminField label="Hours" value={`${shift.startTime} – ${shift.endTime}`} />
                </AdminFieldGrid>

                <div className="mt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => handleEditShift(shift)} 
                    className="rounded-lg bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete ${shift.shiftName}?`)) {
                        try {
                          await deleteShift(shift.shiftId);
                          setShifts((prev) => prev.filter((s) => s.shiftId !== shift.shiftId));
                          alert("Deleted shift successfully!");
                        } catch (error) {
                          alert("Delete shift failed!");
                        }
                      }
                    }}
                    className="rounded-lg bg-red-500/80 px-3 py-2 text-xs text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </AdminPanel>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}