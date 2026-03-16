# BibleType Backup And Restore Guide

This document is written for AI-assisted server operations. Follow it literally unless the host environment requires a documented deviation.

## Scope

This repository currently stores production state in at least two places:

- PostgreSQL
- uploaded files under `storage/uploads`

The database backup scripts in this repository cover PostgreSQL only. A complete disaster recovery plan must preserve both the database and uploaded files.

## Required tools

Install PostgreSQL client tools on the host:

```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
```

The scripts assume these commands are available:

- `pg_dump`
- `pg_restore`
- `psql`

## Included scripts

- [scripts/backup-postgres.sh](./scripts/backup-postgres.sh)
- [scripts/restore-postgres.sh](./scripts/restore-postgres.sh)
- [scripts/systemd/bibletype-db-backup.service.example](./scripts/systemd/bibletype-db-backup.service.example)
- [scripts/systemd/bibletype-db-backup.timer.example](./scripts/systemd/bibletype-db-backup.timer.example)

## Backup format

The backup script creates:

- a PostgreSQL custom-format dump: `bibletype_YYYYMMDDTHHMMSSZ.dump`
- a checksum file: `.dump.sha256`
- a metadata file: `.meta.txt`

The custom dump format is intentional:

- it is more flexible for restore than plain SQL
- it supports `pg_restore`
- it usually produces smaller backup files

## One-off manual backup

From the project root:

```bash
chmod +x scripts/backup-postgres.sh scripts/restore-postgres.sh
./scripts/backup-postgres.sh
```

Default behavior:

- reads `DATABASE_URL` from the current shell or from `.env`
- writes backups to `./backups/postgres`
- keeps the last 14 days based on file mtime

Override example:

```bash
ENV_FILE=/srv/bibletype/app/.env \
BACKUP_DIR=/srv/bibletype/backups/postgres \
RETENTION_DAYS=21 \
/srv/bibletype/app/scripts/backup-postgres.sh
```

## Scheduled backups with systemd timer

Use the example units in [scripts/systemd/bibletype-db-backup.service.example](./scripts/systemd/bibletype-db-backup.service.example) and [scripts/systemd/bibletype-db-backup.timer.example](./scripts/systemd/bibletype-db-backup.timer.example).

Install them like this:

```bash
sudo cp /srv/bibletype/app/scripts/systemd/bibletype-db-backup.service.example /etc/systemd/system/bibletype-db-backup.service
sudo cp /srv/bibletype/app/scripts/systemd/bibletype-db-backup.timer.example /etc/systemd/system/bibletype-db-backup.timer
sudo sed -i 's/YOUR_DEPLOY_USER/your-deploy-user/g' /etc/systemd/system/bibletype-db-backup.service
sudo systemctl daemon-reload
sudo systemctl enable --now bibletype-db-backup.timer
sudo systemctl list-timers --all | grep bibletype-db-backup
```

Run a test backup immediately:

```bash
sudo systemctl start bibletype-db-backup.service
sudo systemctl status bibletype-db-backup.service
```

Inspect the logs:

```bash
sudo journalctl -u bibletype-db-backup.service -n 100 --no-pager
```

## Required file backup in addition to PostgreSQL

You must also back up uploaded files:

- source directory: `/srv/bibletype/app/storage/uploads`

At minimum, copy that directory into your server backup flow. If you skip this, avatar and future upload recovery will be incomplete even when the database restore succeeds.

## Off-host backup recommendation

Local backups on the same VPS are necessary but not sufficient.

At least one of these should also exist:

- object storage sync
- backup rsync target on another machine
- provider snapshot policy with known restore procedure

If the VPS disk fails and backups live only on that VPS, recovery still fails.

## Restore workflow

### 1. Preconditions

Before restoring:

- confirm the target environment is correct
- stop application writes if possible
- identify the exact `.dump` file to restore
- verify that the matching upload backups also exist if user uploads matter

### 2. Stop the app

```bash
sudo systemctl stop bibletype
```

### 3. Run restore

The restore script is destructive. It drops and recreates the `public` schema before loading the dump.

Example:

```bash
cd /srv/bibletype/app
./scripts/restore-postgres.sh --yes /srv/bibletype/backups/postgres/bibletype_20260316T032000Z.dump
```

Default restore behavior:

- verifies checksum unless `--skip-checksum` is used
- creates a fresh safety backup before restore unless `--skip-safety-backup` is used
- terminates active PostgreSQL sessions for the current database
- drops and recreates the `public` schema
- restores the custom dump with `pg_restore`

### 4. Restore uploaded files if needed

If the incident affected uploads too, restore:

- `/srv/bibletype/app/storage/uploads`

### 5. Start the app again

```bash
sudo systemctl start bibletype
sudo systemctl status bibletype
```

## Post-restore verification

After restore, verify all of the following:

- homepage loads
- a normal user can sign in
- `/api/typing/current` returns data for an authenticated user
- admin pages still load for an admin user
- expected user profiles and feedback records exist
- uploaded avatars load if upload data was restored

Useful verification commands:

```bash
sudo journalctl -u bibletype -n 200 --no-pager
psql "$DATABASE_URL" -c '\dt'
psql "$DATABASE_URL" -c 'SELECT count(*) FROM "user";'
psql "$DATABASE_URL" -c 'SELECT count(*) FROM "bible_verses";'
```

## Operational cautions

- Do not run restore while the app is actively serving writes unless you accept data loss after the backup timestamp.
- Do not assume provider disk snapshots are enough without a tested restore path.
- Do not delete checksum or metadata files. They are part of the recovery chain.
- Do not store the only copy of backups under the app checkout.

## Suggested production layout

Recommended directories:

- app: `/srv/bibletype/app`
- database backups: `/srv/bibletype/backups/postgres`
- uploaded file backups: `/srv/bibletype/backups/uploads`

## Routine backup validation

A backup strategy is incomplete unless restores are tested.

At a minimum:

- run a manual restore rehearsal on a non-production database after major schema changes
- verify that the newest scheduled backup file exists every day
- verify that retention cleanup is actually deleting old backups
- verify that off-host replication completed successfully if configured
