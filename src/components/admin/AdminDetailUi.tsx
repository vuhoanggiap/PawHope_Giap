import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminTabsProps<T extends string> = {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
};

export function AdminTabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: AdminTabsProps<T>) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 border-b border-white/[0.06] pb-4",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={
            active === tab.id ? "admin-tab-active" : "admin-tab"
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface AdminFieldProps {
  label: string;
  value?: ReactNode;
  className?: string;
}

export function AdminField({
  label,
  value,
  className,
}: AdminFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <div className="text-sm leading-relaxed text-slate-200">
        {value ?? "—"}
      </div>
    </div>
  );
}

export function AdminFieldGrid({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 2 | 3;
}) {
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
      <div className="admin-panel-header flex items-center justify-between">
        <h3 className="font-medium text-white">{title}</h3>
        {action}
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
}