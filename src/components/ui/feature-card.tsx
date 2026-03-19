import { cn } from "@/lib/utils";
import type React from "react";

export const FeatureCard = ({
  title,
  description,
  icon,
  index,
  total,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  total: number;
}) => {
  const midpoint = Math.ceil(total / 2);
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-8 relative group/feature border-border/50",
        (index === 0 || index === midpoint) && "lg:border-l",
        index < midpoint && "lg:border-b"
      )}
    >
      {index < midpoint && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      )}
      {index >= midpoint && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-8 text-primary">
        {icon}
      </div>
      <div className="text-base font-semibold mb-2 relative z-10 px-8">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-border group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-1 transition duration-200 inline-block text-foreground text-sm">
          {title}
        </span>
      </div>
      <p className="text-xs text-muted-foreground relative z-10 px-8 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
