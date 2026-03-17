

# Déplacer la bannière d'installation PWA en haut

## Changement

**`src/components/pwa/InstallBanner.tsx`** :
- Remplacer `fixed bottom-0` par `fixed top-0`
- Remplacer `slide-in-from-bottom` par `slide-in-from-top`
- Remplacer `mb-3` par `mt-3` sur le conteneur intérieur
- Retirer `safe-area-bottom` et ajouter `safe-area-top` si nécessaire

