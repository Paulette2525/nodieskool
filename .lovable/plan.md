

# Page de consentement Google OAuth

## Contexte

La page que vous voyez (capture d'ecran) est la page de consentement OAuth geree par Lovable Cloud. Elle est hebergee sur `oauth.lovable.app` et affiche le nom "Community Builder Hub" avec le logo Lovable. Cette page est **obligatoire** selon les regles de Google — elle ne peut pas etre supprimee. Elle apparait uniquement la premiere fois qu'un utilisateur autorise l'application.

## Le probleme

Cette page est geree par l'infrastructure Lovable Cloud. On ne peut **pas la modifier via le code du projet**. Le nom "Community Builder Hub" et le logo Lovable sont configures dans les identifiants OAuth geres par Lovable.

## Solution : Utiliser vos propres identifiants Google OAuth

Pour personnaliser cette page avec le nom "Tribbue", votre logo, et des informations en francais, vous devez creer vos propres identifiants Google OAuth :

1. **Google Cloud Console** (`console.cloud.google.com`) :
   - Creer un projet nomme "Tribbue"
   - Configurer l'ecran de consentement OAuth avec :
     - Nom de l'application : "Tribbue"
     - Logo : votre logo Tribbue
     - Langue : francais
   - Creer des identifiants OAuth (Client ID + Secret)
   - Ajouter l'URL de callback fournie par Lovable Cloud dans les "Authorized redirect URIs"

2. **Dans Lovable Cloud** :
   - Aller dans les parametres d'authentification (Cloud → Users → Authentication Settings → Sign In Methods → Google)
   - Entrer votre Client ID et Client Secret personnalises

Cela remplacera la page "Community Builder Hub / Lovable" par une page personnalisee "Tribbue" avec votre branding.

## Ce qui ne change pas cote code

Aucune modification du code n'est necessaire. Le `lovable.auth.signInWithOAuth("google", ...)` existant fonctionnera automatiquement avec les nouveaux identifiants.

## Limitation

La langue de la page de consentement Google depend des parametres de langue du compte Google de l'utilisateur, pas de l'application. On ne peut pas forcer le francais — mais le nom et le logo seront bien ceux de Tribbue.

