

## Plan : Messagerie privée membre → admin

### Concept
Les membres peuvent envoyer un message privé à l'admin/propriétaire de la communauté. L'admin voit une boîte de réception avec tous les messages reçus des membres. Les conversations sont 1-à-1 entre un membre et le propriétaire.

### Changements

| Fichier | Modification |
|---------|-------------|
| **Migration SQL** | Ajouter `community_id` à `conversations`. Activer Realtime sur `messages`. |
| `src/hooks/useCommunityMessages.ts` | **Nouveau** — Hook pour créer/retrouver une conversation avec l'admin, envoyer/recevoir des messages, lister les conversations (côté admin). |
| `src/pages/community/CommunityMessages.tsx` | **Nouveau** — Page inbox admin : liste des conversations avec les membres + zone de chat. Pour les membres : redirige vers la conversation avec l'admin. |
| `src/components/layout/CommunitySidebar.tsx` | Ajouter lien "Messages" (pour l'admin : inbox, pour les membres : conversation directe avec l'admin). |
| `src/App.tsx` | Ajouter route `/c/:slug/messages`. |

### Flux
- **Membre** : clique "Messages" → ouvre directement sa conversation privée avec le propriétaire
- **Admin/Owner** : clique "Messages" → voit la liste de toutes les conversations des membres, peut répondre

