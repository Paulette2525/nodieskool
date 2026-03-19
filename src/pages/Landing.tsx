import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare, Calendar, Check, Globe, Zap, Shield, Star, Play, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCommunities } from "@/hooks/useCommunities";
import { getAndClearRedirectUrl } from "@/hooks/useRedirectUrl";
import { ShinyButton } from "@/components/ui/shiny-button";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import tribbueLogoImg from "@/assets/tribbue-logo.png";

import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingBenefits from "@/components/landing/LandingBenefits";
import LandingCommunities from "@/components/landing/LandingCommunities";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  const { user } = useAuth();
  const { publicCommunities } = useCommunities();
  const navigate = useNavigate();
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(!!standalone);
    if (standalone && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      if (localStorage.getItem('oauth_pending')) {
        localStorage.removeItem('oauth_pending');
      }
      const redirectUrl = getAndClearRedirectUrl();
      navigate(redirectUrl || "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <LandingNav user={user} />
      <LandingHero user={user} isStandalone={isStandalone} />
      <LandingFeatures />
      <LandingBenefits user={user} />
      {publicCommunities.length > 0 && (
        <LandingCommunities communities={publicCommunities} />
      )}
      <LandingCTA user={user} />
      <LandingFooter />
    </div>
  );
}
