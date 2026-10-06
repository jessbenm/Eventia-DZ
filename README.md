# EVENTIA by Nahid — Plateforme de billetterie (Oran, Algérie)

## Prérequis

- Node.js 20+
- pnpm ou npm
- Docker (pour PostgreSQL)

## Installation

### 1. Base de données

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

API disponible sur `http://localhost:5000`

### 3. Frontend

```bash
# à la racine du projet
cp .env.example .env
npm install
npm run dev
```

Frontend sur `http://localhost:5173`

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@eventia.dz | Admin123! |
| User | sophie.martin@email.dz | User123! |

## Architecture

- **Frontend** : React + Vite + Tailwind
- **Backend** : Node.js + Express + TypeScript (architecture modulaire)
- **BDD** : PostgreSQL + Prisma
- **Auth** : JWT + Refresh Token + RBAC (USER / ADMIN)
- **Paiement** : Stripe (mode simulation si clés non configurées)

## Variables d'environnement

Voir `backend/.env.example` et `.env.example` à la racine.

## RBAC

- **USER** : Accueil, événements, réservation, paiement, mes billets, profil, paramètres
- **ADMIN** : Tout + menu Administration, dashboard admin, statistiques
