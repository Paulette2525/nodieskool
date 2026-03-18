

## Diagnostic complet et plan d'optimisation de Tribbue

### Problemes identifies

#### 1. Erreur de build critique
Le build echoue avec `Cannot find package '@swc/core'`. Le package `rollup` a ete ajoute manuellement dans les dependencies, ce qui n'est pas necessaire et peut causer des conflits. Il faut retirer `rollup` des dependencies (c'est une dependance interne de Vite).

#### 2. Warnings React dans la console
- `Function components cannot be given refs` sur `CommunityFeed` et `CreatePostCard`. Le composant `CommunityFeedContent` est passe comme ref quelque part sans `forwardRef`. A verifier et corriger.

#### 3. N+1 queries dans `useCommunityMessages`
La fonction `fetchConversations` fait une boucle sur chaque conversation avec 3 requetes individuelles (participants, profile, last message, unread count). Pour 10 conversations, ca fait 40 requetes. Il faut consolider en batch queries.

#### 4. Rechargements inutiles de `CommunityContext`
Chaque page communautaire (`CommunityFeed`, `CommunityMessages`, `CommunityEvents`, etc.) encapsule son propre `<CommunityProvider>` via `<CommunityLayout>`. A chaque navigation entre pages de la meme communaute, le contexte est recree et les donnees rechargees. C'est un probleme de performance significatif.

#### 5. Images non optimisees
Pas de lazy loading sur les images des posts (`PostCard`, `CreatePostCard`). Les avatars ne sont pas dimensionnes cote serveur.

#### 6. Dependances lourdes chargees en eager
`framer-motion` (~130ko gzip), `recharts` (~80ko) et `date-fns` sont charges meme si pas utilises sur toutes les pages.

---

### Plan de corrections

| # | Fichier(s) | Correction |
|---|-----------|------------|
| 1 | `package.json` | Retirer `rollup` des dependencies pour corriger le build |
| 2 | `src/pages/community/CommunityFeed.tsx` | Identifier et corriger le warning `forwardRef` |
| 3 | `src/hooks/useCommunityMessages.ts` | Optimiser `fetchConversations` : batch les requetes profiles et messages au lieu du N+1 |
| 4 | `src/components/community/PostCard.tsx` | Ajouter `loading="lazy"` aux images des posts |
| 5 | `src/pages/community/CommunityMessages.tsx` | Nettoyer le composant et s'assurer que le disabled/sending fonctionne correctement |
| 6 | `src/hooks/useCourses.ts` | Les messages de toast melangent francais et anglais ("Lesson completed! +10 points", "Course created!") - harmoniser en francais |
| 7 | `src/hooks/useProfile.ts` | `updatePassword` ne verifie pas le mot de passe actuel (le parametre `currentPassword` est ignore) |
| 8 | `src/components/layout/CommunityLayout.tsx` | Ajouter un scroll-to-top sur `pt-14 md:pt-0` - le padding top mobile `pt-14` pourrait masquer du contenu |

### Optimisations de performance

| # | Optimisation | Impact |
|---|-------------|--------|
| A | Retirer `rollup` des deps | Fix build |
| B | Batch queries dans `useCommunityMessages` | Reduit de ~40 requetes a ~4 par chargement |
| C | Lazy load images dans les posts | Ameliore le First Contentful Paint |
| D | Harmoniser les toasts FR | Coherence UX |
| E | Corriger le warning forwardRef | Console propre |

### Hors perimetre (pas de changement necessaire)
- L'architecture globale (lazy loading des pages, QueryClient cache, infinite query pour le feed) est deja bien optimisee
- Les RLS policies sont correctement configurees
- Le realtime est bien scope par conversation_id
- La structure de la sidebar et du layout est propre

### Impact estime
- Fix du build : critique (bloquant)
- N+1 messaging : amelioration notable sur les communautes avec beaucoup de conversations
- Lazy images : amelioration perceptible sur mobile avec beaucoup de posts
- Toasts FR : coherence, pas de perf

