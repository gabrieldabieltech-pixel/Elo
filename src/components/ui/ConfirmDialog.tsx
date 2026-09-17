import * as React from "react"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "./Dialog"
import { Button } from "./Button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "warning" | "primary";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  variant = "danger"
}: ConfirmDialogProps) {

  const iconColor = variant === "danger" ? "text-danger" : variant === "warning" ? "text-warning" : "text-primary";
  const iconBg = variant === "danger" ? "bg-danger-soft" : variant === "warning" ? "bg-warning-soft" : "bg-primary-soft";
  const buttonVariant = variant === "danger" ? "destructive" : variant === "warning" ? "outline" : "primary"; // adjusted warning button variant to outline to avoid missing "warning" variant

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className={`p-2 rounded-xl ${iconBg} ${iconColor}`}>
              <AlertTriangle size={20} />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-text-secondary text-sm font-medium">{description}</p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
            {cancelLabel}
          </Button>
          <Button variant={buttonVariant as any} onClick={() => { onConfirm(); onOpenChange(false); }} className="rounded-xl font-bold">
            {confirmLabel}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  )
}
