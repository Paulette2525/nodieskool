import { MainLayout } from "@/components/layout/MainLayout";
import { CourseCard } from "@/components/classroom/CourseCard";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, Clock } from "lucide-react";

// Mock data
const mockCourses = [
  {
    id: "1",
    title: "Marketing Mastery",
    description: "Learn advanced marketing strategies to grow your business and reach more customers effectively.",
    thumbnailUrl: "",
    totalLessons: 24,
    completedLessons: 24,
    progress: 100,
  },
  {
    id: "2",
    title: "Sales Fundamentals",
    description: "Master the art of selling with proven techniques and frameworks used by top performers.",
    thumbnailUrl: "",
    totalLessons: 18,
    completedLessons: 12,
    progress: 67,
  },
  {
    id: "3",
    title: "Leadership Excellence",
    description: "Develop essential leadership skills to inspire teams and drive organizational success.",
    thumbnailUrl: "",
    totalLessons: 15,
    completedLessons: 3,
    progress: 20,
  },
  {
    id: "4",
    title: "Advanced Strategies",
    description: "Unlock advanced business strategies for scaling and sustainable growth.",
    thumbnailUrl: "",
    totalLessons: 20,
    completedLessons: 0,
    progress: 0,
    isLocked: true,
  },
];

export default function Classroom() {
  const totalLessons = mockCourses.reduce((acc, c) => acc + c.totalLessons, 0);
  const completedLessons = mockCourses.reduce((acc, c) => acc + c.completedLessons, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

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
              <p className="text-2xl font-bold text-foreground">{completedLessons}/{totalLessons}</p>
              <p className="text-sm text-muted-foreground">Lessons Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-card rounded-xl border shadow-card">
            <div className="p-3 rounded-lg bg-success/10">
              <Award className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockCourses.filter(c => c.progress === 100).length}</p>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-card rounded-xl border shadow-card">
            <div className="p-3 rounded-lg bg-accent/10">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12h 30m</p>
              <p className="text-sm text-muted-foreground">Learning Time</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                thumbnailUrl={course.thumbnailUrl}
                totalLessons={course.totalLessons}
                completedLessons={course.completedLessons}
                progress={course.progress}
                isLocked={course.isLocked}
                onClick={() => console.log("Open course:", course.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
