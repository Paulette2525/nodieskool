import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  name: string;
  description?: string | null;
  icon: string;
  isEarned?: boolean;
  awardedAt?: string;
  size?: "sm" | "md" | "lg";
}

export function BadgeCard({
  name,
  description,
  icon,
  isEarned = false,
  awardedAt,
  size = "md",
}: BadgeCardProps) {
  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as Record<string, any>)[icon] || LucideIcons.Award;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center p-3 rounded-lg transition-all",
        isEarned
          ? "bg-primary/10 border border-primary/20"
          : "bg-muted/50 border border-transparent opacity-50"
      )}
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center mb-2",
          sizeClasses[size],
          isEarned
            ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg"
            : "bg-muted text-muted-foreground"
        )}
      >
        <IconComponent className={iconSizeClasses[size]} />
      </div>
      <h4 className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>
        {name}
      </h4>
      {description && size !== "sm" && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {description}
        </p>
      )}
      {isEarned && awardedAt && size === "lg" && (
        <p className="text-xs text-muted-foreground mt-2">
          Obtenu le {new Date(awardedAt).toLocaleDateString("fr-FR")}
        </p>
      )}
    </div>
  );
}
