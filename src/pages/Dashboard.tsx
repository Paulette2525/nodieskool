import { Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Plus, Users, User, Settings, LogOut, KeyRound } from "lucide-react";
import tribbueLogoImg from "@/assets/tribbue-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useCommunities } from "@/hooks/useCommunities";
import { useSubscription } from "@/hooks/useSubscription";
import { CommunityCard } from "@/components/community/CommunityCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { saveRedirectUrl } from "@/hooks/useRedirectUrl";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { myCommunities, isLoading, joinByCode } = useCommunities();
  const { currentPlan, limits } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!user) {
    saveRedirectUrl(location.pathname + location.search + location.hash);
    return <Navigate to="/auth" replace />;
  }

  const canCreateMore = limits.maxCommunities === -1 || myCommunities.filter(c => c.role === "owner").length < limits.maxCommunities;

  // Filter out communities the user already belongs to
  const myIds = new Set(myCommunities.map(c => c.id));
  const discoverCommunities = publicCommunities.filter(c => !myIds.has(c.id));

  const handleJoinByCode = () => {
    if (!inviteCode.trim()) return;
    joinByCode.mutate(inviteCode.trim(), {
      onSuccess: (data) => {
        if (data?.success) {
          setCodeDialogOpen(false);
          setInviteCode("");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <InstallBanner />
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={tribbueLogoImg} alt="Tribbue" className="h-8 object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize text-xs rounded-full border-border/50">{currentPlan}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none">
                  <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {(profile?.full_name || profile?.username || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Bonjour, {profile?.full_name || profile?.username} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos communautés et découvrez de nouvelles opportunités</p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Card className="flex items-center gap-3 px-4 py-3 rounded-2xl border-border/50 shadow-card">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{myCommunities.length}</p>
              <p className="text-[11px] text-muted-foreground">Communautés</p>
            </div>
          </Card>
        </div>

        {/* My Communities */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Mes communautés</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-9 gap-1.5" onClick={() => setCodeDialogOpen(true)}>
              <KeyRound className="h-3.5 w-3.5" />
              Code d'invitation
            </Button>
            {canCreateMore && (
              <Button asChild size="sm" className="rounded-xl text-xs h-9">
                <Link to="/create-community"><Plus className="h-3.5 w-3.5 mr-1.5" />Créer</Link>
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : myCommunities.length === 0 ? (
          <Card className="p-10 text-center rounded-2xl border-border/50">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold mb-1.5">Aucune communauté</h3>
            <p className="text-xs text-muted-foreground mb-4">Créez votre première communauté ou rejoignez-en une</p>
            <div className="flex gap-2 justify-center">
              <Button asChild size="sm" className="rounded-xl text-xs"><Link to="/create-community"><Plus className="h-3.5 w-3.5 mr-1.5" />Créer</Link></Button>
              <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setCodeDialogOpen(true)}>
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />Code
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCommunities.map((community) => (
              <CommunityCard key={community.id} id={community.id} name={community.name} slug={community.slug} description={community.description} logoUrl={community.logo_url} coverUrl={community.cover_url} primaryColor={community.primary_color} isPublic={community.is_public} role={community.role} />
            ))}
          </div>
        )}

      </main>

      {/* Invite Code Dialog */}
      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Rejoindre avec un code
            </DialogTitle>
            <DialogDescription>
              Entrez le code d'invitation partagé par l'administrateur de la communauté
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Input 
              placeholder="Ex: AB3F9K" 
              value={inviteCode} 
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="text-center font-mono text-lg tracking-widest uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
            />
            <Button onClick={handleJoinByCode} disabled={joinByCode.isPending || !inviteCode.trim()}>
              {joinByCode.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rejoindre"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
