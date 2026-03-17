

# Plan : Notifications Push (Web Push via Service Worker)

## Architecture

Les notifications push web nécessitent 3 composants :
1. **Frontend** : Demander la permission, obtenir un token (subscription) via l'API Push du navigateur, et l'envoyer au backend
2. **Backend (table)** : Stocker les subscriptions push par utilisateur
3. **Backend (edge function)** : Envoyer les notifications push via le protocole Web Push quand une nouvelle notification est créée

## Changements

### 1. Table `push_subscriptions`
- Colonnes : `id`, `user_id` (ref profiles), `endpoint`, `p256dh`, `auth`, `created_at`
- RLS : l'utilisateur peut INSERT/DELETE/SELECT ses propres subscriptions
- Contrainte unique sur `(user_id, endpoint)` pour éviter les doublons

### 2. Générer les clés VAPID
- Les notifications push web nécessitent une paire de clés VAPID (Voluntary Application Server Identification)
- La clé publique est stockée dans le code (pas secrète)
- La clé privée est ajoutée comme secret backend (`VAPID_PRIVATE_KEY`)
- Il faudra générer ces clés et les configurer

### 3. Hook `usePushNotifications`
- Vérifie le support du navigateur (`'PushManager' in window`)
- Demande la permission (`Notification.requestPermission()`)
- S'abonne via `registration.pushManager.subscribe()` avec la clé VAPID publique
- Enregistre la subscription dans la table `push_subscriptions`
- Expose `subscribeToPush()`, `unsubscribeFromPush()`, `isSubscribed`, `isSupported`

### 4. Custom Service Worker (`public/custom-sw.js`)
- Écoute l'événement `push` pour afficher les notifications natives
- Écoute `notificationclick` pour ouvrir l'app et naviguer vers le contenu
- Intégré au service worker PWA existant via `importScripts` dans la config VitePWA

### 5. Edge Function `send-push-notification`
- Reçoit `user_id`, `title`, `message`, `url`
- Récupère les subscriptions push de l'utilisateur
- Envoie via le protocole Web Push (bibliothèque `web-push`)
- Appelée par un trigger database quand une notification est insérée

### 6. Trigger database `on_notification_created`
- Se déclenche sur INSERT dans `notifications`
- Appelle la fonction `send-push-notification` via `pg_net` (HTTP POST vers l'edge function)

### 7. Intégration UI
- **Settings.tsx** : Le toggle "Notifications push" existant appelle `subscribeToPush()` / `unsubscribeFromPush()`
- **useNotifications.ts** : Appelle `subscribeToPush()` automatiquement au chargement si l'utilisateur a déjà donné la permission

## Fichiers

| Fichier | Action |
|---------|--------|
| Migration SQL (push_subscriptions + trigger) | Créer |
| `src/hooks/usePushNotifications.ts` | Créer |
| `public/custom-sw.js` | Créer |
| `supabase/functions/send-push-notification/index.ts` | Créer |
| `vite.config.ts` | Modifier (importScripts pour custom SW) |
| `src/pages/Settings.tsx` | Modifier (connecter le toggle push) |
| `src/hooks/useNotifications.ts` | Modifier (auto-subscribe) |

## Prérequis
- Générer une paire de clés VAPID et ajouter la clé privée comme secret backend
- Activer `pg_net` pour appeler l'edge function depuis le trigger (ou utiliser un appel direct depuis le realtime listener côté client comme fallback)

