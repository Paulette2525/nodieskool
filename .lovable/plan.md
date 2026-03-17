

# Générer une icône carrée avec le symbole infini Tribbue

## Objectif
Créer une icône d'app mobile carrée (512x512) montrant uniquement le symbole d'infini stylisé du logo Tribbue, en bleu Tribbue (#2563EB) sur fond blanc.

## Plan

### 1. Créer une edge function `generate-icon`
- Appelle l'API Lovable AI avec le modèle `google/gemini-3-pro-image-preview` (meilleure qualité d'image)
- Prompt précis : symbole d'infini stylisé, bleu #2563EB, fond blanc, carré 512x512, style minimaliste app icon
- Sauvegarde l'image générée dans le bucket `community-assets` (public)
- Retourne l'URL de l'image

### 2. Créer une page temporaire `/icon-preview`
- Appelle la edge function au clic d'un bouton "Générer"
- Affiche l'icône générée en aperçu (carré, coins arrondis simulés)
- Bouton "Utiliser cette icône" qui copie l'image vers les fichiers PWA et met à jour les références

### 3. Fichiers à créer/modifier
| Fichier | Action |
|---------|--------|
| `supabase/functions/generate-icon/index.ts` | Nouvelle edge function |
| `src/pages/IconPreview.tsx` | Page temporaire d'aperçu |
| `src/App.tsx` | Ajouter route `/icon-preview` |

