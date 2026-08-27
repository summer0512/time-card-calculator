# Accounts & Saved Time Cards — Configuration and Deployment

This application uses Better Auth 1.6.29 with Google OAuth, request-scoped `pg.Client` connections, Drizzle, Neon PostgreSQL, and Cloudflare Hyperdrive. All owned database objects are isolated in the `time_card_calculator` PostgreSQL schema.

## 1. Local environment

Create `.env.local` (never commit it):

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@NEON_HOST/DATABASE?sslmode=require
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<at-least-32-random-bytes>
GOOGLE_CLIENT_ID=<google-web-client-id>
GOOGLE_CLIENT_SECRET=<google-web-client-secret>
```

Generate a secret with `openssl rand -base64 32`. Local development connects directly to Neon and closes the `pg.Client` after each operation.

## 2. Review and apply the migration

The migration in `drizzle/` explicitly creates only the `time_card_calculator` schema and its six tables. Review it before applying it to the shared database:

```bash
rg -n 'public\.|DROP|ALTER|CREATE (SCHEMA|TABLE)|REFERENCES' drizzle
pnpm exec drizzle-kit migrate
```

Afterward verify that `user`, `account`, `session`, `verification`, `time_card`, and `time_card_row` exist in `time_card_calculator`, and that no matching tables were added to `public`. The migration account needs permission to create this schema, tables, indexes, and foreign keys; it must not be used to synchronize unrelated schemas.

## 3. Google OAuth

In Google Cloud Console create an OAuth 2.0 **Web application**. Configure the consent screen with the production domain, support email, Privacy Policy (`https://time-card-calculator.work/privacy`) and Terms (`https://time-card-calculator.work/terms`). Add test users while the consent screen remains in testing mode.

Authorized JavaScript origins:

```text
http://localhost:3000
https://time-card-calculator.work
```

Authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://time-card-calculator.work/api/auth/callback/google
```

Copy its client ID and client secret into local variables and Cloudflare secrets.

## 4. Cloudflare Hyperdrive

Create a Hyperdrive configuration that connects to the same Neon database and bind it to the Worker using the exact binding name `HYPERDRIVE`. Add the returned configuration ID to `wrangler.jsonc`:

```jsonc
"hyperdrive": [
  {
    "binding": "HYPERDRIVE",
    "id": "<YOUR_HYPERDRIVE_CONFIGURATION_ID>"
  }
]
```

Production deliberately fails if this binding is absent; it never falls back to a raw production `DATABASE_URL`.

Set secrets:

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
pnpm exec wrangler secret put GOOGLE_CLIENT_ID
pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET
pnpm exec wrangler secret put BETTER_AUTH_URL
```

Enter `https://time-card-calculator.work` for `BETTER_AUTH_URL`. Alternatively use non-secret Wrangler vars for the public URL and client ID, but never expose the client secret, Better Auth secret, database URL, or Hyperdrive connection string to client code.

Regenerate binding types after adding Hyperdrive:

```bash
pnpm run cf-typegen
```

Do not commit a generated file if it contains environment-specific values.

## 5. Build and deploy

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm run build
pnpm run preview
pnpm run deploy
```

Keep `nodejs_compat` and Workers observability enabled.

## 6. Production acceptance checklist

1. Complete Google sign-in and sign-out on the deployed Worker.
2. Enter non-default weekly and biweekly values, breaks, lunch, report header, notes, payment, and overtime settings while signed out; click Save; complete OAuth; confirm every value is restored and saved.
3. Create, reopen, update, rename, duplicate, and soft-delete a card.
4. Test split-shift and localized calculator routes.
5. Use two Google users and confirm neither can load, update, duplicate, rename, or delete the other's IDs; non-owned IDs should return 404.
6. Confirm list queries do not load `time_card_row` data.
7. Repeat session and CRUD requests to detect cross-request connection reuse problems.
8. Inspect Worker logs for HTTP 500, cancellation, deadlock, and Cloudflare 1101 errors.
9. Confirm production database traffic uses Hyperdrive.
10. Query PostgreSQL catalogs to confirm all six tables are in `time_card_calculator`, no corresponding tables were created in `public`, and unrelated schemas were not altered.

## 7. Rollback and data safety

Do not run destructive schema synchronization against the shared Neon database. Back up the application schema before later migrations. User deletion is soft deletion (`deleted_at`); child rows remain until a future explicitly reviewed cleanup process. If deployment fails, roll back the Worker code first and investigate logs rather than dropping shared database objects.
