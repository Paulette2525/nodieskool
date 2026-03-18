import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { useStorage } from "@/hooks/useStorage";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityContext } from "@/contexts/CommunityContext";

export function ProfileOnboarding() {
  const { profile, updateProfile } = useProfile();
  const { refreshProfile } = useAuth();
  const { uploadAvatar, uploading } = useStorage();
  const { community } = useCommunityContext();

  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryColor = community?.primary_color || "hsl(var(--primary))";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    let avatarUrl = profile?.avatar_url || "";

    if (avatarFile) {
      const url = await uploadAvatar(avatarFile);
      if (url) avatarUrl = url;
    }

    await updateProfile.mutateAsync({
      username: username.trim() || profile?.username,
      bio: bio.trim() || undefined,
      avatar_url: avatarUrl || undefined,
    });

    await refreshProfile();
  };

  const handleSkip = () => {
    localStorage.setItem(SKIP_KEY, "true");
    window.dispatchEvent(new Event("storage"));
    // Force re-render by refreshing profile
    refreshProfile();
  };

  const saving = updateProfile.isPending || uploading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-6 md:p-8 rounded-2xl border-border/50 shadow-lg">
        {/* Community branding */}
        {community && (
          <div className="flex justify-center mb-4">
            {community.logo_url ? (
              <Avatar className="h-14 w-14 ring-2 ring-background shadow-sm">
                <AvatarImage src={community.logo_url} alt={community.name} />
                <AvatarFallback style={{ backgroundColor: primaryColor, color: "white" }} className="text-lg font-bold">
                  {community.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground mb-1">
            Bienvenue{community ? ` dans ${community.name}` : ""} !
          </h1>
          <p className="text-sm text-muted-foreground">
            Complétez votre profil pour commencer
          </p>
        </div>

        {/* Avatar upload */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
          >
            <Avatar className="h-20 w-20 ring-2 ring-border shadow-sm">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Avatar" />
              ) : (
                <AvatarFallback className="bg-muted">
                  <User className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">
              Nom d'utilisateur
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="votre_pseudo"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bio" className="text-xs font-medium text-muted-foreground">
              Décrivez-vous en quelques mots
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Passionné(e) de..."
              rows={3}
              className="mt-1 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full h-11 text-sm font-semibold rounded-xl"
            style={{ backgroundColor: primaryColor }}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuer
          </Button>
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
          >
            Passer pour l'instant
          </Button>
        </div>
      </Card>
    </div>
  );
}
