

## Plan : Ajouter l'upload de bannière sur la page de création de communauté

### Modification unique : `src/pages/CreateCommunity.tsx`

1. **Ajouter les states pour la bannière** : `coverFile` et `coverPreview` (comme pour le logo)
2. **Ajouter un ref** : `coverInputRef` pour l'input file caché
3. **Ajouter un handler** : `handleCoverSelect` (identique au pattern de `handleLogoSelect`)
4. **Ajouter la zone d'upload visuelle** : Un rectangle cliquable au-dessus du logo, avec une image de preview ou un placeholder avec icône `ImagePlus`. Dimensions approximatives : largeur 100%, hauteur ~150px, coins arrondis.
5. **Modifier `onSubmit`** : Uploader le fichier cover via `uploadFile("community-assets", coverFile, "covers")` et passer `cover_url` au `createCommunity.mutate()`

### Rendu visuel
```text
┌──────────────────────────────────┐
│   [Bannière : cliquez pour       │  ← zone cliquable, fond gris
│    ajouter une image]            │     ou preview de l'image
└──────────────────────────────────┘
         ┌──────┐
         │ Logo │  ← existant
         └──────┘
   Nom de la communauté
   URL ...
```

### Fichier modifié
- `src/pages/CreateCommunity.tsx`

