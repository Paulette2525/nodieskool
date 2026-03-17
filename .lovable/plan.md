

# Plan : Suppression du classement, des points et du calendrier

## Résumé
Supprimer définitivement trois fonctionnalités : le **classement** (leaderboard), le **système de points/niveaux**, et le **calendrier** (événements). Cela inclut le frontend, les triggers de points côté base de données, et les routes.

## Changements

### 1. Supprimer les routes (App.tsx)
- Retirer les imports : `Leaderboard`, `Calendar`, `CommunityLeaderboard`, `CommunityCalendar`
- Retirer les routes : `/leaderboard`, `/calendar`, `/c/:slug/leaderboard`, `/c/:slug/calendar`

### 2. Supprimer les liens de navigation
- **`CommunitySidebar.tsx`** : retirer les entrées "Classement" et "Calendrier" du tableau `navigation`, retirer les imports `Trophy` et `Calendar`
- **`Sidebar.tsx`** : idem

### 3. Supprimer les pages
- Supprimer `src/pages/Leaderboard.tsx`
- Supprimer `src/pages/Calendar.tsx`
- Supprimer `src/pages/community/CommunityLeaderboard.tsx`
- Supprimer `src/pages/community/CommunityCalendar.tsx`

### 4. Supprimer les hooks liés
- Supprimer `src/hooks/useLeaderboard.ts`
- Nettoyer `src/hooks/useEvents.ts` — supprimer les fonctions liées aux événements (ou supprimer le fichier si entièrement dédié au calendrier)

### 5. Supprimer les composants liés
- Supprimer `src/components/leaderboard/LeaderboardCard.tsx`
- Supprimer `src/components/calendar/EventCard.tsx`

### 6. Nettoyer le Dashboard (Dashboard.tsx)
- Retirer la carte "Points" (lignes 94-102) et la carte "Niveau" (lignes 85-93) du dashboard
- Retirer les imports `Trophy`

### 7. Nettoyer l'admin communauté (CommunityAdmin.tsx)
- Retirer l'onglet "Événements" et le composant `CommunityAdminEventsTab`
- Retirer l'import `Calendar` et le TabsTrigger/TabsContent associé

### 8. Nettoyer les colonnes points/niveau dans les vues membres
- **`CommunityAdminMembersTab.tsx`** : retirer les colonnes "Niveau" et "Points" du tableau
- **`AdminMembersTab.tsx`** : retirer le système d'attribution de points (dialog, bouton "Award Points")

### 9. Nettoyer useAdmin.ts
- Retirer la mutation `awardPoints` et les imports/invalidations liés au leaderboard

### 10. Migration SQL — Désactiver les triggers de points
Supprimer les triggers qui attribuent automatiquement des points :
- `award_post_points` (trigger sur `posts`)
- `award_lesson_completion_points` (trigger sur `lesson_progress`)
- Points dans `update_post_likes_count` (trigger sur `post_likes`)
- Points dans `update_post_comments_count` (trigger sur `post_comments`)

```sql
-- Supprimer les triggers d'attribution de points
DROP TRIGGER IF EXISTS award_post_points_trigger ON public.posts;
DROP TRIGGER IF EXISTS award_lesson_completion_points_trigger ON public.lesson_progress;

-- Recréer les triggers likes/comments SANS attribution de points
CREATE OR REPLACE FUNCTION public.update_post_likes_count() ...  -- sans appel à update_user_points
CREATE OR REPLACE FUNCTION public.update_post_comments_count() ... -- sans appel à update_user_points
```

### 11. Nettoyer le certificat edge function
- `supabase/functions/generate-certificate/index.ts` : retirer l'appel à `update_user_points`

### 12. Nettoyer useQuizzes.ts
- Retirer l'appel à `supabase.rpc("update_user_points", ...)` après réussite du quiz

## Fichiers modifiés/supprimés

| Fichier | Action |
|---------|--------|
| `src/App.tsx` | Retirer routes + imports |
| `src/components/layout/Sidebar.tsx` | Retirer nav Classement + Calendrier |
| `src/components/layout/CommunitySidebar.tsx` | Idem |
| `src/pages/Leaderboard.tsx` | Supprimer |
| `src/pages/Calendar.tsx` | Supprimer |
| `src/pages/community/CommunityLeaderboard.tsx` | Supprimer |
| `src/pages/community/CommunityCalendar.tsx` | Supprimer |
| `src/hooks/useLeaderboard.ts` | Supprimer |
| `src/components/leaderboard/LeaderboardCard.tsx` | Supprimer |
| `src/components/calendar/EventCard.tsx` | Supprimer |
| `src/pages/Dashboard.tsx` | Retirer cartes Points/Niveau |
| `src/pages/community/CommunityAdmin.tsx` | Retirer onglet Événements |
| `src/components/community-admin/CommunityAdminEventsTab.tsx` | Supprimer |
| `src/components/community-admin/CommunityAdminMembersTab.tsx` | Retirer colonnes points/niveau |
| `src/components/admin/AdminMembersTab.tsx` | Retirer attribution de points |
| `src/hooks/useAdmin.ts` | Retirer `awardPoints` |
| `src/hooks/useQuizzes.ts` | Retirer appel `update_user_points` |
| `supabase/functions/generate-certificate/index.ts` | Retirer appel `update_user_points` |
| Migration SQL | Désactiver triggers de points |

Les tables (`events`, `event_attendees`, `points_log`, `profiles.points/level`) restent en base mais ne sont plus utilisées. Aucune suppression de table pour éviter de casser des données.

