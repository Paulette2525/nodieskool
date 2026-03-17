
J’ai vérifié le code actuel et les logs d’authentification. Le problème ne semble pas venir du backend Google lui-même : les logs montrent des connexions Google réussies sur l’URL publiée. Le vrai problème est surtout côté interface et gestion de session.

## Diagnostic

1. `/auth` redirige immédiatement vers `/dashboard` dès qu’un utilisateur est déjà connecté :
   - `src/pages/Auth.tsx`
   - `if (user) { ... return <Navigate to={r || "/dashboard"} replace />; }`

2. Le bouton Google ne force pas l’écran de choix de compte :
   - `src/hooks/useAuth.tsx`
   - `signInWithGoogle()` appelle bien Google, mais sans `prompt: "select_account"`
   - Résultat : si Google a déjà une session active, l’utilisateur peut être reconnecté automatiquement puis renvoyé au dashboard, ce qui donne l’impression que “la page de connexion ne marche pas”.

3. Le contournement “custom domain + skipBrowserRedirect” vu dans l’exemple similaire n’est probablement pas nécessaire ici :
   - votre URL publiée est `nodieskool.lovable.app`
   - ce n’est pas un domaine personnalisé externe
   - donc je ne partirais pas sur ce correctif en premier

## Plan de correction

### 1. Corriger le comportement de la page `/auth`
Modifier `src/pages/Auth.tsx` pour ne plus forcer une redirection immédiate vers `/dashboard` quand `user` existe.

A la place :
- afficher un état “vous êtes déjà connecté”
- proposer 2 actions claires :
  - “Aller au dashboard”
  - “Se déconnecter”
- et éventuellement un troisième bouton :
  - “Se connecter avec un autre compte Google”

Cela évitera que l’interface de connexion disparaisse automatiquement.

### 2. Forcer le sélecteur de compte Google
Modifier `signInWithGoogle()` dans `src/hooks/useAuth.tsx` pour utiliser :

- `extraParams: { prompt: "select_account" }`

Ainsi, cliquer sur “Continuer avec Google” ouvrira le choix de compte au lieu de réutiliser silencieusement la session Google existante.

### 3. Ajouter un vrai flux “changer de compte”
Sur la page d’authentification :
- si l’utilisateur est déjà connecté et clique sur “Se connecter avec un autre compte Google” :
  1. faire `signOut()`
  2. relancer `signInWithGoogle()`

Cela rend le comportement compréhensible pour les membres qui veulent se reconnecter avec une autre adresse Google.

### 4. Stabiliser la logique de redirection
Revoir légèrement la logique de redirection dans `src/pages/Auth.tsx` pour que :
- après un login réussi, on redirige vers l’URL sauvegardée si elle existe
- sinon vers `/dashboard`
- mais sans vider/rediriger trop tôt juste parce qu’une session existe déjà

Objectif : éviter les redirections “surprises”.

## Fichiers à modifier

- `src/pages/Auth.tsx`
  - retirer la redirection automatique immédiate
  - afficher un état “déjà connecté”
  - ajouter les actions dashboard / déconnexion / autre compte Google

- `src/hooks/useAuth.tsx`
  - enrichir `signInWithGoogle()` avec `prompt: "select_account"`
  - réutiliser le flux existant `lovable.auth.signInWithOAuth("google", ...)`

## Ce que je ne changerais pas
- Pas de modification de la configuration Google côté backend en premier
- Pas de passage à `supabase.auth.signInWithOAuth()` direct
- Pas de correctif “custom domain auth-bridge” tant qu’on reste sur `*.lovable.app`

## Vérification prévue après correction

1. Utilisateur déconnecté :
   - `/auth` affiche bien l’interface
   - clic sur “Continuer avec Google” ouvre le choix de compte
   - après validation, redirection correcte

2. Utilisateur déjà connecté :
   - `/auth` n’envoie plus automatiquement vers `/dashboard`
   - il voit qu’il est déjà connecté
   - il peut aller au dashboard ou changer de compte

3. Test sur les deux environnements :
   - preview
   - URL publiée

En résumé : je corrigerais surtout l’UX de `/auth` et j’ajouterais `prompt: "select_account"` pour que la connexion Google paraisse enfin fonctionner normalement côté utilisateur.
