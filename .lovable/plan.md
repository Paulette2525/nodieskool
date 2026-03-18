

## Plan : Supprimer "Contacter l'admin" et afficher le lien meeting pour tous les membres

### 1. Supprimer le bouton "Contacter l'admin"

| Fichier | Modification |
|---------|-------------|
| `src/components/layout/CommunitySidebar.tsx` | Supprimer l'import `ContactAdminButton`, supprimer le bloc lignes 84-90 (section contact admin + separator) |
| `src/components/community/ContactAdminButton.tsx` | Supprimer le fichier |
| `src/hooks/useMessages.ts` | Supprimer le fichier (ne contient plus que `useContactAdmin` qui n'est plus utilisé) |

### 2. Afficher le lien meeting pour tous les membres inscrits

Actuellement dans `EventCard.tsx`, le lien "Rejoindre" n'est visible que si `isRegistered && !isPast`. Le problème est que seuls les inscrits voient le lien.

**Modification :** Changer la condition ligne 66 de `event.meeting_url && isRegistered && !isPast` en `event.meeting_url && !isPast` pour que tous les membres puissent voir le lien de l'événement, pas seulement ceux qui se sont inscrits.

