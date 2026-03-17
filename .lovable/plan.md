
Objectif
- Faire en sorte que l’URL publiée `https://nodieskool.lovable.app/admin` affiche toujours l’écran PIN (5 chiffres) et ne redirige plus vers `/auth`.

Constat (important)
- Dans l’environnement Preview/Test, `/admin` affiche bien l’écran PIN (je l’ai vérifié).
- Sur l’URL publiée, `/admin` affiche encore la page d’authentification. Ça indique presque toujours que la version publiée n’embarque pas les derniers changements (ou qu’un cache/service worker sert un ancien bundle).

Plan d’action (définitif, avec preuves à chaque étape)

1) Vérifier si la production embarque bien la nouvelle version
- Télécharger la page publiée `/admin` et ses assets JS (bundle).
- Rechercher dans le bundle publié des signatures de la nouvelle implémentation :
  - la chaîne `AdminPinEntry`
  - la chaîne `verify-admin-code`
  - la chaîne `admin_unlocked`
- Interprétation :
  - Si ces chaînes n’existent pas dans les assets publiés, la prod tourne sur un ancien build → il faut publier.
  - Si elles existent, la prod a le code mais quelque chose force quand même la navigation vers `/auth` → on passe à l’étape 3.

2) Publier la version actuelle (si la prod est en retard)
- Déclencher la publication de la version Test actuelle vers l’URL publiée.
- Après publication, retester `https://nodieskool.lovable.app/admin` :
  - en navigation normale
  - et en “hard refresh” (Ctrl+Shift+R) / fenêtre privée
- Résultat attendu : l’écran PIN s’affiche, identique au Preview.

3) Si la prod a bien le code mais redirige encore : identifier qui déclenche `/auth`
On va isoler la source exacte de la redirection côté client, en instrumentant légèrement (sans changer la logique fonctionnelle) :

3.1) Ajout d’un marquage visible de version (anti-ambiguïté)
- Dans `src/pages/Admin.tsx`, afficher temporairement un petit label “Admin build: <timestamp/commit>” sur l’écran PIN.
- But : prouver visuellement que la prod sert la bonne version, sans dépendre du cache.

3.2) Logs ciblés (temporairement) pour capturer la redirection
- Ajouter des `console.log()` au tout début du composant Admin (montage) :
  - `location.href`
  - valeur de `sessionStorage.admin_unlocked`
- Ajouter un log dans la page Auth (si on y arrive) pour imprimer :
  - `location.href`
  - si un mécanisme de “redirectUrl” est en train de forcer une destination
- Objectif : savoir “qui a poussé vers /auth” (Admin lui-même, un layout, un guard, ou un composant global).

3.3) Vérification des gardes de routes / layouts
- Inspecter `src/components/layout/*` et `src/pages/*` pour repérer :
  - des wrappers “RequireAuth”
  - des `useEffect(() => navigate('/auth'))`
  - des `<Navigate to="/auth" />` conditionnels
- Et confirmer que `/admin` n’est pas rendu à l’intérieur d’un layout qui impose `user` (par exemple un layout global utilisé dans App routing).

4) Corriger la cause (selon le diagnostic)
Cas A — Publication en retard (le plus probable)
- Correction : publier (étape 2). Aucun changement de code nécessaire.

Cas B — Cache navigateur / service worker
- Solution robuste :
  - s’assurer qu’aucun service worker n’est actif (Vite PWA ou code custom).
  - si un SW existe : le désactiver ou forcer une stratégie “network-first” pour les assets.
  - ajouter un “cache-busting” visible (étape 3.1) le temps de valider.
  - ensuite retirer les logs.

Cas C — Une autre redirection vers /auth persiste
- Correction : enlever/ajuster le guard responsable UNIQUEMENT pour `/admin` (puisqu’on a validé “Code seul, sans compte”).
- Exemple typique :
  - un layout qui fait `if (!user) return <Navigate to="/auth" />`
  - ou une logique globale qui redirige les routes non publiques vers `/auth`
- Solution : rendre `/admin` explicitement public au niveau du routing/guard (tout en gardant le PIN).

5) Validation end-to-end (critère “définitif”)
- Tester sur l’URL publiée :
  - accéder à `/admin` en non-connecté
  - entrer un code faux → erreur “Code incorrect”
  - entrer le bon code → accès au super admin
  - refresh de la page → reste accessible (sessionStorage) pendant la session
  - nouvelle fenêtre / navigation privée → redemande le PIN
- Une fois validé, retirer les logs et le label de version.

Livrables (ce qui sera modifié si nécessaire)
- Publication (si c’est la cause).
- Sinon, modifications minimales et ciblées dans :
  - `src/pages/Admin.tsx` (marquage + logs temporaires + éventuel ajustement de guard si encore présent ailleurs)
  - `src/pages/Auth.tsx` (log temporaire pour confirmer l’origine de la redirection)
  - éventuellement un layout global si un guard impose l’auth partout.

Pourquoi ce plan règle “définitivement”
- Il élimine l’ambiguïté “prod pas à jour vs bug de code” en prouvant ce que la prod exécute réellement.
- Il identifie de manière certaine la source de la redirection au lieu d’essayer au hasard.
- Il aboutit soit à une simple publication (cas fréquent), soit à une correction isolée du seul guard responsable, sans régression sur le reste de la plateforme.
