"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-input-background px-3 py-2",
          "text-sm text-text-primary placeholder:text-text-secondary",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-danger focus:ring-danger/30"
            : "border-input-border",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
