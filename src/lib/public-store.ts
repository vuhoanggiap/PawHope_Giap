import {
  demoRescueReports,
  demoUserAdoptions,
  demoUserNotifications,
  type PublicAdoption,
  type PublicNotification,
  type PublicRescueReport,
} from "@/data/public-mock";

const RESCUE_KEY = "pawshope_public_rescues";
const ADOPTIONS_KEY = "pawshope_public_adoptions";
const NOTIFICATIONS_KEY = "pawshope_public_notifications";
const NOTI_READ_KEY = "pawshope_noti_read";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getReadNotiIds(): number[] {
  return readJson<number[]>(NOTI_READ_KEY, []);
}

function applyReadState(list: PublicNotification[]): PublicNotification[] {
  const readSet = new Set(getReadNotiIds());
  return list.map((n) => (readSet.has(n.noti_id) ? { ...n, is_read: true } : n));
}

function allRescues(): PublicRescueReport[] {
  const custom = readJson<PublicRescueReport[]>(RESCUE_KEY, []);
  return [...custom, ...demoRescueReports];
}

export function getRescueByCode(code: string): PublicRescueReport | undefined {
  const normalized = code.trim().toUpperCase();
  return allRescues().find((r) => r.tracking_code.toUpperCase() === normalized);
}

export function generateTrackingCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `RSC-${new Date().getFullYear()}-${n}`;
}

export function saveRescueReport(
  report: Omit<PublicRescueReport, "tracking_code" | "created_at" | "updated_at" | "status"> & {
    user_id?: number;
  }
): PublicRescueReport {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const entry: PublicRescueReport = {
    ...report,
    tracking_code: generateTrackingCode(),
    status: "PENDING",
    created_at: now,
    updated_at: now,
  };
  const custom = readJson<PublicRescueReport[]>(RESCUE_KEY, []);
  custom.unshift(entry);
  writeJson(RESCUE_KEY, custom);
  return entry;
}

export function getUserRescueReports(userId: number): PublicRescueReport[] {
  return allRescues().filter((r) => r.user_id === userId);
}

function allAdoptions(): PublicAdoption[] {
  const custom = readJson<PublicAdoption[]>(ADOPTIONS_KEY, []);
  return [...custom, ...demoUserAdoptions];
}

export function getUserAdoptions(userId: number): PublicAdoption[] {
  return allAdoptions().filter((a) => a.user_id === userId);
}

export function getAdoptionById(userId: number, adoptionId: number): PublicAdoption | undefined {
  return getUserAdoptions(userId).find((a) => a.adoption_id === adoptionId);
}

export function saveAdoption(
  entry: Omit<PublicAdoption, "adoption_id" | "application_code" | "status" | "apply_date">
): PublicAdoption {
  const id = Date.now();
  const adoption: PublicAdoption = {
    ...entry,
    adoption_id: id,
    application_code: `AD-${new Date().getFullYear()}-${String(id).slice(-4)}`,
    status: "PENDING",
    apply_date: new Date().toISOString().slice(0, 10),
  };
  const custom = readJson<PublicAdoption[]>(ADOPTIONS_KEY, []);
  custom.unshift(adoption);
  writeJson(ADOPTIONS_KEY, custom);

  const notifications = readJson<PublicNotification[]>(NOTIFICATIONS_KEY, demoUserNotifications);
  notifications.unshift({
    noti_id: Date.now(),
    user_id: entry.user_id,
    message: `Application ${adoption.application_code} for ${entry.pet_name} was received.`,
    type: "SYSTEM",
    is_read: false,
    created_at: new Date().toISOString().slice(0, 16).replace("T", " "),
    link: `/account/adoptions/${adoption.adoption_id}`,
  });
  writeJson(NOTIFICATIONS_KEY, notifications);

  return adoption;
}

function allNotifications(): PublicNotification[] {
  const custom = readJson<PublicNotification[]>(NOTIFICATIONS_KEY, []);
  const merged = [...custom];
  for (const n of demoUserNotifications) {
    if (!merged.some((m) => m.noti_id === n.noti_id)) merged.push(n);
  }
  return merged;
}

export function getUserNotifications(userId: number): PublicNotification[] {
  return applyReadState(
    allNotifications()
      .filter((n) => n.user_id === userId)
      .sort((a, b) => b.noti_id - a.noti_id)
  );
}

export function getUnreadNotificationCount(userId: number) {
  return getUserNotifications(userId).filter((n) => !n.is_read).length;
}

export function markNotificationRead(notiId: number) {
  const ids = getReadNotiIds();
  if (!ids.includes(notiId)) {
    writeJson(NOTI_READ_KEY, [...ids, notiId]);
  }
  const custom = readJson<PublicNotification[]>(NOTIFICATIONS_KEY, []);
  writeJson(
    NOTIFICATIONS_KEY,
    custom.map((n) => (n.noti_id === notiId ? { ...n, is_read: true } : n))
  );
}

export function markAllNotificationsRead(userId: number) {
  const all = allNotifications().filter((n) => n.user_id === userId);
  const ids = new Set(getReadNotiIds());
  for (const n of all) ids.add(n.noti_id);
  writeJson(NOTI_READ_KEY, [...ids]);
  const custom = readJson<PublicNotification[]>(NOTIFICATIONS_KEY, []);
  writeJson(
    NOTIFICATIONS_KEY,
    custom.map((n) => (n.user_id === userId ? { ...n, is_read: true } : n))
  );
}
