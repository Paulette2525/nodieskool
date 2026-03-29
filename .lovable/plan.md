

## Plan : Optimiser le logo Collonie pour mobile

Le logo utilise actuellement une taille fixe `h-12` partout, ce qui est trop grand sur mobile (prend trop de place dans la navbar) ou parfois trop petit selon le contexte. De plus, le texte "Community Hub" dans la barre mobile du MainLayout n'a pas été renommé en "Collonie" et n'utilise pas le logo.

### Changements

**1. Tailles responsives du logo (mobile vs desktop)**

Appliquer des classes responsives `h-8 md:h-12` pour que le logo soit plus petit sur mobile et garde sa taille actuelle sur desktop :

| Fichier | Contexte | Avant | Après |
|---------|----------|-------|-------|
| `Landing.tsx` | navbar | `h-12` | `h-8 md:h-12` |
| `Landing.tsx` | footer | `h-10` | `h-8 md:h-10` |
| `Dashboard.tsx` | header | `h-12` | `h-8 md:h-12` |
| `Pricing.tsx` | header | `h-12` | `h-8 md:h-12` |
| `Contact.tsx` | header | `h-12` | `h-8 md:h-12` |
| `Discover.tsx` | header | `h-12` | `h-8 md:h-12` |
| `CreateCommunity.tsx` | header | `h-12` | `h-8 md:h-12` |
| `Auth.tsx` | card | `h-14` | `h-10 md:h-14` |
| `ForgotPassword.tsx` | card | `h-14` | `h-10 md:h-14` |
| `ResetPassword.tsx` | card | `h-14` | `h-10 md:h-14` |

**2. Remplacer "Community Hub" par le logo Collonie dans le mobile top bar**

Dans `src/components/layout/MainLayout.tsx` ligne 27 : remplacer le texte statique `Community Hub` par le logo Collonie avec une taille adaptée mobile (`h-7`).

**3. Ajouter le logo dans le mobile top bar du CommunityLayout**

Vérifier `src/components/layout/CommunityLayout.tsx` pour le même problème et appliquer la même correction si nécessaire.

### Fichiers modifiés (~12 fichiers)
Uniquement des changements de classes CSS Tailwind, aucune logique modifiée.

