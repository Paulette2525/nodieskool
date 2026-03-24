

## Diagnostic : La bannière d'installation ne s'affiche plus

### Cause racine
L'événement `beforeinstallprompt` est déclenché par le navigateur **une seule fois** au chargement de la page. Or, le composant `InstallBanner` n'écoute cet événement que lorsque `pathname === "/dashboard"`. Si l'utilisateur arrive sur une autre page d'abord (ex: `/auth`, `/`), l'événement se déclenche, personne ne l'écoute, et il est perdu. Quand l'utilisateur navigue ensuite vers `/dashboard`, l'événement ne se redéclenche pas.

Sur iOS/Safari, le problème est différent : la vérification du `localStorage` (`pwa_banner_dismissed_at`) peut empêcher l'affichage si l'utilisateur a cliqué "X" dans les 3 derniers jours.

### Solution
Refactoriser `InstallBanner` pour :

1. **Écouter `beforeinstallprompt` dès le montage**, indépendamment de la route
2. **Conditionner uniquement l'affichage** (le `return null`) sur `pathname === "/dashboard"`
3. Séparer la logique en deux `useEffect` : un pour capturer l'événement (permanent), un pour gérer la visibilité (dépend de la route)

### Fichier modifié
- `src/components/pwa/InstallBanner.tsx`

### Détail technique
```text
useEffect 1 (sans dépendance de route) :
  - Écouter beforeinstallprompt → stocker dans state
  - Détecter iOS → stocker dans state

useEffect 2 (dépend de pathname, deferredPrompt, isIOS) :
  - Si pathname === "/dashboard" ET pas standalone ET pas dismissed :
    → setVisible(true)
  - Sinon : setVisible(false)

Rendu :
  - if (!visible) return null  (plus besoin du double check pathname)
```

