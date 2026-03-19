

## Plan : Afficher la bannière d'installation sur tablettes

### Problème

La bannière ne s'affiche pas sur tablettes car :
- Les **iPad récents** (iPadOS 13+) se présentent comme "Macintosh" dans le User-Agent, donc le test `/iPad|iPhone|iPod/` ne les détecte pas
- Les **tablettes Android** en mode navigateur standard peuvent ne pas déclencher `beforeinstallprompt` selon le navigateur utilisé

### Correction

**Fichier : `src/components/pwa/InstallBanner.tsx`**

Améliorer la détection iOS/iPadOS en ajoutant la vérification pour les iPad modernes :

```typescript
// Détection actuelle (rate les iPad récents)
const ios = /iPad|iPhone|iPod/.test(ua);

// Nouvelle détection (inclut iPadOS 13+)
const ios = /iPad|iPhone|iPod/.test(ua) 
  || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
```

C'est le seul changement nécessaire. Les iPad modernes seront alors détectés comme iOS, la bannière s'affichera et les instructions "Partager → Écran d'accueil" seront proposées.

Adapter aussi le texte de la bannière pour ne pas dire uniquement "téléphone" :
- `"Installez l'app sur votre téléphone"` → `"Installez l'app sur votre appareil"`

