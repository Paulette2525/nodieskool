
Objectif : faire en sorte que la bannière d’installation ne puisse s’afficher que sur la page `/dashboard`, et jamais sur les pages Communauté, Formations, Événements, Messages ou Admin.

Plan :
1. Vérifier le point de montage actuel de `InstallBanner`
   - Le code montre aujourd’hui que la bannière est montée dans `src/pages/Dashboard.tsx`.
   - Je vais conserver ce montage uniquement pour le dashboard principal.

2. Ajouter un verrou de route dans `src/components/pwa/InstallBanner.tsx`
   - Faire une condition explicite sur la route courante pour n’autoriser l’affichage que sur `/dashboard`.
   - Si la route est :
     - `/c/:slug/community`
     - `/c/:slug/classroom`
     - `/c/:slug/events`
     - `/c/:slug/messages`
     - `/c/:slug/admin`
     - ou toute autre page différente de `/dashboard`
     alors la bannière retournera `null`.

3. Laisser les pages communauté intactes
   - `CommunityLayout` et les pages internes continueront de fonctionner normalement.
   - La barre du haut de la communauté restera visible, mais la bannière d’installation ne pourra plus s’y afficher.

4. Vérification ciblée
   - Contrôler le comportement sur :
     - `/dashboard` → bannière visible
     - pages communauté / formations / événements / messages / admin → bannière absente

Détail technique :
- Fichiers concernés :
  - `src/components/pwa/InstallBanner.tsx`
  - éventuellement `src/pages/Dashboard.tsx` si un petit ajustement de placement est nécessaire
- Approche recommandée :
  - utiliser la route courante (`useLocation`) dans `InstallBanner`
  - autoriser uniquement `pathname === "/dashboard"`

Résultat attendu :
- La bannière ne s’affiche plus du tout dans l’espace communauté.
- Elle reste visible uniquement sur le dashboard principal avec la liste des communautés.
