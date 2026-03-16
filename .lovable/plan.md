

# Plan: Rendre toutes les fonctionnalites existantes operationnelles

## Problemes identifies

### 1. Duplication a la creation de communaute (BUG CRITIQUE)
Le trigger `on_community_created` insere automatiquement le createur comme membre `owner`. Mais `useCommunities.ts` (lignes 98-104) fait aussi manuellement un INSERT dans `community_members`. Resultat: erreur "duplicate key" a chaque creation de communaute.

**Correction:** Supprimer l'insertion manuelle du membre dans `useCommunities.ts` (lignes 96-107), ne garder que le `return community`.

### 2. Leaderboard de la communaute affiche le classement global (BUG)
Dans `CommunityFeed.tsx` ligne 16, `useLeaderboard()` est appele sans `community?.id`. Le sidebar "Top Membres" affiche donc le classement global au lieu des membres de la communaute.

**Correction:** Changer en `useLeaderboard(community?.id)`.

### 3. Branding incoherent - "Vibe Platform" / "Growth Academy"
- Landing.tsx: "Vibe Platform" partout (header, footer)
- Dashboard.tsx ligne 43: "Vibe Platform"
- Discover.tsx ligne 83: "Vibe Platform"
- Auth.tsx lignes 81-85: "G" + "Growth Academy"
- Footer: "© 2025 Vibe Platform"

**Correction:** Remplacer par "NodieSkool" partout et mettre l'annee a 2026.

### 4. Page `/contact` inexistante (lien mort)
`Pricing.tsx` ligne 173 renvoie vers `/contact` qui n'existe pas → 404.

**Correction:** Creer `src/pages/Contact.tsx` avec un formulaire simple et ajouter la route dans `App.tsx`.

### 5. Boutons "Nouveau cours" et "Nouvel evenement" non fonctionnels
- `CommunityClassroom.tsx` ligne 33-37: le bouton "Nouveau cours" n'a pas d'action
- `CommunityCalendar.tsx` ligne 25-29: le bouton "Nouvel evenement" n'a pas d'action

**Correction:** Ajouter des dialogues de creation pour les cours et evenements dans ces pages, avec les mutations existantes (`createCourse`, `createEvent`).

### 6. Boutons Pricing desactives (Stripe absent)
Les boutons Pro/Business affichent "Bientot disponible" et sont `disabled`. Sans Stripe, pas de monetisation.

**Correction partielle:** On ne peut pas integrer Stripe sans la cle API. On va rendre les boutons plus informatifs (rediriger vers contact au lieu de "disabled").

### 7. Page `CommunityPreview` - le `member_count` ne se met pas a jour apres join
Apres avoir rejoint, `window.location.reload()` est utilise (ligne 51) au lieu de rafraichir proprement le contexte.

**Correction:** Utiliser `refetch()` du `CommunityContext` au lieu de `window.location.reload()`.

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/hooks/useCommunities.ts` | Supprimer l'INSERT manuel du membre owner |
| `src/pages/community/CommunityFeed.tsx` | Passer `community?.id` a `useLeaderboard` |
| `src/pages/Landing.tsx` | Branding NodieSkool |
| `src/pages/Dashboard.tsx` | Branding NodieSkool |
| `src/pages/Discover.tsx` | Branding NodieSkool |
| `src/pages/Auth.tsx` | Branding NodieSkool |
| `src/pages/Contact.tsx` | Creer la page Contact |
| `src/App.tsx` | Ajouter route `/contact` |
| `src/pages/Pricing.tsx` | Lien contact fonctionnel |
| `src/pages/community/CommunityClassroom.tsx` | Dialog creation de cours |
| `src/pages/community/CommunityCalendar.tsx` | Dialog creation d'evenement |
| `src/pages/community/CommunityPreview.tsx` | Utiliser refetch() au lieu de reload() |

