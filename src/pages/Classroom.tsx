import { Navigate, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { CourseCard } from "@/components/classroom/CourseCard";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";

export default function Classroom() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { courses, completedLessons, isLoading } = useCourses();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const totalLessons = courses.reduce((acc, course) => acc + course.modules.reduce((modAcc, mod) => modAcc + mod.lessons.length, 0), 0);
  const completedCount = completedLessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const coursesWithProgress = courses.map((course) => {
    const courseLessons = course.modules.flatMap((m) => m.lessons);
    const courseCompleted = courseLessons.filter((l) => completedLessons.includes(l.id)).length;
    return { ...course, totalLessons: courseLessons.length, completedLessons: courseCompleted, progress: courseLessons.length > 0 ? Math.round((courseCompleted / courseLessons.length) * 100) : 0 };
  });

  const completedCourses = coursesWithProgress.filter((c) => c.progress === 100).length;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Formations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Continuez votre parcours d'apprentissage</p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {[
            { icon: BookOpen, label: "Leçons", value: `${completedCount}/${totalLessons}`, color: "text-primary", bg: "bg-primary/10" },
            { icon: Award, label: "Cours terminés", value: `${completedCourses}`, color: "text-success", bg: "bg-success/10" },
            { icon: Clock, label: "Disponibles", value: `${courses.length}`, color: "text-accent", bg: "bg-accent/10" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-card rounded-xl border border-border/50 shadow-card">
              <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-base font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div className="mb-6 p-4 bg-card rounded-2xl border border-border/50 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Progression globale</h3>
            <span className="text-xs font-semibold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-1.5" />
        </div>

        {/* Courses */}
        <h2 className="text-sm font-semibold text-foreground mb-3">Vos formations</h2>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : courses.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-2xl border border-border/50">
            <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground">Aucune formation disponible</h3>
            <p className="text-xs text-muted-foreground mt-1">Revenez bientôt pour de nouveaux cours</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coursesWithProgress.map((course) => (
              <CourseCard key={course.id} id={course.id} title={course.title} description={course.description ?? ""} thumbnailUrl={course.thumbnail_url ?? undefined} totalLessons={course.totalLessons} completedLessons={course.completedLessons} progress={course.progress} onClick={() => navigate(`/classroom/${course.id}`)} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
