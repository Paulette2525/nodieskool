

# Corriger le compteur de membres pour les visiteurs

## Probleme

Dans `CommunityContext.tsx`, quand un visiteur (non-membre) accede a une communaute :
1. La requete sur `communities` echoue (RLS : `is_community_member` requis pour les communautes privees, ou l'utilisateur n'est pas connecte)
2. Le fallback sur `communities_public` fonctionne pour les infos de base
3. **Mais le compteur de membres est force a 0** (ligne 89) car la table `community_members` a une RLS `is_community_member(community_id)` sur SELECT -- un visiteur ne peut pas compter les membres

## Solution

### 1. Migration SQL : fonction `get_community_member_count`
Creer une fonction `SECURITY DEFINER` qui retourne le nombre de membres approuves d'une communaute, accessible a tous (bypass RLS).

```sql
CREATE OR REPLACE FUNCTION public.get_community_member_count(_community_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.community_members
  WHERE community_id = _community_id AND is_approved = true
$$;
```

### 2. `src/contexts/CommunityContext.tsx`
Dans le bloc fallback `communities_public` (lignes 82-94), remplacer `setMemberCount(0)` par un appel RPC a `get_community_member_count` pour obtenir le vrai nombre.

Aussi utiliser cette fonction RPC pour le cas normal (membre connecte) afin d'avoir un comportement uniforme.

| Fichier | Action |
|---------|--------|
| Migration SQL | Creer `get_community_member_count` (SECURITY DEFINER) |
| `src/contexts/CommunityContext.tsx` | Appeler `supabase.rpc('get_community_member_count')` dans le fallback public |

