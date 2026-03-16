# BibleType V2

BibleType V2 is a full-stack rewrite of BibleType built with Nuxt 4, Vue 3, TypeScript, PostgreSQL, Drizzle, Better Auth, and MapLibre.

This repository contains:

- the user-facing typing experience
- email/password and Google sign-in
- admin pages and admin APIs
- Bible and place import scripts
- multiplayer race routes and services

## Local development

1. Install dependencies:

```bash
pnpm install
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Start local infrastructure:

```bash
docker compose up -d
```

4. Run migrations and import Bible data:

```bash
pnpm db:migrate
pnpm import:bible
pnpm import:places
```

5. Start the app:

```bash
pnpm dev
```

The development server runs on `http://localhost:3100`.

## Deployment

Use the deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Backup and restore

Use [BACKUPS.md](./BACKUPS.md) for database backup scheduling, restore steps, and recovery checks.

## AI server bootstrap

Use [SERVER_BOOTSTRAP_CHECKLIST.md](./SERVER_BOOTSTRAP_CHECKLIST.md) when handing deployment to an AI on a fresh VPS.

## Important operational notes

- `pnpm import:bible` is destructive. It clears Bible content and several progress-related tables before reimporting data.
- `pnpm import:places` refreshes place and verse-place mapping data.
- Production deployment assumes host-level `nginx` with SSL managed outside this repository.
