

# Quand et chez qui les notifications push se déclenchent

## Chaîne de déclenchement

```text
Action utilisateur
  → Trigger DB (notify_post_like / notify_post_comment)
    → create_notification() insère dans table `notifications`
      → Trigger DB (trigger_push_notification)
        → Edge Function send-push-notification
          → Push natif sur le téléphone/navigateur
```

## Notifications actuellement implémentées

| Événement | Destinataire | Condition |
|-----------|-------------|-----------|
| **Like sur un post** | L'auteur du post | Seulement si le likeur ≠ l'auteur (on ne se notifie pas soi-même) |
| **Commentaire sur un post** | L'auteur du post | Seulement si le commentateur ≠ l'auteur |
| **Certificat obtenu** | L'utilisateur qui reçoit le certificat | Via l'edge function `generate-certificate` |

## Qui reçoit la notification push native ?

Seuls les utilisateurs qui ont :
1. Activé les notifications push dans les **Paramètres** (toggle)
2. Accepté la permission du navigateur
3. Au moins une subscription enregistrée dans la table `push_subscriptions`

Les autres utilisateurs voient les notifications uniquement **dans l'app** (cloche), pas en push natif.

## Ce qui n'est PAS couvert actuellement

- Nouveau message privé (conversations)
- Nouvel événement dans une communauté
- Nouveau cours publié
- Nouveau membre rejoint la communauté
- Réponse à un commentaire (notification au commentaire parent)
- Mention d'un utilisateur dans un post/commentaire

## Aucun changement de code n'est nécessaire

C'est une réponse informative. Si tu veux ajouter des notifications pour d'autres événements, dis-le moi.

