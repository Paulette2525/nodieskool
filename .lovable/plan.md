

# Permettre aux administrateurs d'épingler des publications

## Probleme actuel

Le `PostCard` utilise `useAuth().isAdmin` qui ne verifie que le role **global** (table `user_roles`). Les administrateurs de communaute (owner/admin dans `community_members`) ne peuvent pas epingler ni gerer les posts dans leur communaute.

## Correction

Ajouter une prop `isCommunityAdmin` au `PostCard` pour que le contexte parent (community feed ou global feed) puisse indiquer si l'utilisateur courant a les droits d'administration.

### Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/components/community/PostCard.tsx` | Ajouter prop `isCommunityAdmin`, l'utiliser dans `canManage` |
| `src/pages/community/CommunityFeed.tsx` | Passer `isCommunityAdmin` depuis `useCommunityContext()` |
| `src/pages/Community.tsx` | Passer `isCommunityAdmin={false}` (feed global) |

### Detail

**PostCard.tsx** :
- Nouvelle prop optionnelle : `isCommunityAdmin?: boolean`
- `canManage` devient : `isAdmin || isCommunityAdmin`
- Les actions epingler/supprimer sont visibles pour les admins globaux ET les admins de communaute

**CommunityFeed.tsx** :
- Importer `useCommunityContext` et recuperer `isAdmin` (community admin)
- Passer `isCommunityAdmin={isAdmin}` a chaque `PostCard`

**Community.tsx** :
- Passer `isCommunityAdmin={false}` (pas de contexte communautaire)

