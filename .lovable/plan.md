

# Ajouter 3 nouveaux types de notifications

## Nouveaux triggers DB

Les 3 notifications suivent le même pattern que `notify_post_like` et `notify_post_comment` déjà en place : un trigger AFTER INSERT qui appelle `create_notification()`, ce qui déclenche automatiquement le push via `trigger_push_notification`.

### 1. Nouvelle publication dans une communauté
- **Trigger** `notify_new_community_post` sur `posts` AFTER INSERT
- Quand un post est créé avec un `community_id` non null, notifier tous les membres de cette communauté (sauf l'auteur)
- Titre : "Nouvelle publication"
- Message : "{nom_auteur} a publié dans {nom_communauté}"

### 2. Nouveau cours publié
- **Trigger** `notify_course_published` sur `courses` AFTER UPDATE
- Se déclenche quand `is_published` passe de `false` à `true` et que `community_id` est non null
- Notifie tous les membres de la communauté
- Titre : "Nouveau cours disponible"
- Message : "{titre_cours} est maintenant disponible dans {nom_communauté}"

### 3. Réponse à un commentaire
- **Trigger** `notify_comment_reply` sur `post_comments` AFTER INSERT
- Se déclenche quand `parent_id` est non null
- Notifie l'auteur du commentaire parent (sauf si c'est le même utilisateur)
- Titre : "Nouvelle réponse"
- Message : "{nom_répondeur} a répondu à votre commentaire"

## Migration SQL unique

Une seule migration contenant les 3 fonctions et leurs triggers associés. Pas de changement de schéma de table.

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| Migration SQL (3 triggers) | Créer |

Aucun changement de code frontend nécessaire : les notifications apparaîtront automatiquement dans la cloche et en push grâce au système existant.

