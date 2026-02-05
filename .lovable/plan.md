
# Plan de Transformation en Plateforme SaaS Multi-Communautés

## Vue d'ensemble

Transformer la plateforme actuelle (mono-communauté) en une plateforme SaaS multi-tenant où chaque utilisateur abonné peut créer et gérer plusieurs communautés, similaire à Skool.

---

## Architecture Multi-Tenant

```text
┌─────────────────────────────────────────────────────────────────┐
│                    PLATEFORME PRINCIPALE                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Page d'accueil / Landing                    │   │
│   │         (Découverte, Pricing, Inscription)               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│   ┌──────────────────────────▼──────────────────────────────┐   │
│   │              Dashboard Utilisateur                       │   │
│   │    ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│   │    │Communauté 1│  │Communauté 2│  │Communauté 3│        │   │
│   │    │  (Admin)   │  │  (Membre)  │  │  (Admin)   │        │   │
│   │    └────────────┘  └────────────┘  └────────────┘        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Système d'Abonnement                        │   │
│   │         (Free / Pro / Business via Stripe)               │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1 : Nouvelle Structure de Base de Données

### Nouvelles tables à créer

**1. Table `communities`**
- `id` (uuid, primary key)
- `owner_id` (uuid, reference vers profiles)
- `name` (text, nom de la communauté)
- `slug` (text, unique, URL-friendly)
- `description` (text)
- `logo_url` (text)
- `cover_url` (text)
- `primary_color` (text, couleur thème)
- `is_public` (boolean, visible dans l'annuaire)
- `is_active` (boolean, communauté active)
- `created_at`, `updated_at`

**2. Table `community_members`**
- `id` (uuid)
- `community_id` (uuid, reference vers communities)
- `user_id` (uuid, reference vers profiles)
- `role` (enum: 'owner', 'admin', 'moderator', 'member')
- `joined_at` (timestamp)
- `is_approved` (boolean, pour communautés privées)

**3. Table `subscriptions`**
- `id` (uuid)
- `user_id` (uuid, reference vers profiles)
- `stripe_customer_id` (text)
- `stripe_subscription_id` (text)
- `plan` (enum: 'free', 'pro', 'business')
- `status` (enum: 'active', 'canceled', 'past_due')
- `current_period_start` (timestamp)
- `current_period_end` (timestamp)
- `max_communities` (integer, limite selon le plan)

**4. Table `subscription_plans`**
- `id` (text, e.g. 'free', 'pro', 'business')
- `name` (text)
- `price_monthly` (integer, en centimes)
- `price_yearly` (integer, en centimes)
- `max_communities` (integer)
- `max_members_per_community` (integer)
- `features` (jsonb, liste des fonctionnalités)

### Modification des tables existantes

Ajouter `community_id` aux tables suivantes :
- `posts` (chaque post appartient a une communauté)
- `courses` (chaque cours appartient a une communauté)
- `events` (chaque événement appartient a une communauté)
- `community_settings` (remplacer par paramètres par communauté)
- `badges` (badges par communauté)

---

## Phase 2 : Système d'Abonnement avec Stripe

### Plans proposés

| Plan | Prix/mois | Communautés | Membres/communauté | Fonctionnalités |
|------|-----------|-------------|---------------------|-----------------|
| Free | 0€ | 1 | 100 | Basique |
| Pro | 29€ | 3 | 1000 | + Cours illimités, Stats |
| Business | 99€ | Illimité | Illimité | + Domaine personnalisé, API |

### Intégration Stripe

- Créer un webhook pour gérer les événements de paiement
- Gérer le cycle de vie des abonnements
- Page de tarification (Pricing)
- Page de gestion de l'abonnement

---

## Phase 3 : Nouvelles Pages et Routes

### Structure de navigation

```text
/                          → Landing page (découverte)
/pricing                   → Page de tarification
/auth                      → Inscription/Connexion
/dashboard                 → Liste des communautés de l'utilisateur
/create-community          → Création d'une nouvelle communauté
/c/:slug                   → Page d'accueil de la communauté
/c/:slug/community         → Feed de la communauté
/c/:slug/classroom         → Cours de la communauté
/c/:slug/leaderboard       → Classement de la communauté
/c/:slug/calendar          → Événements de la communauté
/c/:slug/admin             → Administration de la communauté
/settings                  → Paramètres compte utilisateur
/subscription              → Gestion de l'abonnement
```

### Nouvelles pages à créer

1. **Landing Page** (`/`) - Marketing, découverte des communautés publiques
2. **Pricing Page** (`/pricing`) - Plans et tarification
3. **Dashboard** (`/dashboard`) - Liste des communautés de l'utilisateur
4. **Create Community** (`/create-community`) - Formulaire de création
5. **Subscription** (`/subscription`) - Gestion de l'abonnement
6. **Community Home** (`/c/:slug`) - Page d'accueil d'une communauté

---

## Phase 4 : Refactoring du Code Existant

### Hooks à modifier

Tous les hooks doivent accepter un `communityId` :
- `usePosts(communityId)` → filtrer les posts par communauté
- `useCourses(communityId)` → filtrer les cours par communauté
- `useEvents(communityId)` → filtrer les événements par communauté
- `useLeaderboard(communityId)` → classement par communauté
- `useSettings(communityId)` → paramètres par communauté

### Nouveaux hooks à créer

- `useCommunities()` - Liste des communautés de l'utilisateur
- `useCommunity(slug)` - Détails d'une communauté
- `useSubscription()` - État de l'abonnement de l'utilisateur
- `useCommunityRole(communityId)` - Rôle de l'utilisateur dans une communauté

### Context à créer

- `CommunityContext` - Fournit la communauté active à tous les composants enfants

---

## Phase 5 : RLS (Row Level Security)

### Nouvelles politiques RLS

**Pour `communities`:**
- SELECT : Publiques OU membre de la communauté
- INSERT : Utilisateurs avec abonnement actif
- UPDATE/DELETE : Owner uniquement

**Pour `community_members`:**
- SELECT : Membres de la même communauté
- INSERT : Owner/Admin de la communauté OU auto-inscription si publique
- DELETE : Owner/Admin OU l'utilisateur lui-même

**Pour tables avec `community_id`:**
- Toutes les opérations filtrées par appartenance à la communauté

---

## Phase 6 : Interface Utilisateur

### Composants à créer

1. **CommunityCard** - Carte pour afficher une communauté dans le dashboard
2. **CommunitySelector** - Switcher entre communautés
3. **CreateCommunityForm** - Formulaire de création
4. **PricingTable** - Tableau des plans
5. **SubscriptionCard** - Affichage de l'abonnement actuel

### Layout à modifier

- `Sidebar` : Ajouter un sélecteur de communauté en haut
- `MainLayout` : Wrapper avec le contexte de communauté active

---

## Séquence d'Implémentation

1. **Étape 1** : Base de données (tables + RLS)
2. **Étape 2** : Intégration Stripe
3. **Étape 3** : Pages Landing + Pricing
4. **Étape 4** : Dashboard utilisateur
5. **Étape 5** : Création de communauté
6. **Étape 6** : Refactoring des hooks avec `communityId`
7. **Étape 7** : Routes dynamiques `/c/:slug/...`
8. **Étape 8** : Migration des données existantes

---

## Détails Techniques

### Migration des données existantes

- Créer une communauté par défaut "Vibe Coding Academy"
- Associer tous les posts, cours, événements à cette communauté
- Migrer les user_roles vers community_members

### Edge Functions requises

1. `stripe-webhook` - Gérer les événements Stripe
2. `create-checkout-session` - Créer une session de paiement
3. `manage-subscription` - Gérer les changements d'abonnement

### Variables d'environnement nécessaires

- `STRIPE_SECRET_KEY` - Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret pour les webhooks

---

## Estimation de l'effort

Ce projet est une refonte majeure qui nécessite plusieurs phases d'implémentation. Je propose de commencer par la Phase 1 (base de données) et la Phase 2 (Stripe), puis d'avancer progressivement.

Voulez-vous que je commence par la mise en place de la structure de base de données et l'intégration Stripe ?
