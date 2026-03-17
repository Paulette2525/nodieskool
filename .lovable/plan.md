

# Optimiser l'interface de creation de formation

## Probleme

Dans la sidebar droite (col-span-1 sur lg), les boutons admin (Modifier, Supprimer, + Lecon) sont entasses sur une seule ligne horizontale dans un espace trop etroit. Le bouton "+ Lecon" est tronque et invisible. L'ensemble est difficile a utiliser.

## Solution

### `src/pages/community/CommunityClassroomDetail.tsx`

1. **Reorganiser les boutons admin dans chaque module** (lignes 367-378) :
   - Empiler les boutons sur 2 lignes au lieu d'une seule ligne horizontale
   - Ligne 1 : boutons "Modifier" et "Supprimer" cote a cote
   - Ligne 2 : bouton "+ Ajouter une lecon" en pleine largeur, plus visible avec `variant="outline"`
   - Utiliser `flex-wrap` ou un layout en colonne pour s'adapter a l'espace etroit

2. **Ameliorer le bouton "+ Module"** (ligne 338) :
   - Texte complet visible, pas tronque

3. **Ameliorer les boutons edit/delete sur chaque lecon** (lignes 404+) :
   - Les rendre toujours visibles (pas seulement au hover) dans un espace aussi etroit, car le hover ne fonctionne pas sur mobile
   - Utiliser des icones seules sans texte pour gagner de l'espace

