

# Plan : Ajouter la connexion Google OAuth

## Contexte

L'application utilise actuellement un systeme email/mot de passe. L'utilisateur souhaite simplifier l'authentification en ajoutant Google Sign-In. Lovable Cloud gere automatiquement les credentials Google OAuth -- aucune configuration manuelle n'est necessaire.

## Etapes

### 1. Configurer le module Social Auth

Utiliser l'outil **Configure Social Login** pour generer le module `src/integrations/lovable/` avec le package `@lovable.dev/cloud-auth-js`. Ce module fournit `lovable.auth.signInWithOAuth("google", ...)`.

### 2. Mettre a jour `handle_new_user()` (migration SQL)

Le trigger actuel utilise `raw_user_meta_data->>'username'` et `raw_user_meta_data->>'full_name'`. Pour Google OAuth, ces champs n'existent pas -- il faut aussi lire `full_name` depuis `raw_user_meta_data->>'name'` et generer un username depuis l'email si absent. Aussi recuperer l'avatar depuis `raw_user_meta_data->>'avatar_url'`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  RETURN NEW;
END;
$$;
```

### 3. Modifier `src/pages/Auth.tsx`

- Garder les formulaires email/mot de passe existants
- Ajouter un bouton **"Continuer avec Google"** bien visible au-dessus des tabs
- Au clic, appeler `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
- Ajouter un separateur "ou" entre le bouton Google et les formulaires

### 4. Modifier `src/hooks/useAuth.tsx`

- Ajouter une fonction `signInWithGoogle` qui utilise le module lovable
- L'exposer dans le contexte

### 5. PWA

Deja configure : `navigateFallbackDenylist: [/^\/~oauth/]` est present dans `vite.config.ts`.

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/integrations/lovable/` | Genere automatiquement par l'outil Configure Social Login |
| Migration SQL | Mettre a jour `handle_new_user()` pour supporter les metadonnees Google |
| `src/hooks/useAuth.tsx` | Ajouter `signInWithGoogle` |
| `src/pages/Auth.tsx` | Ajouter bouton Google + separateur |

