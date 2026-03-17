

# Corriger le build et l'authentification Google

## Problemes identifies

### 1. Erreur de build critique : `CardTitle` casse
Dans `src/components/ui/card.tsx` ligne 18, le composant `CardTitle` a un corps vide `{}` au lieu de retourner du JSX. Cela casse tout le rendu de l'application, y compris la page d'authentification.

### 2. Redirection vers le dashboard
La page `/auth` (ligne 30) redirige automatiquement vers `/dashboard` si l'utilisateur est deja connecte (`if (user)`). C'est un comportement normal. Si l'utilisateur est deja authentifie via Google (les logs montrent des logins Google reussis), il est redirige immediatement.

## Solution

### Fichier 1 : `src/components/ui/card.tsx`
Restaurer le composant `CardTitle` avec son JSX correct :
```tsx
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) =>
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
);
```

Cela corrigera l'erreur de build et permettra a la page d'authentification de s'afficher correctement avec le bouton Google fonctionnel.

