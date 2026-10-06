# EVENTIA Backend — Documentation

## Architecture modulaire

```
backend/src/
├── app.ts                 # Express app + routes
├── server.ts              # Point d'entrée
├── config/env.ts          # Variables d'environnement
├── database/
│   └── prisma.client.ts
├── middlewares/
│   ├── auth.middleware.ts      # JWT + RBAC
│   ├── validate.middleware.ts  # Zod
│   └── errorHandler.middleware.ts
├── utils/
│   ├── jwt.util.ts
│   ├── email.util.ts
│   ├── notification.util.ts
│   ├── cloudinary.util.ts
│   └── qrcode.util.ts
└── modules/
    ├── auth/          # Login, register, Google OAuth, JWT
    ├── users/         # Profil, liste admin (pagination/recherche)
    ├── events/        # CRUD événements
    ├── bookings/      # Réservations
    ├── tickets/       # QR codes
    ├── payments/      # Stripe + confirmation
    ├── statistics/    # Stats admin + publiques
    ├── notifications/ # Notifications en base
    └── upload/        # Cloudinary (images)
```

## Schéma Prisma (PostgreSQL)

| Table | Description |
|-------|-------------|
| `User` | Utilisateurs (LOCAL ou GOOGLE), rôles USER/ADMIN |
| `RefreshToken` | Tokens de rafraîchissement JWT |
| `Event` | Événements à Oran |
| `Booking` | Réservations |
| `Ticket` | Billets avec QR code |
| `Payment` | Paiements Stripe |
| `Notification` | Notifications persistées |

## Routes API

### Auth `/api/auth`
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/register` | — | Inscription + email bienvenue |
| POST | `/login` | — | Connexion + email notification |
| POST | `/google` | — | Google OAuth (ID token) |
| POST | `/refresh` | — | Refresh token |
| POST | `/logout` | — | Déconnexion |
| GET | `/me` | JWT | Profil utilisateur |

### Events `/api/events`
| POST | `/` | ADMIN | Créer événement |
| GET | `/` | — | Liste (public ou admin) |
| GET | `/:id` | — | Détail |
| PUT | `/:id` | ADMIN | Modifier |
| DELETE | `/:id` | ADMIN | Supprimer |
| PATCH | `/:id/publish` | ADMIN | Publier |
| PATCH | `/:id/disable` | ADMIN | Désactiver |

### Bookings `/api/bookings`
| POST | `/` | USER | Créer réservation |
| GET | `/my` | USER | Mes réservations |
| PATCH | `/:id/cancel` | USER | Annuler |
| GET | `/` | ADMIN | Toutes |

### Tickets `/api/tickets`
| GET | `/my` | USER | Mes billets |
| GET | `/:id/qr` | USER | QR code image |
| POST | `/validate` | ADMIN | Valider QR |

### Payments `/api/payments`
| POST | `/create-intent` | USER | Stripe intent |
| POST | `/confirm` | USER | Confirmer paiement |
| GET | `/my` | USER | Historique |
| POST | `/webhook` | Stripe | Webhook |

### Users `/api/users`
| PUT | `/me` | USER | Modifier profil |
| GET | `/` | ADMIN | Liste (pagination, recherche, tri) |

### Statistics `/api/statistics`
| GET | `/public` | — | Stats homepage |
| GET | `/overview` | ADMIN | Dashboard complet |
| GET | `/revenue` | ADMIN | Revenus |

### Notifications `/api/notifications`
| GET | `/` | USER | Mes notifications |
| PATCH | `/:id/read` | USER | Marquer lue |
| PATCH | `/read-all` | USER | Tout marquer lu |

### Upload `/api/upload`
| POST | `/event-image` | ADMIN | Upload Cloudinary |

## Variables `.env`

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://eventia:eventia123@localhost:5432/eventia_db

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_CURRENCY=dzd

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM="EVENTIA <noreply@eventia.dz>"

ADMIN_EMAIL=admin@eventia.dz
ADMIN_PASSWORD=Admin123!
```

## Installation

```bash
docker compose up -d
cd backend
npm install
npm run db:setup
npm run dev
```

## Comptes seed

- Admin : `admin@eventia.dz` / `Admin123!`
- User : `sophie.martin@email.dz` / `User123!`

## Fonctionnalités encore non implémentées

| Zone | Détail |
|------|--------|
| **Stripe réel** | Paiement simulé si `STRIPE_SECRET_KEY` est un placeholder. Le formulaire carte/PayPal dans `Payment.tsx` est décoratif. |
| **Mot de passe oublié** | Bouton présent dans `Auth.tsx`, aucune route API. |
| **Témoignages / Sponsors** | Contenu marketing statique dans `Home.tsx` (pas en base). |
| **Like / Partage événement** | Boutons dans `EventDetail.tsx` sans persistance. |
| **Admin utilisateurs** | Boutons modifier/supprimer non branchés. Pagination UI absente (API prête). |
| **Tendances dashboard** | Pourcentages `+18%`, `+3%` dans certains StatCards encore fictifs. |
| **Préférences notifications** | Section dans `UserDashboard.tsx` sans backend. |
| **Liens Footer** | Réseaux sociaux et pages légales sans action. |
| **Réservation** | Champs nom/email/téléphone validés localement mais non envoyés à l'API (le booking utilise l'utilisateur connecté). |
| **Reviews / Ratings** | Affichés depuis la DB (seed) mais pas de système d'avis utilisateur. |

## Prérequis production

1. Démarrer **Docker Desktop** puis `docker compose up -d`
2. `cd backend && npm run db:setup`
3. Configurer SMTP, Cloudinary, Google OAuth et Stripe dans `.env`
4. Créer `.env` frontend avec `VITE_GOOGLE_CLIENT_ID` (même ID que backend)
