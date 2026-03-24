import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  Palette,
  Save,
  Loader2,
  Globe,
  Lock,
  Camera,
  ImagePlus,
  KeyRound,
  Copy,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useStorage } from "@/hooks/useStorage";

export function CommunityAdminSettingsTab() {
  const { community, communityId } = useCommunityContext();
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useStorage();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [localSettings, setLocalSettings] = useState({
    name: "",
    description: "",
    primary_color: "#8B5CF6",
    is_public: true,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (community) {
      setLocalSettings({
        name: community.name,
        description: community.description || "",
        primary_color: community.primary_color || "#8B5CF6",
        is_public: community.is_public,
      });
      setLogoPreview(community.logo_url);
      setCoverPreview(community.cover_url);
    }
  }, [community]);

  useEffect(() => {
    if (!community) return;
    const changed = 
      localSettings.name !== community.name ||
      localSettings.description !== (community.description || "") ||
      localSettings.primary_color !== (community.primary_color || "#8B5CF6") ||
      localSettings.is_public !== community.is_public ||
      pendingLogoFile !== null ||
      pendingCoverFile !== null;
    setHasChanges(changed);
  }, [localSettings, community, pendingLogoFile, pendingCoverFile]);

  const handleFileSelect = (type: "logo" | "cover") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "logo") {
        setLogoPreview(reader.result as string);
        setPendingLogoFile(file);
      } else {
        setCoverPreview(reader.result as string);
        setPendingCoverFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateSettings = useMutation({
    mutationFn: async () => {
      if (!communityId) throw new Error("No community ID");

      let logoUrl = community?.logo_url || null;
      let coverUrl = community?.cover_url || null;

      if (pendingLogoFile) {
        const url = await uploadFile("community-assets", pendingLogoFile, "logos");
        if (url) logoUrl = url;
      }
      if (pendingCoverFile) {
        const url = await uploadFile("community-assets", pendingCoverFile, "covers");
        if (url) coverUrl = url;
      }

      const { error } = await supabase
        .from("communities")
        .update({
          name: localSettings.name,
          description: localSettings.description || null,
          primary_color: localSettings.primary_color,
          is_public: localSettings.is_public,
          logo_url: logoUrl,
          cover_url: coverUrl,
        })
        .eq("id", communityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] });
      toast.success("Paramètres enregistrés");
      setHasChanges(false);
      setPendingLogoFile(null);
      setPendingCoverFile(null);
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const handleChange = <K extends keyof typeof localSettings>(
    key: K,
    value: typeof localSettings[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (!community) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            Images
          </CardTitle>
          <CardDescription>Logo et couverture de votre communauté</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover */}
          <div className="space-y-2">
            <Label>Image de couverture</Label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="relative w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors overflow-hidden group"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ImagePlus className="h-8 w-8 mb-1" />
                  <span className="text-xs">Ajouter une couverture</span>
                </div>
              )}
              {coverPreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect("cover")} />
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="relative group"
              >
                <Avatar className="h-20 w-20 border-2 border-dashed border-muted-foreground/30 group-hover:border-primary transition-colors">
                  {logoPreview ? (
                    <AvatarImage src={logoPreview} alt="Logo" />
                  ) : (
                    <AvatarFallback className="bg-muted text-xl font-bold text-muted-foreground">
                      {community.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>
              <p className="text-xs text-muted-foreground">
                Cliquez pour {logoPreview ? "changer" : "ajouter"} le logo
              </p>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect("logo")} />
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres Généraux
          </CardTitle>
          <CardDescription>Configurez les informations de base de votre communauté</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nom de la communauté</Label>
            <Input value={localSettings.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={localSettings.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Décrivez votre communauté..." />
          </div>
          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input value={community.slug} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Le slug ne peut pas être modifié après la création</p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Apparence
          </CardTitle>
          <CardDescription>Personnalisez l'apparence de votre communauté</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Couleur principale</Label>
            <div className="flex items-center gap-3">
              <Input type="color" value={localSettings.primary_color} onChange={(e) => handleChange("primary_color", e.target.value)} className="w-16 h-10 p-1" />
              <Input value={localSettings.primary_color} onChange={(e) => handleChange("primary_color", e.target.value)} className="w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {localSettings.is_public ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            Confidentialité
          </CardTitle>
          <CardDescription>Contrôlez qui peut voir et rejoindre votre communauté</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Communauté publique</Label>
              <p className="text-sm text-muted-foreground">
                {localSettings.is_public 
                  ? "Tout le monde peut voir et rejoindre cette communauté"
                  : "Seuls les membres invités peuvent voir cette communauté"
                }
              </p>
            </div>
            <Switch checked={localSettings.is_public} onCheckedChange={(checked) => handleChange("is_public", checked)} />
          </div>
        </CardContent>
      </Card>

      {/* Invite Code */}
      <InviteCodeSection communityId={communityId!} />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => updateSettings.mutate()}
          disabled={updateSettings.isPending || uploading || !hasChanges}
          className="gap-2"
        >
          {(updateSettings.isPending || uploading) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  );
}

function InviteCodeSection({ communityId }: { communityId: string }) {
  const queryClient = useQueryClient();

  const { data: inviteCode, isLoading } = useQuery({
    queryKey: ["invite-code", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("invite_code")
        .eq("id", communityId)
        .single();
      if (error) throw error;
      return (data as any)?.invite_code as string | null;
    },
  });

  const generateCode = useMutation({
    mutationFn: async () => {
      const { data: code } = await supabase.rpc("generate_invite_code");
      const { error } = await supabase
        .from("communities")
        .update({ invite_code: code } as any)
        .eq("id", communityId);
      if (error) throw error;
      return code;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invite-code", communityId] });
      toast.success("Code d'invitation généré !");
    },
    onError: (e) => toast.error("Erreur: " + e.message),
  });

  const copyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success("Code copié !");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Code d'invitation
        </CardTitle>
        <CardDescription>
          Partagez ce code pour permettre aux utilisateurs de rejoindre votre communauté directement depuis l'application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : inviteCode ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-center font-mono text-xl tracking-[0.3em] font-bold text-foreground select-all">
              {inviteCode}
            </div>
            <Button variant="outline" size="icon" className="rounded-xl h-11 w-11" onClick={copyCode}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl h-11 w-11" onClick={() => generateCode.mutate()} disabled={generateCode.isPending}>
              {generateCode.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <Button onClick={() => generateCode.mutate()} disabled={generateCode.isPending} className="gap-2">
            {generateCode.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Générer un code d'invitation
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          Les utilisateurs pourront saisir ce code depuis leur tableau de bord pour rejoindre la communauté. Idéal pour les utilisateurs iPhone.
        </p>
      </CardContent>
    </Card>
  );
}
