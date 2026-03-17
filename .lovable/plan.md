

# Corrections logo + performance mobile

## Problème 1 : Logo Sparkles encore visible sur 3 pages

Les pages **Pricing**, **Contact** et **CreateCommunity** utilisent encore l'icône `<Sparkles>` au lieu du logo Tribbue. Ces pages n'ont pas été mises à jour lors du rebranding.

### Fichiers à modifier

| Fichier | Ligne | Action |
|---------|-------|--------|
| `src/pages/Pricing.tsx` | 76-81 | Remplacer le `<div>` avec `<Sparkles>` par `<img src={tribbueLogoImg}>` + importer le logo |
| `src/pages/Contact.tsx` | 42-47 | Idem |
| `src/pages/CreateCommunity.tsx` | 145-150 | Idem |

Pour chaque fichier :
- Ajouter `import tribbueLogoImg from "@/assets/tribbue-logo.png";`
- Remplacer le bloc `<div className="h-8 w-8 rounded-lg bg-primary..."><Sparkles .../></div>` par `<img src={tribbueLogoImg} alt="Tribbue" className="h-8 object-contain" />`

## Problème 2 : Performance mobile

Plusieurs facteurs de lenteur identifiés dans le code :

1. **`framer-motion` sur la Landing page** : Animations lourdes sur mobile. Remplacer les animations `motion.div` par des transitions CSS simples ou les désactiver sur mobile.

2. **QueryClient sans configuration de cache** : Le `QueryClient` dans `App.tsx` est instancié sans options. Ajouter `staleTime` et `gcTime` pour éviter les refetch inutiles.

3. **Chargement synchrone de toutes les pages** : Toutes les routes importent leurs composants de manière synchrone. Utiliser `React.lazy()` + `Suspense` pour le code-splitting des pages moins fréquentes (Landing, Pricing, Contact, Install, CreateCommunity, Discover, etc.).

4. **CSS inutilisé dans `App.css`** : Le fichier `src/App.css` contient des styles hérités de Vite qui ne servent plus. Le supprimer.

### Modifications

| Fichier | Action |
|---------|--------|
| `src/App.tsx` | Lazy-load des pages + configurer QueryClient avec `staleTime: 5 * 60 * 1000` |
| `src/App.css` | Supprimer (fichier inutile) |
| `src/pages/Landing.tsx` | Remplacer `motion.div` par des `div` avec classes CSS d'animation Tailwind |

