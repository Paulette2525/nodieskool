import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Palette,
  Bell,
  Shield,
  Download,
  Upload,
  Save,
  Loader2,
} from "lucide-react";
import { useSettings, CommunitySettings } from "@/hooks/useSettings";

export function AdminSettingsTab() {
  const { settings, isLoading, updateSettings, exportData } = useSettings();
  const [localSettings, setLocalSettings] = useState<CommunitySettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);

  const handleSave = () => {
    updateSettings.mutate(localSettings);
  };

  const handleChange = <K extends keyof CommunitySettings>(
    key: K,
    value: CommunitySettings[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres Généraux
          </CardTitle>
          <CardDescription>
            Configurez les informations de base de votre communauté
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nom de la communauté</Label>
            <Input
              value={localSettings.community_name}
              onChange={(e) => handleChange("community_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={localSettings.community_description}
              onChange={(e) => handleChange("community_description", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Message de bienvenue</Label>
            <Textarea
              value={localSettings.welcome_message}
              onChange={(e) => handleChange("welcome_message", e.target.value)}
              placeholder="Message affiché aux nouveaux membres"
            />
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
              <Input
                type="color"
                value={localSettings.primary_color}
                onChange={(e) => handleChange("primary_color", e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={localSettings.primary_color}
                onChange={(e) => handleChange("primary_color", e.target.value)}
                className="w-32"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo de la communauté</Label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {localSettings.community_name.charAt(0)}
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Changer le logo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Fonctionnalités
          </CardTitle>
          <CardDescription>Activez ou désactivez les fonctionnalités</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des notifications aux membres
              </p>
            </div>
            <Switch
              checked={localSettings.enable_notifications}
              onCheckedChange={(checked) => handleChange("enable_notifications", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Classement</Label>
              <p className="text-sm text-muted-foreground">
                Afficher le leaderboard des membres
              </p>
            </div>
            <Switch
              checked={localSettings.enable_leaderboard}
              onCheckedChange={(checked) => handleChange("enable_leaderboard", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Gamification</Label>
              <p className="text-sm text-muted-foreground">
                Points, niveaux et badges
              </p>
            </div>
            <Switch
              checked={localSettings.enable_gamification}
              onCheckedChange={(checked) => handleChange("enable_gamification", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>Paramètres de sécurité et de confidentialité</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Vérification email</Label>
              <p className="text-sm text-muted-foreground">
                Exiger la vérification de l'email à l'inscription
              </p>
            </div>
            <Switch
              checked={localSettings.require_email_verification}
              onCheckedChange={(checked) => handleChange("require_email_verification", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Profils publics</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux profils d'être visibles publiquement
              </p>
            </div>
            <Switch
              checked={localSettings.allow_public_profiles}
              onCheckedChange={(checked) => handleChange("allow_public_profiles", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Gestion des Données
          </CardTitle>
          <CardDescription>Exporter ou importer les données de la communauté</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => exportData.mutate()}
              disabled={exportData.isPending}
            >
              {exportData.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exporter les données (JSON)
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importer des données
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            L'export inclut les membres, posts, cours et événements.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending || !hasChanges}
          className="gap-2"
        >
          {updateSettings.isPending ? (
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
