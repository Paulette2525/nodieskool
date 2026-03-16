

# Plan : Corriger l'ajout de modules — problème de permissions (RLS)

## Problème identifié

Les politiques RLS des tables `modules` et `lessons` n'autorisent que les **admins/modérateurs globaux** (`is_moderator_or_admin()`). Or, vous êtes **admin de communauté** (owner), ce qui est un rôle différent. Le bouton "Module" s'affiche bien (car `isAdmin` vient du contexte communauté), mais l'insertion en base est bloquée par RLS.

## Solution

1. **Créer une fonction SQL `is_course_community_admin`** qui, à partir d'un `course_id`, vérifie si l'utilisateur est admin de la communauté associée au cours.

2. **Mettre à jour les politiques RLS** des tables `modules` et `lessons` pour autoriser aussi les admins de communauté :
   - `modules` : la policy "Admins/Mods can manage modules" ajoutera `OR is_course_community_admin(course_id)`
   - `lessons` : idem, en remontant via `module_id → modules.course_id`

3. **Créer une fonction `is_module_community_admin`** pour les `lessons` (qui n'ont pas de `course_id` direct, seulement `module_id`).

## Changements techniques

| Élément | Action |
|---------|--------|
| Fonction SQL `is_course_community_admin(course_id)` | Créer — vérifie `is_community_admin` via `courses.community_id` |
| Fonction SQL `is_module_community_admin(module_id)` | Créer — vérifie via `modules.course_id → courses.community_id` |
| RLS `modules` — "Admins/Mods can manage modules" | Remplacer par `is_moderator_or_admin() OR is_course_community_admin(course_id)` |
| RLS `lessons` — "Admins/Mods can manage lessons" | Remplacer par `is_moderator_or_admin() OR is_module_community_admin(module_id)` |

Aucun changement de code frontend nécessaire — seules les permissions en base doivent être corrigées.

