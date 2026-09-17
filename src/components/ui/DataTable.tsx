import * as React from "react"
import { cn } from "@/lib/utils"

interface DataTableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
}

export function DataTable({ children, className, ...props }: DataTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-surface">
      <table className={cn("w-full text-sm text-left", className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("text-xs uppercase bg-surface-muted text-text-secondary font-bold tracking-wider", className)} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-border", className)} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-surface-muted transition-colors", className)} {...props}>
      {children}
    </tr>
  )
}

export function TableHead({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-4 py-3 font-bold text-text-primary", className)} {...props}>
      {children}
    </th>
  )
}

export function TableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 font-medium text-text-primary", className)} {...props}>
      {children}
    </td>
  )
}
