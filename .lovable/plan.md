

## Plan : Améliorations UX mobile + Typing animation au scroll

### 1. Typing Animation déclenchée au scroll (Intersection Observer)

**Problème** : Les `TypingAnimation` sur la landing page démarrent toutes au chargement avec un simple `delay`, donc l'utilisateur qui défile ne voit que du texte déjà affiché, manquant l'effet de typing.

**Fichier : `src/components/ui/typing-animation.tsx`**
- Ajouter un `useRef` + `IntersectionObserver` pour détecter quand l'élément entre dans le viewport
- Ne déclencher le typing qu'à l'apparition (quand `isInView` devient `true`), en remplaçant le `delay` statique
- Le composant affiche le texte complet en `opacity-0` pour réserver l'espace, puis lance l'animation une seule fois à l'intersection

### 2. Décalage mobile sur Dashboard / Classroom / Community

**Problème** : Le `MainLayout` et `CommunityLayout` appliquent `pt-14` sur mobile (pour laisser de la place au bouton hamburger fixe en `top-4 left-4`), mais cela crée un espace vide visible. Le bouton hamburger chevauche aussi parfois le contenu.

**Fichier : `src/components/layout/MainLayout.tsx`**
- Ajouter une barre de navigation mobile fixe en haut (`md:hidden`) avec le bouton hamburger, le logo/nom, et les icônes recherche + notifications, au lieu du bouton hamburger flottant isolé
- Cela justifie le `pt-14` et élimine l'impression de décalage

**Fichier : `src/components/layout/Sidebar.tsx`**
- Supprimer le bouton hamburger flottant (`fixed left-4 top-4`) car il sera intégré dans la barre mobile du MainLayout

**Fichier : `src/components/layout/CommunityLayout.tsx`**
- Même approche : ajouter un header mobile compact avec hamburger + nom de la communauté
- La bannière community banner passe de `h-32` à `h-24` sur mobile pour économiser l'espace vertical

**Fichier : `src/components/layout/CommunitySidebar.tsx`**
- Supprimer le bouton hamburger flottant isolé, il sera dans le header mobile du CommunityLayout

### 3. Stats row mobile sur Classroom

**Fichier : `src/pages/Classroom.tsx`**
- La rangée de stats (`flex-wrap`) peut déborder sur mobile. Passer en `grid grid-cols-3` pour un alignement propre sur petits écrans.

### Résumé des fichiers modifiés
- `src/components/ui/typing-animation.tsx` — Intersection Observer
- `src/components/layout/MainLayout.tsx` — Header mobile intégré
- `src/components/layout/Sidebar.tsx` — Retrait du bouton hamburger flottant
- `src/components/layout/CommunityLayout.tsx` — Header mobile + bannière réduite
- `src/components/layout/CommunitySidebar.tsx` — Retrait du bouton hamburger flottant
- `src/pages/Classroom.tsx` — Grid stats mobile

