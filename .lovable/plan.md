

# Audit pré-publication -- Corrections et optimisations

Après analyse complète du code, de la base de données, des triggers et des politiques RLS, voici les problèmes identifiés et les corrections à apporter.

---

## Problèmes critiques

### 1. Double création de profil lors de l'inscription
Le trigger `handle_new_user` sur `auth.users` crée automatiquement un profil. Mais `signUp()` dans `useAuth.tsx` insère AUSSI manuellement un profil (ligne 156). Cela provoque une erreur de clé dupliquée.

**Correction** : Supprimer l'insertion manuelle du profil dans `signUp()` -- le trigger s'en charge.

### 2. Insertion de rôle échoue silencieusement (RLS)
`signUp()` tente d'insérer un rôle "member" dans `user_roles` (ligne 165). Or la seule politique INSERT sur `user_roles` exige `is_admin()`. Un nouvel utilisateur ne peut donc PAS insérer son propre rôle → l'inscription échoue ou le rôle n'est jamais créé.

**Correction** : Créer un trigger SQL `on_profile_created_role` sur la table `profiles` qui attribue automatiquement le rôle "member" via `SECURITY DEFINER`, et supprimer l'insertion manuelle dans `signUp()`.

### 3. Limite de création de communautés
Le plan "free" limite à 1 communauté. Vous voulez pouvoir en créer autant que vous voulez.

**Correction** : Mettre à jour le plan "free" dans `subscription_plans` pour passer `max_communities` à `-1` (illimité).

---

## Problèmes mineurs

### 4. Warning React "ref on Badge" dans Landing.tsx
Le composant `Badge` reçoit un `ref` sans `React.forwardRef`. C'est un warning en console.

**Correction** : Aucune action nécessaire (warning cosmétique, n'affecte pas le fonctionnement).

### 5. Page `/icon-preview` exposée en production
C'est un outil de développement qui ne devrait pas être accessible aux utilisateurs.

**Correction** : Supprimer la route `/icon-preview` et le lazy import de `IconPreview` dans `App.tsx`.

---

## Résumé des modifications

| Fichier / Ressource | Action |
|---|---|
| `src/hooks/useAuth.tsx` | Supprimer les insertions manuelles dans `profiles` et `user_roles` de `signUp()` (lignes 154-171) |
| Migration SQL | Créer trigger `assign_default_role` sur `profiles` pour auto-attribuer le rôle "member" |
| Migration SQL | `UPDATE subscription_plans SET max_communities = -1 WHERE id = 'free'` |
| `src/App.tsx` | Supprimer la route `/icon-preview` et son import |

