

## Plan : Agrandir le logo Collonie sur toute la plateforme

Le logo utilise actuellement `h-8` (32px) dans les navbars et `h-10` (40px) sur les pages auth. C'est effectivement petit. Je vais augmenter les tailles de manière cohérente.

### Nouvelles tailles

| Contexte | Avant | Après |
|----------|-------|-------|
| Navbar (Landing, Dashboard, Pricing, Contact, Discover, CreateCommunity) | `h-8` | `h-12` |
| Footer (Landing) | `h-7` | `h-10` |
| Pages Auth (Auth, ForgotPassword, ResetPassword) | `h-10` | `h-14` |
| Page Install | `w-20 h-20` | `w-24 h-24` |

### Fichiers modifiés (10 fichiers)
- `src/pages/Landing.tsx` — navbar `h-12`, footer `h-10`
- `src/pages/Dashboard.tsx` — `h-12`
- `src/pages/Pricing.tsx` — `h-12`
- `src/pages/Contact.tsx` — `h-12`
- `src/pages/Discover.tsx` — `h-12`
- `src/pages/CreateCommunity.tsx` — `h-12`
- `src/pages/Auth.tsx` — `h-14`
- `src/pages/ForgotPassword.tsx` — `h-14`
- `src/pages/ResetPassword.tsx` — `h-14`
- `src/pages/Install.tsx` — `w-24 h-24`

Aucun changement de logique, uniquement les classes CSS de taille.

