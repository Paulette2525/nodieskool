"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-xl text-sm font-medium disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "text-primary hover:scale-105 duration-300 transition",
        outline: "border border-primary/20 text-primary hover:bg-primary/5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
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
          "relative overflow-hidden",
          liquidbuttonVariants({ variant, size }),
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 rounded-xl bg-primary/5 backdrop-blur-md border border-primary/20 pointer-events-none" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </a>
    )
  }
)
LiquidButton.displayName = "LiquidButton"

export { LiquidButton, liquidbuttonVariants }
