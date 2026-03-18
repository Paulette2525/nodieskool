
Objectif: rendre la plateforme réellement rapide sur mobile, web et PWA, et la préparer à une montée en charge importante. Mon diagnostic confirme que le problème n’est pas “un seul bug”, mais un ensemble de choix de chargement qui sont encore trop coûteux même avec peu de données.

Diagnostic confirmé
- Le démarrage est trop lourd: profil navigateur relevé à environ FCP 4.6s / load 4.65s sur `/dashboard`, avec ~85 scripts et ~810KB de JS.
- Il y a un bloqueur build séparé: `@vitejs/plugin-react-swc` échoue car `@swc/core` n’est pas trouvé.
- Le contexte communauté est recréé à chaque changement d’onglet (`/community`, `/messages`, `/admin`, etc.), donc les mêmes données sont refetchées.
- Plusieurs écrans ne sont pas dimensionnés pour 30.000 membres:
  - `useCommunityAdmin` charge toute la liste des membres d’un coup
  - `useCommunityMessages` charge toute la boîte de réception d’un coup
  - `useCoursesWithCommunity` charge cours + modules + leçons en une seule requête
  - `Discover` fait un N+1 pour compter les membres
- Le shell charge trop tôt des éléments non essentiels: recherche globale, notifications, abonnements, rôles, etc.
- Les images ne sont pas encore assez optimisées partout.

Ce qu’il faut pour viser 30.000 membres / communauté
1. Pagination partout sur les grosses listes
2. Requêtes indexées côté base
3. Ne jamais charger un arbre complet si l’utilisateur n’affiche qu’une liste
4. Réduire fortement le coût du premier rendu
5. Garder les données en cache entre navigations
6. Mesurer puis valider sur mobile et desktop

Plan d’implémentation

Phase 1 — Corriger les fondations bloquantes
- Remplacer le plugin Vite SWC par `@vitejs/plugin-react` dans `vite.config.ts` pour supprimer la panne `@swc/core`.
- Rendre `Dashboard` et `Auth` lazy comme les autres pages dans `src/App.tsx`.
- Éviter les doubles chargements de session/profil dans `src/hooks/useAuth.tsx`:
  - paralléliser profil + rôles
  - empêcher les refetchs inutiles au boot
  - garder un état de session plus stable

Phase 2 — Réduire le coût de navigation dans les communautés
- Refactorer le routing pour monter `CommunityProvider` une seule fois pour toutes les routes `/c/:slug/*`, au lieu d’un `CommunityLayout` recréé par page.
- Conséquence: navigation beaucoup plus fluide entre Communauté / Formations / Événements / Messages / Admin.
- Fichiers concernés:
  - `src/App.tsx`
  - `src/components/layout/CommunityLayout.tsx`
  - pages `src/pages/community/*`

Phase 3 — Rendre les écrans scalables
- Messagerie:
  - paginer la liste des conversations admin
  - charger les messages par pages
  - éviter tout chargement complet de boîte de réception
  - idéalement utiliser un RPC/vue résumé pour inbox
- Admin membres:
  - remplacer le fetch complet par pagination + recherche + filtres
  - ajouter compte total séparé
- Formations:
  - sur la page liste, ne charger que les métadonnées des cours
  - charger modules/leçons seulement dans le détail
- Découverte:
  - supprimer le N+1 des counts via vue/RPC/compteur agrégé
- Fichiers principaux:
  - `src/hooks/useCommunityMessages.ts`
  - `src/hooks/useCommunityAdmin.ts`
  - `src/hooks/useCourses.ts`
  - `src/pages/Discover.tsx`

Phase 4 — Optimiser le shell mobile/web
- Charger `GlobalSearch` et `NotificationBell` seulement quand utiles, surtout pas comme coût fixe de chaque page.
- Réduire les imports lourds réellement inutilisés au runtime.
- Ajouter lazy loading systématique, `decoding="async"` et dimensions cohérentes sur images communautaires/cartes/couvertures.
- Vérifier les composants qui utilisent `date-fns` partout; limiter les recalculs ou mutualiser si nécessaire.
- Fichiers probables:
  - `src/components/layout/CommunityLayout.tsx`
  - `src/components/community/CommunityCard.tsx`
  - `src/pages/Discover.tsx`
  - `src/components/community/PostCard.tsx`

Phase 5 — Base de données et montée en charge
- Ajouter/valider les index pour les accès critiques:
  - `community_members(community_id, is_approved, role, joined_at)`
  - `community_members(user_id, is_approved)`
  - `posts(community_id, is_pinned, created_at desc)`
  - `conversations(community_id, updated_at desc)`
  - `conversation_participants(user_id, conversation_id)`
  - `messages(conversation_id, created_at)`
  - `notifications(user_id, created_at desc, is_read)`
  - `courses(community_id, is_published, order_index)`
  - `events(community_id, start_time)`
- Si besoin, créer des compteurs agrégés/RPC pour éviter les `count exact` répétés sur gros volumes.

Phase 6 — Validation réelle de performance
Après implémentation, je ferai une vraie passe de vérification:
- temps d’ouverture dashboard
- navigation entre onglets communauté
- ouverture admin avec beaucoup de membres
- messagerie membre/admin
- test mobile + desktop
- contrôle réseau/console/performance

Résultat attendu
- ouverture initiale nettement plus rapide
- navigation intra-communauté quasi instantanée
- pages capables de rester fluides même avec beaucoup de membres, messages et contenus
- base prête pour grossir sans s’effondrer dès les premiers milliers d’utilisateurs

Note importante
Je peux améliorer fortement la plateforme, mais pour être honnête: on ne prépare pas 30.000 membres par communauté uniquement avec du “frontend plus léger”. Il faut combiner:
- optimisation du bundle
- cache/navigation
- pagination stricte
- requêtes base bien pensées
- index backend
- validation réelle sur parcours clés

Si j’implémente ce plan, ce sera la première vraie étape sérieuse pour rendre la plateforme rapide et scalable, sur web, mobile et PWA.
