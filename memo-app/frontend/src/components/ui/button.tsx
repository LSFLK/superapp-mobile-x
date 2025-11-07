import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-blue-600 text-white shadow hover:bg-blue-700 active:bg-blue-800":
              variant === "default",
            "border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700":
              variant === "outline",
            "hover:bg-slate-100 text-slate-700 active:bg-slate-200": variant === "ghost",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3 text-xs font-medium": size === "sm",
            "h-12 rounded-lg px-8 text-base": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
