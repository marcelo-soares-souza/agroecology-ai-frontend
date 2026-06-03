import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-primary text-white hover:bg-primary-dark": variant === "primary",
          "bg-primary-100 text-primary-700 hover:bg-primary-200": variant === "secondary",
          "bg-error text-white hover:bg-red-700": variant === "danger",
          "text-text-secondary hover:text-text-primary hover:bg-black/5": variant === "ghost",
        },
        {
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2 text-base": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
