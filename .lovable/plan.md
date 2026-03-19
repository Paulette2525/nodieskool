

## Plan : Corriger définitivement l'affichage iPhone/Safari

### Analyse approfondie des causes réelles

Après une investigation complète du code, j'ai identifié **5 causes distinctes** qui provoquent l'écran blanc sur iPhone, dont certaines n'avaient pas été corrigées lors de la dernière tentative :

**Cause 1 (CRITIQUE) : `var(--transparent)` jamais défini**
Le composant `AuroraBackground` utilise `var(--transparent)` dans ses gradients CSS, mais cette variable n'est **définie nulle part** dans `index.css`. Chrome tolère gracieusement cette erreur, mais Safari invalide le gradient entier, ce qui peut casser le rendu de la page Landing complète.

**Cause 2 (CRITIQUE) : `background-attachment: fixed` sur iOS**
L'Aurora utilise `after:[background-attachment:fixed]`. Cette propriété est **explicitement ignorée par iOS Safari** (bug connu depuis des années). Cela provoque un comportement de rendu imprévisible.

**Cause 3 : `conic-gradient(from var(--gradient-angle))` dans ShinyButton**
L'animation `shiny-gradient-angle` tente d'animer `--gradient-angle` de 0 à 360deg via `@keyframes`. Sans `@property` (supprimé correctement), cette animation **ne fait rien** mais le `conic-gradient` avec une variable CSS non-typée peut causer des problèmes de parsing sur Safari < 16.

**Cause 4 : `mix-blend-difference` invalide**
La classe Tailwind utilisée est `mix-blend-difference` qui n'est pas valide. La bonne classe est `mix-blend-mode-difference` ou en CSS arbitraire. Cela peut générer un conflit de rendu.

**Cause 5 : Cache Service Worker bloqué sur iOS**
Même si les corrections sont déployées, les iPhones qui ont visité le site gardent l'ancienne version en cache. Il faut forcer l'invalidation.

### Corrections

**Fichier 1 : `src/index.css`**
- Ajouter `--transparent: transparent;` dans `:root` et `.dark`

**Fichier 2 : `src/components/ui/aurora-background.tsx`**
- Remplacer `var(--transparent)` par `transparent` directement dans les classes
- Supprimer `after:[background-attachment:fixed]`
- Remplacer `mix-blend-difference` par la syntaxe CSS correcte
- Ajouter `transform: translateZ(0)` pour forcer l'accélération GPU sur Safari

**Fichier 3 : `src/components/ui/shiny-button.tsx`**
- Remplacer le `conic-gradient(from var(--gradient-angle), ...)` par un gradient linéaire simple avec rotation via `@keyframes` standard (utiliser `rotate` sur le pseudo-élément au lieu d'animer une variable CSS)
- Supprimer complètement l'animation `shiny-gradient-angle` qui dépend de `@property`

**Fichier 4 : `vite.config.ts`**
- Ajouter `build.target: 'es2015'` pour garantir la compatibilité avec iOS 13+
- Ajouter `css.target: 'safari14'` pour la transpilation CSS

**Fichier 5 : `public/custom-sw.js`**
- Ajouter un listener `activate` avec `caches.keys()` pour supprimer les anciens caches et forcer le rafraîchissement sur iOS

### Résultat attendu
Le site s'affichera correctement sur tous les iPhones (iOS 13+), en Safari web et en mode installé, sans écran blanc ni artéfacts visuels.

