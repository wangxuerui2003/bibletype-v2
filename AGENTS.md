# AGENTS.md

Use this file for repository-specific rules only. For setup and operations, defer to the dedicated docs:

- [README.md](./README.md)
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [BACKUPS.md](./BACKUPS.md)
- [SERVER_BOOTSTRAP_CHECKLIST.md](./SERVER_BOOTSTRAP_CHECKLIST.md)

## Project intent

BibleType V2 is a code-first rewrite of BibleType. The app includes:

- verse-by-verse typing practice
- email/password auth
- Google auth
- persistent progress and attempt history
- an in-repo admin panel
- verse-to-place map support
- multiplayer race flows

Do not reintroduce PocketBase or any schema-in-the-dashboard workflow.

## Required stack

Unless the user explicitly changes direction, use:

- `Nuxt 4`
- `Vue 3`
- `TypeScript`
- `Tailwind CSS`
- `PostgreSQL`
- `Drizzle ORM` and `drizzle-kit`
- `Better Auth`
- `MapLibre GL JS`
- `Vitest`
- `@vue/test-utils`
- `Playwright`

## Architecture rules

- Keep frontend, server routes, auth, and admin UI in this repository.
- Keep business logic in shared modules, not directly in page components.
- Prefer server-side and database-backed flows over client-owned state.
- Keep multiplayer race state server-authoritative.
- Treat imported datasets as inputs to normalize into app-owned tables.
- Prefer precomputed verse-to-place mappings over runtime entity extraction.

## Data and schema rules

- Schema changes must be committed as Drizzle schema updates plus migrations.
- Do not rely on manual database edits as the normal workflow.
- If a task needs data backfill or reindexing, implement it as a script or migration.
- Meaningful admin mutations should be auditable.

Important:

- `pnpm import:bible` is destructive. It clears Bible content and several progress-related tables before reimporting.
- `pnpm import:places` refreshes place and verse-place mapping data.

## Auth and authorization rules

- Google login is required.
- Email/password login is required.
- `/admin` pages and admin APIs must be gated by role.
- Support at least `user` and `admin` roles.

## UI rules

- The visual direction should remain typing-first and clearly inspired by Monkeytype without becoming a clone.
- Keep the main typing stage low-noise and legible.
- Motion should stay restrained and support typing, race progress, and result transitions.
- Preserve the established visual language unless the user asks for a redesign.

## Testing rules

Do not treat tests as optional for meaningful features.

Minimum areas to cover when relevant:

- text normalization
- verse progression logic
- auth flows
- API validation and authorization
- admin authorization
- import scripts
- verse-place mapping behavior
- race state transitions and realtime sync
- core component behavior
- critical end-to-end flows

## Deployment assumptions

- Production uses host-level `nginx`, not Caddy.
- SSL is handled on the host with Certbot.
- The app is expected to run behind `nginx` on `127.0.0.1:3100`.
- PostgreSQL should not be exposed publicly on production hosts.

## Old project references

Use the old project as reference material only. Do not revive its architecture.

- old frontend reference: `/Users/wxuerui/coding/bibletype-old/bibletype-frontend`
- old Bible JSON reference: `/Users/wxuerui/coding/bibletype-old/bible-scraper/Bible`

Safe reuse:

- typing interaction patterns
- text normalization behavior
- Bible JSON input structure

Do not reuse:

- PocketBase collections or rules
- manual backend schema management
- frontend-owned verse ordering as the system of record

## Working style for future agents

- Read [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) before major architectural work.
- Make the smallest coherent change.
- Do not invent a parallel architecture when the current one can be extended.
- When introducing a dependency, justify why existing tools are insufficient.
- When changing operational behavior, update the relevant docs.
- Do not commit generated local artifacts such as `.nuxt`, `.data`, `node_modules`, test outputs, or local env files.

## Definition of done for major features

A major feature is not done until the relevant parts are present:

- schema and migrations if needed
- server API if needed
- UI if needed
- correct auth and authorization
- automated test coverage for the critical path
- operational documentation if deployment or maintenance changed
