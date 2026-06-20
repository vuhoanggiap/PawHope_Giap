import {
  adminDashboardStats as mockDashboardStats,
  mockAdoptions,
  mockAdminPets,
  mockDonationCampaigns,
  mockDonations,
  mockEmailLogs,
  mockExpenses,
  mockItemDonations,
  mockKennels,
  mockNotifications,
  mockOrderItems,
  mockOrders,
  mockPetMedicalRecords,
  mockPetStatusLogs,
  mockRescueReports,
  mockScheduleWindows,
  mockShifts,
  mockStaff,
  mockUsers,
  mockVolunteerApplications,
  mockVolunteerSchedules,
  mockVolunteerWeeks,
  mockAdoptionMeetings,
  mockAdoptionHandovers,
  mockAdoptionFollowups,
} from "@/data/admin-mock";
import { ApiError, apiFetch, USE_MOCK } from "@/lib/api-client";
import { formatApiDate } from "@/lib/api/format";
import type { AdoptionResDto, DonationCampaignResDto, OrderResDto } from "@/lib/api/mappers";
import type { PetResDto } from "@/lib/api/mappers";
import { sumCampaignRaised } from "@/lib/api/donations-api";
import { fetchEmailLogs } from "@/lib/api/email-logs-api";
import { fetchExpenses } from "@/lib/api/expenses-api";
import { fetchKennels } from "@/lib/api/kennels-api";
import type { NotificationResDto, RescueReportResDto } from "@/lib/api/mappers";
import { fetchOrderById } from "@/lib/api/orders-api";
import {
  acceptRescueReport,
  deleteRescueReport,
  updateRescueReportStatus,
} from "@/lib/api/rescue-reports-api";
import { markNotificationRead } from "@/lib/api/notifications-api";
import { fetchMeetingsByAdoption } from "@/lib/api/adoption-meetings-api";
import { fetchHandoversByAdoption } from "@/lib/api/adoption-handovers-api";
import { fetchFollowupsByAdoption } from "@/lib/api/adoption-followups-api";
import {
  approveAdoption,
  cancelAdoption,
  completeAdoption,
  rejectAdoption,
  updateAdoptionPaymentStatus,
} from "@/lib/api/adoptions-api";
import { createExpense } from "@/lib/api/expenses-api";
import { updateKennel } from "@/lib/api/kennels-api";
import { fetchUsersRaw, patchUserRole, patchUserStatus } from "@/lib/api/users-api";
import { getStoredAdmin } from "@/lib/admin-auth";
import { fetchAllProducts } from "@/lib/api/products-api";
import { fetchVolunteerApplications } from "@/lib/api/volunteer-applications-api";
import {
  createVolunteerSchedule,
  createVolunteerScheduleWeek,
  deleteVolunteerSchedule,
  fetchScheduleWeeks,
  fetchScheduleWindows,
  fetchShifts,
  fetchVolunteerSchedules,
  submitVolunteerScheduleWeek,
} from "@/lib/api/volunteer-schedule-api";
import {
  mapAdminAdoption,
  mapAdminCampaign,
  mapAdminDonation,
  mapAdminEmailLog,
  mapAdminExpense,
  mapAdminItemDonation,
  mapAdminKennel,
  mapAdminMedical,
  mapAdminNotification,
  mapAdminOrder,
  mapAdminPet,
  mapAdminRescue,
  mapAdminStatusLog,
  mapAdminVolunteerApp,
  mapAdminMeeting,
  mapAdminHandover,
  mapAdminFollowup,
  type AdminRescueRow,
  mapScheduleWindow,
  mapShift,
  mapVolunteerScheduleRow,
} from "@/lib/admin/admin-mappers";
import { fetchPetMedicalByPet, fetchPetStatusLogsByPet } from "@/lib/api/pet-records-api";
import type { DonationResDto, ItemDonationResDto } from "@/lib/api/mappers";

type UserRow = (typeof mockUsers)[number];

const cache = {
  users: null as UserRow[] | null,
  rescues: null as ReturnType<typeof mapAdminRescue>[] | null,
  pets: null as ReturnType<typeof mapAdminPet>[] | null,
  kennels: null as ReturnType<typeof mapAdminKennel>[] | null,
  adoptions: null as ReturnType<typeof mapAdminAdoption>[] | null,
  orders: null as ReturnType<typeof mapAdminOrder>[] | null,
  donations: null as ReturnType<typeof mapAdminDonation>[] | null,
  campaigns: null as ReturnType<typeof mapAdminCampaign>[] | null,
  itemDonations: null as ReturnType<typeof mapAdminItemDonation>[] | null,
  expenses: null as ReturnType<typeof mapAdminExpense>[] | null,
  volunteers: null as ReturnType<typeof mapAdminVolunteerApp>[] | null,
  notifications: null as ReturnType<typeof mapAdminNotification>[] | null,
  emailLogs: null as ReturnType<typeof mapAdminEmailLog>[] | null,
  windows: null as ReturnType<typeof mapScheduleWindow>[] | null,
  shifts: null as ReturnType<typeof mapShift>[] | null,
  schedules: null as ReturnType<typeof mapVolunteerScheduleRow>[] | null,
};

function userLookup(userId: number | null | undefined) {
  if (userId == null) return undefined;
  const u = (cache.users ?? mockUsers).find((x) => x.user_id === userId);
  return u ? { name: u.full_name, email: u.email, phone: u.phone } : undefined;
}

export function getStaffName(userId: number | null | undefined) {
  if (userId == null) return "—";
  return (
    mockStaff.find((s) => s.user_id === userId)?.full_name ??
    (cache.users ?? mockUsers).find((u) => u.user_id === userId)?.full_name ??
    "—"
  );
}

export function getKennelOccupancy(kennelId: number) {
  const pets = cache.pets ?? mockAdminPets;
  return pets.filter((p) => p.kennel_id === kennelId).length;
}

export function getCampaignTitle(campaignId: number) {
  const list = cache.campaigns ?? mockDonationCampaigns;
  return list.find((c) => c.campaign_id === campaignId)?.title ?? "—";
}

export async function loadUsers(): Promise<UserRow[]> {
  if (USE_MOCK) return mockUsers;
  if (cache.users) return cache.users;

  try {
    cache.users = (await fetchUsersRaw()).map((d: any) => ({
      user_id: d.userId,
      username: d.username,
      full_name: d.fullName ?? d.username ?? `User #${d.userId}`,
      email: d.email,
      phone: d.phone ?? "",
      role: d.role ?? "USER",
      status: d.status === false ? 0 : 1,
      created_at: d.createdAt ?? "",
    }));

    return cache.users;
  } catch (e) {
    console.error("loadUsers failed:", e);
    return mockUsers;
  }
}

export async function loadRescueReports() {
  if (USE_MOCK) return mockRescueReports;
  if (cache.rescues) return cache.rescues;
  const raw = await apiFetch<RescueReportResDto[]>("/rescue_reports");
  cache.rescues = raw.map(mapAdminRescue);
  return cache.rescues;
}

export async function patchRescueReport(
  reportId: number,
  current: AdminRescueRow,
  patch: { status?: string; assigned_to?: number | null }
) {
  if (USE_MOCK) return;

  const assigneeId =
    patch.assigned_to !== undefined ? patch.assigned_to : current.assigned_to;
  const nextStatus = patch.status ?? current.status;

  const wantsAssign =
    assigneeId != null && assigneeId !== current.assigned_to;
  const wantsStatus = patch.status != null && patch.status !== current.status;

  if (wantsAssign) {
    if (current.assigned_to != null) {
      throw new ApiError("This report is already assigned. Reassignment is not supported by the API.");
    }
    if (current.status !== "PENDING") {
      throw new ApiError("Only PENDING reports can be assigned (accept).");
    }
    await acceptRescueReport(reportId, assigneeId);
  }

  if (wantsStatus) {
    await updateRescueReportStatus(reportId, nextStatus);
  }

  cache.rescues = null;
}

export async function removeRescueReport(reportId: number) {
  if (USE_MOCK) return;
  await deleteRescueReport(reportId);
  cache.rescues = null;
}

export async function loadRescueAssignees() {
  if (USE_MOCK) {
    return mockStaff.filter((s) => s.role === "VOLUNTEER" || s.role === "ADMIN");
  }
  const users = await loadUsers();
  return users.map((u) => ({
    user_id: u.user_id,
    full_name: u.full_name,
    role: u.role,
  }));
}

export async function markAdminNotificationRead(notiId: number) {
  if (USE_MOCK) return;
  await markNotificationRead(notiId);
  cache.notifications = null;
}

export async function loadAdoptionMeetings(adoptionId: number) {
  if (USE_MOCK) return mockAdoptionMeetings.filter((m) => m.adoption_id === adoptionId);
  await loadUsers();
  const raw = await fetchMeetingsByAdoption(adoptionId);
  return raw.map((m) => mapAdminMeeting(m, getStaffName(m.staffId)));
}

export async function loadAdoptionHandovers(adoptionId: number) {
  if (USE_MOCK) return mockAdoptionHandovers.filter((h) => h.adoption_id === adoptionId);
  const raw = await fetchHandoversByAdoption(adoptionId);
  return raw.map((h) => mapAdminHandover(h, getStaffName(h.handledBy)));
}

export async function loadAdoptionFollowups(adoptionId: number) {
  if (USE_MOCK) return mockAdoptionFollowups.filter((f) => f.adoption_id === adoptionId);
  const raw = await fetchFollowupsByAdoption(adoptionId);
  return raw.map((f) => mapAdminFollowup(f, getStaffName(f.createdBy)));
}

function staffActorId() {
  return getStoredAdmin()?.userId ?? 1;
}

export async function applyAdoptionAction(
  adoptionId: number,
  action: "approve" | "reject" | "complete" | "cancel" | "payment",
  payload?: { paymentStatus?: string; note?: string }
) {
  if (USE_MOCK) return;
  const actor = staffActorId();
  if (action === "approve") await approveAdoption(adoptionId, actor);
  if (action === "reject") await rejectAdoption(adoptionId, actor, payload?.note);
  if (action === "complete") await completeAdoption(adoptionId);
  if (action === "cancel") await cancelAdoption(adoptionId);
  if (action === "payment" && payload?.paymentStatus) {
    await updateAdoptionPaymentStatus(adoptionId, payload.paymentStatus);
  }
  cache.adoptions = null;
}

export async function saveExpenseRecord(input: {
  category: string;
  amount: number;
  description?: string;
  expenseDate: string;
  receiptImageUrl?: string;
}) {
  if (USE_MOCK) return;
  const actor = staffActorId();
  await createExpense({
    category: input.category,
    amount: input.amount,
    description: input.description,
    expenseDate: input.expenseDate,
    receiptImageUrl: input.receiptImageUrl,
    createdBy: actor,
  });
  cache.expenses = null;
}

export async function saveKennelRecord(kennel: {
  kennel_id: number;
  name: string;
  capacity: number;
  description: string;
}) {
  if (USE_MOCK) return;
  await updateKennel(kennel.kennel_id, {
    name: kennel.name,
    capacity: kennel.capacity,
    description: kennel.description,
  });
  cache.kennels = null;
}

export async function updateUserRole(userId: number, role: string) {
  if (USE_MOCK) return;
  await patchUserRole(userId, role);
  cache.users = null;
}

export async function updateUserActive(userId: number, active: boolean) {
  if (USE_MOCK) return;
  await patchUserStatus(userId, active);
  cache.users = null;
}

export async function loadAdminPets() {
  if (USE_MOCK) return mockAdminPets;
  if (cache.pets) return cache.pets;
  const raw = await apiFetch<PetResDto[]>("/pets");
  cache.pets = raw.map(mapAdminPet);
  return cache.pets;
}

export async function loadKennels() {
  if (USE_MOCK) return mockKennels;
  if (cache.kennels) return cache.kennels;
  cache.kennels = (await fetchKennels()).map(mapAdminKennel);
  return cache.kennels;
}

export async function loadAdoptions() {
  if (USE_MOCK) return mockAdoptions;
  if (cache.adoptions) return cache.adoptions;
  await Promise.all([loadUsers(), loadAdminPets()]);
  const raw = await apiFetch<AdoptionResDto[]>("/adoptions");
  cache.adoptions = raw.map((d) => {
    const pet = (cache.pets ?? []).find((p) => p.pet_id === d.petId);
    const user = userLookup(d.userId);
    return mapAdminAdoption(d, {
      petName: pet?.name,
      applicantName: user?.name,
      applicantEmail: user?.email,
      applicantPhone: user?.phone,
    });
  });
  return cache.adoptions;
}

export async function loadOrders() {
  if (USE_MOCK) return mockOrders;
  if (cache.orders) return cache.orders;

  try {
    await loadUsers();

    const raw = await apiFetch<OrderResDto[]>("/orders");

    cache.orders = raw.map((d) => {
      const user = userLookup(d.userId);

      return mapAdminOrder(
        d,
        user
          ? {
              name: user.name,
              email: user.email,
            }
          : undefined
      );
    });

    return cache.orders;
  } catch (e) {
    console.error("loadOrders failed:", e);
    return mockOrders;
  }
}

export async function loadOrderItems(orderId: number) {
  if (USE_MOCK) return mockOrderItems[orderId] ?? [];
  const order = await fetchOrderById(orderId);
  return (order.items ?? []).map((i) => ({
    product_name_snapshot: i.product_name,
    quantity: i.quantity,
    price_at_purchase: i.price,
  }));
}

export async function loadDonationCampaigns() {
  if (USE_MOCK) return mockDonationCampaigns;
  if (cache.campaigns) return cache.campaigns;
  const raw = await apiFetch<DonationCampaignResDto[]>("/donation_campaigns");
  cache.campaigns = await Promise.all(
    raw.map(async (c) => {
      const raised = await sumCampaignRaised(c.campaignId).catch(() => 0);
      return mapAdminCampaign(c, raised);
    })
  );
  return cache.campaigns;
}

export async function loadDonations() {
  if (USE_MOCK) return mockDonations;
  if (cache.donations) return cache.donations;
  const raw = await apiFetch<DonationResDto[]>("/donations");
  cache.donations = raw.map(mapAdminDonation);
  return cache.donations;
}

export async function loadItemDonations() {
  if (USE_MOCK) return mockItemDonations;
  if (cache.itemDonations) return cache.itemDonations;
  const raw = await apiFetch<ItemDonationResDto[]>("/item_donations");
  cache.itemDonations = raw.map(mapAdminItemDonation);
  return cache.itemDonations;
}

export async function loadExpenses() {
  if (USE_MOCK) return mockExpenses;
  if (cache.expenses) return cache.expenses;
  await loadUsers();
  cache.expenses = (await fetchExpenses()).map((e) =>
    mapAdminExpense(e, getStaffName(e.createdBy))
  );
  return cache.expenses;
}

export async function loadVolunteerApplications() {
  if (USE_MOCK) return mockVolunteerApplications;
  if (cache.volunteers) return cache.volunteers;
  cache.volunteers = (await fetchVolunteerApplications()).map(mapAdminVolunteerApp);
  return cache.volunteers;
}

export async function loadNotifications() {
  if (USE_MOCK) return mockNotifications;
  if (cache.notifications) return cache.notifications;
  const raw = await apiFetch<NotificationResDto[]>("/notifications");
  cache.notifications = raw.map(mapAdminNotification);
  return cache.notifications;
}

export async function loadEmailLogs() {
  if (USE_MOCK) return mockEmailLogs;
  if (cache.emailLogs) return cache.emailLogs;
  cache.emailLogs = (await fetchEmailLogs()).map(mapAdminEmailLog);
  return cache.emailLogs;
}

export async function loadVolunteerScheduleBundle() {
  if (USE_MOCK) {
    return { windows: mockScheduleWindows, shifts: mockShifts, schedules: mockVolunteerSchedules };
  }
  await loadUsers();
  
  // 🟢 BỌC AN TOÀN TRÁNH LỖI 403 KHI VOLUNTEER TRUY CẬP:
  const [windows, shifts, schedules] = await Promise.all([
    fetchScheduleWindows().catch(() => []),
    fetchShifts().catch(() => []),
    fetchVolunteerSchedules().catch(() => []),
  ]);
  
  cache.windows = windows.map(mapScheduleWindow);
  cache.shifts = shifts.map(mapShift);
  const shiftMap = new Map(cache.shifts.map((s) => [s.shift_id, s.shift_name]));
  cache.schedules = schedules.map((s) =>
    mapVolunteerScheduleRow(s, {
      volunteerName: getStaffName(s.userId) || "Volunteer",
      shiftName: shiftMap.get(s.shiftId ?? 0) ?? "Shift",
      windowId: s.weekId ?? 1,
      weekLabel: formatApiDate(s.workDate),
    })
  );
  return { windows: cache.windows, shifts: cache.shifts, schedules: cache.schedules };
}

export async function loadPetMedicalRecords(petId: number) {
  if (USE_MOCK) return mockPetMedicalRecords.filter((r) => r.pet_id === petId);
  const list = await fetchPetMedicalByPet(petId);
  return list.map((r) => mapAdminMedical(r, getStaffName(r.createdBy)));
}

export async function loadPetStatusLogs(petId: number) {
  if (USE_MOCK) return mockPetStatusLogs.filter((l) => l.pet_id === petId);
  const list = await fetchPetStatusLogsByPet(petId);
  return list.map((l) => mapAdminStatusLog(l, getStaffName(l.updatedBy)));
}

export async function loadDashboardStats() {
  if (USE_MOCK) return mockDashboardStats;
  const [rescues, pets, adoptions, donations, orders, products, volunteers, notifications] =
    await Promise.all([
      loadRescueReports().catch(() => []),
      loadAdminPets().catch(() => []),
      loadAdoptions().catch(() => []),
      loadDonations().catch(() => []),
      loadOrders().catch(() => []),
      fetchAllProducts().catch(() => []),
      loadVolunteerApplications().catch(() => []),
      loadNotifications().catch(() => []),
    ]);

  return {
    rescue: {
      pending: rescues.filter((r) => r.status === "PENDING").length,
      inProgress: rescues.filter((r) => r.status === "IN_PROGRESS").length,
      rescued: rescues.filter((r) => r.status === "RESCUED").length,
      failed: rescues.filter((r) => r.status === "FAILED").length,
      total: rescues.length,
    },
    pets: {
      available: pets.filter((p) => p.status === "AVAILABLE_FOR_ADOPTION").length,
      pendingAdoption: pets.filter((p) => p.status === "PENDING_ADOPTION").length,
      inCare: pets.length,
    },
    adoptions: {
      pending: adoptions.filter((a) => a.status === "PENDING").length,
      inReview: adoptions.filter((a) =>
        ["MEETING_SCHEDULED", "INTERVIEWING", "APPROVED", "HANDOVER_SCHEDULED"].includes(a.status)
      ).length,
      completed: adoptions.filter((a) => a.status === "COMPLETED").length,
    },
    donations: {
      count: donations.length,
      totalVnd: donations.reduce((s, d) => s + d.amount, 0),
    },
    orders: {
      pending: orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.order_status)).length,
      completed: orders.filter((o) => o.order_status === "DELIVERED").length,
    },
    products: {
      active: products.filter((p) => p.is_active).length,
      lowStock: products.filter((p) => p.stock_quantity <= 10).length,
    },
    volunteers: { pendingApps: volunteers.filter((v) => v.status === "PENDING").length },
    notifications: { unread: notifications.filter((n) => !n.is_read).length },
  };
}

export type MyScheduleWeekRow = {
  week_id: number;
  window_id: number;
  user_id: number;
  status: string;
  week_start: string;
  week_end: string;
};

export type MyScheduleShiftRow = {
  schedule_id: number;
  week_id: number;
  user_id: number;
  shift_id: number;
  shift_name: string;
  work_date: string;
  window_id: number;
};

let mockWeekIdSeq = 100;
let mockScheduleIdSeq = 100;

function clearScheduleCache() {
  cache.schedules = null;
  cache.windows = null;
  cache.shifts = null;
}

export async function loadMyScheduleBundle(userId: number) {
  const { windows, shifts, schedules } = await loadVolunteerScheduleBundle();
  const shiftMap = new Map(shifts.map((s) => [s.shift_id, s.shift_name]));

  if (USE_MOCK) {
    const weeks = mockVolunteerWeeks.filter((w) => w.user_id === userId);
    const myShifts: MyScheduleShiftRow[] = schedules
      .filter((s) => s.user_id === userId)
      .map((s) => ({
        schedule_id: s.schedule_id,
        week_id: weeks.find((w) => w.window_id === s.window_id)?.week_id ?? 1,
        user_id: s.user_id,
        shift_id: s.shift_id,
        shift_name: s.shift_name,
        work_date: s.week_label,
        window_id: s.window_id,
      }));
    return { windows, shifts, weeks, shiftsRegistered: myShifts };
  }

  // 🟢 BỌC BẮT LỖI AN TOÀN CHỐNG SẬP 500 CHO TÀI KHOẢN MỚI
  const weekDtos = await fetchScheduleWeeks().catch(() => []);
  const weeks: MyScheduleWeekRow[] = Array.isArray(weekDtos) 
    ? weekDtos
        .filter((w) => w.userId === userId)
        .map((w) => ({
          week_id: w.weekId,
          window_id: w.windowId ?? 0,
          user_id: w.userId ?? userId,
          status: w.status,
          week_start: formatApiDate(w.weekStartDate),
          week_end: formatApiDate(w.weekEndDate),
        }))
    : [];

  const weekById = new Map(weeks.map((w) => [w.week_id, w]));
  const rawSchedules = await fetchVolunteerSchedules().catch(() => []);
  const shiftsRegistered: MyScheduleShiftRow[] = Array.isArray(rawSchedules)
    ? rawSchedules
        .filter((s) => s.userId === userId)
        .map((s) => {
          const week = weekById.get(s.weekId ?? 0);
          return {
            schedule_id: s.scheduleId,
            week_id: s.weekId ?? 0,
            user_id: s.userId ?? userId,
            shift_id: s.shiftId ?? 0,
            shift_name: shiftMap.get(s.shiftId ?? 0) ?? "Shift",
            work_date: formatApiDate(s.workDate),
            window_id: week?.window_id ?? 0,
          };
        })
    : [];

  return { windows, shifts, weeks, shiftsRegistered };
}

// 🟢 TẠO BÍ DANH HÀM (ALIAS) ĐỂ KHỚP 100% VỚI FRONTEND ĐANG GỌI
export const loadMyScheduleBundleReal = loadMyScheduleBundle;

export async function registerMyScheduleWeek(windowId: number, userId: number) {
  if (USE_MOCK) {
    if (mockVolunteerWeeks.some((w) => w.user_id === userId && w.window_id === windowId)) {
      throw new ApiError("You already registered for this week.");
    }
    const win = mockScheduleWindows.find((w) => w.window_id === windowId);
    const row: MyScheduleWeekRow = {
      week_id: ++mockWeekIdSeq,
      window_id: windowId,
      user_id: userId,
      status: "DRAFT",
      week_start: win?.week_start ?? "",
      week_end: win?.week_end ?? "",
    };
    mockVolunteerWeeks.push(row);
    clearScheduleCache();
    return row;
  }
  const dto = await createVolunteerScheduleWeek({ windowId, userId });
  clearScheduleCache();
  return {
    week_id: dto.weekId,
    window_id: dto.windowId ?? windowId,
    user_id: dto.userId ?? userId,
    status: dto.status,
    week_start: formatApiDate(dto.weekStartDate),
    week_end: formatApiDate(dto.weekEndDate),
  };
}

export async function addMyScheduleShift(input: {
  weekId: number;
  userId: number;
  shiftId: number;
  workDate: string;
  windowId: number;
  shiftName: string;
  volunteerName: string;
}) {
  if (USE_MOCK) {
    const row: MyScheduleShiftRow = {
      schedule_id: ++mockScheduleIdSeq,
      week_id: input.weekId,
      user_id: input.userId,
      shift_id: input.shiftId,
      shift_name: input.shiftName,
      work_date: input.workDate,
      window_id: input.windowId,
    };
    mockVolunteerSchedules.push({
      schedule_id: row.schedule_id,
      user_id: input.userId,
      volunteer_name: input.volunteerName,
      window_id: input.windowId,
      week_label: input.workDate,
      shift_id: input.shiftId,
      shift_name: input.shiftName,
      status: "PENDING",
      note: "",
    });
    clearScheduleCache();
    return row;
  }
  const dto = await createVolunteerSchedule({
    weekId: input.weekId,
    userId: input.userId,
    shiftId: input.shiftId,
    workDate: input.workDate,
  });
  return {
    schedule_id: dto.scheduleId,
    week_id: input.weekId,
    user_id: input.userId,
    shift_id: input.shiftId,
    shift_name: input.shiftName,
    work_date: formatApiDate(dto.workDate),
    window_id: input.windowId,
  };
}

export async function removeMyScheduleShift(scheduleId: number) {
  if (USE_MOCK) {
    const idx = mockVolunteerSchedules.findIndex((s) => s.schedule_id === scheduleId);
    if (idx >= 0) mockVolunteerSchedules.splice(idx, 1);
    clearScheduleCache();
    return;
  }
  await deleteVolunteerSchedule(scheduleId);
  clearScheduleCache();
}

export async function submitMyScheduleWeek(weekId: number) {
  if (USE_MOCK) {
    const w = mockVolunteerWeeks.find((x) => x.week_id === weekId);
    if (!w) throw new ApiError("Week not found.");
    const count = mockVolunteerSchedules.filter(
      (s) => s.user_id === w.user_id && s.window_id === w.window_id
    ).length;
    if (count < 5) {
      throw new ApiError("Submit failed. Register at least 5 shifts before submitting.");
    }
    w.status = "SUBMITTED";
    clearScheduleCache();
    return w;
  }
  const dto = await submitVolunteerScheduleWeek(weekId);
  clearScheduleCache();
  return {
    week_id: dto.weekId,
    window_id: dto.windowId ?? 0,
    user_id: dto.userId ?? 0,
    status: dto.status,
    week_start: formatApiDate(dto.weekStartDate),
    week_end: formatApiDate(dto.weekEndDate),
  };
}

export { mockStaff };
export type { AdminRescueRow } from "@/lib/admin/admin-mappers";
export type AdminPetRow = Awaited<ReturnType<typeof loadAdminPets>>[number];