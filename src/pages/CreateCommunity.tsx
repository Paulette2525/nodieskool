 import { useState } from "react";
 import { Navigate, useNavigate, Link } from "react-router-dom";
 import { useForm } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
 import * as z from "zod";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
 import { Switch } from "@/components/ui/switch";
 import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { useCommunities } from "@/hooks/useCommunities";
 import { useSubscription } from "@/hooks/useSubscription";
 
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
   const { myCommunities, createCommunity } = useCommunities();
   const { limits } = useSubscription();
   const [slugTouched, setSlugTouched] = useState(false);
 
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
 
   const onSubmit = (data: FormData) => {
     createCommunity.mutate({
       name: data.name,
       slug: data.slug,
       description: data.description,
       is_public: data.is_public,
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
             <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
               <Sparkles className="h-5 w-5 text-primary-foreground" />
             </div>
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
                   disabled={createCommunity.isPending}
                 >
                   {createCommunity.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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