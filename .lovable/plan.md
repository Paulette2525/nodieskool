

# Corriger l'authentification Google et le branding des pages auth

## Probleme 1 : Redirection vers la page d'accueil au lieu du dashboard

**Cause racine** : Dans `signInWithGoogle()`, le `redirect_uri` est defini a `window.location.origin` (la racine `/`). Apres que Google authentifie l'utilisateur, il est redirige vers `/` (la page Landing), pas vers `/auth`. Or, la logique `oauth_pending` qui detecte le retour OAuth et redirige vers `/dashboard` n'existe que dans `Auth.tsx`. Resultat : l'utilisateur atterrit sur la page d'accueil sans redirection automatique.

**Solution** : Deux corrections combinees :

1. **`src/hooks/useAuth.tsx`** : Changer `redirect_uri` de `window.location.origin` a `window.location.origin + '/auth'` pour que l'utilisateur revienne sur la page Auth apres OAuth, ou le `useEffect` avec `oauth_pending` peut le rediriger vers `/dashboard`.

2. **`src/pages/Landing.tsx`** : Ajouter un `useEffect` de secours qui detecte `oauth_pending` + `user` et redirige vers `/dashboard`. Cela couvre le cas ou l'utilisateur arrive quand meme sur `/`.

## Probleme 2 : Page intermediaire pour nouveaux utilisateurs

C'est le meme probleme : le nouvel utilisateur est redirige vers `/` (Landing) apres son inscription Google au lieu d'etre envoye au dashboard. Avec le fix ci-dessus (redirect vers `/auth` + detection `oauth_pending`), les nouveaux utilisateurs seront directement envoyes au dashboard.

## Probleme 3 : Logo duplique sur les pages d'inscription

Sur la page Auth (`src/pages/Auth.tsx`) :
- Il y a le logo image Tribbue (`tribbueLogoImg`)
- PLUS un `CardTitle` avec le texte "Tribbue" en dessous

**Solution** : Supprimer le `CardTitle` "Tribbue" sur les deux vues de la page Auth (formulaire login et ecran "deja connecte"). Garder uniquement le logo image.

Sur `ForgotPassword.tsx` et `ResetPassword.tsx` :
- Il y a une icone noire generique (un carre avec la lettre "G") au lieu du vrai logo Tribbue

**Solution** : Remplacer ces icones par le logo `tribbueLogoImg` sur les deux pages.

## Fichiers a modifier

### `src/hooks/useAuth.tsx`
- Ligne 174 : changer `redirect_uri: window.location.origin` en `redirect_uri: window.location.origin + '/auth'`

### `src/pages/Auth.tsx`
- Supprimer la ligne `<CardTitle className="text-lg">Tribbue</CardTitle>` (vue formulaire, ligne 141)
- Supprimer la ligne `<CardTitle className="text-lg">Vous etes deja connecte</CardTitle>` - la garder mais retirer le logo duplique si necessaire, ou fusionner logo + titre

### `src/pages/Landing.tsx`
- Ajouter un `useEffect` pour detecter `oauth_pending` + `user` et rediriger vers `/dashboard`

### `src/pages/ForgotPassword.tsx`
- Remplacer l'icone noire "G" (lignes 73-76) par le logo Tribbue : `<img src={tribbueLogoImg} alt="Tribbue" className="h-10 object-contain" />`

### `src/pages/ResetPassword.tsx`
- Remplacer l'icone noire "G" (lignes 140-143) par le logo Tribbue

## Resume des changements

| Fichier | Changement |
|---------|-----------|
| `useAuth.tsx` | redirect_uri → `/auth` |
| `Landing.tsx` | useEffect fallback oauth_pending |
| `Auth.tsx` | Supprimer CardTitle "Tribbue" duplique |
| `ForgotPassword.tsx` | Remplacer icone "G" par logo Tribbue |
| `ResetPassword.tsx` | Remplacer icone "G" par logo Tribbue |

