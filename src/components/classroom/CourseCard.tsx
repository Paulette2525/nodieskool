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

export function CourseCard({ title, description, thumbnailUrl, totalLessons, completedLessons, progress, isLocked, onClick }: CourseCardProps) {
  const isCompleted = progress >= 100;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 group rounded-2xl border-border/50 shadow-card hover:shadow-card-hover",
      isLocked && "opacity-70"
    )}>
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
            <PlayCircle className="h-10 w-10 text-primary/30" />
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <span className="text-xs font-medium">Verrouillé</span>
            </div>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-2.5 right-2.5">
            <div className="flex items-center gap-1 bg-success text-success-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold">
              <CheckCircle className="h-3 w-3" />Terminé
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{description}</p>
        
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] mb-1.5">
            <span className="text-muted-foreground">{completedLessons} / {totalLessons} leçons</span>
            <span className={cn("font-semibold", isCompleted ? "text-success" : "text-primary")}>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className={cn("h-1", isCompleted && "[&>div]:bg-success")} />
        </div>

        <Button className="w-full mt-3 gap-1.5 rounded-xl text-xs h-9" onClick={onClick} disabled={isLocked} variant={isCompleted ? "outline" : "default"}>
          {isLocked ? <><Lock className="h-3.5 w-3.5" />Verrouillé</> : isCompleted ? <><CheckCircle className="h-3.5 w-3.5" />Revoir</> : progress > 0 ? <>Continuer<ArrowRight className="h-3.5 w-3.5" /></> : <>Commencer<ArrowRight className="h-3.5 w-3.5" /></>}
        </Button>
      </div>
    </Card>
  );
}
