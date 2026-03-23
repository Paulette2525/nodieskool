import { useState } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { savePendingCommunityUrl, wasPwaInstalled } from "@/hooks/useRedirectUrl";
import tribbueLogoImg from "@/assets/tribbue-logo.png";

function isIOSBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone;
  return isIOS && !isStandalone;
}

interface SmartRedirectProps {
  communityName?: string;
  communityLogoUrl?: string | null;
  primaryColor?: string | null;
}

export function SmartRedirect({ communityName, communityLogoUrl, primaryColor }: SmartRedirectProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !isIOSBrowser() || !wasPwaInstalled()) return null;

  // Save current URL for the PWA to pick up
  savePendingCommunityUrl(window.location.pathname + window.location.search);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-6">
      <Card className="max-w-sm w-full p-6 rounded-2xl border-border/50 shadow-lg text-center space-y-5">
        <div className="flex justify-center">
          <img src={tribbueLogoImg} alt="Tribbue" className="h-14 object-contain" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            Ouvrez Tribbue depuis votre écran d'accueil
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {communityName
              ? `Pour accéder à "${communityName}", ouvrez l'application Tribbue sur votre écran d'accueil. Vous serez redirigé automatiquement.`
              : "Ouvrez l'application Tribbue sur votre écran d'accueil pour une meilleure expérience. Vous serez redirigé automatiquement."}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-muted/60 rounded-xl p-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground text-left leading-relaxed">
            Rendez-vous sur votre <span className="font-semibold text-foreground">écran d'accueil</span> et appuyez sur l'icône <span className="font-semibold text-foreground">Tribbue</span>
          </p>
        </div>

        <Button
          variant="ghost"
          className="w-full text-xs text-muted-foreground"
          onClick={() => setDismissed(true)}
        >
          Continuer sur le navigateur
        </Button>
      </Card>
    </div>
  );
}
