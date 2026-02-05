 import { useEffect, useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Switch } from "@/components/ui/switch";
 import {
   Settings,
   Palette,
   Save,
   Loader2,
   Globe,
   Lock,
 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useMutation, useQueryClient } from "@tanstack/react-query";
 import { toast } from "sonner";
 import { useCommunityContext, Community } from "@/contexts/CommunityContext";
 
 export function CommunityAdminSettingsTab() {
   const { community, communityId } = useCommunityContext();
   const queryClient = useQueryClient();
   
   const [localSettings, setLocalSettings] = useState({
     name: "",
     description: "",
     primary_color: "#8B5CF6",
     is_public: true,
   });
   const [hasChanges, setHasChanges] = useState(false);
 
   useEffect(() => {
     if (community) {
       setLocalSettings({
         name: community.name,
         description: community.description || "",
         primary_color: community.primary_color || "#8B5CF6",
         is_public: community.is_public,
       });
     }
   }, [community]);
 
   useEffect(() => {
     if (!community) return;
     const changed = 
       localSettings.name !== community.name ||
       localSettings.description !== (community.description || "") ||
       localSettings.primary_color !== (community.primary_color || "#8B5CF6") ||
       localSettings.is_public !== community.is_public;
     setHasChanges(changed);
   }, [localSettings, community]);
 
   const updateSettings = useMutation({
     mutationFn: async () => {
       if (!communityId) throw new Error("No community ID");
       const { error } = await supabase
         .from("communities")
         .update({
           name: localSettings.name,
           description: localSettings.description || null,
           primary_color: localSettings.primary_color,
           is_public: localSettings.is_public,
         })
         .eq("id", communityId);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["community"] });
       toast.success("Paramètres enregistrés");
       setHasChanges(false);
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
               value={localSettings.name}
               onChange={(e) => handleChange("name", e.target.value)}
             />
           </div>
           <div className="space-y-2">
             <Label>Description</Label>
             <Textarea
               value={localSettings.description}
               onChange={(e) => handleChange("description", e.target.value)}
               placeholder="Décrivez votre communauté..."
             />
           </div>
           <div className="space-y-2">
             <Label>Slug (URL)</Label>
             <Input
               value={community.slug}
               disabled
               className="bg-muted"
             />
             <p className="text-xs text-muted-foreground">
               Le slug ne peut pas être modifié après la création
             </p>
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
             <Switch
               checked={localSettings.is_public}
               onCheckedChange={(checked) => handleChange("is_public", checked)}
             />
           </div>
         </CardContent>
       </Card>
 
       {/* Save Button */}
       <div className="flex justify-end">
         <Button
           onClick={() => updateSettings.mutate()}
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