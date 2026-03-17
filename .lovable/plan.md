

# Plan : Suppression complète des badges, points et niveaux

## Résumé
Retirer toute trace du système de badges, points et niveaux de l'ensemble de la plateforme (UI, hooks, composants, données affichées).

## Changements

### 1. Supprimer les fichiers dédiés
- `src/hooks/useBadges.ts`
- `src/components/badges/BadgeCard.tsx`

### 2. Nettoyer `src/pages/Profile.tsx`
- Retirer imports `useBadges`, `BadgeCard`, `Progress`, `Trophy`, `Award`
- Supprimer le bloc "Level Progress" (lignes 151-164)
- Supprimer l'onglet "Badges" du TabsList (passer de 3 à 2 onglets)
- Supprimer le TabsContent "badges" entier (lignes 216-248)
- Retirer `levelProgress`, `pointsToNextLevel` calculations

### 3. Nettoyer `src/components/community/PostCard.tsx`
- Retirer `level` de l'interface `PostCardProps.author`
- Retirer l'affichage du niveau dans le composant

### 4. Nettoyer `src/pages/community/CommunityFeed.tsx`
- Retirer `level` du mapping des posts vers PostCard

### 5. Nettoyer `src/components/community/CommentItem.tsx`
- Retirer l'affichage "Lvl {comment.profiles.level}" (ligne 64-66)

### 6. Nettoyer `src/hooks/useComments.ts`
- Retirer `level` du select des profils

### 7. Nettoyer `src/hooks/useCommunityAdmin.ts`
- Retirer `points` et `level` du type et du select

### 8. Nettoyer `src/hooks/useAdmin.ts`
- Retirer `points` et `level` du type et du select

### 9. Nettoyer `src/hooks/useSuperAdmin.ts`
- Retirer `points` et `level` du type `SuperAdminUser`
- Retirer le type `"points"` de `ActivityItem`
- Retirer la requête `points_log` et le mapping dans l'activité

### 10. Nettoyer `src/components/super-admin/SuperAdminUsers.tsx`
- Retirer colonnes points/niveau si affichées

### 11. Nettoyer `src/components/super-admin/SuperAdminActivity.tsx`
- Retirer la config pour le type "points"

### 12. Nettoyer `src/pages/CourseDetail.tsx`
- Retirer l'affichage "+X points" (lignes 165-168) et l'import `Award`

### 13. Nettoyer `src/components/admin/AdminCoursesTab.tsx`
- Retirer le badge "+X pts" dans l'affichage des leçons
- Retirer `points_reward` du formulaire de leçon

### 14. Nettoyer `src/components/admin/AdminSettingsTab.tsx`
- Retirer le toggle "Gamification" (points, niveaux et badges)

### 15. Nettoyer `src/pages/Landing.tsx`
- Remplacer la feature "Gamification intégrée" par autre chose (ex: "Messagerie privée") ou la supprimer
- Retirer l'import `Trophy` si plus utilisé

### 16. Nettoyer `src/components/notifications/NotificationBell.tsx`
- Retirer les types `badge` et `points` du mapping d'icônes

### 17. Nettoyer `src/hooks/useAuth.tsx`
- Retirer `points` et `level` de l'interface `Profile` (optionnel, car les colonnes restent en BDD)

### 18. Nettoyer `src/types/index.ts`
- Retirer l'interface `Badge`

## Fichiers supprimés
| Fichier | 
|---------|
| `src/hooks/useBadges.ts` |
| `src/components/badges/BadgeCard.tsx` |

## Fichiers modifiés
| Fichier | Modification |
|---------|-------------|
| `src/pages/Profile.tsx` | Retirer niveau, points, badges |
| `src/components/community/PostCard.tsx` | Retirer level |
| `src/pages/community/CommunityFeed.tsx` | Retirer level du mapping |
| `src/components/community/CommentItem.tsx` | Retirer "Lvl X" |
| `src/hooks/useComments.ts` | Retirer level du select |
| `src/hooks/useCommunityAdmin.ts` | Retirer points/level |
| `src/hooks/useAdmin.ts` | Retirer points/level |
| `src/hooks/useSuperAdmin.ts` | Retirer points/level/activité points |
| `src/components/super-admin/SuperAdminActivity.tsx` | Retirer type points |
| `src/components/super-admin/SuperAdminUsers.tsx` | Retirer colonnes points/level |
| `src/pages/CourseDetail.tsx` | Retirer affichage points |
| `src/components/admin/AdminCoursesTab.tsx` | Retirer points_reward |
| `src/components/admin/AdminSettingsTab.tsx` | Retirer toggle gamification |
| `src/pages/Landing.tsx` | Remplacer feature gamification |
| `src/components/notifications/NotificationBell.tsx` | Retirer badge/points |
| `src/types/index.ts` | Retirer interface Badge |

Aucune migration SQL nécessaire — les colonnes et tables restent en base mais ne sont plus utilisées.

