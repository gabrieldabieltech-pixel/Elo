"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-5 w-5 appearance-none rounded border border-input-border bg-surface",
          "checked:border-primary checked:bg-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
      <Check
        className="pointer-events-none absolute h-3.5 w-3.5 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
        strokeWidth={3}
      />
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
