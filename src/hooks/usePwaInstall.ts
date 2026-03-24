import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android-native" | "android-manual" | "ios-safari" | "ios-other" | "desktop" | "standalone";

const DISMISS_KEY = "pwa_banner_dismissed_at";
const DISMISS_DAYS = 3;

function detectPlatform(): Platform {
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone
  ) {
    return "standalone";
  }

  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
    return isSafari ? "ios-safari" : "ios-other";
  }

  const isAndroid = /Android/.test(ua);
  if (isAndroid) {
    // Will be refined to "android-native" if beforeinstallprompt fires
    return "android-manual";
  }

  return "desktop";
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>(() => detectPlatform());

  // Capture beforeinstallprompt globally — runs once at app start
  useEffect(() => {
    if (platform === "standalone") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android-native");
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [platform]);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setPlatform("standalone");
    }
    return outcome === "accepted";
  }, [deferredPrompt]);

  const isDismissed = (() => {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - Number(ts) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  })();

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }, []);

  return {
    platform,
    canShowBanner: platform !== "standalone" && platform !== "desktop" && !isDismissed,
    triggerInstall,
    dismiss,
  };
}
