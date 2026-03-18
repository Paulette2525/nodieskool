

## Rediriger vers /auth en mode PWA installée

### Contexte

Quand l'app est installée sur mobile (mode standalone), la landing page marketing n'a pas d'utilité — l'utilisateur veut directement se connecter ou accéder à son dashboard.

### Changement

**`src/pages/Landing.tsx`** — Ajouter une redirection au début du composant :

- Détecter le mode standalone (`display-mode: standalone` ou `navigator.standalone`)
- Si standalone ET pas d'utilisateur connecté → `navigate("/auth", { replace: true })`
- Si standalone ET utilisateur connecté → comportement existant (redirect vers dashboard)

Concrètement, modifier le `useEffect` existant qui détecte `isStandalone` (lignes 42-46) pour déclencher la navigation vers `/auth` quand `isStandalone && !user`.

Aucun autre fichier modifié. La page `/install` et la bannière restent inchangées (elles concernent le navigateur web classique).

