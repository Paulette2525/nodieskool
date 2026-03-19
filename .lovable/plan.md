

## Plan : Afficher la bannière de communauté dans le layout membre

### Constat actuel
- La colonne `cover_url` existe déjà sur la table `communities`
- L'upload de bannière est déjà fonctionnel dans l'onglet Admin > Settings (CommunityAdminSettingsTab)
- **Problème** : la bannière n'est affichée que sur la page CommunityPreview (pour les non-membres). Une fois membre, elle disparaît

### Ce qui sera fait

**1. Ajouter un bandeau bannière dans CommunityLayout**
- Afficher la `cover_url` de la communauté en haut du layout principal (au-dessus du contenu, sous la barre de recherche)
- Si pas de bannière : afficher un dégradé basé sur la `primary_color`
- Hauteur compacte (~120px) avec le logo et nom de la communauté en superposition
- Bouton "Modifier" visible uniquement pour les admins/owners, qui redirige vers la page admin settings

**2. Fichier modifié**
- `src/components/layout/CommunityLayout.tsx` : ajout d'un composant bannière entre le header et le contenu `{children}`

### Détails techniques
- Utilisation de `useCommunityContext()` déjà disponible dans CommunityLayout pour accéder à `community.cover_url`, `community.primary_color`, `community.logo_url`
- Aucune migration DB nécessaire (la colonne `cover_url` existe déjà)
- Aucune modification RLS nécessaire (l'upload passe par le bucket `community-assets` déjà configuré)

