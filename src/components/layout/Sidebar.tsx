import { Link, useLocation } from "react-router-dom";
import { Users, BookOpen, Settings, LogOut, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Communauté", href: "/community", icon: Users },
  { name: "Formations", href: "/classroom", icon: BookOpen },
];

interface SidebarProps {
  communityName?: string;
  communityLogo?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ communityName = "Community Hub", communityLogo, isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => { onClose?.(); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />}

      <aside className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 w-[220px] overflow-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0"
      )}>
        <div className="flex h-14 items-center border-b border-sidebar-border px-3">
          {/* Close button on mobile */}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg md:hidden mr-1" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          {communityLogo ? (
            <img src={communityLogo} alt={communityName} className="h-7 w-7 rounded-lg" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
              {communityName.charAt(0)}
            </div>
          )}
          <span className="ml-2.5 font-semibold text-sidebar-foreground truncate text-sm">{communityName}</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto min-h-0">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <Link key={item.name} to={item.href} className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                isActive ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}>
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-primary")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin" className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
              location.pathname === "/admin" ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/60"
            )}>
              <ShieldCheck className={cn("h-4 w-4 flex-shrink-0", location.pathname === "/admin" && "text-primary")} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className="border-t border-sidebar-border p-2 flex-shrink-0">
          {user && profile && (
            <>
              <Link to="/profile" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-sidebar-accent/60 transition-colors">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {(profile.full_name || profile.username).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sidebar-foreground truncate">{profile.full_name || profile.username}</p>
                </div>
              </Link>
              <div className="mt-1 space-y-0.5">
                <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground text-xs h-8 rounded-lg" asChild>
                  <Link to="/settings"><Settings className="h-3.5 w-3.5 flex-shrink-0" /><span className="ml-2">Paramètres</span></Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8 rounded-lg">
                  <LogOut className="h-3.5 w-3.5 flex-shrink-0" /><span className="ml-2">Déconnexion</span>
                </Button>
              </div>
            </>
          )}
          {!user && <Link to="/auth"><Button className="w-full rounded-xl text-xs h-9">Se connecter</Button></Link>}
        </div>
      </aside>
    </>
  );
}
