
# Plan d'implémentation des fonctionnalités manquantes

## Vue d'ensemble

Ce plan couvre l'implémentation de toutes les fonctionnalités identifiées comme manquantes ou incomplètes pour finaliser la plateforme.

---

## Phase 1 : Fonctionnalités essentielles (Priorité haute)

### 1.1 Page de profil utilisateur
Créer une page complète permettant aux utilisateurs de gérer leur profil.

**Fonctionnalités :**
- Affichage et modification du nom, username, bio
- Upload et modification de l'avatar
- Statistiques personnelles (posts, commentaires, points, niveau)
- Historique des formations suivies et progression
- Badges obtenus

**Fichiers à créer/modifier :**
- `src/pages/Profile.tsx` (nouvelle page)
- `src/hooks/useProfile.ts` (hook pour les mutations de profil)
- `src/App.tsx` (ajout de la route `/profile`)

---

### 1.2 Page des paramètres utilisateur
Rendre le bouton "Paramètres" de la sidebar fonctionnel.

**Fonctionnalités :**
- Modification du mot de passe
- Préférences de notification
- Gestion des préférences d'affichage
- Suppression du compte (avec confirmation)

**Fichiers à créer/modifier :**
- `src/pages/Settings.tsx` (nouvelle page)
- `src/components/layout/Sidebar.tsx` (lier le bouton à la page)
- `src/App.tsx` (ajout de la route `/settings`)

---

### 1.3 Système de stockage d'images (Supabase Storage)
Configurer le stockage pour les avatars et images des posts.

**Base de données :**
```sql
-- Créer le bucket pour les avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Créer le bucket pour les images des posts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-images', 'post-images', true);

-- Politiques RLS pour les buckets
```

**Fichiers à créer/modifier :**
- `src/hooks/useStorage.ts` (hook pour upload/delete)
- `src/components/community/CreatePostCard.tsx` (upload d'image)
- `src/pages/Profile.tsx` (upload d'avatar)

---

### 1.4 Réinitialisation du mot de passe
Implémenter le flux complet "Mot de passe oublié".

**Fonctionnalités :**
- Lien "Mot de passe oublié" sur la page de connexion
- Page de demande de reset par email
- Page de création du nouveau mot de passe

**Fichiers à créer/modifier :**
- `src/pages/ForgotPassword.tsx` (nouvelle page)
- `src/pages/ResetPassword.tsx` (nouvelle page)
- `src/pages/Auth.tsx` (ajouter le lien)
- `src/App.tsx` (routes)

---

## Phase 2 : Améliorations UX (Priorité moyenne)

### 2.1 Système de notifications temps réel
Alertes pour les interactions sociales.

**Base de données :**
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'event', 'badge'
  title TEXT NOT NULL,
  message TEXT,
  reference_id UUID, -- ID du post, commentaire, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activer le realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

**Fichiers à créer/modifier :**
- `src/hooks/useNotifications.ts` (hook avec realtime)
- `src/components/notifications/NotificationBell.tsx` (icône avec badge)
- `src/components/notifications/NotificationDropdown.tsx` (liste)
- `src/components/layout/Sidebar.tsx` (intégrer le bell)

---

### 2.2 Système de badges et achievements
Récompenses visuelles pour les accomplissements.

**Base de données :**
```sql
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- nom de l'icône ou URL
  criteria TEXT, -- critère d'obtention
  points_required INTEGER DEFAULT 0
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
```

**Fichiers à créer/modifier :**
- `src/hooks/useBadges.ts`
- `src/components/badges/BadgeCard.tsx`
- `src/pages/Profile.tsx` (afficher les badges)

---

### 2.3 Recherche globale
Barre de recherche pour posts, cours, membres.

**Fichiers à créer/modifier :**
- `src/components/search/GlobalSearch.tsx` (composant de recherche)
- `src/hooks/useSearch.ts` (hook avec debounce)
- `src/components/layout/MainLayout.tsx` (intégrer la barre)

---

## Phase 3 : Fonctionnalités avancées (Priorité basse)

### 3.1 Messagerie privée
Messages directs entre membres.

**Base de données :**
```sql
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Fichiers à créer/modifier :**
- `src/pages/Messages.tsx`
- `src/hooks/useMessages.ts`
- `src/components/messages/ConversationList.tsx`
- `src/components/messages/ChatWindow.tsx`

---

### 3.2 Système de quiz
Quiz à la fin de chaque module pour validation.

**Base de données :**
```sql
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70
);

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- [{text, isCorrect}]
  order_index INTEGER DEFAULT 0
);

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 3.3 Certificats téléchargeables
Génération PDF à la fin des formations.

**Fichiers à créer/modifier :**
- `supabase/functions/generate-certificate/index.ts` (edge function)
- `src/components/certificates/CertificatePreview.tsx`
- `src/pages/CourseDetail.tsx` (bouton télécharger)

---

## Résumé des tâches par ordre de priorité

| Priorité | Fonctionnalité | Complexité | Estimé |
|----------|----------------|------------|--------|
| Haute | Page profil utilisateur | Moyenne | 1-2 sessions |
| Haute | Page paramètres utilisateur | Faible | 1 session |
| Haute | Storage images (avatars/posts) | Moyenne | 1 session |
| Haute | Mot de passe oublié | Faible | 1 session |
| Moyenne | Notifications temps réel | Haute | 2 sessions |
| Moyenne | Système de badges | Moyenne | 1-2 sessions |
| Moyenne | Recherche globale | Faible | 1 session |
| Basse | Messagerie privée | Haute | 2-3 sessions |
| Basse | Système de quiz | Haute | 2-3 sessions |
| Basse | Certificats PDF | Moyenne | 1-2 sessions |

---

## Détails techniques

### Migrations de base de données requises
1. Création des buckets de stockage (avatars, post-images)
2. Table `notifications` avec realtime
3. Tables `badges` et `user_badges`
4. Tables pour messagerie (si implémentée)
5. Tables pour quiz (si implémenté)

### Politiques RLS à configurer
- Storage buckets : upload par propriétaire, lecture publique
- Notifications : lecture/modification par propriétaire uniquement
- Badges : lecture publique, modification admin uniquement
- Messages : lecture/écriture par participants uniquement

### Hooks React à créer
- `useProfile` - gestion du profil utilisateur
- `useStorage` - upload/suppression de fichiers
- `useNotifications` - notifications avec realtime
- `useBadges` - système de badges
- `useSearch` - recherche globale avec debounce

---

## Recommandation

Je recommande de commencer par la **Phase 1** qui couvre les fonctionnalités essentielles pour une plateforme fonctionnelle :
1. Page profil utilisateur
2. Page paramètres  
3. Storage pour images
4. Réinitialisation mot de passe

Ces 4 éléments rendront la plateforme complète pour un lancement initial. Les phases 2 et 3 peuvent être ajoutées progressivement après le lancement.
