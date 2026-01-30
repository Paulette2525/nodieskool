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
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Communauté", href: "/community", icon: Users },
  { name: "Formations", href: "/classroom", icon: BookOpen },
  { name: "Classement", href: "/leaderboard", icon: Trophy },
  { name: "Calendrier", href: "/calendar", icon: Calendar },
];

interface SidebarProps {
  communityName?: string;
  communityLogo?: string;
}

export function Sidebar({ communityName = "Growth Academy", communityLogo }: SidebarProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden bg-background shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 w-64",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0"
        )}
      >
        {/* Logo / Community Name */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          {communityLogo ? (
            <img src={communityLogo} alt={communityName} className="h-8 w-8 rounded-lg" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">
              {communityName.charAt(0)}
            </div>
          )}
          <span className="ml-3 font-semibold text-sidebar-foreground truncate">
            {communityName}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
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
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                <span>{item.name}</span>
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
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <ShieldCheck className={cn("h-5 w-5 flex-shrink-0", location.pathname === "/admin" && "text-primary")} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          {/* Level & Points */}
          {profile && (
            <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
              <div className="flex items-center justify-between text-xs text-sidebar-foreground">
                <span className="font-medium">Niveau {profile.level}</span>
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
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {(profile.full_name || profile.username).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {profile.full_name || profile.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{profile.username}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 justify-start text-sidebar-foreground"
                >
                  <Settings className="h-4 w-4" />
                  <span className="ml-2">Paramètres</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex-1 justify-start text-sidebar-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2">Déconnexion</span>
                </Button>
              </div>
            </>
          )}

          {/* Login button if not authenticated */}
          {!user && (
            <Link to="/auth">
              <Button className="w-full">Se connecter</Button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
