

## Probleme

La banniere d'installation PWA (`InstallBanner`) depend de l'evenement `beforeinstallprompt` du navigateur pour s'afficher sur Android/Desktop. Cet evenement n'est **pas garanti** : il ne se declenche pas sur Firefox, certains navigateurs in-app (Instagram, Facebook, TikTok), ni si l'utilisateur a deja ferme la banniere (masquee 7 jours). Sur iOS, la banniere s'affiche mais ne peut pas declencher l'installation — elle donne juste des instructions textuelles.

Resultat : beaucoup d'utilisateurs ne voient jamais la possibilite d'installer l'app.

## Solution

Ajouter un **bouton "Installer l'app" visible en permanence** dans la landing page (section hero ou navigation), independant de `beforeinstallprompt`. Ce bouton redirige vers la page `/install` qui existe deja et guide l'utilisateur selon son appareil.

### Changements

**`src/pages/Landing.tsx`** :
- Ajouter un bouton/lien "Installer l'app" avec l'icone `Download` dans la section hero, a cote des boutons existants ("Creer votre communaute" / "Decouvrir")
- Ce bouton pointe vers `/install` et est visible uniquement si l'app n'est pas deja en mode standalone (pas deja installee)
- Style secondaire (variant outline ou ghost) pour ne pas concurrencer le CTA principal

**`src/components/pwa/InstallBanner.tsx`** :
- Reduire le delai de masquage de 7 jours a 3 jours pour que la banniere reapparaisse plus vite
- Ajouter un lien "En savoir plus" qui pointe vers `/install` pour les utilisateurs dont le navigateur ne supporte pas `beforeinstallprompt`

Aucun autre fichier modifie. La page `/install` existante gere deja tous les cas (iOS, Android, Desktop, deja installe).

