import { useState } from "react";
import { useLocation } from "react-router-dom";
import { X, Download, Share, Plus, MoreVertical, ExternalLink } from "lucide-react";
import collonieLogoImg from "@/assets/collonie-logo.png";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const ALLOWED_PATHS = ["/", "/dashboard"];

export function InstallBanner() {
  const { pathname } = useLocation();
  const { platform, canShowBanner, triggerInstall, dismiss } = usePwaInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);

  // Only show on allowed paths
  if (!ALLOWED_PATHS.includes(pathname)) return null;
  if (!canShowBanner || localDismissed) return null;

  const handleInstall = async () => {
    if (platform === "android-native") {
      const accepted = await triggerInstall();
      if (accepted) setLocalDismissed(true);
    } else {
      setShowInstructions((prev) => !prev);
    }
  };

  const handleDismiss = () => {
    dismiss();
    setLocalDismissed(true);
  };

  return (
    <div className="fixed bottom-0 md:bottom-auto md:top-0 left-0 right-0 z-50 safe-area-bottom md:safe-area-top animate-in slide-in-from-bottom md:slide-in-from-top duration-300">
      <div className="mx-3 mb-3 md:mb-0 md:mt-3 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-lg shadow-lg p-3">
        <div className="flex items-center gap-3">
          <img
            src={collonieLogoImg}
            alt="Collonie"
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

        {showInstructions && (
          <div className="mt-3 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {platform === "ios-safari" && (
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
            )}

            {platform === "ios-other" && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                  <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-foreground">
                    Ouvrez cette page dans <span className="font-semibold">Safari</span> pour pouvoir installer l'application
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Puis suivez : <Share className="w-3 h-3 inline text-primary" /> Partager → <Plus className="w-3 h-3 inline text-primary" /> Sur l'écran d'accueil → Ajouter</p>
              </div>
            )}

            {platform === "android-manual" && (
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-foreground">3 étapes pour installer :</p>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">1</span>
                  <p className="text-xs text-muted-foreground">Appuyez sur <MoreVertical className="w-3.5 h-3.5 inline text-primary" /> <span className="font-medium text-foreground">le menu</span> (⋮) en haut à droite</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">2</span>
                  <p className="text-xs text-muted-foreground">Appuyez sur <span className="font-medium text-foreground">Ajouter à l'écran d'accueil</span></p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">3</span>
                  <p className="text-xs text-muted-foreground">Confirmez en appuyant sur <span className="font-medium text-foreground">Ajouter</span></p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
