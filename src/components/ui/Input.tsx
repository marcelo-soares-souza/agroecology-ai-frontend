import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-[var(--radius-input)] border border-primary-200 bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/60 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
        className
      )}
      {...props}
    />
  );
}
