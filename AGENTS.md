# AGENTS.md: AutoParts Tawfikya (Phase 3 backend)

Read this file first in every session. It is short on purpose; the detail lives in `docs/`.

## Project snapshot
- npm-workspaces monorepo: `apps/web` (Vite + React, TS migrating), `apps/api` (NestJS), `packages/database` (Prisma schema + client).
- Postgres 16, Redis 7 (BullMQ), Mailpit locally, Resend in staging/prod.
- Storefront for car parts plus a staff dashboard (inventory, purchasing, invoices, orders, users). Demo scope; web hosted on Cloudflare Pages, API on Railway; no custom domain yet.
- Default locale is Arabic (`ar`), English supported. Money is Decimal, never `number`.

## Source of truth (priority order)
1. `docs/decisions.md`: a decision with status **Accepted** is binding. **Proposed** or **Needs input** means ask the human before building on it.
2. `docs/permissions.yaml` and `docs/openapi.json`: who can call what, and the request/response contract.
3. `docs/erd.md`: the schema. Do not add, rename, or remove tables or columns that are not in the approved ERD.
4. `docs/inventory_invariants.md`, `docs/state_machines.md`, `docs/sequences.md`, `docs/architecture.md`, `docs/threat_model.md`.

If code and docs disagree, or a doc is silent on something you need, **stop and ask**. Do not guess and do not silently pick a behavior.

## Commands (defined in step 1; create them as specified if missing)
```
npm ci
npm run dev:web | dev:api
npm run build | lint | typecheck | test
npm run db:migrate | db:seed | db:studio
npm run api:openapi          # regenerates docs/openapi.json; CI fails on a dirty diff
docker compose up -d         # postgres, redis, mailpit
```
Run `lint`, `typecheck`, and the relevant tests before you say a step is done.

## Architecture rules
- One NestJS module per domain: `auth users catalog inventory purchasing orders shipments invoices suppliers reports audit health`.
- A module reads or writes only its own tables. Cross-domain work goes through the owning module's service (see the allowed-dependency diagram in `docs/architecture.md`). `reports` uses read-only query services. ESLint boundary rules enforce this; do not disable them.
- Only `InventoryService` writes `StockLevel` and `StockMovement`. Every stock change is one `prisma.$transaction` with `SELECT ... FOR UPDATE`, rows locked in ascending `id` order.
- DTOs use `class-validator`; global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`. Response DTOs are explicit classes; never return Prisma entities.
- Every route has `@Roles(...)` or `@Public()`. Boot fails if one is missing.
- Errors are `HttpException` subclasses with a stable `code` (see error catalog in the OpenAPI doc). Format: `{ statusCode, code, message, details? }`.
- API is versioned under `/v1`. Pagination is cursor-based with `id` as the sort tiebreaker.
- Raw SQL only through `Prisma.sql`. No string concatenation into queries.
- Logging: Pino only, no `console.log`. Redact `password token authorization cookie email` and never log request bodies for `/auth/*`.

## Security rules (non-negotiable)
- Passwords: Argon2id, minimum 10 characters, blocklist check.
- Access JWT 15 min (in memory on the client), carrying `token_version`. Refresh token 7 days in an `HttpOnly; Secure; SameSite=Lax` cookie scoped to `/v1/auth` (first-party via the same-origin proxy, D1 interim), hashed in DB, rotated on use, family revoked on reuse outside the grace window.
- Suspend, role change, delete, and password reset bump `token_version`.
- Never trust client totals, prices, roles, or ownership. Server recomputes; services enforce object-level access.
- Public responses never include `cost`, `wac`, `stock_reserved`, supplier data, or other customers' data. Field visibility per role is in `docs/permissions.yaml`.
- Privileged mutations write an `AuditLog` row in the same transaction, passing through the redaction allowlist (no hashes, secrets, or TOTP seeds).
- No enumeration: login, register, verify-email, reset, invite, guest checkout, and tracking return generic responses.
- Secrets only from env. `.env` is gitignored; `.env.example` lists names only.

## Data rules
- Money: `Decimal` in Prisma, `decimal.js` in code. Prices and invoice amounts are 2 dp, cost and WAC are 4 dp, rounding half-up. Serialize money as strings. Currency is EGP; selling prices are tax-inclusive at `TAX_RATE=0.14`; the formulas are in `docs/decisions.md` D14. Shipping fee is `SHIPPING_FEE` (0.00 for now).
- Migrations only via Prisma migrate. Never `db push` outside scratch work. Never edit an applied migration.
- `StockMovement` and `AuditLog` are append-only; the runtime DB role has no UPDATE/DELETE on them.
- Seeds are idempotent, transactional, keyed by natural identifiers, and refuse to run when `NODE_ENV=production`.

## Testing rules
- Unit tests (Jest) for pure logic; integration tests (Jest + Supertest) against real Postgres for anything involving transactions, locks, or RBAC.
- Required before a step exits: the tests listed for that step in the build plan, plus every invariant example in `docs/inventory_invariants.md` as a test with the exact numbers given.
- RBAC tests are generated from `docs/permissions.yaml`; do not hand-maintain a second list.
- Coverage gate: 80% lines for `inventory`, `auth`, `orders`; 60% overall.

## Workflow
- One build-plan step per session. Start by stating your plan and wait for approval before large changes.
- Small, conventional commits (`feat(api): ...`, `chore(repo): ...`, `docs: ...`).
- End every step with: (1) summary of changes, (2) how to run, (3) how to test, (4) deviations from the spec with reasons, (5) every new dependency and the workspace it was added to.
- Update the relevant `docs/` file in the same commit as the code that changes it.

## Never
- Touch `.env*`, production credentials, deploy settings, or Railway/Cloudflare configuration.
- Add a dependency without listing it in the step summary.
- Weaken a guard, disable a lint rule, skip a test, or loosen validation to make something pass.
- Hard-delete users or ledger rows. Write to stock outside `InventoryService`.
- Use `localStorage` for tokens, or `innerHTML` with unsanitized data.
