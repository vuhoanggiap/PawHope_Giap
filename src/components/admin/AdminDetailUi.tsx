import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminTabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function AdminTabs({ tabs, active, onChange, className }: AdminTabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 border-b border-white/[0.06] pb-4", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={active === tab.id ? "admin-tab-active" : "admin-tab"}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface FieldProps {
  label: string;
  value?: ReactNode;
  className?: string;
}

export function AdminField({ label, value, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <div className="text-sm leading-relaxed text-slate-200">{value ?? "—"}</div>
    </div>
  );
}

export function AdminFieldGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div
      className={cn(
        "grid gap-5",
        cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
      )}
    >
      {children}
    </div>
  );
}

export function AdminPanel({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("admin-panel overflow-hidden", className)}>
      <div className="admin-panel-header">
        <h3 className="font-medium text-white">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
