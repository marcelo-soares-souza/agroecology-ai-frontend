import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-card)] bg-primary-100",
        className,
      )}
      {...props}
    />
  );
}
