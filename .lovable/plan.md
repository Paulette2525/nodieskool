

## Plan : Code d'invitation obligatoire + Quitter une communauté

### 1. Supprimer la section "Découvrir des communautés" du Dashboard

**Fichier : `src/pages/Dashboard.tsx`**
- Retirer tout le bloc "Découvrir des communautés" (lignes 154-205) qui affiche les communautés publiques avec un bouton "Rejoindre" direct
- Supprimer les imports/variables devenus inutiles (`Globe`, `discoverCommunities`, `joinCommunity`, `publicCommunities`, `isLoadingPublic`)
- Conserver uniquement le bouton "Code d'invitation" pour rejoindre une communauté

### 2. Ajouter le bouton "Quitter" pour les membres (non-propriétaires)

**Fichier : `src/components/community/CommunityCard.tsx`**
- Pour les rôles `member`, `moderator`, `admin` (pas `owner`), ajouter une option "Quitter la communauté" dans un menu contextuel ou un bouton visible
- Utiliser `leaveCommunity` de `useCommunities` (déjà implémenté dans le hook)
- Ajouter un `AlertDialog` de confirmation avant de quitter

### 3. Code d'invitation depuis la page Admin communauté

La section `InviteCodeSection` existe déjà dans `CommunityAdminSettingsTab.tsx` — elle permet de générer, copier et régénérer le code. Aucun changement nécessaire ici.

### Résumé des fichiers modifiés
- `src/pages/Dashboard.tsx` — Retrait de la section Découvrir
- `src/components/community/CommunityCard.tsx` — Ajout du bouton Quitter pour non-propriétaires

