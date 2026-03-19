
Objectif: corriger le vrai crash iPhone et stabiliser aussi la version installée.

Constat principal:
- Le bug le plus probable est dans `src/App.tsx` : `InstallBanner` est monté avant `BrowserRouter`.
- Or `InstallBanner` utilise `Link` de `react-router-dom`.
- Sur iPhone Safari, la bannière devient visible automatiquement, donc ce `Link` est rendu hors du router et peut faire planter toute l’app en écran blanc.
- En mode installé, un second risque reste présent : la stratégie PWA est trop agressive (`registerSW` toutes les 60s + suppression complète des caches dans `public/custom-sw.js`), ce qui peut provoquer un chargement infini ou une app qui ouvre un shell cassé.

Plan d’implémentation :
1. Corriger le crash global iPhone
   - Déplacer `BrowserRouter` au-dessus de `InstallBanner`, ou rendre `InstallBanner` à l’intérieur du router.
   - Vérifier que la bannière iOS peut s’afficher sans faire planter la page.

2. Stabiliser la PWA installée
   - Supprimer la boucle `registration.update()` dans `src/main.tsx`.
   - Retirer la suppression globale de tous les caches dans `public/custom-sw.js`.
   - Garder seulement le nécessaire pour les notifications, sans logique destructive côté cache.

3. Réduire le risque de blanc au premier chargement sur Safari
   - Rendre les routes critiques non lazy dans `src/App.tsx` : `/`, `/auth`, `/dashboard`, `/install`.
   - Laisser le lazy-loading seulement sur les pages secondaires.

4. Corriger un autre point fragile sur la landing
   - Nettoyer les usages invalides où un `Link` entoure `LiquidButton` alors que `LiquidButton` rend déjà un `<a>`.
   - Cela évite un HTML invalide qui peut créer des comportements imprévisibles sur Safari.

5. Vérification finale ciblée
   - Safari web : ouverture du site publié, bannière iPhone, navigation accueil → auth → dashboard.
   - Mode installé : ouverture depuis l’écran d’accueil, fermeture/réouverture, redirection auth, chargement du dashboard.
   - Contrôler qu’il n’y a plus ni écran blanc ni chargement infini.

Détails techniques :
- Fichiers concernés : `src/App.tsx`, `src/components/pwa/InstallBanner.tsx`, `src/main.tsx`, `public/custom-sw.js`, `src/pages/Landing.tsx`.
- Cause la plus claire identifiée : rendu de `Link` hors `BrowserRouter` quand la bannière iPhone s’affiche.
- Cause secondaire probable pour la version installée : conflit de mise à jour/cache PWA sur iOS.

Résultat attendu :
- Safari iPhone n’affiche plus d’écran blanc.
- La version installée ne reste plus bloquée au chargement.
- Les prochaines publications ne recassent plus les iPhones déjà installés.
