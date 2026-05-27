import {
  demoRescueReports,
  demoUserAdoptions,
  demoUserNotifications,
  type PublicAdoption,
  type PublicNotification,
  type PublicRescueReport,
} from "@/data/public-mock";
import { USE_MOCK } from "@/lib/api-client";
import {
  createAdoption,
  fetchAdoptionById,
  fetchAdoptionsByUser,
} from "@/lib/api/adoptions-api";
import {
  createRescueReport,
  fetchAllRescueReports,
  fetchRescueById,
  fetchRescueByTrackingCode,
} from "@/lib/api/rescue-reports-api";
import {
  fetchNotificationsByUser,
  fetchUnreadCount,
  markAllNotificationsRead as apiMarkAllRead,
  markNotificationRead as apiMarkRead,
} from "@/lib/api/notifications-api";

const RESCUE_KEY = "pawshope_public_rescues";
const ADOPTIONS_KEY = "pawshope_public_adoptions";
const NOTIFICATIONS_KEY = "pawshope_public_notifications";
const NOTI_READ_KEY = "pawshope_noti_read";

let apiRescuesCache: PublicRescueReport[] | null = null;
let apiAdoptionsCache = new Map<number, PublicAdoption[]>();
let apiNotificationsCache = new Map<number, PublicNotification[]>();

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
  if (!USE_MOCK && apiRescuesCache) {
    const hit = apiRescuesCache.find((r) => r.tracking_code.toUpperCase() === normalized);
    if (hit) return hit;
  }
  return allRescues().find((r) => r.tracking_code.toUpperCase() === normalized);
}

export async function loadRescueByCode(code: string): Promise<PublicRescueReport | undefined> {
  if (USE_MOCK) return getRescueByCode(code);
  try {
    const report = await fetchRescueByTrackingCode(code);
    return report;
  } catch {
    return getRescueByCode(code);
  }
}

export function generateTrackingCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `RSC-${new Date().getFullYear()}-${n}`;
}

function saveRescueReportMock(
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

export async function saveRescueReport(
  report: Omit<PublicRescueReport, "tracking_code" | "created_at" | "updated_at" | "status"> & {
    user_id?: number;
  }
): Promise<PublicRescueReport> {
  if (USE_MOCK) return saveRescueReportMock(report);
  return createRescueReport({
    userId: report.user_id,
    reporterName: report.reporter_name,
    reporterPhone: report.reporter_phone,
    locationText: report.location_text,
    urgencyLevel: report.urgency_level,
    injuryType: report.injury_type,
    temperament: report.temperament,
    behavior: report.behavior,
    additionalNote: report.additional_note,
    imageUrl: report.image_url,
  });
}

async function enrichNotificationLinks(list: PublicNotification[]): Promise<PublicNotification[]> {
  if (USE_MOCK) return list;
  return Promise.all(
    list.map(async (n) => {
      if (n.type === "RESCUE_ASSIGNED" && n.related_id) {
        try {
          const report = await fetchRescueById(n.related_id);
          return {
            ...n,
            link: `/rescue/track/${encodeURIComponent(report.tracking_code)}`,
          };
        } catch {
          return n;
        }
      }
      return n;
    })
  );
}

export function getUserRescueReports(userId: number): PublicRescueReport[] {
  if (!USE_MOCK && apiRescuesCache) {
    return apiRescuesCache.filter((r) => r.user_id === userId);
  }
  return allRescues().filter((r) => r.user_id === userId);
}

export async function loadUserRescueReports(userId: number): Promise<PublicRescueReport[]> {
  if (USE_MOCK) return getUserRescueReports(userId);
  try {
    const all = await fetchAllRescueReports();
    apiRescuesCache = all;
    return all.filter((r) => r.user_id === userId);
  } catch {
    return getUserRescueReports(userId);
  }
}

function allAdoptions(): PublicAdoption[] {
  const custom = readJson<PublicAdoption[]>(ADOPTIONS_KEY, []);
  return [...custom, ...demoUserAdoptions];
}

export function getUserAdoptions(userId: number): PublicAdoption[] {
  const cached = apiAdoptionsCache.get(userId);
  if (!USE_MOCK && cached) return cached;
  return allAdoptions().filter((a) => a.user_id === userId);
}

export async function loadUserAdoptions(userId: number): Promise<PublicAdoption[]> {
  if (USE_MOCK) return getUserAdoptions(userId);
  try {
    const list = await fetchAdoptionsByUser(userId);
    apiAdoptionsCache.set(userId, list);
    return list;
  } catch {
    return getUserAdoptions(userId);
  }
}

export function getAdoptionById(userId: number, adoptionId: number): PublicAdoption | undefined {
  return getUserAdoptions(userId).find((a) => a.adoption_id === adoptionId);
}

export async function loadAdoptionById(
  userId: number,
  adoptionId: number
): Promise<PublicAdoption | undefined> {
  if (USE_MOCK) return getAdoptionById(userId, adoptionId);
  try {
    const adoption = await fetchAdoptionById(adoptionId);
    if (adoption.user_id !== userId) return undefined;
    return adoption;
  } catch {
    return getAdoptionById(userId, adoptionId);
  }
}

export async function saveAdoption(
  entry: Omit<PublicAdoption, "adoption_id" | "application_code" | "status" | "apply_date">
): Promise<PublicAdoption> {
  if (USE_MOCK) {
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
  const adoption = await createAdoption({
    petId: entry.pet_id,
    userId: entry.user_id,
    housingType: entry.housing_type,
    reason: entry.reason,
  });
  const list = apiAdoptionsCache.get(entry.user_id) ?? [];
  apiAdoptionsCache.set(entry.user_id, [adoption, ...list]);
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
  const cached = apiNotificationsCache.get(userId);
  if (!USE_MOCK && cached) return cached;
  return applyReadState(
    allNotifications()
      .filter((n) => n.user_id === userId)
      .sort((a, b) => b.noti_id - a.noti_id)
  );
}

export async function loadUserNotifications(userId: number): Promise<PublicNotification[]> {
  if (USE_MOCK) return getUserNotifications(userId);
  try {
    const list = await enrichNotificationLinks(await fetchNotificationsByUser(userId));
    apiNotificationsCache.set(userId, list);
    return list;
  } catch {
    return getUserNotifications(userId);
  }
}

export function getUnreadNotificationCount(userId: number) {
  return getUserNotifications(userId).filter((n) => !n.is_read).length;
}

export async function loadUnreadNotificationCount(userId: number): Promise<number> {
  if (USE_MOCK) return getUnreadNotificationCount(userId);
  try {
    return await fetchUnreadCount(userId);
  } catch {
    return getUnreadNotificationCount(userId);
  }
}

export async function markNotificationRead(notiId: number) {
  if (!USE_MOCK) {
    try {
      await apiMarkRead(notiId);
      return;
    } catch {
      /* fallback mock */
    }
  }
  const ids = getReadNotiIds();
  if (!ids.includes(notiId)) writeJson(NOTI_READ_KEY, [...ids, notiId]);
  const custom = readJson<PublicNotification[]>(NOTIFICATIONS_KEY, []);
  writeJson(
    NOTIFICATIONS_KEY,
    custom.map((n) => (n.noti_id === notiId ? { ...n, is_read: true } : n))
  );
}

export async function markAllNotificationsRead(userId: number) {
  if (!USE_MOCK) {
    try {
      await apiMarkAllRead(userId);
      apiNotificationsCache.delete(userId);
      return;
    } catch {
      /* fallback */
    }
  }
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
