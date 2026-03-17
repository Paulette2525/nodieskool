

# Ajouter un bouton "Entrer" sur la CommunityCard

## Problème
La card de communauté sur le dashboard est cliquable mais il n'y a pas de bouton visible et explicite pour entrer dans la communauté.

## Solution
Ajouter un bouton "Entrer" bien visible en bas de la card, sous les badges, qui navigue vers `/c/{slug}/community`.

## Changement

**`src/components/community/CommunityCard.tsx`** :
- Ajouter un `Button` "Entrer" avec une icône flèche (`ArrowRight`) dans la section footer de la card, après les badges
- Style : bouton primaire compact (`size="sm"`, `rounded-xl`), aligné à droite avec `ml-auto`
- Le bouton utilise `Link` vers `/c/{slug}/community`

