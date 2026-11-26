# Prisma + PostgreSQL setup verification

## Installed versions and migration

Installed Prisma CLI, Prisma Client, and PostgreSQL adapter are all `7.10.1`.
The config uses Prisma 7's `defineConfig` and `env("DATABASE_URL")` API; the
schema uses the `prisma-client` generator and the PostgreSQL driver adapter.

Command output from `npx prisma migrate dev --name init`:

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "library_db", schema "public" at "localhost:5432"

Applying migration `20261126090843_init`

The following migration(s) have been created and applied from new schema changes:

prisma\migrations/
  └─ 20261126090843_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

Command output from `npx prisma generate`:

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.

┌─────────────────────────────────────────────────────────┐
│ Update available 7.10.1 -> 8.0.0-rc.35                 │
│                                                         │
│ This is a major update - please follow the guide at     │
│ https://pris.ly/d/major-version-upgrade                 │
│                                                         │
│ Run the following to update                             │
│   npm i --save-dev prisma@latest                        │
│   npm i @prisma/client@latest                           │
└─────────────────────────────────────────────────────────┘

✔ Generated Prisma Client (7.10.1) to .\src\generated\prisma in 96ms
```

## Migration directory contents

Actual recursive file listing:

```text
.\prisma\migrations\migration_lock.toml
.\prisma\migrations\20261126090843_init\migration.sql
```

## PostgreSQL verification

Actual output from PostgreSQL 16 `psql` connected to `library_db` using
`\dt` and `\d books`:

```text
               List of relations
 Schema |        Name        | Type  |  Owner
--------+--------------------+-------+----------
 public | _prisma_migrations | table | postgres
 public | books              | table | postgres
(2 rows)

                 Table "public.books"
  Column   |  Type   | Collation | Nullable | Default
-----------+---------+-----------+----------+---------
 id        | uuid    |           | not null |
 title     | text    |           | not null |
 author    | text    |           | not null |
 genre     | text    |           | not null |
 available | boolean |           | not null |
Indexes:
    "books_pkey" PRIMARY KEY, btree (id)
```

## TypeScript and ignore checks

`npx tsc --noEmit` completed with exit code `0` and no diagnostics.

Actual `git check-ignore -v --no-index` checks:

```text
.gitignore:3:.env	.env
ignored=True
.gitignore:6:!.env.example	.env.example
ignored=False
```

`git diff --check` passed.

## Secret scan

A byte-level scan checked every file under the project root (including hidden,
generated, dependency, and Git files), excluding only `.env`.

```text
Files scanned (excluding .env): 12546
Password matches: 0
```

The pre-existing `PORT` entries were retained in both environment files;
`DATABASE_URL` was appended to each. The real credential is confined to the
ignored `.env`; `.env.example` uses the `YOUR_PASSWORD` placeholder.
