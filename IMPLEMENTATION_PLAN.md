# BibleType V2 Implementation Plan

## Goal

Rebuild BibleType as a code-first full-stack application that is easy for AI and humans to evolve without manual backend administration. The new system should keep the proven parts of the old project, add an admin panel, and introduce a map experience for Bible places relevant to the current verse while typing.

## Product Scope

### Core user experience

- Sign in with Google.
- Sign in with email and password.
- Resume typing from saved progress.
- Type through the Bible verse by verse.
- Show live typing feedback, timer, WPM, and accuracy.
- Record attempts and progress in a real database.
- Show a map of places relevant to the current verse.
- Offer a real-time multiplayer race mode for 2 to 4 players.

### Admin experience

- Manage users and roles.
- Inspect and adjust user progress.
- Manage feedback records.
- Inspect Bible verse data.
- Inspect, fix, and reindex verse-to-place mappings.
- Run import or reindex jobs from the app.

### Non-goals for V1

- Multi-translation support.
- Social features beyond feedback and admin moderation.
- Mobile apps.

## Constraints and Decisions

- Repository stays in this folder.
- No PocketBase.
- No Caddy in project deployment.
- Production reverse proxy is the host machine's `nginx` service.
- SSL will be managed outside the project with Certbot.
- Existing Bible JSON files from the old project should remain the canonical text source unless a concrete migration need appears.
- Google login remains required.
- Email and password login is also required.
- Comprehensive automated testing is required for both frontend and backend.
- The visual language should take clear inspiration from Monkeytype's minimal, typing-first experience while remaining original to BibleType and making room for Bible-specific features such as verse context and maps.

## Recommended Stack

- Frontend and server: `Nuxt 4`
- Language: `TypeScript`
- Database: `PostgreSQL 17`
- ORM and migrations: `Drizzle ORM` and `drizzle-kit`
- Authentication: `Better Auth` with Google OAuth and email/password auth
- Map rendering: `MapLibre GL JS`
- Background jobs for imports and reindexing: start with app-triggered server jobs; promote to a queue only if imports become slow or operationally fragile
- Validation: `zod`
- Styling: `Tailwind CSS`
- Real-time multiplayer transport: `WebSocket` support through Nitro server routes or a dedicated realtime layer only if the built-in path proves insufficient
- Automated testing:
  - unit and integration: `Vitest`
  - component testing: `@vue/test-utils`
  - end-to-end: `Playwright`
- Charts or admin metrics: add only if needed after core flows are stable

## Why this architecture

- Nuxt keeps frontend, backend routes, and admin UI in one codebase.
- Drizzle keeps schema and migrations in code, which avoids the old PocketBase problem.
- Better Auth keeps Google login and password login in the app and under version control.
- PostgreSQL is stable, explicit, and easy to back up on a VPS.
- MapLibre is open and flexible for place markers and future geometry support.
- A lightweight real-time transport is sufficient for race lobbies, ready state, and progress updates without introducing a separate large multiplayer backend too early.

## Data sources

### Canonical Bible text

- Use the old project Bible JSON files from:
  - `/Users/wxuerui/coding/bibletype-old/bible-scraper/Bible`

### Old frontend logic for reference

- Use the old project as reference only:
  - `/Users/wxuerui/coding/bibletype-old/bibletype-frontend`

### Bible places data

- Prefer importing a maintained Bible geography dataset and normalizing it into our own tables.
- Keep imported place data as project-owned records after ingestion. Runtime features should query our own database, not a third-party API.

## Target repository layout

```text
bibletype/
  AGENTS.md
  IMPLEMENTATION_PLAN.md
  app/
    app.vue
    pages/
    components/
    composables/
    assets/
  server/
    api/
    routes/
    utils/
    services/
  db/
    schema/
    migrations/
  scripts/
    import-bible.ts
    import-places.ts
    rebuild-verse-place-index.ts
  public/
  docker/
  docker-compose.yml
  nginx/
    bibletype.conf.example
```

## Main domain model

### Auth and authorization

- `users`
- `accounts`
- `sessions`
- `verifications`
- optional password reset or credential recovery records if the final Better Auth setup requires them

Better Auth should own the auth tables, but they still live in Drizzle schema and migrations.

### Bible content

- `bible_books`
  - `id`
  - `testament`
  - `slug`
  - `name`
  - `ordered_id`
- `bible_verses`
  - `id`
  - `book_id`
  - `chapter`
  - `verse`
  - `reference`
  - `text_raw`
  - `text_normalized`

### User progress and typing analytics

- `user_progress`
  - one row per user
  - current `book_id`, `chapter`, `verse`
- `typing_attempts`
  - one row per completed verse attempt
  - `elapsed_ms`
  - `accuracy`
  - `wpm`
  - `typed_chars`
  - `correct_chars`
  - `completed_at`

### Multiplayer race system

- `race_lobbies`
  - lobby code
  - host user
  - target player count from 2 to 4
  - race state
  - selected verse or race content payload
- `race_participants`
  - lobby membership
  - slot index
  - ready state
  - finish state
- `race_progress_events`
  - optional persisted event stream or summarized snapshots if replay or audit becomes useful
- `race_results`
  - final placement
  - elapsed time
  - accuracy
  - wpm

### Feedback

- `feedback`
  - `type` with values like `feedback`, `bug`, `suggestion`
  - `status`
  - `content`
  - `created_by`
  - optional moderation fields

### Places and verse links

- `biblical_places`
  - canonical place identity
  - names and aliases
  - place type
  - confidence metadata
- `place_geometries`
  - optional point or GeoJSON geometry
  - preview latitude and longitude
- `verse_places`
  - link table from verse to place
  - matching source and confidence
  - optional admin override fields

### Admin and operations

- `admin_audit_logs`
  - actor
  - action
  - target_type
  - target_id
  - metadata
- `import_jobs`
  - job type
  - status
  - started and finished timestamps
  - logs or summary payload

## Main application surfaces

### Public and user routes

- `/`
  - primary typing experience
- `/race`
  - multiplayer lobby discovery or quick match entry
- `/race/[id]`
  - live race view
- `/auth/sign-in`
  - Google login and email/password login entry
- `/auth/sign-up`
  - email/password registration
- `/auth/forgot-password`
  - password reset request
- `/auth/reset-password`
  - password reset completion
- `/faq`
  - optional carry-over from old product
- `/feedback`
  - authenticated feedback page
- `/settings`
  - profile and preferences

### Admin routes

- `/admin`
  - admin dashboard
- `/admin/users`
- `/admin/users/[id]`
- `/admin/feedback`
- `/admin/bible/books`
- `/admin/bible/verses/[id]`
- `/admin/places`
- `/admin/places/[id]`
- `/admin/verse-links`
- `/admin/races`
- `/admin/jobs`

## Verse typing experience requirements

- Preserve the old typing feel where it was good:
  - per-word progress
  - live correct and incorrect highlighting
  - timer starts on first keystroke
  - backspace can move back into an incorrect prior word
  - end-of-verse modal or panel with stats
- Move typing logic into reusable composables and pure utility functions.
- Normalize verse text before typing comparison.
- Persist progress and attempts server-side.
- Do not depend on a static frontend-only Bible index for verse progression; verse ordering should come from the database.

## UI and animation direction

### Design intent

- The product should feel fast, minimal, and typing-first in the spirit of Monkeytype, but it must not become a visual clone.
- The page should prioritize the text line, typing focus, and immediate performance feedback over chrome and decorative UI.
- BibleType should introduce its own identity through scripture context, geography, and subtle sacred or literary design cues rather than through noisy ornament.

### Visual rules

- Keep the primary typing view low-noise, center-weighted, and spacious.
- Use a restrained color system with strong contrast and deliberate emphasis colors.
- Keep supporting UI secondary until needed:
  - stats
  - verse reference
  - map panel
  - race progress
- Avoid dashboard clutter on the main typing screen.
- Maintain strong typography hierarchy and legibility for long-form verse content.

### Motion rules

- Animations must feel smooth and intentional rather than flashy.
- Prioritize motion on:
  - page entrance
  - active word and caret transitions
  - result reveal
  - map focus transitions
  - race progress updates
- Avoid heavy animation on every keystroke that could increase latency or visual noise.
- Favor transform and opacity animations over layout-thrashing transitions.

### Product-specific additions beyond Monkeytype inspiration

- Verse reference and context should feel native to the UI, not bolted on.
- The map panel should visually integrate with the typing area instead of feeling like a separate app embedded on the page.
- Race mode should preserve the same clean typing aesthetic while surfacing competitor progress in a readable way.

## Map feature requirements

### Product behavior

- While typing a verse, show a map panel with the places relevant to that verse.
- If the verse has no mapped places, show a graceful empty state.
- If the verse has multiple places, show a list of chips or cards below the map.
- Clicking a place chip should focus the map on that place.
- The map should enrich the experience, not interrupt typing.

### Data strategy

- Precompute verse-to-place links.
- Avoid runtime named entity extraction during typing.
- Allow admin review and manual corrections.
- Store the origin of each mapping:
  - imported
  - inferred
  - admin-confirmed

### Technical strategy

- First map version can use simple point markers.
- Keep schema open to richer geometry later.
- Prefer storing normalized place records in PostgreSQL and returning only the current verse's related places to the client.

## Multiplayer race mode requirements

### Product behavior

- Users can enter a race mode and be matched into races of 2, 3, or 4 players.
- Users should also be able to join a lobby or room when direct matching is not enough.
- A race starts only when the lobby is full or when the host starts under allowed rules.
- All players type the same content in a race.
- The race UI must show each player's progress in real time using a compact and readable progress-track presentation.
- At race end, show placement, completion time, WPM, and accuracy.

### Realtime model

- Use server-authoritative race state.
- Send compact progress updates rather than full typing state.
- Progress representation should be based on stable metrics such as completed characters or completed words against the same source text.
- Handle disconnects and reconnects gracefully.
- Ensure races cannot be trivially manipulated by trusting only client-reported final results.

### MVP race feature set

- Quick match for 2 to 4 players
- Lobby ready state
- Countdown before start
- Shared verse or race text payload
- Real-time player progress bars
- Final placements and stats

### Later race extensions

- Private invite codes
- Ranked and unranked queues
- Spectator mode
- Anti-cheat heuristics
- Team or tournament formats

### Technical implications

- Add WebSocket or equivalent realtime support to the app.
- Add race matchmaking and lobby lifecycle services.
- Add tests for race state transitions and reconnect handling.
- Add end-to-end coverage for multi-user race flows where practical.

## Authentication and authorization plan

- Use Better Auth with both Google OAuth and email/password authentication.
- Support account registration with email and password.
- Support password reset flow.
- Support secure password hashing and standard session handling through Better Auth.
- Add an application-level `role` on users:
  - `user`
  - `admin`
- Gate all `/admin` routes and admin APIs by role.
- Log sensitive admin actions in `admin_audit_logs`.

## Automated testing strategy

Comprehensive automated testing is a required part of the rewrite. The test suite should cover both frontend and backend and should run in CI.

### Test layers

- Unit tests
  - typing utilities
  - text normalization
  - verse progression
  - place mapping utilities
  - auth and permission helpers
- Integration tests
  - server services against a test database
  - import scripts and reindexing logic
  - auth flows including Google callback handling boundaries and email/password flows
- API tests
  - authenticated and unauthenticated server routes
  - admin-only routes
  - validation and error handling
- Component tests
  - typing UI states
  - auth forms
  - admin tables and filters
  - map panel empty, single-place, and multi-place states
- End-to-end tests
  - sign up with email/password
  - sign in with email/password
  - Google auth entry flow boundaries
  - resume typing from saved progress
  - complete a verse and persist attempt stats
  - admin login and admin-only page access
  - feedback creation and moderation flow

### Test tooling

- `Vitest` for unit and integration tests
- `@vue/test-utils` for Vue component tests
- `Playwright` for end-to-end browser tests
- database test helpers for isolated PostgreSQL-backed integration runs

### CI expectations

- Run lint, typecheck, unit tests, integration tests, component tests, and end-to-end tests in CI.
- Keep deterministic fixtures for Bible import and place mapping tests.
- Seed test data through scripts or factories, not through manual SQL setup.

## Deployment plan

### Runtime topology

- Host machine `nginx`
- Docker Compose services:
  - `app`
  - `db`

### Network model

- `app` binds to `127.0.0.1`
- `db` is internal to Docker network only
- `nginx` on the host proxies to the app container

### SSL

- Managed outside the repository by Certbot on the host

### Backups

- Daily PostgreSQL dump
- Retain multiple recent snapshots
- Document restore procedure early

## Phase plan

### Phase 0: Project bootstrap

- Initialize Nuxt 4 project.
- Add TypeScript, Tailwind, Drizzle, Better Auth, and PostgreSQL wiring.
- Establish the design system direction for the Monkeytype-inspired but BibleType-specific UI.
- Add the automated test toolchain and baseline CI commands.
- Create local Docker Compose for app and db.
- Add environment variable templates.
- Add example `nginx` config for host deployment.

### Phase 1: Core schema and auth

- Define auth tables and application user role field.
- Define Bible content tables.
- Define user progress and typing attempts tables.
- Define feedback tables.
- Define multiplayer race tables and lobby state model.
- Implement Google sign-in.
- Implement email/password sign-up, sign-in, and password reset flow.
- Add protected server utilities for auth and role checks.
- Add auth-focused unit, integration, and end-to-end tests.

### Phase 2: Bible import pipeline

- Build `scripts/import-bible.ts`.
- Import from `/Users/wxuerui/coding/bibletype-old/bible-scraper/Bible`.
- Normalize text during import and store both raw and normalized forms.
- Generate canonical verse ordering in the database.
- Add verification checks:
  - book count
  - chapter count
  - verse count
  - missing or duplicate references

### Phase 3: Typing MVP

- Build the main typing page.
- Implement typing composables and shared text normalization.
- Implement next-verse logic from DB ordering.
- Save progress server-side.
- Save attempt records server-side.
- Build settings and feedback pages at MVP quality.
- Implement the first polished visual system and motion layer for the typing experience.
- Add tests for typing progression, stats calculation, and saved progress resume behavior.

### Phase 4: Admin MVP

- Add role-gated admin layout and navigation.
- Add user list and detail page.
- Add feedback moderation page.
- Add Bible verse inspector page.
- Add import job history page.
- Add admin route and permission tests.

### Phase 5: Places data and mapping

- Build `scripts/import-places.ts`.
- Define `biblical_places`, `place_geometries`, and `verse_places`.
- Import the external places dataset into normalized tables.
- Build `scripts/rebuild-verse-place-index.ts`.
- Expose admin tools to inspect and correct mappings.

### Phase 6: Map UI

- Add map panel to typing page.
- Return current verse place payload from server.
- Show markers, place chips, and empty states.
- Tune layout for desktop and mobile.
- Add component and end-to-end coverage for map rendering states.

### Phase 7: Multiplayer race MVP

- Build race matchmaking entry and lobby flow.
- Implement server-side race lifecycle and realtime updates.
- Build race UI with live opponent progress tracks.
- Persist race results.
- Add race-focused integration and end-to-end tests.

### Phase 8: Hardening

- Add tests for:
  - text normalization
  - verse progression
  - import logic
  - auth guards
  - email/password auth flows
  - admin permissions
  - verse-to-place mapping behavior
- Add tests for:
  - race matchmaking
  - race reconnects
  - progress synchronization
- Add browser-level regression coverage for critical user and admin flows.
- Add audit logging for admin actions.
- Add operational docs for deploy, backup, and restore.
- Run performance checks on typing page and map payload size.
- Run performance checks on race update frequency and perceived UI smoothness.

## Suggested first deliverables

- Project scaffold
- Initial Drizzle schema
- Better Auth integration
- Email/password auth flows
- Docker Compose
- Host `nginx` example config
- Bible import script
- Minimal typing route
- Initial design tokens and motion primitives

## Key implementation rules

- Schema changes must go through Drizzle migrations.
- No manual production database edits except emergency break-glass work.
- Imported source files remain immutable inputs.
- Application logic should not depend on opaque BaaS rules.
- All admin actions that alter data should be traceable.
- Critical auth, typing, and admin paths must be covered by automated tests before being considered complete.
- Realtime race features must remain server-authoritative and testable.

## Risks and mitigations

### Risk: place data is messy

- Mitigation: keep imported source metadata, confidence, and admin override capability.

### Risk: Bible import mismatches old behavior

- Mitigation: verify counts and sample references against old JSON before shipping.

### Risk: admin scope expands too early

- Mitigation: ship admin in layers, starting with read-heavy pages and only necessary write actions.

### Risk: map UI distracts from typing

- Mitigation: treat typing as primary and map as supportive context.

### Risk: Monkeytype inspiration turns into shallow imitation

- Mitigation: borrow information density, responsiveness, and typing-first focus, but build a distinct visual system around Bible context, maps, and race mode.

### Risk: race mode adds too much technical complexity too early

- Mitigation: ship a disciplined MVP with fixed player counts, simple lobby state, and compact progress updates before adding ranking or advanced matchmaking.

## Immediate next step

After this document is accepted, bootstrap the new Nuxt repository in this folder and implement Phase 0 and Phase 1 before touching map-specific features.
