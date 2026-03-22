

## Plan : Limiter la bannière d'installation à la Landing page

### Problème
La bannière d'installation PWA (`InstallBanner`) est placée dans `App.tsx` au niveau racine, donc elle s'affiche sur toutes les pages.

### Solution
1. **Retirer `<InstallBanner />` de `src/App.tsx`** (supprimer l'import et le composant)
2. **Ajouter `<InstallBanner />` dans `src/pages/Landing.tsx`** uniquement

Changement minimal — 2 fichiers modifiés.

