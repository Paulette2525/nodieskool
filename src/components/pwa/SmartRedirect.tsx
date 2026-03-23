import { useState } from "react";
import { Smartphone, Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { savePendingCommunityUrl } from "@/hooks/useRedirectUrl";
import tribbueLogoImg from "@/assets/tribbue-logo.png";
import { toast } from "sonner";

type IOSBrowserType = "standalone" | "safari" | "chrome" | "other-ios" | "not-ios";

function detectIOSBrowser(): IOSBrowserType {
  if (typeof window === "undefined") return "not-ios";
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIOS) return "not-ios";

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone;
  if (isStandalone) return "standalone";

  // CriOS = Chrome on iOS, FxiOS = Firefox on iOS, EdgiOS = Edge on iOS
  if (/CriOS/.test(ua)) return "chrome";
  if (/FxiOS|EdgiOS|OPiOS/.test(ua)) return "other-ios";

  // Default iOS browser without third-party identifier = Safari
  return "safari";
}

interface SmartRedirectProps {
  communityName?: string;
  communityLogoUrl?: string | null;
  primaryColor?: string | null;
}

export function SmartRedirect({ communityName, communityLogoUrl, primaryColor }: SmartRedirectProps) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const browserType = detectIOSBrowser();

  // Only show on iOS browsers (not standalone, not non-iOS)
  if (dismissed || browserType === "standalone" || browserType === "not-ios") return null;

  const currentUrl = window.location.href;
  const isSafari = browserType === "safari";

  // Save URL for PWA handoff (only useful in Safari where localStorage is shared)
  if (isSafari) {
    savePendingCommunityUrl(window.location.pathname + window.location.search);
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-6">
      <Card className="max-w-sm w-full p-6 rounded-2xl border-border/50 shadow-lg text-center space-y-5">
        <div className="flex justify-center">
          <img src={tribbueLogoImg} alt="Tribbue" className="h-14 object-contain" />
        </div>

        {isSafari ? (
          /* Safari flow: open from home screen */
          <>
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
          </>
        ) : (
          /* Chrome / Firefox / other iOS browser flow: copy link + open in Safari */
          <>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">
                Ouvrez ce lien dans Safari
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {communityName
                  ? `Pour accéder à "${communityName}" dans l'application Tribbue, copiez ce lien et ouvrez-le dans Safari.`
                  : "Pour utiliser l'application Tribbue, copiez ce lien et ouvrez-le dans Safari."}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-muted/60 rounded-xl p-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <p className="text-xs text-muted-foreground text-left leading-relaxed">
                  Appuyez sur <span className="font-semibold text-foreground">"Copier le lien"</span> ci-dessous
                </p>
              </div>

              <div className="flex items-center gap-3 bg-muted/60 rounded-xl p-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <p className="text-xs text-muted-foreground text-left leading-relaxed">
                  Ouvrez <span className="font-semibold text-foreground">Safari</span> et collez le lien dans la barre d'adresse
                </p>
              </div>

              <div className="flex items-center gap-3 bg-muted/60 rounded-xl p-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <p className="text-xs text-muted-foreground text-left leading-relaxed">
                  Ouvrez l'app <span className="font-semibold text-foreground">Tribbue</span> depuis votre écran d'accueil
                </p>
              </div>
            </div>

            <Button
              onClick={handleCopyLink}
              className="w-full h-11 text-sm font-semibold rounded-xl shadow-sm"
              size="lg"
            >
              {copied ? (
                <><Check className="mr-2 h-4 w-4" /> Lien copié !</>
              ) : (
                <><Copy className="mr-2 h-4 w-4" /> Copier le lien</>
              )}
            </Button>
          </>
        )}

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
