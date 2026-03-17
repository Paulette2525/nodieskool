

# Ajouter un menu utilisateur sur le Dashboard

## Problème
Le header du Dashboard n'a qu'un avatar qui redirige vers `/profile`. Il n'y a aucun bouton de déconnexion, ni accès aux paramètres.

## Solution
Transformer l'avatar en un **dropdown menu** (via `DropdownMenu` de shadcn) qui affiche :
- **Mon profil** → `/profile`
- **Paramètres** → `/settings`
- **Déconnexion** → appel `signOut()`

## Fichier modifié

| Fichier | Action |
|---------|--------|
| `src/pages/Dashboard.tsx` | Remplacer le `<Link to="/profile"><Avatar>` par un `<DropdownMenu>` avec 3 options |

## Détail
- Importer `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger` depuis `@/components/ui/dropdown-menu`
- Importer les icônes `User`, `Settings`, `LogOut` de lucide
- Le trigger reste l'avatar actuel (sans le `<Link>`)
- Menu aligné à droite (`align="end"`)

