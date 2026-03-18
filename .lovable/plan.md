

## Ajouter un bouton "afficher/masquer le mot de passe"

### Changement

Ajouter une icone oeil (Eye/EyeOff de lucide-react) dans chaque champ mot de passe de `src/pages/Auth.tsx` pour basculer entre `type="password"` et `type="text"`.

### Implementation

**`src/pages/Auth.tsx`** :

1. Ajouter deux etats : `showLoginPassword` et `showSignupPassword`
2. Importer `Eye` et `EyeOff` depuis lucide-react
3. Wrapper chaque Input password dans un `div relative`, et ajouter un bouton icone positionne en absolue a droite dans le champ :
   - Clic sur l'icone toggle le type entre `password` et `text`
   - Icone `EyeOff` quand masque, `Eye` quand visible
4. Ajouter du padding-right (`pr-10`) sur les inputs password pour eviter que le texte passe sous l'icone

Concerne les 3 champs password : login, signup, et la page reset-password si applicable.

