
Objectif : rétablir un vrai parcours d’installation PWA sur mobile, avec un bouton visible à nouveau sur le site, et un fallback clair quand le navigateur ne fournit pas l’installation native.

1. Corriger la cause racine
- Aujourd’hui, la bannière est montée uniquement dans `src/pages/Dashboard.tsx`.
- Donc si l’utilisateur arrive d’abord sur la landing, `/auth`, ou une autre page mobile, l’événement d’installation peut être raté.
- Je vais centraliser la détection d’installation au niveau global de l’application, puis afficher la bannière seulement aux bons endroits.

2. Restaurer la bannière sur les bons points d’entrée
- Afficher la bannière sur :
  - la landing publique `/`
  - le dashboard `/dashboard`
- Ne jamais l’afficher dans :
  - communauté
  - formations
  - événements
  - messages
  - admin
- Cela permet aux nouveaux visiteurs mobile de voir l’option d’installation dès l’arrivée sur le site, sans réintroduire la bannière partout.

3. Refaire la logique d’installation de façon robuste
- Capturer `beforeinstallprompt` globalement dès le chargement de l’app.
- Détecter séparément :
  - iPhone/iPad Safari
  - iPhone/iPad navigateur tiers
  - Android avec install native disponible
  - Android sans install native disponible
  - mode déjà installé (`standalone`)
- La bannière restera masquée si l’app est déjà installée.

4. Reprendre exactement le comportement attendu
- Android avec prompt natif disponible :
  - clic sur “Installer”
  - ouverture du vrai prompt d’installation natif
- Android sans prompt natif :
  - afficher les 3 étapes demandées dans la bannière
  - “Partager / Plus / Ajouter à l’écran d’accueil” (ou formulation équivalente selon le menu navigateur)
- iPhone Safari :
  - afficher les 3 étapes manuelles
  - “Partager / Sur l’écran d’accueil / Ajouter”
- iPhone Chrome ou autres navigateurs :
  - afficher un message clair pour ouvrir le site dans Safari, car l’installation PWA sur iPhone est limitée par iOS hors Safari
  - puis montrer les étapes Safari

5. Uniformiser l’UX de la bannière
- Garder un seul bouton principal “Installer”.
- Au clic :
  - prompt natif si disponible
  - sinon ouverture des instructions inline
- Conserver la fermeture temporaire via `localStorage`, mais vérifier que cette logique ne bloque pas l’affichage à tort.

6. Fichiers à modifier
- `src/App.tsx`
  - monter la logique globale d’installation ou un provider/hook partagé
- `src/components/pwa/InstallBanner.tsx`
  - refonte de l’affichage, des conditions de visibilité, et des instructions Android/iPhone
- `src/pages/Landing.tsx`
  - ajouter la bannière si elle n’est pas déjà montée via un point commun
- `src/pages/Dashboard.tsx`
  - conserver la bannière ici si on ne passe pas par un montage commun

Détail technique
- Approche recommandée :
  - créer une source unique d’état PWA (`deferredPrompt`, `isIOS`, `isAndroid`, `isStandalone`, `supportsNativeInstall`)
  - n’utiliser `InstallBanner` que comme composant d’affichage
- Règles d’affichage :
  - visible seulement sur `/` et `/dashboard`
  - cachée si `standalone === true`
  - cachée si bannière récemment fermée
- Important :
  - sur iPhone, aucun code ne peut forcer une installation native dans Chrome/Firefox ; le bon comportement est donc un guidage vers Safari, pas une fausse promesse

Résultat attendu
- Le bouton “Installer” réapparaît sur mobile.
- Android retrouve l’installation native quand elle est disponible.
- Safari iPhone retrouve un parcours simple d’ajout à l’écran d’accueil.
- Les pages communauté/admin restent propres, sans bannière.
