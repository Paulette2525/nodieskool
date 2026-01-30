import { Link, useLocation } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Community", href: "/community", icon: Users },
  { name: "Classroom", href: "/classroom", icon: BookOpen },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

interface SidebarProps {
  communityName?: string;
  communityLogo?: string;
}

export function Sidebar({ communityName = "Growth Academy", communityLogo }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          isCollapsed ? "w-0 md:w-20" : "w-64",
          "md:relative"
        )}
      >
        {/* Logo / Community Name */}
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          isCollapsed && "md:justify-center md:px-2"
        )}>
          {communityLogo ? (
            <img src={communityLogo} alt={communityName} className="h-8 w-8 rounded-lg" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              {communityName.charAt(0)}
            </div>
          )}
          {!isCollapsed && (
            <span className="ml-3 font-semibold text-sidebar-foreground truncate">
              {communityName}
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/" && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "md:justify-center md:px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {/* Admin link */}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                location.pathname === "/admin"
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "md:justify-center md:px-2"
              )}
            >
              <ShieldCheck className={cn("h-5 w-5 flex-shrink-0", location.pathname === "/admin" && "text-primary")} />
              {!isCollapsed && <span>Admin</span>}
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          {/* Level & Points */}
          {!isCollapsed && profile && (
            <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
              <div className="flex items-center justify-between text-xs text-sidebar-foreground">
                <span className="font-medium">Level {profile.level}</span>
                <span className="text-accent font-semibold">{profile.points} pts</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-sidebar-border">
                <div 
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (profile.points % 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* User info */}
          {user && profile && (
            <>
              <div className={cn(
                "flex items-center gap-3",
                isCollapsed && "md:justify-center"
              )}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {(profile.full_name || profile.username).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile.full_name || profile.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{profile.username}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={cn(
                "mt-3 flex gap-2",
                isCollapsed && "md:flex-col"
              )}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "flex-1 justify-start text-sidebar-foreground",
                    isCollapsed && "md:justify-center md:px-2"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2">Settings</span>}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className={cn(
                    "flex-1 justify-start text-sidebar-foreground hover:text-destructive",
                    isCollapsed && "md:justify-center md:px-2"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2">Log out</span>}
                </Button>
              </div>
            </>
          )}

          {/* Login button if not authenticated */}
          {!user && !isCollapsed && (
            <Link to="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
