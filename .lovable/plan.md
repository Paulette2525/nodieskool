

# Activer les notifications push sans blocage de permissions

## Problème

Quand l'utilisateur active les notifications push, si le navigateur refuse la permission (ou si l'API Push n'est pas supportée), le message d'erreur "Impossible d'activer les notifications push. Vérifiez les permissions de votre navigateur" s'affiche sans solution. L'utilisateur est bloqué.

## Solution

Modifier le flux pour que :
1. Si le navigateur supporte les push ET que la permission est accordée → activer les push normalement
2. Si la permission est refusée ou l'API non supportée → sauvegarder quand même la préférence en base de données et informer l'utilisateur que les notifications in-app resteront actives
3. Ne plus bloquer complètement l'activation

## Modifications

| Fichier | Action |
|---------|--------|
| `src/hooks/usePushNotifications.ts` | Modifier `subscribeToPush` : si permission refusée, sauvegarder la préférence push en DB (table `profiles` ou nouvelle colonne) et retourner `"fallback"` au lieu de `false`. Ne plus retourner `false` quand `!isSupported`. |
| `src/pages/Settings.tsx` | Adapter `handleTogglePush` : gérer le cas `"fallback"` avec un toast info ("Notifications in-app activées. Pour les notifications push, autorisez-les dans les paramètres de votre navigateur.") au lieu du message d'erreur bloquant |

## Détail technique

### `usePushNotifications.ts`
- `subscribeToPush` retourne `true | "fallback" | false`
- Si `!isSupported` ou permission `"denied"` : sauvegarder la préférence dans le profil utilisateur via `supabase.from("profiles").update({ push_notifications_enabled: true })` et retourner `"fallback"`
- Le toggle reste activé visuellement dans tous les cas

### `Settings.tsx`
- Si résultat = `true` → toast success "Notifications push activées"
- Si résultat = `"fallback"` → toast info "Notifications in-app activées. Autorisez les notifications dans les paramètres de votre navigateur pour recevoir les push."
- Si résultat = `false` → toast error (cas technique imprévu uniquement)

### Migration DB
- Ajouter colonne `push_notifications_enabled boolean default false` à la table `profiles`

