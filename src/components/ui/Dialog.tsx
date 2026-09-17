"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-overlay backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange?.(false)}
        aria-hidden="true"
      />
      <div 
        role="dialog" 
        aria-modal="true"
        className="z-50 w-full max-w-lg max-h-[90vh] flex flex-col p-6 bg-surface text-text-primary rounded-xl shadow-lg border border-border animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="overflow-y-auto flex-1 pr-1 -mr-1">
          {children}
        </div>
      </div>
    </div>
  )
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>{children}</div>
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight text-text-primary", className)}>{children}</h2>
}

export function DialogDescription({ children, className }: { children: React.ReactNode, className?: string }) {
  return <p className={cn("text-sm text-text-secondary", className)}>{children}</p>
}

export function DialogFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)}>{children}</div>
}
