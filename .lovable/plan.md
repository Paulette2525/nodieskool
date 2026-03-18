

## Plan : Optimisation des performances + Événements + Contact administrateur

### 1. Optimisation des performances

**Problèmes identifiés :**

- **CommunityContext** : fait 4-5 requêtes séquentielles (communauté, owner profile, member count, admin count, user role) à chaque navigation. Ces requêtes doivent être parallélisées.
- **PostCard** : chaque post instancie `usePostLikes` et `usePostBookmark` qui lancent chacun une requête individuelle. Pour 20 posts = 40 requêtes supplémentaires. Il faut batch les likes/bookmarks dans la requête principale.
- **Query invalidation** : `invalidateQueries({ queryKey: ["posts"] })` invalide toutes les variantes (global + par communauté). Affiner les clés.
- **Pas de pagination** : tous les posts sont chargés d'un coup. Ajouter une pagination (limit 20 + load more).

**Changements :**

| Fichier | Modification |
|---------|-------------|
| `src/contexts/CommunityContext.tsx` | Paralléliser les 4 requêtes avec `Promise.all` au lieu de séquentiel |
| `src/hooks/usePosts.ts` | Ajouter `.limit(20)` aux posts, inclure les likes/bookmarks de l'utilisateur dans la requête principale via une sous-requête ou un fetch groupé |
| `src/components/community/PostCard.tsx` | Recevoir `isLiked`/`isBookmarked` en props au lieu de hooks individuels par post |
| `src/pages/community/CommunityFeed.tsx` | Ajouter un bouton "Charger plus" pour la pagination |
| `src/hooks/useBookmarks.ts` | Créer un hook `usePostBookmarks` groupé qui fetch tous les bookmarks de l'utilisateur pour la communauté en une seule requête |

### 2. Fonctionnalité Événements

La table `events` et `event_attendees` existent déjà en base avec les bonnes RLS policies. Il faut créer l'interface.

**Nouveaux fichiers :**

| Fichier | Description |
|---------|-------------|
| `src/hooks/useEvents.ts` | Hook CRUD pour les événements (fetch, create, delete) scoped à `community_id` |
| `src/pages/community/CommunityEvents.tsx` | Page des événements pour les membres : liste des événements à venir et passés |
| `src/components/community/EventCard.tsx` | Carte d'événement (titre, date, type, nombre de participants, bouton inscription) |
| `src/components/community-admin/CommunityAdminEventsTab.tsx` | Onglet admin pour créer/gérer les événements |

**Fichiers modifiés :**

| Fichier | Modification |
|---------|-------------|
| `src/App.tsx` | Ajouter route `/c/:slug/events` |
| `src/components/layout/CommunitySidebar.tsx` | Ajouter lien "Événements" avec icône `Calendar` dans la navigation |
| `src/pages/community/CommunityAdmin.tsx` | Ajouter onglet "Événements" dans l'admin |
| `src/hooks/useCommunityAdmin.ts` | Ajouter query pour les événements de la communauté |

### 3. Contact administrateur

Utiliser le système de conversations/messages existant (`conversations`, `conversation_participants`, `messages` tables avec RLS).

**Nouveaux fichiers :**

| Fichier | Description |
|---------|-------------|
| `src/components/community/ContactAdminButton.tsx` | Bouton "Contacter l'admin" qui crée une conversation avec le owner et redirige vers la messagerie |
| `src/pages/community/CommunityMessages.tsx` | Page de messagerie communautaire : liste des conversations + vue messages |
| `src/hooks/useMessages.ts` | Hook pour créer conversations, envoyer/lire messages |

**Fichiers modifiés :**

| Fichier | Modification |
|---------|-------------|
| `src/App.tsx` | Ajouter route `/c/:slug/messages` |
| `src/components/layout/CommunitySidebar.tsx` | Ajouter lien "Messages" avec icône `MessageSquare` |
| `src/pages/community/CommunityFeed.tsx` ou `CommunitySidebar.tsx` | Ajouter le bouton "Contacter l'admin" visible dans la sidebar |

**Migration DB :** Activer le realtime sur la table `messages` pour les conversations en temps réel.

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

### Résumé des priorités

1. **Performance** (impact immédiat sur la lenteur) — parallélisation des requêtes, pagination, batch des likes/bookmarks
2. **Événements** — nouvelle section avec CRUD admin + vue membre
3. **Contact admin** — messagerie directe utilisant les tables existantes

