import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-text-primary text-app-bg hover:opacity-90",
    secondary: "border-transparent bg-surface-muted text-text-primary hover:opacity-90",
    destructive: "border-transparent bg-danger text-white hover:opacity-90",
    outline: "border-border text-text-primary",
    success: "border-transparent bg-success-soft text-success",
    warning: "border-transparent bg-warning-soft text-warning",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
