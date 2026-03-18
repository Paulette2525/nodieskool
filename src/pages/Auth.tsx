import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, LogOut, LayoutDashboard, RefreshCw, Eye, EyeOff } from "lucide-react";
import tribbueLogoImg from "@/assets/tribbue-logo.png";
import { getAndClearRedirectUrl, hasRedirectUrl } from "@/hooks/useRedirectUrl";

export default function Auth() {
  const { user, profile, loading, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const defaultTab = useMemo(() => "login" as const, []);

  // Auto-redirect after OAuth completion on mobile
  useEffect(() => {
    if (user && localStorage.getItem('oauth_pending')) {
      localStorage.removeItem('oauth_pending');
      const redirectUrl = getAndClearRedirectUrl();
      navigate(redirectUrl || "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  // Already logged in: show options instead of auto-redirecting
  if (user) {
    const redirectUrl = getAndClearRedirectUrl();

    const handleGoToDashboard = () => {
      navigate(redirectUrl || "/dashboard");
    };

    const handleSignOut = async () => {
      try {
        await signOut();
        toast.success("Déconnecté avec succès");
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    const handleSwitchAccount = async () => {
      setIsGoogleLoading(true);
      try {
        await signOut();
        await signInWithGoogle();
      } catch (error: any) {
        toast.error(error.message || "Erreur lors du changement de compte");
      } finally {
        setIsGoogleLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <Card className="w-full max-w-sm rounded-2xl border-border/50 shadow-lg relative">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-3">
              <img src={tribbueLogoImg} alt="Tribbue" className="h-10 object-contain" />
            </div>
            <CardTitle className="text-lg">Vous êtes déjà connecté</CardTitle>
            <CardDescription className="text-xs">
              Connecté en tant que {profile?.full_name || user.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleGoToDashboard} className="w-full rounded-xl h-10 text-sm font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Aller au dashboard
            </Button>
            <Button variant="outline" onClick={handleSwitchAccount} className="w-full rounded-xl h-10 text-sm font-medium" disabled={isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Se connecter avec un autre compte
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="w-full rounded-xl h-10 text-sm font-medium text-muted-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    try { await signIn(loginEmail, loginPassword); const r = getAndClearRedirectUrl(); navigate(r || "/dashboard"); toast.success("Welcome back!"); }
    catch (error: any) { toast.error(error.message); }
    finally { setIsLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    try { await signUp(signupEmail, signupPassword, signupUsername, signupFullName); toast.success("Account created! Please check your email to verify."); }
    catch (error: any) { toast.error(error.message); }
    finally { setIsLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-sm rounded-2xl border-border/50 shadow-lg relative">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-3">
            <img src={tribbueLogoImg} alt="Tribbue" className="h-10 object-contain" />
          </div>
          
          <CardDescription className="text-xs">Rejoignez notre communauté d'apprentissage</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            variant="outline"
            className="w-full rounded-xl h-10 text-sm font-medium mb-4"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continuer avec Google
          </Button>

          <div className="relative mb-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              ou
            </span>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-5 rounded-xl h-9">
              <TabsTrigger value="login" className="text-xs rounded-lg">Connexion</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs rounded-lg">Créer un compte</TabsTrigger>
            </TabsList>

            {hasRedirectUrl() && (
              <div className="mb-4 rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Créez un compte ou connectez-vous pour continuer.
              </div>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="rounded-xl h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs">Mot de passe</Label>
                    <Link to="/forgot-password" className="text-[11px] text-primary hover:underline">Oublié ?</Link>
                  </div>
                  <div className="relative">
                    <Input id="login-password" type={showLoginPassword ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="rounded-xl h-9 text-sm pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9 px-2" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                      {showLoginPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl h-9 text-sm" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}Se connecter
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-fullname" className="text-xs">Nom complet</Label>
                  <Input id="signup-fullname" type="text" placeholder="John Doe" value={signupFullName} onChange={(e) => setSignupFullName(e.target.value)} required className="rounded-xl h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-username" className="text-xs">Nom d'utilisateur</Label>
                  <Input id="signup-username" type="text" placeholder="johndoe" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} required className="rounded-xl h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="rounded-xl h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs">Mot de passe</Label>
                  <div className="relative">
                    <Input id="signup-password" type={showSignupPassword ? "text" : "password"} placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} className="rounded-xl h-9 text-sm pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9 px-2" onClick={() => setShowSignupPassword(!showSignupPassword)}>
                      {showSignupPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl h-9 text-sm" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}