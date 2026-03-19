import { Link } from "react-router-dom";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { Button } from "@/components/ui/button";
import tribbueLogoImg from "@/assets/tribbue-logo.png";
import type { User } from "@supabase/supabase-js";

export default function LandingNav({ user }: { user: User | null }) {
  return (
    <header className="border-b border-border/40 bg-card/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={tribbueLogoImg} alt="Tribbue" className="h-8 object-contain" />
        </Link>
        <nav className="hidden md:flex items-center gap-5">
          <Link to="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</Link>
          <Link to="/pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Tarifs</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <LiquidButton asChild size="sm" variant="default">
              <Link to="/dashboard">Dashboard</Link>
            </LiquidButton>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex text-xs h-9">
                <Link to="/auth">Se connecter</Link>
              </Button>
              <LiquidButton asChild size="sm" variant="default">
                <Link to="/auth">Commencer</Link>
              </LiquidButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
