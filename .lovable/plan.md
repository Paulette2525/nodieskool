

# Plan : Bannière d'installation PWA automatique sur mobile

## Problème
La page `/install` existe mais l'utilisateur doit la trouver manuellement. Il n'y a aucune notification ou bannière qui s'affiche automatiquement sur mobile pour suggérer l'installation.

## Solution
Créer un composant `InstallBanner` qui s'affiche automatiquement en bas de l'écran sur mobile quand l'app n'est pas encore installée. Il intercepte le `beforeinstallprompt` (Android/Chrome) ou détecte iOS pour afficher un rappel contextuel. Le banner peut être fermé et ne réapparaît pas pendant 7 jours (via `localStorage`).

## Changements

### 1. Créer `src/components/pwa/InstallBanner.tsx`
- Composant "smart banner" fixe en bas de l'écran (mobile uniquement)
- Écoute `beforeinstallprompt` pour Android/Chrome → bouton "Installer"
- Détecte iOS/Safari → message "Ajouter à l'écran d'accueil" avec instructions
- Ne s'affiche pas si déjà en mode `standalone` (déjà installée)
- Bouton fermer qui stocke un timestamp dans `localStorage` pour masquer pendant 7 jours
- Design : barre compacte avec icône app, texte court, bouton CTA et bouton fermer

### 2. Intégrer dans `src/App.tsx`
- Ajouter `<InstallBanner />` au niveau racine, après les `<Toaster />`, pour qu'il soit visible sur toutes les pages

## Fichiers
| Fichier | Action |
|---------|--------|
| `src/components/pwa/InstallBanner.tsx` | Créer |
| `src/App.tsx` | Ajouter `<InstallBanner />` |

