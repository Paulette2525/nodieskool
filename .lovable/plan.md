

## Probleme

La page d'accueil (`/`) ne redirige pas les utilisateurs connectes vers `/dashboard`. La redirection ne se declenche que si le flag `oauth_pending` est present dans `localStorage` (cas OAuth uniquement). Quand un utilisateur revient sur l'app mobile apres s'etre connecte, il atterrit sur la landing page marketing au lieu du dashboard.

## Solution

Modifier le `useEffect` dans `Landing.tsx` pour rediriger **tout utilisateur connecte** vers le dashboard, pas seulement ceux avec `oauth_pending`.

### Changement unique

**`src/pages/Landing.tsx`** — Remplacer le useEffect actuel (lignes 43-49) :

```typescript
useEffect(() => {
  if (user) {
    // If OAuth pending, clear the flag
    if (localStorage.getItem('oauth_pending')) {
      localStorage.removeItem('oauth_pending');
    }
    const redirectUrl = getAndClearRedirectUrl();
    navigate(redirectUrl || "/dashboard", { replace: true });
  }
}, [user, navigate]);
```

C'est le seul changement necessaire. Tout utilisateur authentifie arrivant sur `/` sera automatiquement redirige vers son dashboard.

