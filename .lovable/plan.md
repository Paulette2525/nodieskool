

# Corriger la connexion Google sur mobile

## Diagnostic

Le flux OAuth Google fonctionne cote backend (les logs confirment des connexions reussies). Le probleme est cote client sur mobile :

1. L'utilisateur clique sur "Continuer avec Google"
2. Il est redirige vers Google, choisit son compte
3. Au retour dans l'app, `onAuthStateChange` detecte la session
4. La page `/auth` affiche l'ecran "Vous etes deja connecte" au lieu de rediriger automatiquement vers le dashboard

L'utilisateur doit cliquer manuellement sur "Aller au dashboard", ce qui donne l'impression que la connexion n'a pas marche.

## Solution

Distinguer "vient de se connecter via OAuth" de "avait deja une session" en posant un flag avant le lancement du flux Google.

### Fichier 1 : `src/hooks/useAuth.tsx`

- Dans `signInWithGoogle()`, poser un flag `localStorage.setItem('oauth_pending', 'true')` avant d'appeler `lovable.auth.signInWithOAuth`
- Dans le callback `onAuthStateChange`, si l'evenement est `SIGNED_IN` et le flag `oauth_pending` existe :
  - Supprimer le flag
  - Rediriger automatiquement vers l'URL sauvegardee ou `/dashboard`

### Fichier 2 : `src/pages/Auth.tsx`

- Ajouter un `useEffect` qui ecoute les changements de `user` : si `user` vient d'apparaitre et que le flag `oauth_pending` etait pose, naviguer vers `/dashboard` immediatement
- Garder l'ecran "Vous etes deja connecte" uniquement quand il n'y a pas de flag OAuth (session pre-existante)

Cela garantit une experience fluide : apres avoir choisi son compte Google, l'utilisateur arrive directement sur le dashboard, sans etape intermediaire.

