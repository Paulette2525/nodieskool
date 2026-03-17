

# Remplacer toutes les icônes PWA par le logo Tribbue

## Plan

Copier `public/tribbue-logo.png` vers `public/pwa-192x192.png` et `public/pwa-512x512.png` (écrasement), puis mettre à jour toutes les références restantes pour pointer vers `/tribbue-logo.png` de manière cohérente.

### Fichiers à modifier

| Fichier | Action |
|---------|--------|
| `index.html` | Lignes 15 et 27 : remplacer `/pwa-192x192.png` par `/tribbue-logo.png` (favicon + apple-touch-icon) |
| `vite.config.ts` | Lignes 39, 44, 49 : remplacer les `src` des icônes manifest par `/tribbue-logo.png` |
| `public/custom-sw.js` | Lignes 3, 16, 17 : remplacer `/pwa-192x192.png` par `/tribbue-logo.png` |
| `src/pages/Install.tsx` | Ligne 74 : importer `tribbueLogoImg` depuis `@/assets/tribbue-logo.png` et l'utiliser à la place de `/pwa-192x192.png` |

Cela garantit que le favicon, l'icône d'app installée, l'apple-touch-icon, les notifications push et la page d'installation utilisent tous le logo Tribbue.

