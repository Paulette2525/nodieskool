

## Plan : Déplacer la bannière d'installation vers le Dashboard

### Constat
La bannière est actuellement sur la **Landing page** (`/`), qui est la page publique. L'utilisateur veut qu'elle s'affiche uniquement sur le **Dashboard** (`/dashboard`) — la page connectée qui liste les communautés.

### Modifications (2 fichiers)

1. **`src/pages/Landing.tsx`** — Retirer `<InstallBanner />` et son import
2. **`src/pages/Dashboard.tsx`** — Ajouter `<InstallBanner />` avec son import

La bannière ne s'affichera plus dans les pages communautés (`/c/:slug/*`) ni ailleurs.

