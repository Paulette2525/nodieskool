

## Plan : Corriger l'affichage sur iPhone/Safari

### Problèmes identifiés

Plusieurs éléments du code ne sont pas compatibles avec Safari iOS, ce qui peut provoquer un écran blanc :

**1. `@property` CSS dans ShinyButton (cause la plus probable)**
Le composant `ShinyButton` utilise `@property` pour déclarer des propriétés CSS custom typées (`--gradient-angle`, etc.) ainsi que `animation-composition: add`. Ces deux fonctionnalités ne sont **pas supportées sur Safari iOS < 16.4**. Sur les appareils plus anciens, cela peut casser le rendu CSS global et provoquer un écran blanc.

**2. Boucle de rechargement infini du Service Worker**
Dans `main.tsx`, `onNeedRefresh()` appelle `window.location.reload()`. Sur iOS, si le SW détecte constamment une nouvelle version (comportement connu sur Safari), cela peut créer une boucle de rechargement infinie.

**3. AuroraBackground `h-[100vh]`**
La classe par défaut `h-[100vh]` dans le composant Aurora est problématique sur iOS Safari où `100vh` inclut la barre d'adresse. Bien que surchargée par `h-auto`, le `<main>` wrapper peut poser des conflits sémantiques.

### Corrections prévues

**Fichier 1 : `src/components/ui/shiny-button.tsx`**
- Remplacer les `@property` par des fallbacks CSS standards (variables CSS classiques avec valeurs par défaut)
- Supprimer `animation-composition: add` et simplifier les animations pour être compatibles Safari
- Utiliser des `@keyframes` standards au lieu de propriétés CSS typées

**Fichier 2 : `src/main.tsx`**
- Remplacer le rechargement automatique par une confirmation utilisateur ou un simple log
- Empêcher la boucle infinie sur iOS

**Fichier 3 : `src/components/ui/aurora-background.tsx`**
- Remplacer `h-[100vh]` par `min-h-dvh` avec fallback `min-h-screen`
- Remplacer `<main>` par `<div>` pour éviter les conflits de structure HTML
- Ajouter des préfixes webkit pour `backdrop-filter` et `mix-blend-mode`

### Détails techniques
- Aucune migration DB nécessaire
- Aucune dépendance à installer
- Les corrections ciblent Safari iOS 14+ (large couverture des iPhones en circulation)

