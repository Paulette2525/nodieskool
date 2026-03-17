

# Plan : Refonte de la page d'invitation, de l'interface communauté, et ajout de miniature

## Problème
1. La page d'aperçu/invitation (CommunityPreview) est basique et peu engageante
2. L'interface intérieure de la communauté (CommunityFeed) manque d'accueil visuel
3. Pas de possibilité d'ajouter un logo/miniature lors de la création d'une communauté

## Changements

### 1. Refonte de `CommunityPreview.tsx` -- Page d'invitation
- Cover image plein écran avec overlay gradient élégant
- Logo centré en grand avec effet d'ombre
- Titre et description mis en avant avec typographie plus impactante
- Section de stats visuelles (membres, type public/privé) avec des icones stylisées
- Bouton CTA proéminent avec animation subtile
- Ajouter des éléments visuels : pattern de fond quand pas de cover, indicateurs visuels

### 2. Refonte de `CommunityFeed.tsx` -- Page d'accueil communauté
- Ajouter un header visuel avec cover image et logo de la communauté en haut
- Afficher le nom et la description de façon plus attractive
- Barre de stats rapides (nombre de membres, posts)
- Meilleure séparation visuelle entre le header et le feed de posts

### 3. Ajout d'upload de miniature dans `CreateCommunity.tsx`
- Ajouter un champ d'upload d'image pour le logo de la communauté
- Utiliser le bucket `avatars` existant (ou créer un bucket `community-logos`)
- Prévisualisation de l'image sélectionnée avant upload
- Upload lors de la soumission du formulaire, stockage de l'URL dans `logo_url`

### 4. Ajout upload logo/cover dans `CommunityAdminSettingsTab.tsx`
- Permettre de changer le logo et la cover depuis les paramètres admin

### 5. Bucket de stockage
- Créer un bucket `community-assets` pour les logos et covers de communautés via migration SQL

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/pages/community/CommunityPreview.tsx` | Refonte complète du design |
| `src/pages/community/CommunityFeed.tsx` | Ajout header visuel avec cover/logo |
| `src/pages/CreateCommunity.tsx` | Ajout upload logo |
| `src/components/community-admin/CommunityAdminSettingsTab.tsx` | Ajout upload logo + cover |
| `src/hooks/useStorage.ts` | Ajouter `community-assets` au type BucketName |
| Migration SQL | Créer bucket `community-assets` avec policies |

