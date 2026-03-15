# AGENTS.md

This repository contains the rewrite of BibleType. Follow these instructions when planning or implementing work in this codebase.

## Mission

Build BibleType V2 as a code-first full-stack application with:

- Google login
- email and password login
- verse-by-verse typing practice
- persistent user progress and attempt history
- an admin panel for data and user management
- a map showing Bible places relevant to the current verse
- a multiplayer race mode for 2 to 4 players

The rewrite replaces PocketBase with application-owned backend code, schema, and migrations.

## Source of truth

- Application code in this repository is the source of truth for behavior.
- Database schema must be defined in Drizzle schema files and migrations.
- Production deployment assumes the host machine already runs `nginx`.
- SSL is handled on the host with Certbot, not inside this project.

## Old project references

Use the old project as reference material only. Do not revive its architecture.

- Old frontend reference:
  - `/Users/wxuerui/coding/bibletype-old/bibletype-frontend`
- Old Bible JSON data:
  - `/Users/wxuerui/coding/bibletype-old/bible-scraper/Bible`

Reuse proven ideas from the old project when helpful:

- typing interaction patterns
- text normalization behavior
- Bible JSON input structure

Do not reuse these old architectural choices:

- PocketBase collections and rules
- manual backend schema management
- frontend-owned verse ordering as the primary system of record

## Required stack

Unless the user explicitly changes direction, use:

- `Nuxt 4`
- `Vue 3`
- `TypeScript`
- `Tailwind CSS`
- `PostgreSQL`
- `Drizzle ORM` and `drizzle-kit`
- `Better Auth` with Google OAuth and email/password auth
- `MapLibre GL JS`
- realtime transport that supports race lobbies and live progress updates
- `Vitest`
- `@vue/test-utils`
- `Playwright`

## Architecture rules

- Keep frontend, backend routes, auth, and admin UI in one repository.
- Prefer server routes and shared TypeScript utilities over duplicating logic.
- Keep business logic in reusable modules, not directly inside page components.
- Prefer database-driven verse ordering and lookups.
- Treat imported datasets as inputs to normalize, not as runtime dependencies.
- Keep multiplayer race state server-authoritative.

## UI and motion requirements

- The UI should clearly take inspiration from Monkeytype's minimal, typing-first feel without becoming a direct clone.
- Maintain a clean central typing stage, low-noise supporting UI, and strong typography.
- Animations should be smooth and restrained.
- Motion should reinforce:
  - caret and active word state
  - results reveal
  - map focus changes
  - race progress changes
- Avoid flashy motion that interferes with typing or causes jank.
- BibleType must retain its own identity through scripture context, map integration, and race mode presentation.

## Admin panel requirements

The application must include a first-party admin panel inside this repository. It is not optional.

Expected admin areas:

- user management
- role management
- progress inspection
- feedback moderation
- Bible data inspection
- place and verse-link inspection
- race and lobby inspection
- import and reindex job controls

Do not assume a third-party database GUI is a substitute for the admin panel.

## Database and migrations

- All schema changes must be committed as Drizzle schema updates plus generated migrations.
- Never rely on manual database edits as the normal workflow.
- Add seed or import scripts for repeatable setup when needed.
- If a task needs data backfilling, implement it as a script or migration, not as ad hoc SQL hidden in chat.

## Auth and permissions

- Google login is required.
- Email and password login is required.
- Use Better Auth for authentication.
- Implement sign-up, sign-in, and password reset flows for email/password auth.
- Support at least two application roles:
  - `user`
  - `admin`
- Gate `/admin` routes and admin APIs by role.
- Any meaningful admin mutation should be auditable.

## Map feature rules

- The map is a support feature for the typing experience, not the primary focus.
- Prefer precomputed verse-to-place mappings over runtime entity extraction.
- Keep data lineage for place mappings:
  - imported
  - inferred
  - admin-confirmed
- Design the schema so simple point markers work first, but richer geometry can be added later.

## Multiplayer race rules

- Support race sessions with 2, 3, or 4 players.
- Show all players' progress in real time using compact progress tracks.
- Use server-authoritative race state and do not trust client-only final results.
- Prefer compact progress events over full keystroke replication.
- Handle disconnect and reconnect behavior explicitly.
- Keep the race UI visually aligned with the main typing experience.

## Deployment assumptions

- The host machine already runs `nginx`.
- This repository should include an example `nginx` site config for reverse proxying to the app.
- Do not add Caddy unless the user explicitly requests it later.
- Docker Compose should normally run only the application and PostgreSQL.
- Application container ports should bind to `127.0.0.1` when intended for host `nginx` proxying.

## Coding preferences

- Use ASCII unless a file already requires Unicode.
- Keep modules focused and composable.
- Prefer explicit types for domain entities and API payloads.
- Use `zod` for boundary validation when request payloads or imports are involved.
- Keep utility functions pure when possible, especially for typing logic and normalization.

## Testing requirements

Comprehensive automated testing is required. Do not treat tests as optional polish.

The repository should include automated coverage for:

- text normalization
- verse progression logic
- email/password auth flows
- Google auth entry and callback boundaries
- import scripts
- API route validation and authorization
- Vue component behavior for core screens
- end-to-end browser flows for critical user and admin paths
- auth guards
- admin authorization
- verse-to-place mapping behavior
- race matchmaking and race state transitions
- realtime progress synchronization behavior

Preferred tooling:

- `Vitest` for unit and integration tests
- `@vue/test-utils` for component tests
- `Playwright` for end-to-end tests

## Working style for future agents

- Read `IMPLEMENTATION_PLAN.md` before starting major work.
- Extend the current plan instead of inventing a parallel architecture.
- Make the smallest change that keeps the architecture coherent.
- When introducing a new dependency, justify why existing tools are insufficient.
- When implementing imports or schema changes, document the operational path clearly.

## File and project organization

Preferred top-level layout:

```text
app/
server/
db/
scripts/
public/
docker/
nginx/
```

Keep one responsibility per folder:

- `app/` for UI
- `server/` for API routes and services
- `db/` for schema and migrations
- `scripts/` for imports and maintenance commands
- `nginx/` for host proxy examples

## What to avoid

- Reintroducing PocketBase or similar schema-in-the-dashboard workflows
- Hiding critical logic in page components
- Hardcoding production credentials or callback URLs
- Adding a second reverse proxy layer when host `nginx` already exists
- Tight-coupling runtime features to third-party Bible or geography APIs
- Shipping major flows without automated test coverage
- Trusting clients as the source of truth for multiplayer race outcomes

## Definition of done for major features

A major feature is not done until:

- schema is defined if needed
- migrations exist if needed
- server API exists if needed
- UI exists if needed
- auth and authorization are correct
- automated tests cover the critical path
- operational setup is documented
