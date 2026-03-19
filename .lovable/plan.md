

## Plan : Ajouter l'upload de bannière dans le dialog "Modifier" du Dashboard

### Problème
Le dialog "Modifier la communauté" accessible depuis le Dashboard (CommunityCard) ne contient que nom, description, visibilité et lien d'invitation. Il manque l'upload de bannière/couverture. L'upload existe déjà dans l'admin settings (`/c/:slug/admin` > Paramètres) mais pas dans ce dialog rapide.

### Ce qui sera fait

**Fichier modifié : `src/components/community/CommunityCard.tsx`**

1. Importer `useStorage` et ajouter un `useRef` pour l'input file de couverture
2. Ajouter des états pour `coverPreview` et `pendingCoverFile`
3. Ajouter dans le dialog d'édition (avant le champ "Nom") une zone cliquable pour uploader une bannière — même design que dans `CommunityAdminSettingsTab` : zone dashed avec preview, icône camera au hover
4. Modifier `handleSaveEdit` pour uploader le fichier via `uploadFile("community-assets", file, "covers")` et inclure `cover_url` dans l'update Supabase

### Détails techniques
- Réutilise le hook `useStorage` déjà existant
- Même pattern d'upload que `CommunityAdminSettingsTab` (FileReader pour preview locale, upload au save)
- Aucune migration DB nécessaire — `cover_url` existe déjà sur `communities`

