import { cn } from "@/lib/utils";
import { formatEnum } from "@/lib/adminFormat";

const toneMap: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  IN_PROGRESS: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  RESCUED: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  FAILED: "bg-red-500/15 text-red-300 ring-red-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  APPROVED: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  REJECTED: "bg-red-500/15 text-red-300 ring-red-500/30",
  AVAILABLE_FOR_ADOPTION: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  NOT_READY_FOR_ADOPTION: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  PENDING_ADOPTION: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  ADOPTED: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  CRITICAL: "bg-red-500/15 text-red-300 ring-red-500/30",
  HIGH: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  LOW: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  INTERVIEW_SCHEDULED: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  MEETING_SCHEDULED: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  UNPAID: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  PAID: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  INACTIVE: "bg-slate-500/15 text-slate-400 ring-slate-500/30",
  SENT: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  OPEN: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  UPCOMING: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  ONGOING: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  SHIPPING: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = toneMap[value] ?? "bg-slate-500/15 text-slate-300 ring-slate-500/30";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 backdrop-blur-sm",
        tone
      )}
    >
      {formatEnum(value)}
    </span>
  );
}
