

# Plan : Transformer NodieSkool en PWA (Application Web Installable)

## Résumé
Configurer l'application comme une Progressive Web App installable depuis le navigateur, avec icônes, manifest, service worker et meta tags mobile optimisés.

## Changements

### 1. Installer `vite-plugin-pwa`
Ajouter la dépendance `vite-plugin-pwa` au projet.

### 2. Configurer `vite.config.ts`
- Importer et ajouter `VitePWA` au tableau de plugins
- Configurer le manifest (nom: "NodieSkool", couleurs, icônes)
- Ajouter `navigateFallbackDenylist: [/^\/~oauth/]` pour ne pas cacher les redirections OAuth
- Mode `generateSW` avec cache des assets statiques

### 3. Mettre à jour `index.html`
- Ajouter les meta tags mobile : `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `theme-color`
- Ajouter les liens `apple-touch-icon`
- Mettre à jour le titre en "NodieSkool"

### 4. Créer les icônes PWA
- `public/pwa-192x192.png` et `public/pwa-512x512.png` (générées à partir du logo existant ou placeholder)
- `public/apple-touch-icon-180x180.png`

### 5. Créer une page `/install`
- Page dédiée qui guide l'utilisateur pour installer l'app
- Détecte si l'app est déjà installée
- Déclenche le prompt d'installation natif sur Android/Chrome
- Affiche les instructions manuelles pour iOS (Partager → Ajouter à l'écran d'accueil)

### 6. Ajouter la route `/install` dans `App.tsx`

## Fichiers modifiés
| Fichier | Action |
|---------|--------|
| `package.json` | Ajout `vite-plugin-pwa` |
| `vite.config.ts` | Configuration PWA |
| `index.html` | Meta tags mobile + titre |
| `src/pages/Install.tsx` | Nouvelle page d'installation |
| `src/App.tsx` | Ajout route `/install` |

## Fichiers créés
| Fichier | Description |
|---------|-------------|
| `public/pwa-192x192.png` | Icône PWA 192x192 |
| `public/pwa-512x512.png` | Icône PWA 512x512 |

## Résultat
L'app sera installable sur mobile via le navigateur. Les utilisateurs pourront l'ajouter à leur écran d'accueil et l'utiliser comme une app native, avec chargement hors-ligne des pages déjà visitées.

