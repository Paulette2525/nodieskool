import { useState, useEffect } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa_banner_dismissed_at";
const DISMISS_DAYS = 7;

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone) return;

    // Dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const diff = Date.now() - Number(dismissed);
      if (diff < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua);
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
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom animate-in slide-in-from-bottom duration-300">
      <div className="mx-3 mb-3 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-lg shadow-lg p-3 flex items-center gap-3">
        <img
          src="/pwa-192x192.png"
          alt="NodieSkool"
          className="w-10 h-10 rounded-xl shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">NodieSkool</p>
          {isIOS ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
              Tap <Share className="w-3 h-3 inline" /> puis <Plus className="w-3 h-3 inline" /> Écran d'accueil
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Installez l'app sur votre téléphone</p>
          )}
        </div>

        {!isIOS && (
          <Button size="sm" onClick={handleInstall} className="rounded-xl gap-1.5 shrink-0">
            <Download className="w-4 h-4" />
            Installer
          </Button>
        )}

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
