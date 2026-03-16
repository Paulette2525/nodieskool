

# Plan : Gestion des modules et leçons dans les formations

## Résumé
Ajouter une interface permettant aux admins de créer, modifier et supprimer des modules et des leçons (chapitres) à l'intérieur d'une formation. Les tables `modules` et `lessons` existent déjà en base avec les bonnes politiques RLS.

## Changements

### 1. Ajouter la route communautaire pour le détail d'un cours
Dans `App.tsx`, ajouter : `/c/:slug/classroom/:id` pointant vers une nouvelle page `CommunityClassroomDetail`.

### 2. Créer `src/pages/community/CommunityClassroomDetail.tsx`
Page wrappée dans `CommunityLayout` qui :
- Affiche le cours avec ses modules et leçons (comme `CourseDetail.tsx` actuel)
- Ajoute un panneau d'administration (visible uniquement pour les admins) permettant de :
  - **Créer / modifier / supprimer des modules** (titre, description, ordre, verrouillé)
  - **Créer / modifier / supprimer des leçons** dans chaque module (titre, contenu texte, URL vidéo, durée, points, ordre)
- Utilise des `Dialog` pour les formulaires de création/édition
- Utilise `Collapsible` ou `Accordion` pour afficher les modules avec leurs leçons

### 3. Mettre à jour `CourseCard` dans `CommunityClassroom.tsx`
Faire pointer le `onClick` des `CourseCard` vers `/c/${slug}/classroom/${course.id}` pour naviguer vers le détail communautaire.

### 4. Mettre à jour `useCourses.ts`
Ajouter des mutations pour :
- `createModule`, `updateModule`, `deleteModule`
- `createLesson`, `updateLesson`, `deleteLesson`

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/App.tsx` | Ajouter route `/c/:slug/classroom/:id` |
| `src/pages/community/CommunityClassroomDetail.tsx` | Nouvelle page : vue cours + gestion modules/leçons |
| `src/pages/community/CommunityClassroom.tsx` | Navigation vers le détail du cours |
| `src/hooks/useCourses.ts` | Mutations CRUD pour modules et leçons |

Aucune migration SQL nécessaire — les tables `modules` et `lessons` existent déjà avec les bonnes RLS.

