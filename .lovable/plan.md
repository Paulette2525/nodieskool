
# Plan : URLs de partage fonctionnelles pour les communautes

## Objectif
Permettre aux utilisateurs de partager l'URL de leur communaute (ex: `/c/ma-communaute/community`) et que les visiteurs puissent :
1. Voir un apercu de la communaute meme sans etre connecte
2. Se connecter/s'inscrire puis rejoindre automatiquement la communaute
3. Acceder au contenu une fois membre

---

## Problemes actuels identifies

1. **Redirection vers `/auth`** : Les visiteurs non connectes sont rediriges vers la page de connexion sans contexte
2. **Pas de page d'apercu public** : Aucune preview de la communaute n'est visible avant inscription
3. **Perte de l'URL cible** : Apres connexion, l'utilisateur est redirige vers `/community` au lieu de la communaute ciblee
4. **Pas de bouton "Rejoindre"** : Les utilisateurs connectes non-membres n'ont pas d'option pour rejoindre

---

## Solution proposee

### Phase 1 : Creer une page d'apercu public

Nouveau composant `src/pages/community/CommunityPreview.tsx` :
- Affiche le nom, description, logo et image de couverture
- Montre le nombre de membres (statistique publique)
- Bouton "Rejoindre" pour les utilisateurs connectes non-membres
- Bouton "Se connecter pour rejoindre" pour les visiteurs non authentifies

### Phase 2 : Modifier le flux de redirection

1. **Dans `CommunityLayout.tsx`** :
   - Au lieu de rediriger vers `/dashboard` si non-membre, afficher la page d'apercu
   - Permettre aux non-connectes de voir l'apercu public

2. **Dans `Auth.tsx`** :
   - Sauvegarder l'URL de destination dans `localStorage` avant redirection
   - Apres connexion reussie, rediriger vers l'URL sauvegardee

### Phase 3 : Logique de redirection intelligente

1. **Nouveau hook `useRedirectUrl.ts`** :
   ```text
   - saveRedirectUrl(url) : sauvegarde l'URL cible
   - getRedirectUrl() : recupere et efface l'URL sauvegardee
   - clearRedirectUrl() : efface l'URL
   ```

2. **Flux utilisateur** :
   ```text
   Visiteur clique sur /c/slug/community
          |
          v
   Est-il connecte ?
          |
   Non ---+--- Oui
     |          |
     v          v
   Apercu    Est-il membre ?
   public         |
     |      Non --+-- Oui
     v        |        |
   Bouton     v        v
   "Se       Apercu   Contenu
   connecter" + Btn    complet
              Rejoindre
   ```

---

## Fichiers a creer/modifier

### Nouveaux fichiers
| Fichier | Description |
|---------|-------------|
| `src/pages/community/CommunityPreview.tsx` | Page d'apercu public avec bouton rejoindre |
| `src/hooks/useRedirectUrl.ts` | Hook pour gerer la sauvegarde/restauration de l'URL cible |

### Fichiers a modifier
| Fichier | Modifications |
|---------|---------------|
| `src/components/layout/CommunityLayout.tsx` | Afficher l'apercu au lieu de rediriger |
| `src/pages/Auth.tsx` | Sauvegarder/restaurer l'URL de redirection |
| `src/contexts/CommunityContext.tsx` | Ajouter comptage des membres |

---

## Details techniques

### 1. CommunityPreview.tsx

```text
+------------------------------------------+
|  [Image de couverture]                   |
|  +------+                                |
|  | Logo |  Nom de la communaute          |
|  +------+  @slug                         |
|                                          |
|  Description de la communaute...         |
|                                          |
|  [Users] 42 membres  [Public/Prive]      |
|                                          |
|  [====== Rejoindre la communaute =====]  |
|                                          |
+------------------------------------------+
```

### 2. useRedirectUrl.ts

```text
const REDIRECT_KEY = "community_redirect_url"

saveRedirectUrl(url: string)
  -> localStorage.setItem(REDIRECT_KEY, url)

getAndClearRedirectUrl(): string | null
  -> const url = localStorage.getItem(REDIRECT_KEY)
  -> localStorage.removeItem(REDIRECT_KEY)
  -> return url

hasRedirectUrl(): boolean
  -> return localStorage.getItem(REDIRECT_KEY) !== null
```

### 3. Modifications CommunityLayout.tsx

Logique actuelle :
```text
if (!user) -> Navigate to /auth
if (!isMember && !isPublic) -> Navigate to /dashboard
```

Nouvelle logique :
```text
if (!community) -> Navigate to /dashboard
if (isMember) -> Afficher contenu complet (children)
else -> Afficher CommunityPreview avec option rejoindre
```

### 4. Modifications Auth.tsx

Ajout apres connexion reussie :
```text
const redirectUrl = getAndClearRedirectUrl()
if (redirectUrl) {
  navigate(redirectUrl)
} else {
  navigate('/dashboard')
}
```

---

## Ordre d'implementation

1. Creer `useRedirectUrl.ts`
2. Creer `CommunityPreview.tsx` 
3. Modifier `CommunityLayout.tsx` pour afficher l'apercu
4. Modifier `Auth.tsx` pour gerer la redirection post-connexion
5. Ajouter le comptage des membres dans le contexte
6. Tester le flux complet

---

## Resultat attendu

| Scenario | Comportement actuel | Nouveau comportement |
|----------|--------------------|--------------------|
| Visiteur non connecte | Redirection vers /auth | Apercu public + bouton connexion |
| Connecte, non-membre | Redirection vers /dashboard | Apercu + bouton "Rejoindre" |
| Connecte, membre | Contenu complet | Contenu complet (inchange) |
| Apres inscription via lien | Arrive sur /community | Rejoint automatiquement la communaute ciblee |
