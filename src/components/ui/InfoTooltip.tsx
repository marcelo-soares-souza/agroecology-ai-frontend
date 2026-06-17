import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/cn";

interface InfoTooltipProps {
  label: string;
  className?: string;
}

export function InfoTooltip({ label, className }: InfoTooltipProps) {
  return (
    <span className={cn("relative inline-flex group", className)}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-text-secondary/70 transition-colors hover:bg-primary-50 hover:text-primary focus:bg-primary-50 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      >
        <CircleHelp className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-left text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
