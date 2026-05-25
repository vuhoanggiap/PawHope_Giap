import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
  activeIndex: number;
  failed?: boolean;
  failedLabel?: string;
  className?: string;
}

export function StatusTimeline({
  steps,
  activeIndex,
  failed,
  failedLabel = "Case closed",
  className,
}: StatusTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {failed ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {failedLabel}
        </p>
      ) : null}
      <ol className="relative border-l-2 border-[#2c5f51]/15 ml-3 space-y-6">
        {steps.map((step, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex && !failed;
          return (
            <li key={step.id} className="ml-6 relative">
              <span
                className={cn(
                  "absolute -left-[1.85rem] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white",
                  done && "bg-[#2c5f51] text-white",
                  current && "bg-[#f6931d] text-white shadow-md shadow-[#f6931d]/30",
                  !done && !current && "bg-gray-100 text-gray-400"
                )}
              >
                {done ? <Check size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
              </span>
              <p
                className={cn(
                  "font-semibold text-sm",
                  current ? "text-[#2c5f51]" : done ? "text-gray-700" : "text-gray-400"
                )}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
