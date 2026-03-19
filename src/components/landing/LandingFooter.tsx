import { Link } from "react-router-dom";
import tribbueLogoImg from "@/assets/tribbue-logo.png";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border/50 py-8 px-4 bg-muted/20">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={tribbueLogoImg} alt="Tribbue" className="h-7 object-contain" />
        </div>
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <Link to="/pricing" className="hover:text-foreground transition-colors">Tarifs</Link>
          <Link to="/auth" className="hover:text-foreground transition-colors">Connexion</Link>
        </div>
        <p className="text-[11px] text-muted-foreground">© 2026 Tribbue. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
