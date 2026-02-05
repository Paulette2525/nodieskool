
# Plan : Interface Admin pour les Propriétaires de Communauté

## Contexte du Problème

L'architecture actuelle mélange deux concepts d'administration :

1. **Admin Global de Plateforme** (`/admin`) - Pour les super-administrateurs qui gèrent l'ensemble de la plateforme
2. **Admin de Communauté** (`/c/:slug/admin`) - Pour les propriétaires/admins qui gèrent LEUR communauté

Actuellement :
- La route `/c/:slug/admin` est affichée dans la sidebar mais **n'existe pas**
- La page `/admin` vérifie `isAdmin` qui est basé sur `user_roles` (vide pour tous les utilisateurs actuels)
- Chaque créateur de communauté devrait pouvoir administrer sa propre communauté

## Solution Proposée

### 1. Créer la Page Admin de Communauté

Créer une nouvelle page `/c/:slug/admin` accessible aux owners et admins de chaque communauté.

**Fichier : `src/pages/community/CommunityAdmin.tsx`**

Cette page permettra de :
- Gérer les membres de la communauté (rôles, suppression)
- Gérer les formations liées à cette communauté
- Gérer les événements de la communauté
- Gérer les posts de la communauté
- Configurer les paramètres de la communauté

### 2. Ajouter la Route dans App.tsx

```text
Nouvelle route : /c/:slug/admin -> CommunityAdmin
```

### 3. Créer un Hook `useCommunityAdmin`

Hook spécifique pour récupérer les données d'administration filtrées par `community_id` :
- Membres de la communauté (via `community_members`)
- Formations de la communauté (via `courses.community_id`)
- Événements de la communauté (via `events.community_id`)
- Posts de la communauté (via `posts.community_id`)
- Statistiques spécifiques à la communauté

### 4. Composants Admin Spécifiques à la Communauté

Créer des versions "community-scoped" des composants admin existants :
- `CommunityAdminMembersTab` - Gestion des membres de la communauté
- `CommunityAdminCoursesTab` - Formations avec `community_id` automatique
- `CommunityAdminEventsTab` - Événements avec `community_id` automatique
- `CommunityAdminPostsTab` - Posts de la communauté
- `CommunityAdminSettingsTab` - Paramètres de la communauté

### 5. Mettre à jour la Page Admin Globale (Optionnel)

La page `/admin` actuelle reste pour les super-admins de la plateforme avec vue sur TOUTES les données. Pour y accéder, il faudrait attribuer le rôle `admin` dans `user_roles`.

## Détails Techniques

### Structure des Fichiers à Créer/Modifier

```text
src/
├── pages/
│   └── community/
│       └── CommunityAdmin.tsx (NOUVEAU)
├── hooks/
│   └── useCommunityAdmin.ts (NOUVEAU)
├── components/
│   └── community-admin/
│       ├── CommunityAdminStats.tsx (NOUVEAU)
│       ├── CommunityAdminMembersTab.tsx (NOUVEAU)
│       ├── CommunityAdminCoursesTab.tsx (NOUVEAU)
│       ├── CommunityAdminEventsTab.tsx (NOUVEAU)
│       ├── CommunityAdminPostsTab.tsx (NOUVEAU)
│       └── CommunityAdminSettingsTab.tsx (NOUVEAU)
└── App.tsx (MODIFIER - ajouter route)
```

### Hook `useCommunityAdmin.ts`

```typescript
// Logique principale
- Query: membres via community_members JOIN profiles
- Query: formations via courses WHERE community_id = X
- Query: événements via events WHERE community_id = X
- Query: posts via posts WHERE community_id = X
- Mutations: updateMemberRole, removeMember, etc.
```

### Contrôle d'Accès

La page utilisera `useCommunityContext()` pour :
- Vérifier que l'utilisateur est `owner` ou `admin` de la communauté
- Rediriger vers le feed si pas autorisé
- Filtrer automatiquement toutes les données par `community_id`

### Mutations avec `community_id`

Lors de la création de formations, événements, etc., le `community_id` sera automatiquement ajouté depuis le contexte :

```typescript
const { communityId } = useCommunityContext();

// Création de cours
await supabase.from("courses").insert({
  title: "...",
  community_id: communityId, // Automatique
});
```

## Résumé des Actions

| Étape | Action | Impact |
|-------|--------|--------|
| 1 | Créer `CommunityAdmin.tsx` | Page principale admin communauté |
| 2 | Créer `useCommunityAdmin.ts` | Logique de données filtrées |
| 3 | Créer composants admin communauté | UI de gestion |
| 4 | Ajouter route dans App.tsx | Activer la navigation |
| 5 | Tester le flux complet | Validation |

## Résultat Attendu

Chaque propriétaire de communauté pourra :
- Accéder à `/c/son-slug/admin` 
- Voir uniquement les données de SA communauté
- Gérer ses membres, formations, événements et posts
- Configurer sa communauté (nom, description, couleurs, etc.)
