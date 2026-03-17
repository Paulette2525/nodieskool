

# Remplacer les icones PWA et favicon par le logo Tribbue

## Probleme

Les fichiers `public/pwa-192x192.png` et `public/pwa-512x512.png` contiennent toujours l'ancien logo "N" bleu/vert. Ces fichiers sont utilises par :
- Le **favicon** du navigateur (`index.html` ligne 27)
- L'**apple-touch-icon** (`index.html` ligne 15)
- Le **manifest PWA** (`vite.config.ts` lignes 39-52) -- icone de l'app installee
- Les **notifications push** (`public/custom-sw.js` lignes 3, 16-17)
- La **page Install** (`src/pages/Install.tsx` ligne 74)
- La **banniere Chrome "Appli installee"** visible sur la capture

Le logo Tribbue (`src/assets/tribbue-logo.png` et `public/tribbue-logo.png`) existe deja mais n'est pas utilise pour ces usages.

## Solution

| Fichier | Action |
|---------|--------|
| `public/pwa-192x192.png` | Remplacer par une copie de `public/tribbue-logo.png` |
| `public/pwa-512x512.png` | Idem |
| `public/favicon.ico` | Remplacer le lien dans `index.html` pour pointer vers `/tribbue-logo.png` |
| `index.html` | Changer `href="/pwa-192x192.png"` en `href="/tribbue-logo.png"` pour favicon et apple-touch-icon |
| `vite.config.ts` | Changer les `src` des icones manifest pour utiliser `/tribbue-logo.png` |
| `public/custom-sw.js` | Remplacer `/pwa-192x192.png` par `/tribbue-logo.png` |
| `src/pages/Install.tsx` | Utiliser `tribbueLogoImg` importe depuis `@/assets/tribbue-logo.png` au lieu de `/pwa-192x192.png` |

## Note importante

Le logo Tribbue actuel est rectangulaire (texte "tribbue"). Pour une icone d'app mobile ideale, une icone carree serait preferable. En attendant, le logo actuel sera utilise partout pour la coherence de marque. Les anciens fichiers `pwa-*.png` ne seront plus references.

