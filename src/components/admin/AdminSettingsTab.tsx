import { useState } from "react";
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
import { toast } from "sonner";

export function AdminSettingsTab() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    communityName: "Growth Academy",
    communityDescription: "La communauté des entrepreneurs ambitieux",
    welcomeMessage: "Bienvenue dans notre communauté !",
    primaryColor: "#8B5CF6",
    enableNotifications: true,
    enableLeaderboard: true,
    enableGamification: true,
    requireEmailVerification: true,
    allowPublicProfiles: true,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success("Paramètres enregistrés");
  };

  const handleExport = () => {
    toast.info("Export des données en cours...");
    // TODO: Implement data export
  };

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
              value={settings.communityName}
              onChange={(e) => setSettings({ ...settings, communityName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={settings.communityDescription}
              onChange={(e) =>
                setSettings({ ...settings, communityDescription: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Message de bienvenue</Label>
            <Textarea
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
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
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-16 h-10 p-1"
              />
              <Input
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-32"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo de la communauté</Label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {settings.communityName.charAt(0)}
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
              checked={settings.enableNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableNotifications: checked })
              }
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
              checked={settings.enableLeaderboard}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableLeaderboard: checked })
              }
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
              checked={settings.enableGamification}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableGamification: checked })
              }
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
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireEmailVerification: checked })
              }
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
              checked={settings.allowPublicProfiles}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowPublicProfiles: checked })
              }
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
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter les données (CSV)
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
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
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
