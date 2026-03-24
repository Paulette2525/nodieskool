

## Analyse du problème

Le problème sur iPhone est lié au système "Smart Redirect" iOS : quand un utilisateur reçoit un lien `/c/slug`, la PWA installée ne peut pas intercepter ce lien (pas de Universal Links pour les PWA). Et dans le navigateur Safari, l'utilisateur doit être connecté pour voir/rejoindre la communauté, ce qui crée des frictions.

## Proposition : Section "Découvrir" intégrée au Dashboard

Au lieu de compter sur les liens partagés, on rend les communautés accessibles directement depuis l'application.

### Modifications

**1. Ajouter une section "Communautés disponibles" sur le Dashboard (`src/pages/Dashboard.tsx`)**
- Sous la liste "Mes communautés", ajouter une section "Découvrir des communautés"
- Afficher les communautés publiques auxquelles l'utilisateur n'a pas encore adhéré
- Chaque carte a un bouton "Rejoindre" qui déclenche l'adhésion directement
- L'utilisateur n'a plus besoin de quitter l'app ni de suivre un lien externe

**2. Améliorer la page CommunityPreview pour le web (`src/pages/community/CommunityPreview.tsx`)**
- La page `/c/slug` fonctionne déjà dans le navigateur web classique (hors PWA)
- Ajouter un meilleur guidage : si l'utilisateur n'est pas connecté, afficher clairement "Créez un compte pour rejoindre cette communauté" avec un bouton vers `/auth`
- S'assurer que la redirection post-connexion ramène bien vers `/c/slug`

**3. Système de code d'invitation pour les communautés privées**
- Ajouter un champ `invite_code` (texte, 6-8 caractères) dans la table `communities`
- Le propriétaire peut générer/régénérer un code depuis les paramètres admin
- Sur le Dashboard, ajouter un bouton "Rejoindre avec un code" qui ouvre un petit dialog
- L'utilisateur saisit le code, le système trouve la communauté correspondante et l'ajoute comme membre (en attente d'approbation pour les privées)
- Cela contourne complètement le problème des liens sur iOS

### Flux utilisateur simplifié

```text
Utilisateur iPhone reçoit une invitation :
  Option A (commu publique) : "Ouvre l'app → tu la verras dans Découvrir"
  Option B (commu privée) : "Ouvre l'app → clique Rejoindre avec un code → entre le code XXXX"
```

### Fichiers modifiés
- **Migration SQL** : Ajouter colonne `invite_code` à `communities` + politique RLS pour lecture
- **`src/pages/Dashboard.tsx`** : Section "Découvrir" + bouton "Rejoindre avec un code" + dialog de saisie de code
- **`src/hooks/useCommunities.ts`** : Fonction pour rejoindre via code d'invitation
- **`src/components/community-admin/CommunityAdminSettingsTab.tsx`** : Interface pour générer/afficher le code d'invitation
- **`src/pages/community/CommunityPreview.tsx`** : Améliorer le message pour les utilisateurs non connectés

### Sécurité
- Les communautés privées ne sont visibles dans "Découvrir" que si l'utilisateur a le code
- Le code d'invitation est régénérable par le propriétaire à tout moment
- L'adhésion aux communautés privées reste soumise à approbation (`is_approved = false`)

