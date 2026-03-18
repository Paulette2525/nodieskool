
Objectif: corriger la messagerie privée membre → administrateur car aujourd’hui aucun message n’est réellement créé ni visible.

Diagnostic
- Les tables `conversations`, `conversation_participants` et `messages` sont vides pour la communauté concernée: le flux casse avant même l’envoi du premier message.
- Le point le plus probable est dans `getOrCreateConversation()`:
  - le code fait `insert(...).select().single()` sur `conversations`
  - or la policy `SELECT` sur `conversations` n’autorise la lecture qu’aux participants
  - au moment exact de l’insert, aucun participant n’a encore été ajouté
  - résultat: la conversation n’est pas récupérable côté client, donc l’ajout des participants ne se fait pas, donc `activeConversationId` reste nul.
- Ensuite, `handleSend()` vide quand même le champ, mais `sendMessage()` sort immédiatement si `activeConversationId` est nul. Pour l’utilisateur, le message “semble envoyé” alors qu’aucune ligne n’est insérée.
- Problème secondaire: `fetchMessages()` tente de marquer comme lus les messages reçus, mais la policy actuelle de `messages` n’autorise que l’auteur à faire un `UPDATE`. Donc les accusés de lecture / non-lus sont aussi cassés.

Plan de correction
1. Remplacer la création client-side de conversation par une fonction backend atomique
- Créer une fonction SQL sécurisée du type `get_or_create_admin_conversation(_community_id uuid)`.
- Cette fonction devra:
  - vérifier que l’utilisateur courant est bien membre de la communauté
  - récupérer le propriétaire de la communauté
  - retrouver une conversation existante entre ce membre et ce propriétaire dans cette communauté
  - sinon créer la conversation + insérer les 2 participants dans la même opération
  - retourner l’`id` de la conversation
- Avantage: on évite le problème RLS du `insert().select()` et on garantit une conversation cohérente.

2. Corriger les règles d’accès de la messagerie
- Restreindre la création de conversations au flux membre→owner de la communauté, au lieu des policies très larges actuelles.
- Ajouter/ajuster la possibilité pour un destinataire de marquer comme lu un message reçu.
- Vérifier que l’owner peut voir toutes les conversations où il est participant, et que les membres ne voient que leur propre conversation.

3. Adapter `useCommunityMessages`
- Remplacer la logique actuelle de `getOrCreateConversation()` par un appel RPC à la nouvelle fonction backend.
- Ajouter une vraie gestion d’erreurs sur:
  - récupération/création de conversation
  - chargement des messages
  - envoi d’un message
- Après envoi réussi:
  - soit ajouter le message localement de façon optimiste
  - soit relancer `fetchMessages(activeConversationId)`
  - puis rafraîchir la liste des conversations côté admin pour afficher le dernier message.

4. Sécuriser l’UI pour éviter les faux envois
- Dans `CommunityMessages.tsx`, désactiver le champ et le bouton “Envoyer” tant que la conversation n’est pas prête.
- Afficher un état clair:
  - “Initialisation de la conversation…”
  - ou “Impossible de démarrer la conversation”
- Ne plus vider le champ si l’envoi a échoué.

5. Vérifier la réception côté admin
- S’assurer que la boîte de réception admin recharge les conversations après création du premier message.
- Garder le filtre Realtime par `conversation_id` pour le chat actif, puis ajouter au besoin un rafraîchissement de la liste des conversations afin que le propriétaire voie immédiatement le nouveau fil.

Fichiers à modifier
- `src/hooks/useCommunityMessages.ts`
- `src/pages/community/CommunityMessages.tsx`
- nouvelle migration SQL dans `supabase/migrations/...`

Détail technique
- Le bug n’est pas dans l’affichage du composant de chat lui-même.
- Le vrai blocage est en amont: aucune conversation valide n’est créée, donc aucun `conversation_id` exploitable n’existe au moment de l’insert dans `messages`.
- Le correctif le plus robuste est une fonction backend “get or create” plutôt qu’une chaîne de requêtes client séparées soumises aux policies RLS.
