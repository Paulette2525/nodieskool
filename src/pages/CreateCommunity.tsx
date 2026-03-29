import { useState, useRef } from "react";
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Camera, ImagePlus } from "lucide-react";
import collonieLogoImg from "@/assets/collonie-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useCommunities } from "@/hooks/useCommunities";
import { useSubscription } from "@/hooks/useSubscription";
import { useStorage } from "@/hooks/useStorage";
import { saveRedirectUrl } from "@/hooks/useRedirectUrl";

const formSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères").max(50),
  slug: z.string()
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Seules les lettres minuscules, chiffres et tirets sont autorisés"),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateCommunity() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { myCommunities, createCommunity } = useCommunities();
  const { limits } = useSubscription();
  const { uploadFile, uploading } = useStorage();
  const [slugTouched, setSlugTouched] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_public: true,
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    saveRedirectUrl(location.pathname + location.search + location.hash);
    return <Navigate to="/auth" replace />;
  }

  const ownedCommunities = myCommunities.filter(c => c.role === "owner").length;
  const canCreate = limits.maxCommunities === -1 || ownedCommunities < limits.maxCommunities;

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Limite atteinte</CardTitle>
            <CardDescription>
              Vous avez atteint la limite de {limits.maxCommunities} communauté(s) pour votre plan.
              Passez à un plan supérieur pour en créer davantage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/pricing">Voir les plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormData) => {
    let logoUrl: string | null = null;
    let coverUrl: string | null = null;

    if (logoFile) {
      logoUrl = await uploadFile("community-assets", logoFile, "logos");
      if (!logoUrl) return;
    }

    if (coverFile) {
      coverUrl = await uploadFile("community-assets", coverFile, "covers");
      if (!coverUrl) return;
    }

    createCommunity.mutate({
      name: data.name,
      slug: data.slug,
      description: data.description,
      is_public: data.is_public,
      logo_url: logoUrl,
      cover_url: coverUrl,
    }, {
      onSuccess: (community) => {
        navigate(`/c/${community.slug}/community`);
      },
    });
  };

  const handleNameChange = (value: string) => {
    form.setValue("name", value);
    if (!slugTouched) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 30);
      form.setValue("slug", slug);
    }
  };

  const nameValue = form.watch("name");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <img src={collonieLogoImg} alt="Collonie" className="h-8 object-contain" />
            <span className="font-bold">Créer une communauté</span>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle communauté</CardTitle>
            <CardDescription>
              Créez un espace pour rassembler votre audience et partager du contenu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Banner upload */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="relative group w-full h-[150px] rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors overflow-hidden bg-muted"
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Bannière preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <ImagePlus className="h-8 w-8" />
                        <span className="text-sm">Ajouter une bannière (optionnel)</span>
                      </div>
                    )}
                    {coverPreview && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverSelect}
                  />
                </div>

                {/* Logo upload */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="relative group"
                  >
                    <Avatar className="h-24 w-24 border-2 border-dashed border-muted-foreground/30 group-hover:border-primary transition-colors">
                      {logoPreview ? (
                        <AvatarImage src={logoPreview} alt="Logo preview" />
                      ) : (
                        <AvatarFallback className="bg-muted text-2xl font-bold text-muted-foreground">
                          {nameValue ? nameValue.charAt(0).toUpperCase() : "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {logoPreview ? "Cliquez pour changer" : "Ajouter un logo (optionnel)"}
                  </p>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la communauté</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ma Super Communauté"
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de la communauté</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-l-md border border-r-0">
                            /c/
                          </span>
                          <Input
                            className="rounded-l-none"
                            placeholder="ma-communaute"
                            {...field}
                            onChange={(e) => {
                              setSlugTouched(true);
                              field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        L'URL unique de votre communauté
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez votre communauté en quelques mots..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Communauté publique</FormLabel>
                        <FormDescription>
                          Les communautés publiques sont visibles dans l'annuaire
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createCommunity.isPending || uploading}
                >
                  {(createCommunity.isPending || uploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Créer la communauté
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
