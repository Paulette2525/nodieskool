

# Plan : Refonte style Skool de la page d'invitation et de l'interface communauté

## Référence
Le design cible est inspiré de Skool : layout deux colonnes avec contenu principal à gauche et carte d'info/CTA sticky à droite.

## Changements

### 1. Refonte complète de `CommunityPreview.tsx`
Layout deux colonnes (responsive : une colonne sur mobile) :
- **Colonne gauche (principale)** :
  - Nom de la communauté en titre
  - Image de couverture/bannière grande
  - Barre de stats : Public/Privé, nombre de membres, Gratuit, Créé par [owner]
  - Description longue de la communauté
- **Colonne droite (sidebar sticky)** :
  - Logo de la communauté en grand (rond)
  - Nom + slug
  - Description courte
  - Grille de stats (Membres, Admins)
  - Bouton "REJOINDRE" proéminent
- Mobile : la sidebar passe au-dessus du contenu

### 2. Amélioration de `CommunityFeed.tsx` (CommunityHeader)
- Header plus compact et élégant
- Cover image avec overlay subtil
- Logo + nom + stats en ligne, style plus clean
- Suppression du padding négatif (-mx/-mt) au profit d'un design plus structuré

### 3. Mise à jour du `CommunityContext.tsx`
- Ajouter la récupération du nombre d'admins pour l'afficher dans la page preview
- Ajouter la récupération du nom du propriétaire (owner)

### 4. Pas de changement backend
Aucune migration SQL nécessaire.

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/pages/community/CommunityPreview.tsx` | Refonte complète : layout 2 colonnes style Skool |
| `src/pages/community/CommunityFeed.tsx` | Header communauté amélioré |
| `src/contexts/CommunityContext.tsx` | Ajout ownerName + adminCount au contexte |

