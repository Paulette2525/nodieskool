

## Problème

C'est une **limitation fondamentale d'iOS** : les PWA installées sur l'écran d'accueil n'interceptent pas les liens web. Quand un utilisateur clique sur un lien `https://tribbue.com/c/ma-communaute/community` depuis WhatsApp, iMessage ou autre, **iOS ouvre toujours Safari**, jamais la PWA — même si elle est installée. Seules les apps natives (App Store) peuvent enregistrer des Universal Links.

Il n'existe aucune solution technique qui permette de forcer l'ouverture automatique d'une PWA depuis un lien externe sur iOS. Cependant, on peut **considérablement améliorer l'expérience** avec une page de redirection intelligente.

## Solution proposée : Page de redirection intelligente

Quand un utilisateur iPhone clique sur un lien de communauté et arrive sur Safari :

1. **Détecter si la PWA est probablement installée** (via un cookie/localStorage partagé entre Safari et la PWA)
2. **Sauvegarder l'URL cible** dans localStorage
3. **Afficher un écran intermédiaire élégant** avec :
   - Le logo et nom de la communauté
   - Un message clair : "Ouvrez Tribbue sur votre écran d'accueil"
   - Une illustration/instruction visuelle simple
   - Un bouton "Continuer sur le navigateur" en fallback
4. **Quand l'utilisateur ouvre la PWA**, elle détecte l'URL sauvegardée et **redirige automatiquement** vers la bonne communauté

## Fichiers à modifier/créer

### 1. `src/components/pwa/SmartRedirect.tsx` (nouveau)
- Composant qui s'affiche quand un utilisateur iOS arrive sur une page communauté via Safari alors que la PWA est installée
- Détecte iOS + mode navigateur (pas standalone)
- Affiche les instructions "Ouvrez l'app Tribbue"
- Sauvegarde l'URL cible via `saveRedirectUrl()`

### 2. `src/hooks/useRedirectUrl.ts` (modifier)
- Ajouter une fonction `savePendingCommunityUrl()` qui stocke l'URL avec un timestamp
- Ajouter `getPendingCommunityUrl()` qui récupère et efface l'URL (avec expiration de 5 min)

### 3. `src/pages/Dashboard.tsx` (modifier)
- Au montage, vérifier s'il y a une URL communauté en attente
- Si oui, rediriger automatiquement vers cette communauté

### 4. `src/pages/community/CommunityPreview.tsx` (modifier)
- Intégrer le composant `SmartRedirect` pour les utilisateurs iOS en mode navigateur qui ont déjà visité la PWA

## Flux utilisateur résultant

```text
1. Utilisateur reçoit lien WhatsApp → clique
2. Safari s'ouvre → page communauté détecte iOS + non-standalone
3. Écran élégant : "Ouvrez Tribbue depuis votre écran d'accueil"
   + URL sauvegardée en localStorage
4. Utilisateur ouvre la PWA depuis l'écran d'accueil
5. Dashboard détecte l'URL en attente → redirige vers la communauté
6. L'utilisateur arrive directement dans la communauté 🎯
```

## Limites à communiquer

- **Safari et la PWA partagent le même localStorage** sur iOS, ce qui rend cette solution possible
- Cette approche ajoute une étape manuelle (ouvrir l'app) mais c'est la seule option viable sans app native
- Pour une redirection 100% automatique, il faudrait passer à une **app native** (Capacitor) avec Universal Links configurés

