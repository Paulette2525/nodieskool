

# Corrections : zone de texte des publications et navigation sticky

## Probleme 1 : Zone de texte trop petite

La `Textarea` dans `CreatePostCard` est limitee a 3 lignes (`rows={isFocused ? 3 : 1}`) et `resize-none`. Impossible de voir tout son texte avant de publier.

**Fix** : Remplacer par un textarea auto-resize qui grandit avec le contenu (max ~200px), en utilisant un `useEffect` qui ajuste `scrollHeight` a chaque frappe.

## Probleme 2 : Navigation pas sticky

Le conteneur racine utilise `min-h-screen` au lieu de `h-screen`, ce qui fait que la page entiere (body) scrolle au lieu du conteneur interne. Le `sticky` ne fonctionne pas car il n'y a pas de scroll container borne.

**Fix** : Changer `min-h-screen` en `h-screen overflow-hidden` sur le div racine des deux layouts (MainLayout et CommunityLayout), pour que seul le contenu interne scrolle.

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/components/community/CreatePostCard.tsx` | Textarea auto-resize (grandit avec le contenu, max ~200px) |
| `src/components/layout/MainLayout.tsx` | `min-h-screen` → `h-screen overflow-hidden` |
| `src/components/layout/CommunityLayout.tsx` | `min-h-screen` → `h-screen overflow-hidden` |

