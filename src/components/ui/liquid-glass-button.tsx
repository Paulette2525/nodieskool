"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-xl text-sm font-medium disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
        outline: "border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-primary/5 hover:text-primary",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 text-xs px-4 rounded-lg",
        lg: "h-10 px-6",
        xl: "h-12 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface LiquidButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
  VariantProps<typeof liquidbuttonVariants> {
  to?: string
}

const LiquidButton = React.forwardRef<HTMLAnchorElement, LiquidButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl",
          liquidbuttonVariants({ variant, size }),
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </a>
    )
  }
)
LiquidButton.displayName = "LiquidButton"

export { LiquidButton, liquidbuttonVariants }
