import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const IconPreview = () => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateIcon = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-icon");
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Échec de la génération");
      setIconUrl(data.url);
      toast({ title: "Icône générée !", description: "Prévisualisez l'icône ci-dessous." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Icône Tribbue — Symbole Infini</CardTitle>
          <p className="text-sm text-muted-foreground">
            Générez une icône carrée avec le symbole d'infini bleu Tribbue sur fond blanc.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!iconUrl && (
            <Button onClick={generateIcon} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> Génération en cours…
                </>
              ) : (
                "Générer l'icône"
              )}
            </Button>
          )}

          {iconUrl && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                {/* Large preview */}
                <div className="border rounded-2xl overflow-hidden shadow-lg" style={{ width: 192, height: 192 }}>
                  <img src={iconUrl} alt="Tribbue icon" className="w-full h-full object-cover" />
                </div>
                {/* Small preview */}
                <div className="flex gap-3 items-end">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 text-center">64px</p>
                    <div className="border rounded-xl overflow-hidden shadow" style={{ width: 64, height: 64 }}>
                      <img src={iconUrl} alt="Tribbue icon small" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 text-center">48px</p>
                    <div className="border rounded-lg overflow-hidden shadow" style={{ width: 48, height: 48 }}>
                      <img src={iconUrl} alt="Tribbue icon xs" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-2 rounded break-all">
                {iconUrl}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={generateIcon} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="animate-spin" /> : <RefreshCw className="mr-1" />}
                  Regénérer
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(iconUrl);
                    toast({ title: "URL copiée !" });
                  }}
                  className="flex-1"
                >
                  <Check className="mr-1" /> Copier l'URL
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IconPreview;
