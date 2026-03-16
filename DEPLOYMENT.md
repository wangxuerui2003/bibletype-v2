# BibleType Deployment Guide

This document is written so another AI or operator can deploy BibleType on a Linux server with minimal guesswork.

For a fresh VPS where the AI should do nearly everything itself and stop only for secrets or external console actions, use [SERVER_BOOTSTRAP_CHECKLIST.md](./SERVER_BOOTSTRAP_CHECKLIST.md).

## Deployment model

Use this deployment shape unless there is a strong reason to change it:

- application code checked out on the host
- PostgreSQL running via `docker compose`
- BibleType app running as a host process under `systemd`
- host `nginx` reverse proxying to `127.0.0.1:3100`
- SSL handled on the host with Certbot

This matches the repository assumptions in `AGENTS.md`.

## Important warnings

- Do not use `pnpm import:bible` casually on a live environment.
  It deletes Bible content and several progress-related tables before reimporting.
- `pnpm import:places` also rewrites place mapping tables, but it does not clear user auth data.
- The current `docker-compose.yml` exposes PostgreSQL on `5432`.
  On a production VPS, either firewall that port or bind it to `127.0.0.1` before exposing the host to the internet.

## Server prerequisites

Install these before deployment:

- `git`
- `curl`
- `nginx`
- `certbot` and the nginx plugin
- `docker` and Docker Compose
- `node` 22 LTS
- `pnpm`
- `postgresql-client`

Suggested Node and pnpm install on Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo corepack enable
sudo corepack prepare pnpm@latest --activate
```

Install PostgreSQL client tools:

```bash
sudo apt-get install -y postgresql-client
```

## Required external credentials

Prepare these before starting:

- application domain, for example `bibletype.example.com`
- Google OAuth client ID and secret
- SMTP server credentials for password reset and email verification
- a strong random `BETTER_AUTH_SECRET`

## Google OAuth settings

BibleType uses Better Auth for Google sign-in.

In Google Cloud Console, configure:

- Authorized JavaScript origin: `https://your-domain.com`
- Authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

The redirect URI shape comes from Better Auth's default Google callback route:
https://www.better-auth.com/docs/authentication/google

## Recommended server paths

Use consistent paths so future maintenance is straightforward:

- app checkout: `/srv/bibletype/app`
- environment file: `/srv/bibletype/app/.env`
- optional OpenBible dataset cache: `/srv/bibletype/openbible-data`
- database backups: `/srv/bibletype/backups/postgres`
- uploaded file backups: `/srv/bibletype/backups/uploads`

## First-time deployment

### 1. Clone the repository

```bash
sudo mkdir -p /srv/bibletype
sudo chown "$USER":"$USER" /srv/bibletype
git clone <YOUR_REPOSITORY_URL> /srv/bibletype/app
cd /srv/bibletype/app
```

### 2. Install dependencies

```bash
pnpm install --frozen-lockfile
```

### 3. Create the production environment file

Start from the example:

```bash
cp .env.example .env
```

Then set production values.

Minimum production example:

```dotenv
NUXT_APP_URL=https://your-domain.com
BETTER_AUTH_URL=https://your-domain.com
DATABASE_URL=postgres://bibletype:CHANGE_DB_PASSWORD@127.0.0.1:5432/bibletype
BETTER_AUTH_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET

GOOGLE_CLIENT_ID=REPLACE_ME
GOOGLE_CLIENT_SECRET=REPLACE_ME

SMTP_HOST=REPLACE_ME
SMTP_PORT=587
SMTP_USER=REPLACE_ME
SMTP_PASS=REPLACE_ME
MAIL_FROM=BibleType <no-reply@your-domain.com>

# Optional overrides:
# BIBLE_IMPORT_ROOT=/srv/bibletype/app/data/Bible
# OPENBIBLE_DATA_ROOT=/srv/bibletype/openbible-data
```

Notes:

- Set both `NUXT_APP_URL` and `BETTER_AUTH_URL` to the final public HTTPS URL.
- `BIBLE_IMPORT_ROOT` is optional because this repository already contains `data/Bible`.
- `OPENBIBLE_DATA_ROOT` is optional. If omitted, `pnpm import:places` will clone the OpenBible dataset into `.data/Bible-Geocoding-Data` using `git`.

### 4. Prepare PostgreSQL

The current compose file also includes Mailpit for development. For production, start only PostgreSQL unless you intentionally want Mailpit:

```bash
docker compose up -d db
```

Check database health:

```bash
docker compose ps
```

If you want a stronger production posture, edit `docker-compose.yml` before starting the database so PostgreSQL binds to localhost only:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

### 5. Run database migrations

```bash
pnpm db:migrate
```

### 6. Import application data

Bible text import, first deployment only:

```bash
pnpm import:bible
```

Place and verse-place mapping import:

```bash
pnpm import:places
```

Notes:

- `pnpm import:bible` is appropriate for first setup before real users exist.
- Do not run `pnpm import:bible` during a normal production upgrade unless you intend to reset imported Bible content and related progress data.
- `pnpm import:places` requires network access if `OPENBIBLE_DATA_ROOT` is not already populated locally.

### 7. Build the app

```bash
pnpm build
```

Nuxt will generate a production server in `.output/server/index.mjs`.

### 8. Create a systemd service

Create `/etc/systemd/system/bibletype.service`:

```ini
[Unit]
Description=BibleType Nuxt Application
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=YOUR_DEPLOY_USER
WorkingDirectory=/srv/bibletype/app
Environment=NODE_ENV=production
Environment=NITRO_HOST=127.0.0.1
Environment=NITRO_PORT=3100
ExecStart=/usr/bin/node /srv/bibletype/app/.output/server/index.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Load and start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bibletype
sudo systemctl status bibletype
```

### 9. Configure nginx

Start from [nginx/bibletype.conf.example](./nginx/bibletype.conf.example).

Recommended production server block:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Install it:

```bash
sudo cp nginx/bibletype.conf.example /etc/nginx/sites-available/bibletype
sudo sed -i 's/bibletype.example.com/your-domain.com/g' /etc/nginx/sites-available/bibletype
sudo ln -sf /etc/nginx/sites-available/bibletype /etc/nginx/sites-enabled/bibletype
sudo nginx -t
sudo systemctl reload nginx
```

### 10. Provision TLS with Certbot

After nginx serves the site on port 80 and DNS already points to the server:

```bash
sudo certbot --nginx -d your-domain.com
```

### 11. Create the first admin user

1. Open the site and sign up using email/password or Google.
2. Promote that account from the server:

```bash
cd /srv/bibletype/app
pnpm admin:promote you@example.com
```

### 12. Configure scheduled database backups

Follow [BACKUPS.md](./BACKUPS.md).

Minimum production requirement:

- install the `systemd` backup service and timer
- verify one manual backup run succeeds
- ensure uploaded files under `storage/uploads` are included in server backup policy
- ensure at least one copy of backups exists off-host

## Verification checklist

After deployment, verify all of the following:

- `sudo systemctl status bibletype` shows the service running
- `curl -I http://127.0.0.1:3100` returns an HTTP response from the app
- the public homepage loads through `https://your-domain.com`
- email/password sign-up works
- email verification email is delivered
- password reset email is delivered
- Google sign-in redirects correctly and returns to the app
- the typing page loads a verse
- `/admin` is accessible for an admin account and blocked for a normal user

Useful logs:

```bash
sudo journalctl -u bibletype -n 200 --no-pager
sudo tail -n 200 /var/log/nginx/error.log
docker compose logs db --tail=200
```

## Normal upgrade procedure

Use this flow for routine deployments after the first launch:

```bash
cd /srv/bibletype/app
git pull
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build
sudo systemctl restart bibletype
sudo systemctl status bibletype
```

Only run these when you explicitly intend to refresh imported datasets:

- `pnpm import:bible`
- `pnpm import:places`

## Rollback approach

If a deployment fails after `git pull`:

1. Identify the previous known-good commit.
2. Check out that commit.
3. Rebuild the app.
4. Restart the `bibletype` service.

Example:

```bash
cd /srv/bibletype/app
git log --oneline -n 5
git checkout <KNOWN_GOOD_COMMIT>
pnpm install --frozen-lockfile
pnpm build
sudo systemctl restart bibletype
```

Do not roll back blindly if a migration has already changed schema in an incompatible way. Inspect the migration delta first.

## Common problems

### Google login fails with `redirect_uri_mismatch`

Check all of these:

- `BETTER_AUTH_URL` exactly matches the public site URL
- Google OAuth authorized origin matches `https://your-domain.com`
- Google OAuth redirect URI matches `https://your-domain.com/api/auth/callback/google`

### Password reset or verification email does not arrive

Check:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM`
- provider-side sender restrictions
- application logs via `journalctl`

### `pnpm import:places` fails on a locked-down server

The script clones OpenBible data with `git` if `OPENBIBLE_DATA_ROOT` is absent.

Fix options:

- temporarily allow outbound network access and rerun the import
- pre-clone the dataset into a known path and set `OPENBIBLE_DATA_ROOT`

### The app starts locally but is unreachable through the domain

Check:

- DNS points to the correct server IP
- `nginx` config is enabled and reloaded
- Certbot completed successfully
- the app is bound to `127.0.0.1:3100`
- firewall rules allow `80` and `443`
