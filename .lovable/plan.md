

## Diagnostic

### 1. Liens et domaine
Les liens dynamiques (`window.location.origin`) fonctionnent automatiquement avec le nouveau domaine -- pas besoin de les modifier. Par contre, il y a des liens statiques a corriger:
- `index.html`: les meta OG/Twitter pointent vers `https://lovable.dev/opengraph-image-p98pqg.png` -- il faut les remplacer par une image hebergee sur `https://tribbue.com` ou sur le storage du projet.
- `index.html`: ajouter `<meta property="og:url" content="https://tribbue.com" />`.

### 2. Mise a jour qui n'apparait pas sur mobile (PWA)
Le Service Worker cache agressivement les fichiers (`globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"]`). Meme avec `registerType: "autoUpdate"`, le SW ne force pas le rechargement immediatement. Le probleme: l'utilisateur doit fermer TOUTES les instances de l'app et la reouvrir pour que la mise a jour s'applique. Il faut ajouter `skipWaiting: true` et `clientsClaim: true` dans la config workbox pour forcer l'activation immediate du nouveau SW.

### 3. Deconnexion automatique sur mobile (bug critique)
Le client Supabase utilise `storage: localStorage`. C'est correct. Mais le vrai probleme est probablement lie au Service Worker: quand le SW sert une page cachee et que le token JWT a expire entre temps, `autoRefreshToken` tente un refresh mais le SW peut intercepter la requete et servir une reponse cachee. Il faut:
- Exclure les requetes vers Supabase Auth (`/auth/v1/`) du cache du SW via `navigateFallbackDenylist` et `runtimeCaching`.
- Ajouter une strategie `NetworkFirst` pour les appels API dans le SW.
- S'assurer que `detectBrowserNavigation: false` ne bloque pas le refresh de token.

De plus, il faut verifier que le SW ne cache pas les fichiers `.json` (comme les reponses API). Actuellement `globPatterns` ne les inclut pas, ce qui est bon. Mais il manque une exclusion explicite des appels `supabase.co` dans le runtime caching.

### Plan de correction

| # | Fichier | Changement |
|---|---------|------------|
| 1 | `index.html` | Remplacer les URLs OG/Twitter image par une URL sur le domaine Tribbue, ajouter `og:url` |
| 2 | `vite.config.ts` | Ajouter `skipWaiting: true`, `clientsClaim: true` dans la config workbox. Ajouter `runtimeCaching` pour exclure les appels Supabase du cache et les passer en `NetworkOnly` |
| 3 | `public/custom-sw.js` | Aucun changement necessaire (il ne gere que les push notifications) |

Les modifications sont mineures mais critiques: elles resolvent la deconnexion automatique et le non-rafraichissement de l'app mobile.

