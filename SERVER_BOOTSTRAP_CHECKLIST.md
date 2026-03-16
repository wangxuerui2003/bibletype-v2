# BibleType Server Bootstrap Checklist

This document is the operator runbook for an AI working on a brand new production VPS.

Goal:

- the operator should only need to say "deploy BibleType"
- the AI should perform all deterministic steps itself
- the AI should stop only when secrets, domain-specific values, or external console actions are required

This checklist is intentionally procedural. Follow it in order.

## Operating mode

When executing this checklist on a server:

- do not ask the operator open-ended questions unless a decision cannot be inferred
- do not ask for values that can be discovered locally
- stop only for missing secrets, missing repository access, or required external console work
- after each major stage, run the verification commands listed for that stage

## Inputs the AI must request from the operator

Do not proceed past environment setup until these values are provided:

- Git repository URL
- public domain name
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

The AI should generate these locally instead of asking the operator:

- `BETTER_AUTH_SECRET`
- PostgreSQL password

The AI should propose these defaults unless the operator overrides them:

- app path: `/srv/bibletype/app`
- backup root: `/srv/bibletype/backups`
- deploy user: current non-root shell user
- app port: `3100`

## External operator actions the AI cannot do alone

The AI must stop and explicitly ask the operator to complete these when needed:

1. Ensure the domain DNS `A` or `AAAA` record points to the VPS.
2. Configure Google OAuth in Google Cloud Console:
   - Authorized JavaScript origin: `https://YOUR_DOMAIN`
   - Authorized redirect URI: `https://YOUR_DOMAIN/api/auth/callback/google`
3. Ensure the SMTP credentials are valid for the chosen sender.

After the operator confirms those are complete, the AI may continue.

## Stage 1: Discover execution context

The AI should determine:

- current Linux distribution
- current user
- whether `sudo` is available
- whether `docker`, `nginx`, `git`, `node`, `pnpm`, and `systemctl` are installed
- whether the repo already exists on disk

Verification:

```bash
whoami
pwd
uname -a
systemctl --version
docker --version
nginx -v
node -v
pnpm -v
```

## Stage 2: Install prerequisites if missing

Required packages and tools:

- `git`
- `curl`
- `nginx`
- `certbot`
- `python3-certbot-nginx`
- `docker`
- Docker Compose
- `node` 22 LTS
- `pnpm`
- `postgresql-client`

The AI should install missing packages for the detected distro instead of asking the operator how to install them.

Verification:

```bash
git --version
curl --version
nginx -v
certbot --version
docker --version
docker compose version
node -v
pnpm -v
pg_dump --version
pg_restore --version
psql --version
```

## Stage 3: Collect required secrets and immutable values

The AI must stop here and ask for:

- repository URL
- public domain
- Google OAuth client ID
- Google OAuth client secret
- SMTP host
- SMTP port
- SMTP username
- SMTP password
- mail from value

The AI must generate:

- a strong PostgreSQL password
- a strong `BETTER_AUTH_SECRET`

The AI should display which values it generated and where they will be written, but it must not print secrets again after writing them to disk.

## Stage 4: Prepare filesystem layout

The AI should create:

- `/srv/bibletype`
- `/srv/bibletype/app`
- `/srv/bibletype/backups/postgres`
- `/srv/bibletype/backups/uploads`
- `/srv/bibletype/openbible-data`

It should ensure the deploy user owns `/srv/bibletype`.

Verification:

```bash
ls -ld /srv/bibletype /srv/bibletype/app /srv/bibletype/backups/postgres /srv/bibletype/backups/uploads /srv/bibletype/openbible-data
```

## Stage 5: Clone or update the repository

If `/srv/bibletype/app/.git` does not exist:

- clone the repository into `/srv/bibletype/app`

If it already exists:

- fetch and fast-forward to the intended branch

After checkout:

- confirm `data/Bible` exists inside the repo
- confirm `scripts/backup-postgres.sh` and `scripts/restore-postgres.sh` exist

Important:

- `Bible data` is expected to come from the repository itself via `data/Bible`
- `Geo data` is not committed in this repository; it is fetched by `pnpm import:places` if not already present

Verification:

```bash
test -d /srv/bibletype/app/data/Bible
test -f /srv/bibletype/app/scripts/backup-postgres.sh
test -f /srv/bibletype/app/scripts/restore-postgres.sh
```

## Stage 6: Write production environment

The AI should create `/srv/bibletype/app/.env` with production values.

Required contents:

```dotenv
NUXT_APP_URL=https://YOUR_DOMAIN
BETTER_AUTH_URL=https://YOUR_DOMAIN
DATABASE_URL=postgres://bibletype:GENERATED_DB_PASSWORD@127.0.0.1:5432/bibletype
BETTER_AUTH_SECRET=GENERATED_SECRET
GOOGLE_CLIENT_ID=OPERATOR_PROVIDED
GOOGLE_CLIENT_SECRET=OPERATOR_PROVIDED
SMTP_HOST=OPERATOR_PROVIDED
SMTP_PORT=OPERATOR_PROVIDED
SMTP_USER=OPERATOR_PROVIDED
SMTP_PASS=OPERATOR_PROVIDED
MAIL_FROM=OPERATOR_PROVIDED
OPENBIBLE_DATA_ROOT=/srv/bibletype/openbible-data
```

The AI should set file permissions so `.env` is not world-readable.

Verification:

```bash
test -f /srv/bibletype/app/.env
stat -c '%a %U %G %n' /srv/bibletype/app/.env
grep '^NUXT_APP_URL=' /srv/bibletype/app/.env
grep '^BETTER_AUTH_URL=' /srv/bibletype/app/.env
grep '^OPENBIBLE_DATA_ROOT=' /srv/bibletype/app/.env
```

## Stage 7: Harden docker compose for production database use

Before starting PostgreSQL, the AI should update `docker-compose.yml` so the database binds only to localhost:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

It should also update the PostgreSQL password in compose to match the generated `.env` password.

The AI should not ask the operator whether to do this. This is the production-safe default.

Verification:

```bash
grep -n '127.0.0.1:5432:5432' /srv/bibletype/app/docker-compose.yml
```

## Stage 8: Start PostgreSQL

The AI should start only the `db` service:

```bash
docker compose up -d db
```

Then wait for health to pass.

Verification:

```bash
docker compose ps
docker compose logs db --tail=100
```

## Stage 9: Install Node dependencies

From `/srv/bibletype/app`:

```bash
pnpm install --frozen-lockfile
```

Verification:

```bash
test -d /srv/bibletype/app/node_modules
```

## Stage 10: Run database migrations

The AI should run:

```bash
pnpm db:migrate
```

Verification:

```bash
psql 'postgres://bibletype:GENERATED_DB_PASSWORD@127.0.0.1:5432/bibletype' -c '\dt'
```

## Stage 11: Import production datasets

The AI should run:

```bash
pnpm import:bible
pnpm import:places
```

Important behavior:

- `pnpm import:bible` reads from repository-local `data/Bible` unless `BIBLE_IMPORT_ROOT` is set
- `pnpm import:places` uses `OPENBIBLE_DATA_ROOT` if present
- if `OPENBIBLE_DATA_ROOT` is missing data, the import script may `git clone` the OpenBible dataset automatically

The AI should verify import results by checking row counts, not just command exit codes.

Verification:

```bash
psql 'postgres://bibletype:GENERATED_DB_PASSWORD@127.0.0.1:5432/bibletype' -c 'SELECT count(*) FROM "bible_books";'
psql 'postgres://bibletype:GENERATED_DB_PASSWORD@127.0.0.1:5432/bibletype' -c 'SELECT count(*) FROM "bible_verses";'
psql 'postgres://bibletype:GENERATED_DB_PASSWORD@127.0.0.1:5432/bibletype' -c 'SELECT count(*) FROM "biblical_places";'
psql 'postgres://bibletype:GENERATED_DB_PASSWORD@127.0.0.1:5432/bibletype' -c 'SELECT count(*) FROM "verse_places";'
```

## Stage 12: Build the application

The AI should run:

```bash
pnpm build
```

Verification:

```bash
test -f /srv/bibletype/app/.output/server/index.mjs
```

## Stage 13: Install and start the app service

The AI should create a `systemd` unit for BibleType that:

- runs as the deploy user
- uses `/srv/bibletype/app` as `WorkingDirectory`
- binds to `127.0.0.1:3100`
- restarts automatically

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bibletype
sudo systemctl status bibletype
```

Verification:

```bash
curl -I http://127.0.0.1:3100
sudo journalctl -u bibletype -n 100 --no-pager
```

## Stage 14: Install nginx reverse proxy

The AI should:

- install a server block for the provided domain
- proxy to `http://127.0.0.1:3100`
- include websocket upgrade headers
- test nginx configuration
- reload nginx

Verification:

```bash
sudo nginx -t
curl -I -H "Host: YOUR_DOMAIN" http://127.0.0.1
```

## Stage 15: Stop for DNS and Google console confirmation

Before requesting TLS, the AI must stop and ask the operator to confirm:

- domain DNS already points to the VPS
- Google OAuth origin and callback have been configured for the production domain

The AI should not attempt Certbot until the operator confirms both.

## Stage 16: Provision TLS

After operator confirmation:

```bash
sudo certbot --nginx -d YOUR_DOMAIN
```

Verification:

```bash
curl -I https://YOUR_DOMAIN
```

## Stage 17: Install scheduled backups

The AI should:

- install the backup service unit
- install the backup timer unit
- set deploy user correctly
- point backups to `/srv/bibletype/backups/postgres`
- enable and start the timer
- run one manual backup job immediately

Verification:

```bash
sudo systemctl status bibletype-db-backup.timer
sudo systemctl start bibletype-db-backup.service
sudo journalctl -u bibletype-db-backup.service -n 100 --no-pager
ls -lah /srv/bibletype/backups/postgres
```

## Stage 18: Final operator handoff

The AI should report:

- deployed commit SHA
- app domain
- service names
- backup path
- whether TLS succeeded
- whether initial imports succeeded
- whether Google and SMTP secrets were written
- next manual step: create first user account, then run `pnpm admin:promote EMAIL`

## Upgrade mode

For future deploys on the same server, the AI should normally do only:

```bash
cd /srv/bibletype/app
git pull
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build
sudo systemctl restart bibletype
```

The AI must not run these during a normal upgrade unless explicitly instructed:

- `pnpm import:bible`
- `pnpm import:places`

Reason:

- `pnpm import:bible` is destructive to imported Bible content and related progress data
- `pnpm import:places` refreshes mapping data and should be treated as an explicit data maintenance action
