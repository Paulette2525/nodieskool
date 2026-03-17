# Plan : Optimisations du fil d'actualité, commentaires, navigation et formations

## 1. Permettre aux membres de modifier et supprimer leurs propres publications

**PostCard.tsx** :

- Ajouter une prop `onEdit` et afficher le menu "..." (DropdownMenu) pour l'auteur du post aussi (pas seulement les admins)
- L'auteur voit "Modifier" et "Supprimer" ; l'admin voit en plus "Epingler"
- Pour la modification : ouvrir un Dialog avec un Textarea auto-resize pré-rempli du contenu, permettant de voir tout le texte
- Ajouter une mutation `updatePost` dans `usePosts.ts`

**usePosts.ts** :

- Ajouter une mutation `updatePost` (supabase update sur `posts` par id)

La RLS autorise deja les utilisateurs a modifier/supprimer leurs propres posts.

## 2. Tronquer les publications longues avec "Voir plus"

**PostCard.tsx** :

- Limiter l'affichage du contenu a 7 lignes (via `line-clamp-4`)
- Ajouter un bouton "Voir plus" qui revele le texte complet
- Gerer un state `expanded` local

## 3. Navigation sticky sur desktop

**CommunityLayout.tsx et MainLayout.tsx** :

- La sidebar est deja `fixed`/`relative` -- le probleme est que le `<main>` a `overflow-auto` mais la top bar est `sticky top-0` ce qui devrait fonctionner
- Verifier et corriger : le `pt-14 md:pt-0` sur le contenu enfant peut causer un decalage. S'assurer que la top bar reste fixe en rendant le main `relative` avec scroll interne

## 4. Reponses imbriquees aux commentaires (tous les niveaux)

**CommentItem.tsx** :

- Permettre de repondre a N'IMPORTE QUEL commentaire (pas seulement les top-level)
- Retirer la condition `!isReply` sur le bouton Repondre
- Passer `onReply` a tous les niveaux

**CommentSection.tsx** :

- Construire un arbre recursif de commentaires au lieu de 2 niveaux
- Creer un composant recursif `CommentThread` qui affiche les replies de chaque commentaire

## 5. Simplifier le formulaire de creation de chapitre (lecon)

**CommunityClassroomDetail.tsx (LessonForm)** :

- Retirer les champs "Duree (min)" et "Points"
- Retirer le champ "Ordre" (auto-incrementer)
- Garder uniquement : Titre, Contenu, URL video
- Simplifier le formulaire de module aussi (retirer "Ordre", auto-incrementer)

## 6. Retirer l'affichage des points dans la vue lecon

**CommunityClassroomDetail.tsx** :

- Retirer la ligne "+X points" affichee sous le bouton "Marquer comme terminee"

---

## Resume des fichiers a modifier


| Fichier                                            | Modifications                                                           |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/components/community/PostCard.tsx`            | Edit/delete pour auteur, troncature "Voir plus", dialog de modification |
| `src/hooks/usePosts.ts`                            | Ajouter mutation `updatePost`                                           |
| `src/components/community/CommentItem.tsx`         | Reponse sur tous les commentaires (pas seulement top-level)             |
| `src/components/community/CommentSection.tsx`      | Arbre recursif de commentaires                                          |
| `src/pages/community/CommunityClassroomDetail.tsx` | Simplifier LessonForm et ModuleForm, retirer points                     |
| `src/components/layout/CommunityLayout.tsx`        | Corriger sticky top bar                                                 |
| `src/components/layout/MainLayout.tsx`             | Corriger sticky top bar                                                 |
