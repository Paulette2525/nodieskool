

# Bannière d'installation PWA en bas sur mobile

## Changement

Modifier `src/components/pwa/InstallBanner.tsx` pour positionner la bannière en bas de l'écran sur mobile (< 768px) au lieu du haut :

- Remplacer `fixed top-0` par `fixed bottom-0` sur mobile, garder `top-0` sur desktop
- Changer l'animation de `slide-in-from-top` à `slide-in-from-bottom` sur mobile
- Ajuster les marges (`mb-3` au lieu de `mt-3`, `safe-area-bottom` au lieu de `safe-area-top`)

## Fichier modifié

| Fichier | Action |
|---------|--------|
| `src/components/pwa/InstallBanner.tsx` | Positionner en bas sur mobile |

