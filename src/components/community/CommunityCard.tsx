 import { Link } from "react-router-dom";
 import { Card } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Users, Crown, Shield, User } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface CommunityCardProps {
   id: string;
   name: string;
   slug: string;
   description: string | null;
   logoUrl: string | null;
   coverUrl: string | null;
   primaryColor: string | null;
   isPublic: boolean;
   role?: "owner" | "admin" | "moderator" | "member";
   memberCount?: number;
 }
 
 const roleConfig = {
   owner: { label: "Propriétaire", icon: Crown, color: "bg-amber-500" },
   admin: { label: "Admin", icon: Shield, color: "bg-primary" },
   moderator: { label: "Modérateur", icon: Shield, color: "bg-blue-500" },
   member: { label: "Membre", icon: User, color: "bg-muted" },
 };
 
 export function CommunityCard({
   name,
   slug,
   description,
   logoUrl,
   coverUrl,
   primaryColor,
   isPublic,
   role,
   memberCount,
 }: CommunityCardProps) {
   const roleInfo = role ? roleConfig[role] : null;
 
   return (
     <Link to={`/c/${slug}/community`}>
       <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
         {/* Cover image */}
         <div 
           className="h-24 bg-gradient-to-r from-primary/20 to-primary/40 relative"
           style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
         >
           {roleInfo && (
             <Badge 
               className={cn("absolute top-2 right-2", roleInfo.color)}
               variant="secondary"
             >
               <roleInfo.icon className="h-3 w-3 mr-1" />
               {roleInfo.label}
             </Badge>
           )}
         </div>
 
         {/* Content */}
         <div className="p-4 pt-0 relative">
           {/* Logo */}
           <Avatar className="h-14 w-14 border-4 border-background -mt-7 mb-2 ring-2 ring-muted">
             <AvatarImage src={logoUrl || undefined} alt={name} />
             <AvatarFallback 
               className="text-lg font-bold"
               style={{ backgroundColor: primaryColor || undefined }}
             >
               {name.charAt(0).toUpperCase()}
             </AvatarFallback>
           </Avatar>
 
           {/* Info */}
           <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
             {name}
           </h3>
           {description && (
             <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
               {description}
             </p>
           )}
 
           {/* Footer */}
           <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
             {memberCount !== undefined && (
               <span className="flex items-center gap-1">
                 <Users className="h-3 w-3" />
                 {memberCount} membres
               </span>
             )}
             <Badge variant={isPublic ? "secondary" : "outline"} className="text-xs">
               {isPublic ? "Public" : "Privé"}
             </Badge>
           </div>
         </div>
       </Card>
     </Link>
   );
 }