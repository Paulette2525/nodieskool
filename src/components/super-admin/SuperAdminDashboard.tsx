import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FileText, BookOpen, Calendar, TrendingUp, UserPlus, Award, ClipboardCheck } from "lucide-react";
import { PlatformStats, PlatformCommunity, PlatformUser, ActivityItem } from "@/hooks/useSuperAdmin";

interface SuperAdminDashboardProps {
  stats: PlatformStats | undefined;
  communities: PlatformCommunity[];
  users: PlatformUser[];
  activity: ActivityItem[];
}
 
 export function SuperAdminDashboard({ stats, communities, users, activity }: SuperAdminDashboardProps) {
   const statCards = [
     {
       label: "Utilisateurs Totaux",
       value: stats?.totalUsers ?? 0,
       icon: Users,
       bgColor: "bg-primary/10",
       iconColor: "text-primary",
     },
     {
       label: "Communautés",
       value: stats?.totalCommunities ?? 0,
       subValue: `${stats?.activeCommunities ?? 0} actives`,
       icon: Building2,
       bgColor: "bg-blue-100 dark:bg-blue-900/30",
       iconColor: "text-blue-600 dark:text-blue-400",
     },
     {
       label: "Posts",
       value: stats?.totalPosts ?? 0,
       icon: FileText,
       bgColor: "bg-green-100 dark:bg-green-900/30",
       iconColor: "text-green-600 dark:text-green-400",
     },
     {
       label: "Formations",
       value: stats?.totalCourses ?? 0,
       icon: BookOpen,
       bgColor: "bg-purple-100 dark:bg-purple-900/30",
       iconColor: "text-purple-600 dark:text-purple-400",
     },
     {
       label: "Événements",
       value: stats?.totalEvents ?? 0,
       icon: Calendar,
       bgColor: "bg-orange-100 dark:bg-orange-900/30",
       iconColor: "text-orange-600 dark:text-orange-400",
     },
      {
        label: "Nouveaux (7j)",
        value: stats?.newUsersThisWeek ?? 0,
        subValue: `${stats?.newUsersToday ?? 0} aujourd'hui`,
        icon: UserPlus,
        bgColor: "bg-teal-100 dark:bg-teal-900/30",
        iconColor: "text-teal-600 dark:text-teal-400",
      },
      {
        label: "Leçons terminées",
        value: stats?.totalLessonsCompleted ?? 0,
        icon: BookOpen,
        bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "Quiz réussis",
        value: stats?.totalQuizzesPassed ?? 0,
        icon: ClipboardCheck,
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        iconColor: "text-indigo-600 dark:text-indigo-400",
      },
    ];
 
   const topCommunities = [...communities]
     .sort((a, b) => b.members_count - a.members_count)
     .slice(0, 5);
 
   const recentUsers = [...users].slice(0, 5);
 
   return (
     <div className="space-y-6">
       {/* Stats Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
         {statCards.map((stat) => (
           <Card key={stat.label}>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                   <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stat.value}</p>
                   <p className="text-xs text-muted-foreground">{stat.label}</p>
                   {stat.subValue && (
                     <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                   )}
                 </div>
               </div>
             </CardContent>
           </Card>
         ))}
       </div>
 
       {/* Two Column Layout */}
       <div className="grid md:grid-cols-2 gap-6">
         {/* Top Communities */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-primary" />
               Top Communautés
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-3">
               {topCommunities.length === 0 ? (
                 <p className="text-muted-foreground text-sm">Aucune communauté</p>
               ) : (
                 topCommunities.map((community, index) => (
                   <div
                     key={community.id}
                     className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                   >
                     <div className="flex items-center gap-3">
                       <span className="text-lg font-bold text-muted-foreground">
                         #{index + 1}
                       </span>
                       <div>
                         <p className="font-medium">{community.name}</p>
                         <p className="text-xs text-muted-foreground">
                           par {community.owner_full_name || community.owner_username}
                         </p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-bold">{community.members_count}</p>
                       <p className="text-xs text-muted-foreground">membres</p>
                     </div>
                   </div>
                 ))
               )}
             </div>
           </CardContent>
         </Card>
 
         {/* Recent Users */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <UserPlus className="h-5 w-5 text-primary" />
               Inscriptions Récentes
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-3">
               {recentUsers.length === 0 ? (
                 <p className="text-muted-foreground text-sm">Aucun utilisateur</p>
               ) : (
                 recentUsers.map((user) => (
                   <div
                     key={user.id}
                     className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                   >
                     <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                         <span className="text-sm font-medium text-primary">
                           {(user.full_name || user.username).charAt(0).toUpperCase()}
                         </span>
                       </div>
                       <div>
                         <p className="font-medium">{user.full_name || user.username}</p>
                         <p className="text-xs text-muted-foreground">@{user.username}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-muted-foreground">
                         {new Date(user.created_at).toLocaleDateString("fr-FR")}
                       </p>
                       {user.platform_role && (
                         <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                           {user.platform_role}
                         </span>
                       )}
                     </div>
                   </div>
                 ))
               )}
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }