

## Afficher "Connexion" par défaut sur la page d'authentification

### Problème
La page Auth affiche l'onglet "Créer un compte" quand un redirect URL est présent (`hasRedirectUrl() ? "signup" : "login"`). Certains utilisateurs arrivant sur `/auth` voient donc "Créer un compte" au lieu de "Connexion".

### Changement

**`src/pages/Auth.tsx`** (ligne 20) :
- Changer le `defaultTab` pour qu'il soit toujours `"login"`, indépendamment de `hasRedirectUrl()`
- Garder le message informatif (ligne 179) quand un redirect URL est présent, mais sans forcer l'onglet signup

Un seul changement d'une ligne.

