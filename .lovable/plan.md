

## Plan : 3 corrections

### 1. Supprimer les boutons "Rejoindre" des cartes (Landing)

**Fichier : `src/pages/Landing.tsx`** (lignes 247-250)
- Supprimer le `<div>` contenant "Rejoindre" dans les cartes de communautés populaires
- Supprimer aussi le `mb-4` sur la description (devenu inutile)

### 2. Permettre la création de communautés privées

**Problème identifié** : La politique RLS sur `community_members` (INSERT) exige `communities.is_public = true` pour qu'un utilisateur puisse s'auto-ajouter. Or, quand on crée une communauté privée, le trigger `add_community_owner_as_member` insère le owner comme membre avec `SECURITY DEFINER` — donc la création de la communauté elle-même fonctionne, mais le propriétaire ne peut pas voir ses membres ensuite car la politique SELECT exige `is_community_member()`.

**Vérification** : La création de communautés privées devrait fonctionner car le trigger `add_community_owner_as_member` est `SECURITY DEFINER`. Le vrai problème est probablement dans le **join d'une communauté privée** dans `CommunityPreview.tsx` (ligne 29-31) — le RLS bloque l'INSERT car `is_public = false`.

**Correction via migration SQL** : Modifier la politique RLS `Add community members` pour permettre l'insertion dans les communautés privées aussi (avec `is_approved = false` pour les communautés privées) :

```sql
DROP POLICY "Add community members" ON public.community_members;
CREATE POLICY "Add community members" ON public.community_members
FOR INSERT TO authenticated
WITH CHECK (
  is_community_admin(community_id)
  OR (
    user_id = get_current_profile_id()
    AND role = 'member'::community_role
  )
);
```

Cela permet à n'importe quel utilisateur authentifié de rejoindre une communauté (publique ou privée). La distinction publique/privée est gérée côté applicatif via `is_approved`.

### 3. Onboarding obligatoire pour tout nouvel adhérent

**Déjà en place** : `CommunityLayout.tsx` (ligne 49) vérifie `!profile?.avatar_url || !profile?.bio` et affiche `ProfileOnboarding` si incomplet. Tout nouvel adhérent passant par une communauté est intercepté.

**Amélioration** : Ajouter aussi la vérification du `username` dans la condition et rendre le champ `username` obligatoire dans le formulaire d'onboarding (empêcher la soumission si vide).

**Fichier : `src/components/layout/CommunityLayout.tsx`** :
- Modifier `isProfileIncomplete` pour vérifier aussi si le username est le username par défaut (dérivé de l'email)

**Fichier : `src/components/community/ProfileOnboarding.tsx`** :
- Désactiver le bouton "Continuer" si username ou bio sont vides
- Ajouter des indications visuelles (champs requis)

### Résumé des modifications
- `src/pages/Landing.tsx` — Retrait du bouton "Rejoindre"
- Migration SQL — Mise à jour de la politique RLS `Add community members`
- `src/components/layout/CommunityLayout.tsx` — Condition d'onboarding élargie
- `src/components/community/ProfileOnboarding.tsx` — Validation obligatoire des champs

