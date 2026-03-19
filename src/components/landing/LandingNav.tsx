import { useNavigate } from "react-router-dom";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { Button } from "@/components/ui/button";
import tribbueLogoImg from "@/assets/tribbue-logo.png";
import type { User } from "@supabase/supabase-js";

export default function LandingNav({ user }: { user: User | null }) {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border/40 bg-card/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <img src={tribbueLogoImg} alt="Tribbue" className="h-8 object-contain" />
        </button>
        <nav className="hidden md:flex items-center gap-5">
          <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</a>
          <button onClick={() => navigate("/pricing")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Tarifs</button>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <LiquidButton size="sm" variant="default" onClick={() => navigate("/dashboard")}>
              Dashboard
            </LiquidButton>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex text-xs h-9" onClick={() => navigate("/auth")}>
                Se connecter
              </Button>
              <LiquidButton size="sm" variant="default" onClick={() => navigate("/auth")}>
                Commencer
              </LiquidButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
