

# Plan : Rebranding NodieSkool → Tribbue

## Logo

Le PDF contient un logo texte "tribbue" en bleu avec un design distinctif sur les deux "b" (forme d'infini). Je vais extraire l'image du logo et l'utiliser comme image de marque partout.

## Changements

### 1. Copier le logo
- Copier `parsed-documents://...img_p0_1.jpg` vers `src/assets/tribbue-logo.png` (pour les composants React)
- Copier aussi vers `public/tribbue-logo.png` (pour index.html, SW, PWA)

### 2. Remplacer "NodieSkool" → "Tribbue" dans 10 fichiers

| Fichier | Occurrences |
|---------|-------------|
| `index.html` | title, meta author, apple-mobile-web-app-title, og:title, twitter:site |
| `vite.config.ts` | manifest name, short_name |
| `src/pages/Landing.tsx` | Header, footer (×3) |
| `src/pages/Dashboard.tsx` | Header |
| `src/pages/Discover.tsx` | Header |
| `src/pages/Auth.tsx` | Card title |
| `src/pages/Install.tsx` | Textes (×4) |
| `src/components/pwa/InstallBanner.tsx` | alt + texte |
| `public/custom-sw.js` | Default title + tag |
| `supabase/functions/send-push-notification/index.ts` | Email contact |

### 3. Remplacer l'icône Sparkles par le logo image
Dans les headers (Landing, Dashboard, Discover, Auth), remplacer le `<div>` avec l'icône `<Sparkles>` par une `<img>` du logo Tribbue. Le footer de Landing aussi.

### 4. Mettre à jour la mémoire projet
Le nom officiel devient "Tribbue".

