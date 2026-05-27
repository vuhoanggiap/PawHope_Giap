import {
  Dog,
  HeartHandshake,
  LifeBuoy,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { getStoredAdmin, isAdmin, type StaffRole } from "@/lib/admin-auth";
import type { adminDashboardStats } from "@/data/admin-mock";

export function getStaffUser() {
  return getStoredAdmin();
}

export function staffIsAdmin() {
  return isAdmin(getStoredAdmin()?.role);
}

export function staffRole(): StaffRole | undefined {
  return getStoredAdmin()?.role;
}

type DashboardStats = typeof adminDashboardStats;

export function getDashboardStatCards(s: DashboardStats, role?: StaffRole) {
  const all = [
    {
      label: "Rescue pending",
      value: s.rescue.pending,
      sub: `${s.rescue.inProgress} in progress`,
      icon: LifeBuoy,
      tint: "text-sky-400 bg-sky-400/15 ring-sky-400/20",
      to: "/admin/rescue",
      roles: ["ADMIN", "VOLUNTEER"] as StaffRole[],
    },
    {
      label: "Pets available",
      value: s.pets.available,
      sub: `${s.pets.inCare} in care total`,
      icon: Dog,
      tint: "text-emerald-400 bg-emerald-400/15 ring-emerald-400/20",
      to: "/admin/pets",
      roles: ["ADMIN", "VOLUNTEER"] as StaffRole[],
    },
    {
      label: "Adoptions pending",
      value: s.adoptions.pending,
      sub: `${s.adoptions.inReview} in review`,
      icon: HeartHandshake,
      tint: "text-violet-400 bg-violet-400/15 ring-violet-400/20",
      to: "/admin/adoptions",
      roles: ["ADMIN", "VOLUNTEER"] as StaffRole[],
    },
    {
      label: "Donations (VND)",
      value: (s.donations.totalVnd / 1_000_000).toFixed(1) + "M",
      sub: `${s.donations.count} transactions`,
      icon: Wallet,
      tint: "text-amber-400 bg-amber-400/15 ring-amber-400/20",
      to: "/admin/donations",
      roles: ["ADMIN"] as StaffRole[],
    },
    {
      label: "Shop orders",
      value: s.orders.pending,
      sub: `${s.orders.completed} completed`,
      icon: ShoppingBag,
      tint: "text-orange-400 bg-orange-400/15 ring-orange-400/20",
      to: "/admin/orders",
      roles: ["ADMIN"] as StaffRole[],
    },
    {
      label: "Active products",
      value: s.products.active,
      sub: `${s.products.lowStock} low stock`,
      icon: Package,
      tint: "text-teal-400 bg-teal-400/15 ring-teal-400/20",
      to: "/admin/products",
      roles: ["ADMIN"] as StaffRole[],
    },
  ];

  const r = role ?? "ADMIN";
  return all.filter((c) => c.roles.includes(r));
}

export function getDashboardQuickActions(
  unread: number,
  role?: StaffRole
): { to: string; label: string; roles: StaffRole[] }[] {
  const all = [
    { to: "/admin/rescue", label: "Review rescue reports", roles: ["ADMIN", "VOLUNTEER"] as StaffRole[] },
    { to: "/admin/adoptions", label: "Process adoption applications", roles: ["ADMIN", "VOLUNTEER"] as StaffRole[] },
    { to: "/admin/my-schedule", label: "My volunteer schedule", roles: ["VOLUNTEER"] as StaffRole[] },
    { to: "/admin/products", label: "Manage shop products", roles: ["ADMIN"] as StaffRole[] },
    { to: "/admin/volunteers", label: "Volunteer applications", roles: ["ADMIN"] as StaffRole[] },
    { to: "/admin/volunteer-schedule", label: "Volunteer week schedule", roles: ["ADMIN"] as StaffRole[] },
    { to: "/admin/settings", label: "Organization & guidelines", roles: ["ADMIN"] as StaffRole[] },
    {
      to: "/admin/notifications",
      label: `${unread} unread notifications`,
      roles: ["ADMIN", "VOLUNTEER"] as StaffRole[],
    },
  ];
  const r = role ?? "ADMIN";
  return all.filter((a) => a.roles.includes(r));
}

/** Staff notification deep-links (role-aware). */
export function getAdminNotificationLink(
  type: string,
  role?: StaffRole,
  relatedId?: number
): string | undefined {
  const r = role ?? "ADMIN";
  switch (type) {
    case "RESCUE_ASSIGNED":
      return "/admin/rescue";
    case "ADOPTION_MEETING":
    case "ADOPTION_HANDOVER":
    case "ADOPTION_FOLLOWUP":
      return relatedId != null ? `/admin/adoptions/${relatedId}` : "/admin/adoptions";
    case "VOLUNTEER_RESULT":
    case "VOLUNTEER_INTERVIEW":
      return r === "VOLUNTEER" ? "/admin/my-schedule" : "/admin/volunteers";
    case "ORDER_STATUS":
      return r === "ADMIN" ? "/admin/orders" : undefined;
    case "DONATION":
      return r === "ADMIN" ? "/admin/donations" : undefined;
    case "SYSTEM":
      return "/admin/notifications";
    default:
      return undefined;
  }
}
