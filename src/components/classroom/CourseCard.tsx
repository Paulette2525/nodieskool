import { Lock, PlayCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  isLocked?: boolean;
  onClick?: () => void;
}

export function CourseCard({
  title,
  description,
  thumbnailUrl,
  totalLessons,
  completedLessons,
  progress,
  isLocked,
  onClick,
}: CourseCardProps) {
  const isCompleted = progress >= 100;

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg group",
        isLocked && "opacity-75"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <PlayCircle className="h-12 w-12 text-primary/40" />
          </div>
        )}
        
        {/* Status overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Lock className="h-6 w-6" />
              <span className="text-sm font-medium">Verrouillé</span>
            </div>
          </div>
        )}
        
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 bg-success text-success-foreground px-2 py-1 rounded-full text-xs font-medium">
              <CheckCircle className="h-3 w-3" />
              Terminé
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
        
        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">
              {completedLessons} / {totalLessons} leçons
            </span>
            <span className={cn(
              "font-medium",
              isCompleted ? "text-success" : "text-primary"
            )}>
              {Math.round(progress)}%
            </span>
          </div>
          <Progress 
            value={progress} 
            className={cn(
              "h-1.5",
              isCompleted && "[&>div]:bg-success"
            )}
          />
        </div>

        {/* Action Button */}
        <Button 
          className="w-full mt-4 gap-2"
          onClick={onClick}
          disabled={isLocked}
          variant={isCompleted ? "outline" : "default"}
        >
          {isLocked ? (
            <>
              <Lock className="h-4 w-4" />
              Verrouillé
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Revoir le cours
            </>
          ) : progress > 0 ? (
            <>
              Continuer
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Commencer
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
