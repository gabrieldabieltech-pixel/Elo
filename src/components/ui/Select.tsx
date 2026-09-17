"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-lg border bg-input-background px-3 py-2 pr-10",
            "text-sm text-text-primary",
            "transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-danger focus:ring-danger/30"
              : "border-input-border",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-text-secondary"
        />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
export type { SelectProps };
