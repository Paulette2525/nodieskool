import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { CourseCard } from "@/components/classroom/CourseCard";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";

export default function Classroom() {
  const { user, loading } = useAuth();
  const { courses, completedLessons, isLoading } = useCourses();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Calculate stats
  const totalLessons = courses.reduce((acc, course) => 
    acc + course.modules.reduce((modAcc, mod) => modAcc + mod.lessons.length, 0), 0);
  const completedCount = completedLessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Calculate course progress
  const coursesWithProgress = courses.map((course) => {
    const courseLessons = course.modules.flatMap((m) => m.lessons);
    const courseCompleted = courseLessons.filter((l) => completedLessons.includes(l.id)).length;
    const courseProgress = courseLessons.length > 0 
      ? Math.round((courseCompleted / courseLessons.length) * 100) 
      : 0;
    
    return {
      ...course,
      totalLessons: courseLessons.length,
      completedLessons: courseCompleted,
      progress: courseProgress,
    };
  });

  const completedCourses = coursesWithProgress.filter((c) => c.progress === 100).length;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Classroom</h1>
          <p className="text-muted-foreground mt-1">Continue your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-4 p-4 bg-card rounded-xl border shadow-card">
            <div className="p-3 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCount}/{totalLessons}</p>
              <p className="text-sm text-muted-foreground">Lessons Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-card rounded-xl border shadow-card">
            <div className="p-3 rounded-lg bg-success/10">
              <Award className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCourses}</p>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-card rounded-xl border shadow-card">
            <div className="p-3 rounded-lg bg-accent/10">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Available Courses</p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-8 p-5 bg-card rounded-xl border shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Overall Progress</h3>
            <span className="text-sm font-medium text-primary">{overallProgress}% Complete</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Courses Grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Courses</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground">No courses available</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later for new courses
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesWithProgress.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description ?? ""}
                  thumbnailUrl={course.thumbnail_url ?? undefined}
                  totalLessons={course.totalLessons}
                  completedLessons={course.completedLessons}
                  progress={course.progress}
                  onClick={() => console.log("Open course:", course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
