import { apiFetch } from "@/lib/api-client";
import { mapNotificationRes, type NotificationResDto } from "@/lib/api/mappers";
import type { PublicNotification } from "@/data/public-mock";

export async function fetchNotificationsByUser(userId: number): Promise<PublicNotification[]> {
  const list = await apiFetch<NotificationResDto[]>(`/notifications/user/${userId}`);
  return list.map(mapNotificationRes).sort((a, b) => b.noti_id - a.noti_id);
}

export async function fetchUnreadCount(userId: number): Promise<number> {
  return apiFetch<number>(`/notifications/user/${userId}/unread-count`);
}

export async function markNotificationRead(notiId: number) {
  await apiFetch<NotificationResDto>(`/notifications/${notiId}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(userId: number) {
  await apiFetch<string>(`/notifications/user/${userId}/read-all`, { method: "PATCH" });
}

export async function fetchAllNotifications(): Promise<PublicNotification[]> {
  const list = await apiFetch<NotificationResDto[]>("/notifications");
  return list.map(mapNotificationRes);
}
