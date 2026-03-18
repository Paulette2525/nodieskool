

## Plan : Corriger le bouton "Contacter l'admin", rendre l'onboarding obligatoire

### 3 problèmes identifiés

1. **Bouton "Contacter l'admin" : erreur 403** — Le `useMessages` hook utilise `profile.id` (l'id de la table profiles) au lieu de `profile.user_id` pour chercher dans `conversation_participants.user_id`. De plus, `community.owner_id` est un `profile.id` mais `conversation_participants.user_id` attend aussi un profile id — il faut vérifier la cohérence. Le vrai problème est que la RLS sur `conversations` exige `auth.uid() IS NOT NULL` mais le INSERT échoue quand même (403). En regardant les logs réseau, l'utilisateur est bien authentifié. Le problème est probablement que la policy `INSERT` sur `conversations` utilise `auth.uid() IS NOT NULL` mais le rôle est `public` au lieu de `authenticated`. Il faut changer la policy pour le rôle `authenticated`.

   **Correction :** Mettre à jour la RLS policy de la table `conversations` pour que le INSERT soit pour le rôle `authenticated` au lieu de `public`.

2. **Onboarding profil : retirer le bouton "Passer"** — Rendre la complétion du profil obligatoire en supprimant le bouton "Passer pour l'instant", le `hasSkippedOnboarding()`, et le state `skipped` dans `CommunityLayout`.

3. **Onboarding pour les admins aussi** — Actuellement l'onboarding vérifie `isMember` mais les owners/admins sont aussi membres. Le check `isProfileIncomplete` s'applique déjà à tous les membres y compris les admins. Il faut juste retirer la possibilité de skip.

### Changements

| Fichier | Modification |
|---------|-------------|
| `src/components/community/ProfileOnboarding.tsx` | Supprimer le bouton "Passer", supprimer `handleSkip`, supprimer `SKIP_KEY` et `hasSkippedOnboarding` |
| `src/components/layout/CommunityLayout.tsx` | Retirer l'import `hasSkippedOnboarding`, le state `skipped`, le useEffect, simplifier la condition en `isMember && isProfileIncomplete(profile)` |
| `src/hooks/useMessages.ts` | Corriger les comparaisons d'ID (vérifier que `profile.id` vs `profile.user_id` sont utilisés correctement) |
| **Migration SQL** | Mettre à jour la RLS policy INSERT sur `conversations` pour le rôle `authenticated` |

