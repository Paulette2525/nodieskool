import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share, Plus, Check, Smartphone, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full rounded-2xl border-border/50">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Déjà installée !</h1>
            <p className="text-muted-foreground">
              Tribbue est déjà installée sur votre appareil.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="w-full rounded-xl">
              Aller au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <img src="/pwa-192x192.png" alt="Tribbue" className="w-20 h-20 rounded-2xl mx-auto shadow-lg" />
          <h1 className="text-2xl font-bold text-foreground">Installer Tribbue</h1>
          <p className="text-muted-foreground text-sm">
            Accédez à Tribbue directement depuis votre écran d'accueil, comme une application native.
          </p>
        </div>

        {/* Features */}
        <Card className="rounded-2xl border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">Accès rapide</p>
                <p className="text-xs text-muted-foreground">Lancez l'app en un tap depuis votre écran d'accueil</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">Plein écran</p>
                <p className="text-xs text-muted-foreground">Interface immersive sans barre de navigateur</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">Chargement rapide</p>
                <p className="text-xs text-muted-foreground">Les pages se chargent plus vite grâce au cache local</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Install action */}
        {deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full rounded-xl gap-2">
            <Download className="w-5 h-5" />
            Installer l'application
          </Button>
        ) : isIOS ? (
          <Card className="rounded-2xl border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-4">
              <p className="font-semibold text-sm text-foreground text-center">
                Comment installer sur iPhone / iPad
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    Appuyez sur <Share className="w-4 h-4 text-primary" /> <span className="font-medium">Partager</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    Puis <Plus className="w-4 h-4 text-primary" /> <span className="font-medium">Sur l'écran d'accueil</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <p className="text-sm text-foreground">
                    Confirmez en appuyant sur <span className="font-medium">Ajouter</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-border/50">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Ouvrez cette page dans <span className="font-medium text-foreground">Chrome</span> ou <span className="font-medium text-foreground">Safari</span> pour installer l'application.
              </p>
            </CardContent>
          </Card>
        )}

        <Button variant="ghost" onClick={() => navigate("/")} className="w-full text-muted-foreground">
          Continuer sur le navigateur
        </Button>
      </div>
    </div>
  );
};

export default Install;
