

# Plan: Refonte de la page Admin avec PIN 4 chiffres et suivi d'activite

## 1. Changer le PIN a 4 chiffres (1234)

**Fichiers concernes:**
- `src/components/super-admin/AdminPinEntry.tsx` — Passer de 5 a 4 champs de saisie
- `supabase/functions/verify-admin-code/index.ts` — Aucun changement necessaire (compare simplement le code saisi au secret)
- Mettre a jour le secret `ADMIN_ACCESS_CODE` a la valeur `1234` via l'outil secrets

## 2. Ajouter un onglet "Activite" avec les actions utilisateur

Nouveau composant `src/components/super-admin/SuperAdminActivity.tsx` affichant:
- **Journal des points** (table `points_log`): qui a gagne des points, pourquoi, quand
- **Lecons terminees** (table `lesson_progress`): qui a termine quelle lecon, quand
- **Inscriptions recentes aux evenements** (table `event_attendees`)
- **Derniers quiz passes** (table `quiz_attempts`): score, reussite

Le tout dans un flux chronologique filtre par type d'action.

## 3. Enrichir le hook `useSuperAdmin.ts`

Ajouter des queries pour:
- `points_log` avec jointure sur `profiles` (nom de l'utilisateur)
- `lesson_progress` avec jointure sur `profiles` et `lessons` (titre de la lecon)
- `quiz_attempts` avec jointure sur `profiles` et `quizzes` (titre du quiz)
- `event_attendees` avec jointure sur `profiles` et `events` (titre de l'evenement)

## 4. Ajouter la navigation "Activite" dans `Admin.tsx`

Ajouter un 6e item de navigation avec l'icone `Activity` entre "Contenu" et "Parametres".

## 5. Ameliorer le Dashboard

Ajouter au `SuperAdminDashboard.tsx`:
- Un flux "Dernières actions" montrant les 10 dernieres activites (posts, likes, lecons, quiz)
- Nombre total de lecons completees et quiz passes dans les stats

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/super-admin/AdminPinEntry.tsx` | 5 → 4 champs |
| Secret `ADMIN_ACCESS_CODE` | Valeur → `1234` |
| `src/hooks/useSuperAdmin.ts` | Queries activite (points_log, lesson_progress, quiz_attempts, event_attendees) |
| `src/components/super-admin/SuperAdminActivity.tsx` | Nouveau composant — timeline d'activite |
| `src/components/super-admin/SuperAdminDashboard.tsx` | Stats enrichies + flux d'activite recent |
| `src/pages/Admin.tsx` | Ajout onglet Activite |

