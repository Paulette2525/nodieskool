

## Diagnostic

La capture d'écran montre la **page de connexion de lovable.dev** (pas de Tribbue) qui s'ouvre dans Chrome sur iPhone. Cela signifie que le lien partagé pointe vers une URL Lovable (preview ou lovable.app) qui nécessite une authentification Lovable, et non vers le domaine personnalisé **tribbue.com**.

Il y a **deux problèmes distincts** :

### Problème 1 : Mauvaise URL partagée
Les liens envoyés aux utilisateurs pointent probablement vers `nodieskool.lovable.app/c/...` ou une URL preview, au lieu de `tribbue.com/c/...`. Les URLs lovable.app peuvent demander une authentification Lovable — d'où l'écran lovable.dev.

**Solution** : Toujours partager les liens via `https://tribbue.com/c/nom-communaute/community`. Ce n'est pas un changement de code mais d'usage.

### Problème 2 : Chrome sur iOS ≠ Safari → localStorage non partagé
Quand un utilisateur a Chrome comme navigateur par défaut sur iPhone, les liens WhatsApp s'ouvrent dans Chrome. Mais la PWA installée depuis Safari a son propre localStorage séparé. Le système SmartRedirect actuel ne fonctionne donc pas avec Chrome.

**Solution technique** : Améliorer SmartRedirect pour détecter **tous les navigateurs iOS** (pas seulement Safari) et adapter le message :
- **Safari** → message actuel "Ouvrez depuis l'écran d'accueil" (localStorage partagé, redirection automatique possible)
- **Chrome/Firefox/autre** → message différent expliquant d'**ouvrir Safari** d'abord, puis l'app depuis l'écran d'accueil, car Chrome ne peut pas communiquer avec la PWA

### Fichier à modifier

**`src/components/pwa/SmartRedirect.tsx`** :
- Renommer `isIOSBrowser()` en une détection plus fine qui distingue Safari des autres navigateurs
- Ajouter une fonction `isIOSChrome()` / `isIOSNonSafari()`
- Si l'utilisateur est sur Chrome iOS : afficher un message spécifique "Ouvrez ce lien dans Safari pour accéder à l'application Tribbue" avec un bouton pour copier l'URL
- Si l'utilisateur est sur Safari iOS : garder le comportement actuel (sauvegarder l'URL + afficher "Ouvrez depuis l'écran d'accueil")
- Retirer la condition `wasPwaInstalled()` pour les utilisateurs Chrome (on ne peut pas savoir si la PWA est installée depuis Chrome), et montrer le message à **tous les utilisateurs iOS non-standalone** qui arrivent sur une page communauté

### Flux résultant

```text
Utilisateur iPhone + Chrome :
1. Clique lien WhatsApp → Chrome s'ouvre
2. Écran : "Pour une meilleure expérience, ouvrez ce lien dans Safari"
   + Bouton "Copier le lien" 
   + Bouton "Continuer sur le navigateur"

Utilisateur iPhone + Safari :
1. Clique lien WhatsApp → Safari s'ouvre
2. Écran : "Ouvrez Tribbue depuis votre écran d'accueil"
   + URL sauvegardée automatiquement
3. Ouvre la PWA → redirection automatique
```

### Action immédiate (pas de code)
Vérifier que les liens communauté partagés utilisent bien `https://tribbue.com/c/...` et non `nodieskool.lovable.app/c/...`.

