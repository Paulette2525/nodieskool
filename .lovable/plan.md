

## Plan : Renommer la plateforme de "Tribbue" en "Collonie" + nouveau logo

### 1. Remplacer le logo

- Copier `user-uploads://COLLONIE.png` vers `src/assets/collonie-logo.png` et `public/collonie-logo.png`
- Mettre a jour les fichiers PWA (`public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/favicon.ico`) avec le nouveau logo Collonie

### 2. Fichiers a modifier (renommage texte + import logo)

**11 fichiers avec import du logo** -- changer `tribbue-logo` en `collonie-logo` et la variable `tribbueLogoImg` en `collonieLogoImg` :
- `src/pages/Landing.tsx`
- `src/pages/Discover.tsx`
- `src/pages/Install.tsx`
- `src/pages/ResetPassword.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/ForgotPassword.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Pricing.tsx`
- `src/pages/CreateCommunity.tsx`
- `src/pages/Contact.tsx`
- `src/components/pwa/InstallBanner.tsx`

**Autres fichiers avec texte "Tribbue"** :
- `index.html` -- title, meta tags, OG tags (remplacer `Tribbue` par `Collonie`, `tribbue.com` par le domaine actuel)
- `vite.config.ts` -- manifest PWA name/short_name
- `public/custom-sw.js` -- titre notifications, references `tribbue-logo.png` et tag
- `supabase/functions/send-push-notification/index.ts` -- email contact

### 3. Nettoyage
- Supprimer `src/assets/tribbue-logo.png` et `public/tribbue-logo.png` apres migration

### Resume des changements
- ~17 fichiers modifies
- Aucun changement de logique, uniquement du renommage textuel et remplacement d'assets

