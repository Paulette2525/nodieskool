

## Plan : Suppression Messages, réorganisation sidebar, mention @username dans les réponses

### 1. Supprimer la fonctionnalité "Messages"

| Fichier | Modification |
|---------|-------------|
| `src/App.tsx` | Supprimer l'import `CommunityMessages` et la route `/c/:slug/messages` |
| `src/components/layout/CommunitySidebar.tsx` | Retirer "Messages" de la navigation et l'import `MessageSquare` |
| `src/pages/community/CommunityMessages.tsx` | Supprimer le fichier |
| `src/hooks/useMessages.ts` | Conserver uniquement `useContactAdmin` (supprimer `useConversations` et `useMessagesForConversation`) |

### 2. Meilleure présentation du bouton "Contacter l'admin"

Transformer le `ContactAdminButton` en un bouton plus visible, positionné dans la section navigation de la sidebar (après les liens principaux), avec un style distinct (outline ou accent) au lieu d'être perdu dans la zone utilisateur en bas. Le bouton ouvrira directement un lien `mailto:` ou un dialog de contact simple au lieu de rediriger vers une page messages.

**Changement :** Déplacer `<ContactAdminButton />` de la zone "User" (ligne 100) vers la zone "Nav" (après les liens de navigation, ligne 83), et lui donner un style plus visible (variant outline, couleur primary).

### 3. Réorganiser les options en bas de la sidebar

Actuellement : profil, contacter admin, dashboard, paramètres, déconnexion — tout empilé de manière plate.

**Nouvelle disposition :**
- **Profil utilisateur** : avatar + nom (lien vers /profile)
- **Séparateur visuel**
- **Actions** : Dashboard et Paramètres groupés horizontalement ou avec des icônes plus claires
- **Déconnexion** : en dernier, séparé visuellement

### 4. Mention @username dans les réponses aux commentaires

Quand un utilisateur répond à un commentaire, préfixer automatiquement `@username` au contenu de la réponse.

| Fichier | Modification |
|---------|-------------|
| `src/components/community/CommentItem.tsx` | Dans `handleSubmitReply`, préfixer le contenu avec `@{comment.profiles.username} ` avant d'envoyer |
| `src/components/community/CommentItem.tsx` | Pré-remplir le textarea de réponse avec `@{comment.profiles.username} ` quand on clique "Répondre" |
| `src/components/community/CommentItem.tsx` | Dans l'affichage du contenu, détecter les `@username` en début de message et les rendre en gras/couleur primary avec un `<span>` stylisé |

