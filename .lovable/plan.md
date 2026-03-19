

## Plan : Installation directe depuis le bouton

### Contrainte technique importante

Sur **Android/Chrome**, le bouton "Installer" déclenche déjà l'installation native directement (via `beforeinstallprompt`). Ça fonctionne.

Sur **iPhone/Safari**, Apple ne fournit **aucune API** pour déclencher l'installation automatiquement. La seule méthode possible est : Partager → Ajouter à l'écran d'accueil. C'est une limitation d'Apple, pas de l'application.

### Ce qu'on peut améliorer

Au lieu de rediriger vers une page `/install` séparée, on affiche les instructions **directement dans la bannière** sous forme de mini-guide en place (popup/tooltip), sans quitter la page en cours.

### Modifications

**Fichier : `src/components/pwa/InstallBanner.tsx`**
- Sur iOS : remplacer le bouton "Guide" (lien vers `/install`) par un bouton "Installer" qui ouvre un petit panneau déroulant inline avec les 3 étapes (Partager → Écran d'accueil → Ajouter), directement dans la bannière
- Sur Android sans `deferredPrompt` : remplacer "En savoir plus" par les mêmes instructions inline adaptées (ouvrir dans Chrome)

**Fichier : `src/pages/Landing.tsx`**
- Le lien "Installer l'application Tribbue" en bas de page mobile : même logique — si `deferredPrompt` disponible, déclencher l'install directement ; sinon, afficher les instructions inline ou dans un petit dialog

### Résultat
- Android : clic = installation immédiate (déjà le cas, on garde)
- iPhone : clic = instructions claires affichées sur place, sans redirection
- Plus besoin de quitter la page en cours pour comprendre comment installer

