import { CircleHelp } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface InfoTooltipProps {
  label: string;
  className?: string;
}

export function InfoTooltip({ label, className }: InfoTooltipProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 256,
  });

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const margin = 16;
    const rect = button.getBoundingClientRect();
    const width = Math.min(256, window.innerWidth - margin * 2);
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 0;
    const centeredLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(
      Math.max(centeredLeft, margin),
      window.innerWidth - width - margin,
    );
    const belowTop = rect.bottom + 8;
    const aboveTop = rect.top - tooltipHeight - 8;
    const top =
      tooltipHeight > 0 &&
      belowTop + tooltipHeight + margin > window.innerHeight
        ? Math.max(margin, aboveTop)
        : belowTop;

    setPosition({ left, top, width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => {
        setOpen(true);
        updatePosition();
      }}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        setOpen(true);
        updatePosition();
      }}
      onBlur={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-text-secondary/70 transition-colors hover:bg-primary-50 hover:text-primary focus:bg-primary-50 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      >
        <CircleHelp className="h-3.5 w-3.5" />
      </button>
      <span
        ref={tooltipRef}
        role="tooltip"
        className={cn(
          "pointer-events-none fixed z-50 rounded-md bg-gray-900 px-3 py-2 text-left text-xs font-normal leading-relaxed text-white shadow-lg transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
        style={position}
      >
        {label}
      </span>
    </span>
  );
}
