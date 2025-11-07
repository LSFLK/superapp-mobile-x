import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold transition-colors",
        {
          "bg-slate-100 text-slate-700": variant === "default",
          "bg-emerald-50 text-emerald-700 border border-emerald-200": variant === "success",
          "bg-amber-50 text-amber-700 border border-amber-200": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
