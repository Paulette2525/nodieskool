import { Link, useLocation, useParams } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  LayoutDashboard,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityContext } from "@/contexts/CommunityContext";

export function CommunitySidebar() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { community, isAdmin } = useCommunityContext();

  const navigation = [
    { name: "Communauté", href: `/c/${slug}/community`, icon: Users },
    { name: "Formations", href: `/c/${slug}/classroom`, icon: BookOpen },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden bg-background shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 w-64 overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-4 gap-3">
          <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
            <Link to="/dashboard">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          {community?.logo_url ? (
            <img src={community.logo_url} alt={community.name} className="h-8 w-8 rounded-lg" />
          ) : (
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: community?.primary_color || 'hsl(var(--primary))' }}
            >
              {community?.name.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-sidebar-foreground truncate text-sm">
            {community?.name}
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3 overflow-y-auto min-h-0">
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

          {isAdmin && (
            <Link
              to={`/c/${slug}/admin`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                location.pathname === `/c/${slug}/admin`
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <ShieldCheck className={cn("h-5 w-5 flex-shrink-0", location.pathname === `/c/${slug}/admin` && "text-primary")} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className="border-t border-sidebar-border p-3 overflow-y-auto flex-shrink-0 max-h-[40vh]">
          {user && profile && (
            <>
              <Link to="/profile" className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-sidebar-accent transition-colors">
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
              </Link>

              <div className="mt-3 space-y-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sidebar-foreground"
                  asChild
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                    <span className="ml-2">Dashboard</span>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sidebar-foreground"
                  asChild
                >
                  <Link to="/settings">
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    <span className="ml-2">Paramètres</span>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span className="ml-2">Déconnexion</span>
                </Button>
              </div>
            </>
          )}

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
