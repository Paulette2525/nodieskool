import { useMemo, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { getAndClearRedirectUrl, hasRedirectUrl } from "@/hooks/useRedirectUrl";

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const defaultTab = useMemo(() => (hasRedirectUrl() ? "signup" : "login"), []);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupFullName, setSignupFullName] = useState("");

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (user) { const r = getAndClearRedirectUrl(); return <Navigate to={r || "/dashboard"} replace />; }

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-sm rounded-2xl border-border/50 shadow-lg relative">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-lg">NodieSkool</CardTitle>
          <CardDescription className="text-xs">Rejoignez notre communauté d'apprentissage</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
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
                  <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="rounded-xl h-9 text-sm" />
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
                  <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} className="rounded-xl h-9 text-sm" />
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
