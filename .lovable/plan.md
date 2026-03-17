

# Propositions de redesign premium -- NodieSkool

Voici trois directions de design distinctes. Choisissez celle qui vous parle le plus, et je l'implémenterai sur l'ensemble de la plateforme.

---

## Proposition A : "Notion-like Clean" -- Minimalisme élégant

Inspiré de Notion/Linear. Espaces blancs généreux, typographie serrée, pas d'ombre excessive.

**Principes :**
- Largeur de contenu réduite : `max-w-2xl` pour le feed, `max-w-4xl` pour les pages courantes (au lieu de `max-w-6xl` partout)
- Suppression des bordures et ombres sur les cards -- séparation par espacement uniquement
- Typographie plus fine : titres en `font-medium` au lieu de `font-bold`, tailles réduites
- Sidebar ultra-fine (w-56) avec icônes monolignes
- Posts sans card wrapper, séparés par un simple `border-b`
- CommunityPreview : hero full-width avec gradient subtil, sidebar droite flottante minimaliste sans card
- Classroom : grille de cours en liste verticale compacte (pas de cards, juste des lignes avec progress inline)
- Couleurs : fond blanc pur, accents très subtils, primaire desaturé

**Rendu visuel :**
```text
┌──────────────────────────────────────────┐
│ ▪ NodieSkool              🔍  🔔  👤    │
├────────┬─────────────────────────────────┤
│ Feed   │                                 │
│ Cours  │  Communauté XYZ                 │
│ Admin  │  ─────────────────              │
│        │  Avatar  Nom · il y a 2h        │
│        │  Contenu du post ici...          │
│        │  ♡ 12   💬 3                    │
│        │  ─────────────────              │
│        │  Avatar  Nom · il y a 5h        │
│        │  ...                            │
└────────┴─────────────────────────────────┘
```

---

## Proposition B : "Skool Premium" -- Raffinement du modèle actuel

Garde la structure actuelle mais l'élève en qualité : meilleur spacing, typographie premium, cards plus subtiles, max-widths contrôlés.

**Principes :**
- `max-w-2xl` pour le feed (au lieu de `max-w-4xl`), `max-w-5xl` pour les pages
- Cards avec `border` très léger (`border-border/50`), ombre quasi invisible, coins `rounded-2xl`
- Header de communauté compact : logo + nom + stats en une seule ligne horizontale
- Posts : padding accru (p-6), espacement entre posts réduit (`space-y-3`), typographie plus fine
- CommunityPreview : cover en `rounded-2xl`, sidebar card avec fond `bg-card` et ombre douce, bouton CTA avec la couleur primaire de la communauté
- Classroom/CourseDetail : sidebar des modules en card unique avec dividers internes
- Sidebar de navigation : logo en haut, navigation iconique avec labels, section user compacte
- Dashboard : stats en une ligne horizontale compacte, grille de communautés en 2 colonnes max
- Auth : centré avec illustration de fond subtile

**Rendu visuel :**
```text
┌──────────────────────────────────────────┐
│ ← NodieSkool  ▪  Communauté          🔔 │
├────────┬─────────────────────────────────┤
│  🏠    │  ┌─── Cover Image ──────────┐  │
│  💬    │  │                          │  │
│  📚    │  └──────────────────────────┘  │
│  ⚙️    │  ○ Logo  NomCommunauté  42 mbr │
│        │                                 │
│        │  ┌──────────────────────────┐   │
│  ──    │  │ ○ Write something...     │   │
│  👤    │  └──────────────────────────┘   │
│  Exit  │                                 │
│        │  ┌──────────────────────────┐   │
│        │  │ Post content             │   │
│        │  │ ♡ 💬 🔖              🔗  │   │
│        │  └──────────────────────────┘   │
└────────┴─────────────────────────────────┘
```

---

## Proposition C : "Dark Premium" -- Interface sombre haut de gamme

Inspiré de Discord/Vercel. Dark mode par défaut, accents lumineux, effets de profondeur.

**Principes :**
- Dark mode activé par défaut (classe `dark` sur `<html>`)
- Fond très sombre (`hsl(225, 25%, 6%)`), cards en `hsl(225, 25%, 9%)`
- Bordures subtiles lumineuses (`border-white/5`), hover avec glow effect
- Feed et pages en `max-w-2xl`, sidebar sombre avec navigation lumineuse au hover
- CommunityPreview : cover image avec overlay gradient sombre, texte blanc éclatant
- Posts : fond card légèrement plus clair, hover avec bordure lumineuse subtile
- Boutons primaires avec gradient léger et glow au hover
- Classroom : cards de cours avec overlay sombre sur thumbnail, texte contrasté
- Auth : fond sombre avec illustration gradient, card centrée avec bordure subtile

**Rendu visuel :**
```text
┌──────────────────────────────────────────┐
│ ▪ NodieSkool              🔍  🔔  👤    │ ← fond très sombre
├────────┬─────────────────────────────────┤
│ ▸ Feed │                                 │
│   Cours│  ┌─ cover avec gradient ────┐   │ ← cards avec 
│   Admin│  └──────────────────────────┘   │   bordure lumineuse
│        │  ○ Logo  NomCom   42 membres    │
│        │                                 │
│        │  ┌──────────────────────────┐   │
│  ──    │  │ Post lumineux sur sombre │   │
│  👤    │  │ ♡ 💬 🔖                  │   │
│        │  └──────────────────────────┘   │
└────────┴─────────────────────────────────┘
```

---

## Éléments communs aux trois propositions

Quel que soit le choix, j'appliquerai ces améliorations transversales :

| Page | Amélioration |
|------|-------------|
| **CommunityPreview** | Réduction largeur textes, meilleur spacing, sidebar plus compacte |
| **CommunityFeed** | Feed en `max-w-2xl`, header compact, posts mieux espacés |
| **Classroom** | Grille 2 colonnes max, stats compactes, progress plus visible |
| **CourseDetail** | Video player plein largeur, sidebar modules plus claire |
| **Dashboard** | Stats en ligne, grille communautés mieux proportionnée |
| **Profile** | Header visuel, stats compactes, formulaire centré |
| **Auth** | Centré avec branding plus visible |
| **Landing** | Hero plus impactant, sections mieux rythmées |
| **Sidebar** | Plus compacte, navigation claire, section user épurée |

## Fichiers modifiés (pour toute proposition)

`src/index.css`, `src/pages/community/CommunityPreview.tsx`, `src/pages/community/CommunityFeed.tsx`, `src/pages/Classroom.tsx`, `src/pages/CourseDetail.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Profile.tsx`, `src/pages/Auth.tsx`, `src/pages/Landing.tsx`, `src/pages/Discover.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/CommunitySidebar.tsx`, `src/components/layout/MainLayout.tsx`, `src/components/layout/CommunityLayout.tsx`, `src/components/community/PostCard.tsx`, `src/components/community/CreatePostCard.tsx`, `src/components/classroom/CourseCard.tsx`

