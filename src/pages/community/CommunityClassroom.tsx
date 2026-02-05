 import { CommunityLayout } from "@/components/layout/CommunityLayout";
 import { CourseCard } from "@/components/classroom/CourseCard";
 import { Card } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Loader2, BookOpen, Plus } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { useCoursesWithCommunity } from "@/hooks/useCourses";
 import { useCommunityContext } from "@/contexts/CommunityContext";
 
 function CommunityClassroomContent() {
   const { community, isAdmin } = useCommunityContext();
   const { courses, completedLessons, isLoading } = useCoursesWithCommunity(community?.id);
 
   const getCourseProgress = (course: typeof courses[0]) => {
     const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
     const completed = course.modules?.reduce((acc, m) => {
       return acc + (m.lessons?.filter(l => completedLessons.includes(l.id)).length || 0);
     }, 0) || 0;
     const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
     return { total: totalLessons, completed, progress };
   };
 
   return (
     <div className="max-w-6xl mx-auto p-6">
       <div className="flex items-center justify-between mb-6">
         <div>
           <h1 className="text-2xl font-bold text-foreground">Formations</h1>
           <p className="text-muted-foreground mt-1">
             Développez vos compétences avec nos cours
           </p>
         </div>
         {isAdmin && (
           <Button>
             <Plus className="h-4 w-4 mr-2" />
             Nouveau cours
           </Button>
         )}
       </div>
 
       {isLoading ? (
         <div className="flex justify-center py-12">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       ) : courses.length === 0 ? (
         <Card className="p-12 text-center">
           <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
             <BookOpen className="h-8 w-8 text-muted-foreground" />
           </div>
           <h3 className="text-lg font-semibold mb-2">Aucun cours disponible</h3>
           <p className="text-muted-foreground">
             Les cours seront bientôt disponibles
           </p>
         </Card>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {courses.map((course) => {
             const progress = getCourseProgress(course);
             return (
               <CourseCard
                 key={course.id}
                 id={course.id}
                 title={course.title}
                 description={course.description || ""}
                 thumbnailUrl={course.thumbnail_url}
                 totalLessons={progress.total}
                 completedLessons={progress.completed}
                 progress={progress.progress}
                 isLocked={false}
               />
             );
           })}
         </div>
       )}
     </div>
   );
 }
 
 export default function CommunityClassroom() {
   return (
     <CommunityLayout>
       <CommunityClassroomContent />
     </CommunityLayout>
   );
 }