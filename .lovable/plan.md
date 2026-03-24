

## Diagnostic : Les mises à jour ne s'affichent pas sur iPhone

### Problème
Sur iOS, la PWA ne recharge pas automatiquement le nouveau contenu. Safari vérifie les mises à jour du Service Worker seulement quand l'app est rouverte depuis l'écran d'accueil, et même avec `skipWaiting: true`, iOS ne force pas toujours le rechargement de la page avec les nouveaux fichiers.

### Cause racine
Dans `src/main.tsx`, le callback `onNeedRefresh()` se contente de loguer un message console. Il ne force jamais le rechargement. Sur Android c'est moins visible car Chrome est plus agressif, mais sur iOS le problème est flagrant.

### Solution
Modifier `src/main.tsx` pour forcer un rechargement automatique quand une nouvelle version est détectée :

```typescript
registerSW({
  onNeedRefresh() {
    // Force reload when new version is available
    window.location.reload();
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
});
```

### Fichier modifie
- `src/main.tsx` -- Remplacer le `console.log` par `window.location.reload()` dans `onNeedRefresh`

### Note importante
Les utilisateurs iPhone devront quand même fermer et rouvrir l'app (swipe up dans le multitache puis relancer) pour que iOS detecte le nouveau Service Worker. C'est une limitation iOS, pas un bug du code. Mais une fois detecte, le reload forcera bien l'affichage de la nouvelle version.

