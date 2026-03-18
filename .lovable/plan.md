

## Diagnostic

Le probleme est identifie : l'application mobile installee (PWA) ne recoit pas les mises a jour malgre `skipWaiting: true` et `clientsClaim: true` dans la config Workbox.

### Pourquoi ca ne marche pas

1. **Pas de detection active des mises a jour** : Le code actuel (`main.tsx`) ne contient aucun appel a `registerSW` depuis `virtual:pwa-register`. Le plugin injecte un script basique dans le HTML, mais il ne force pas de verification proactive. Sur mobile, le navigateur ne verifie les mises a jour du Service Worker que passivement (parfois toutes les 24h), donc les utilisateurs peuvent rester bloques sur une ancienne version pendant des jours.

2. **Pas de mecanisme de rechargement** : Meme quand un nouveau SW est detecte et active (grace a `skipWaiting`), la page n'est jamais rechargee automatiquement. L'utilisateur voit donc toujours l'ancien code en cache.

3. **Publication necessaire** : Les changements frontend ne sont pas en production tant que vous n'avez pas clique sur "Update" dans le dialogue de publication. Il faut verifier que c'est bien fait.

### Plan de correction

| # | Fichier | Changement |
|---|---------|------------|
| 1 | `src/main.tsx` | Importer `registerSW` depuis `virtual:pwa-register` et configurer une verification periodique (toutes les 60 secondes). Quand un nouveau SW est pret, forcer un `window.location.reload()` automatique |
| 2 | `src/vite-env.d.ts` | Ajouter la declaration de type pour le module `virtual:pwa-register` |
| 3 | `vite.config.ts` | Aucun changement necessaire — la config existante est correcte |

### Changement principal dans `main.tsx`

```typescript
import { registerSW } from 'virtual:pwa-register';

// Check for updates every 60 seconds and auto-reload when a new version is ready
registerSW({
  onNeedRefresh() {
    // New content available — reload immediately
    window.location.reload();
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
  // Check for SW updates every 60 seconds
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      setInterval(() => { registration.update(); }, 60 * 1000);
    }
  },
});
```

### Resultat attendu

- L'app mobile verifiera activement les mises a jour toutes les 60 secondes
- Des qu'une nouvelle version est detectee, la page se recharge automatiquement
- Plus besoin de fermer/rouvrir l'app pour voir les changements

### Action manuelle requise

Apres implementation, vous devez **cliquer sur "Update"** dans le dialogue de publication pour que les changements soient deployes en production sur `tribbue.com`. Les changements frontend ne sont jamais deployes automatiquement.

