import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X, Download, Share, Plus, ChevronDown, ChevronUp } from "lucide-react";
import tribbueLogoImg from "@/assets/tribbue-logo.png";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa_banner_dismissed_at";
const DISMISS_DAYS = 3;

export function InstallBanner() {
  const { pathname } = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Only allow banner on /dashboard
  if (pathname !== "/dashboard") return null;

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const diff = Date.now() - Number(dismissed);
      if (diff < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    if (ios) {
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setVisible(false);
      setDeferredPrompt(null);
    } else {
      setShowInstructions((prev) => !prev);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 md:bottom-auto md:top-0 left-0 right-0 z-50 safe-area-bottom md:safe-area-top animate-in slide-in-from-bottom md:slide-in-from-top duration-300">
      <div className="mx-3 mb-3 md:mb-0 md:mt-3 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-lg shadow-lg p-3">
        <div className="flex items-center gap-3">
          <img
            src={tribbueLogoImg}
            alt="Tribbue"
            className="w-10 h-10 rounded-xl shrink-0 object-contain"
          />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Tribbue</p>
            <p className="text-xs text-muted-foreground">Installez l'app sur votre appareil</p>
          </div>

          <Button size="sm" onClick={handleInstall} className="rounded-xl gap-1.5 shrink-0">
            <Download className="w-4 h-4" />
            Installer
          </Button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inline instructions for iOS / fallback */}
        {showInstructions && (
          <div className="mt-3 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {isIOS ? (
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-foreground">3 étapes pour installer :</p>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">1</span>
                  <p className="text-xs text-muted-foreground">Appuyez sur <Share className="w-3.5 h-3.5 inline text-primary" /> <span className="font-medium text-foreground">Partager</span> en bas de Safari</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">2</span>
                  <p className="text-xs text-muted-foreground">Faites défiler et appuyez sur <Plus className="w-3.5 h-3.5 inline text-primary" /> <span className="font-medium text-foreground">Sur l'écran d'accueil</span></p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">3</span>
                  <p className="text-xs text-muted-foreground">Confirmez en appuyant sur <span className="font-medium text-foreground">Ajouter</span></p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Pour installer l'application :</p>
                <p className="text-xs text-muted-foreground">Ouvrez cette page dans <span className="font-medium text-foreground">Google Chrome</span>, puis le bouton "Installer" apparaîtra automatiquement.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
