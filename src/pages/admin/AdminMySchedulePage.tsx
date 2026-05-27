import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getStoredAdmin } from "@/lib/admin-auth";
import {
  addMyScheduleShift,
  loadMyScheduleBundle,
  registerMyScheduleWeek,
  removeMyScheduleShift,
  submitMyScheduleWeek,
  type MyScheduleShiftRow,
  type MyScheduleWeekRow,
} from "@/lib/admin/admin-data";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { formatEnum } from "@/lib/adminFormat";
import { Trash2 } from "lucide-react";

export function AdminMySchedulePage() {
  const staff = getStoredAdmin();
  const userId = staff?.userId ?? 0;

  const [windows, setWindows] = useState<Awaited<ReturnType<typeof loadMyScheduleBundle>>["windows"]>([]);
  const [shifts, setShifts] = useState<Awaited<ReturnType<typeof loadMyScheduleBundle>>["shifts"]>([]);
  const [weeks, setWeeks] = useState<MyScheduleWeekRow[]>([]);
  const [registered, setRegistered] = useState<MyScheduleShiftRow[]>([]);
  const [windowId, setWindowId] = useState<number | null>(null);
  const [shiftId, setShiftId] = useState<number>(1);
  const [workDate, setWorkDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    if (!userId) return;
    void loadMyScheduleBundle(userId).then((b) => {
      setWindows(b.windows);
      setShifts(b.shifts);
      setWeeks(b.weeks);
      setRegistered(b.shiftsRegistered);
      setWindowId((prev) => {
        if (prev != null && b.windows.some((w) => w.window_id === prev)) return prev;
        const open = b.windows.find((w) => w.status === "OPEN");
        return open?.window_id ?? b.windows[0]?.window_id ?? null;
      });
    });
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const selectedWindow = windows.find((w) => w.window_id === windowId);
  const weekForWindow = weeks.find((w) => w.window_id === windowId);
  const weekShifts = useMemo(
    () => registered.filter((s) => s.week_id === weekForWindow?.week_id),
    [registered, weekForWindow?.week_id]
  );
  const canEditWeek = weekForWindow?.status === "DRAFT";
  const openWindows = windows.filter((w) => w.status === "OPEN");

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
    if (!windowId || !userId) return;
    void run(async () => {
      await registerMyScheduleWeek(windowId, userId);
      setMessage("Registered for this week. Add at least 5 shifts, then submit.");
    });
  };

  const handleAddShift = () => {
    if (!weekForWindow || !userId || !shiftId || !workDate) {
      setError("Pick a shift and work date.");
      return;
    }
    const shiftName = shifts.find((s) => s.shift_id === shiftId)?.shift_name ?? "Shift";
    void run(async () => {
      await addMyScheduleShift({
        weekId: weekForWindow.week_id,
        userId,
        shiftId,
        workDate,
        windowId: weekForWindow.window_id,
        shiftName,
        volunteerName: staff?.fullName ?? "Volunteer",
      });
      setMessage("Shift added.");
      setWorkDate("");
    });
  };

  const handleSubmitWeek = () => {
    if (!weekForWindow) return;
    void run(async () => {
      await submitMyScheduleWeek(weekForWindow.week_id);
      setMessage("Week submitted for admin approval.");
    });
  };

  if (!staff) {
    return <p className="text-slate-400">Sign in to manage your schedule.</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="My schedule"
        description="Register for open weeks, pick shifts, and submit your availability."
        badge={USE_MOCK ? "Mock" : "Live API"}
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Registration windows">
          {openWindows.length === 0 ? (
            <p className="text-sm text-slate-500">No open registration windows right now.</p>
          ) : (
            <div className="space-y-2">
              {openWindows.map((w) => (
                <button
                  key={w.window_id}
                  type="button"
                  onClick={() => setWindowId(w.window_id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    windowId === w.window_id
                      ? "border-[#2c5f51]/50 bg-[#2c5f51]/15"
                      : "admin-card"
                  }`}
                >
                  <p className="font-medium text-white">{w.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {w.week_start} → {w.week_end} · <StatusBadge value={w.status} />
                  </p>
                </button>
              ))}
            </div>
          )}
        </AdminPanel>

        {selectedWindow ? (
          <AdminPanel title="Your week">
            <AdminFieldGrid cols={2}>
              <AdminField label="Window" value={selectedWindow.title} />
              <AdminField
                label="Registration"
                value={`${selectedWindow.open_from} → ${selectedWindow.open_until}`}
              />
              <AdminField
                label="Week status"
                value={weekForWindow ? <StatusBadge value={weekForWindow.status} /> : "Not registered"}
              />
              <AdminField label="Shifts logged" value={weekShifts.length} />
            </AdminFieldGrid>

            {!weekForWindow ? (
              <button
                type="button"
                disabled={busy || selectedWindow.status !== "OPEN"}
                onClick={handleRegisterWeek}
                className="admin-btn-primary mt-4 text-sm disabled:opacity-50"
              >
                Register for this week
              </button>
            ) : (
              <div className="mt-4 space-y-4">
                {canEditWeek ? (
                  <>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-500">Shift</label>
                        <select
                          value={shiftId}
                          onChange={(e) => setShiftId(Number(e.target.value))}
                          className={adminInputClass("mt-1 w-full")}
                        >
                          {shifts.map((s) => (
                            <option key={s.shift_id} value={s.shift_id}>
                              {s.shift_name} ({s.start_time}–{s.end_time})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Work date</label>
                        <input
                          type="date"
                          value={workDate}
                          min={weekForWindow.week_start}
                          max={weekForWindow.week_end}
                          onChange={(e) => setWorkDate(e.target.value)}
                          className={adminInputClass("mt-1 w-full")}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={handleAddShift}
                          className="admin-filter-pill-active w-full text-sm disabled:opacity-50"
                        >
                          Add shift
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Submit when you have at least 5 shifts (backend rule).
                    </p>
                    <button
                      type="button"
                      disabled={busy || weekShifts.length < 5}
                      onClick={handleSubmitWeek}
                      className="admin-btn-primary text-sm disabled:opacity-50"
                    >
                      Submit week for approval
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    This week is {formatEnum(weekForWindow.status)} — editing is closed.
                  </p>
                )}
              </div>
            )}
          </AdminPanel>
        ) : null}
      </div>

      <AdminPanel title="My shifts">
        {weekShifts.length === 0 ? (
          <p className="text-sm text-slate-500">No shifts for the selected week yet.</p>
        ) : (
          <ul className="space-y-2">
            {weekShifts.map((s) => (
              <li
                key={s.schedule_id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {s.work_date} · {s.shift_name}
                  </p>
                  <p className="text-xs text-slate-500">Schedule #{s.schedule_id}</p>
                </div>
                {canEditWeek ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        await removeMyScheduleShift(s.schedule_id);
                        setMessage("Shift removed.");
                      })
                    }
                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                    aria-label="Remove shift"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
