import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminFilterPillProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function AdminFilterPill({ active, onClick, children }: AdminFilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "admin-filter-pill-active" : "admin-filter-pill"}
    >
      {children}
    </button>
  );
}

interface AdminSearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function AdminSearchInput({ className, ...props }: AdminSearchInputProps) {
  return (
    <input
      {...props}
      className={cn("admin-input h-9 min-w-[220px]", className)}
    />
  );
}

export function adminInputClass(extra?: string) {
  return cn("admin-input w-full h-10 px-3", extra);
}
