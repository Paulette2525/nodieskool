

# Plan : Upload de miniatures et modification des formations

## Résumé
Permettre aux utilisateurs d'importer une image comme miniature lors de la création/modification d'une formation, au lieu de saisir une URL manuellement. Aussi s'assurer que le formulaire de modification est bien accessible depuis la page Classroom (pas seulement l'admin).

## Changements

### 1. Créer un bucket de stockage `course-thumbnails`
Migration SQL pour créer le bucket et les politiques RLS permettant aux membres authentifiés d'uploader et lire les images.

### 2. Mettre à jour `useStorage.ts`
Ajouter `"course-thumbnails"` au type `BucketName` et une fonction `uploadCourseThumbnail`.

### 3. Mettre à jour `CommunityAdminCoursesTab.tsx`
- Remplacer le champ URL texte par un `<input type="file" accept="image/*">` avec prévisualisation
- Uploader l'image via `useStorage` avant de sauvegarder le cours
- Garder le bouton "Modifier" existant (déjà fonctionnel via `openEditCourse`)

### 4. Mettre à jour `CommunityClassroom.tsx`
- Ajouter le même upload de miniature au dialog de création de cours
- Ajouter un bouton "Modifier" sur chaque `CourseCard` visible par les admins, ouvrant un dialog d'édition avec les mêmes champs (titre, description, miniature, publié)

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| Migration SQL | Créer bucket `course-thumbnails` + RLS |
| `src/hooks/useStorage.ts` | Ajouter type + helper `uploadCourseThumbnail` |
| `src/components/community-admin/CommunityAdminCoursesTab.tsx` | Input file + preview au lieu d'URL texte |
| `src/pages/community/CommunityClassroom.tsx` | Upload miniature à la création + dialog d'édition pour admins |

