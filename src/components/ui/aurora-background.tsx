"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div>
      <div
        className={cn(
          "relative flex flex-col min-h-screen min-h-[100dvh] items-center justify-center bg-background text-foreground transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
            [--white-gradient:repeating-linear-gradient(100deg,hsl(var(--background))_0%,hsl(var(--background))_7%,var(--transparent)_10%,var(--transparent)_12%,hsl(var(--background))_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,hsl(var(--foreground)/0.05)_0%,hsl(var(--foreground)/0.05)_7%,var(--transparent)_10%,var(--transparent)_12%,hsl(var(--foreground)/0.05)_16%)]
            [--aurora:repeating-linear-gradient(100deg,hsl(var(--primary))_10%,hsl(var(--primary)/0.6)_15%,hsl(var(--primary)/0.3)_20%,hsl(var(--primary)/0.5)_25%,hsl(var(--primary)/0.2)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:[-webkit-mix-blend-mode:difference] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-40 will-change-transform`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </div>
  );
};
