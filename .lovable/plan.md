

## Plan : Onboarding profil à la première connexion dans une communauté

### Concept

Après qu'un utilisateur rejoigne une communauté (ou qu'un admin accède pour la première fois), vérifier si son profil est incomplet (pas d'avatar ou pas de bio). Si oui, afficher un écran/modal d'onboarding pour compléter le profil avant d'entrer dans la communauté.

### Détection "profil incomplet"

Un profil est considéré incomplet si `!profile.avatar_url || !profile.bio`. Le username et full_name sont déjà remplis à l'inscription.

### Changements

| Fichier | Modification |
|---------|-------------|
| `src/components/community/ProfileOnboarding.tsx` | **Nouveau** — Modal/page d'onboarding avec formulaire (nom d'utilisateur, photo de profil avec upload, bio). Utilise `useProfile` et `useStorage` existants. Appelle `refreshProfile()` après enregistrement. |
| `src/components/layout/CommunityLayout.tsx` | Après le check `isMember`, vérifier `!profile?.avatar_url || !profile?.bio`. Si incomplet, afficher `<ProfileOnboarding />` au lieu du contenu de la communauté. |
| `src/pages/community/CommunityPreview.tsx` | Dans `handleJoinCommunity`, après le `refetch()`, le CommunityLayout prendra le relais automatiquement (l'utilisateur devient membre → le check d'onboarding s'active). |

### Composant ProfileOnboarding

- Écran centré avec le logo de la communauté
- Message de bienvenue "Complétez votre profil pour commencer"
- Champs : avatar (upload avec `useStorage.uploadAvatar`), nom d'utilisateur (pré-rempli), bio (textarea)
- Bouton "Continuer" qui appelle `updateProfile` puis `refreshProfile`
- Bouton "Passer" discret pour ignorer (stocke un flag `localStorage` pour ne plus afficher)

### Flux

1. Utilisateur rejoint la communauté → `isMember` devient `true`
2. `CommunityLayout` vérifie le profil → incomplet → affiche `ProfileOnboarding`
3. L'utilisateur complète ou passe → le contenu de la communauté s'affiche
4. Les visites suivantes ne montrent plus l'onboarding (profil complet ou flag "passé")

