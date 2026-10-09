# Phase 3 Backend Build Plan (rev 3)

Execution plan for `phase_3_technical_specification.md`, derived from `CONTEXT.md`.
Rev 2 incorporated *Phase 3 Backend Plan: Gap Analysis* (`[GA-…]` tags). Rev 3 aligns the plan with `docs/decisions.md` (D1–D16) and the agent docs (`AGENTS.md`, `docs/erd.md`, `docs/permissions.yaml`, `docs/inventory_invariants.md`, `docs/sequences.md`, `docs/architecture.md`). Where this plan and `docs/decisions.md` disagree, `decisions.md` wins.

Each step is delivered alone and stops for review. No step starts until the previous one is approved.

---

## 0. Decisions in force (summary; full text in `docs/decisions.md`)

| Topic | Decision | Source |
|---|---|---|
| Package manager / orchestration | npm workspaces + Turborepo (`packages/database` builds before `apps/api`) | plan |
| Domain / cookie topology | **No domain yet.** Browser talks to one origin: Cloudflare Pages serves the SPA and proxies `/v1/*` to Railway; Vite dev server proxies `/v1` locally. Refresh cookie is first-party `SameSite=Lax; Path=/v1/auth`. Step 1 runs the proxy spike (cookies, methods, `X-Forwarded-For`, `trust proxy`). Fallback: `SameSite=None` with documented limitation | D1 (Deferred, interim Accepted) |
| Web hosting | Cloudflare Pages, `VITE_BASE_PATH=/`, `_headers` + `_redirects`; GitHub Pages retired at step 1 | D2 |
| Environments | Railway `staging` + `production`, separate Postgres/Redis each; `APP_ENV` gates seeds and reseed. Single env acceptable for the demo (treated as staging) | D12 |
| Email | Resend (deployed) / Mailpit (local); `EMAIL_VERIFICATION_REQUIRED=false` until a domain exists | D1, D15 |
| Stock ownership | `Part` (catalog): identity, names, `selling_price`, `standard_cost`, `reorder_level`. `StockLevel` (inventory, 1:1): `on_hand`, `reserved`, `wac`, `last_movement_at`. Only `InventoryService` writes `StockLevel`/`StockMovement` | D3 |
| Reservations | `Reservation` per order line; `StockLevel.reserved` = Σ ACTIVE; `RESERVATION_TTL_HOURS=24`; BullMQ expiry job | D4 |
| No partial fills | `0 ≤ reserved ≤ on_hand` always; `issueReserved` at PACKED can never be short; manual staff `issue` works on `available` | D5 |
| Vendor | `VENDOR` login role, `Vendor` entity, `User.vendor_id`, `Shipment.vendor_id`; vendor sees/updates only own shipments; no listings, no self-registration | D6 |
| Currency / tax / shipping | `EGP`; `TAX_RATE=0.14`, prices **tax-inclusive**; `SHIPPING_FEE=0.00`; order snapshots `currency, subtotal, tax, shipping, total` | D7, D14 |
| Idempotency | `Idempotency-Key` on `POST /v1/checkout` and `POST /v1/purchase-orders/:id/receive`; `IdempotencyKey` table, 24 h; 422 `IDEMPOTENCY_KEY_REUSED` | D8 |
| Order-status roles | `permissions.yaml` → `order_transitions` | D9 |
| Returns / refunds | None in Phase 3; `RETURN` and `REFUNDED` reserved, never written. Cancel after PACKED returns stock via `ADJUST` | D10 |
| Access-token revocation | `User.token_version` in JWT, checked per request (Redis cache 30 s) | D11 |
| Images / files | Static URLs only; no uploads, no object storage, no signed URLs → **no PDF export**, CSV only | D13 |
| Money | `Decimal(12,2)` prices/totals, `Decimal(12,4)` cost/WAC, half-up, serialized as strings; tax-inclusive formulas in D14 | D14 |
| Payments | Stub: `payment_method` (`COD`, `CARD_PENDING`), `payment_status` (`UNPAID`, `PAID`, `REFUNDED`) | D16 |
| Web TypeScript | Mechanical rename in step 1 (`strict: false`); API client generated from `docs/openapi.json` (`openapi-typescript` + `openapi-fetch`) | plan `[GA-late integration]` |
| Dashboard HTML | Relocated in step 1, deleted in step 13 after `/dashboard` parity | CONTEXT §9.6 |
| Prisma location | Schema, migrations, generated client in `packages/database`; `PrismaService` (Nest lifecycle) in `apps/api` | plan |
| API conventions | `/v1` prefix, cursor pagination (`limit ≤ 100`, `id` tiebreak), `Vary: Accept-Language`, Swagger off in production | plan, AGENTS.md |
| Observability | `x-request-id`, Sentry (API + web), Pino → Railway logs | plan |

---

## 1. Global rules (apply to every step)

`AGENTS.md` is the short form of these rules and is binding for the agent; this section adds the detail.

### Delivery
- One step per session; each ends with: summary, run instructions, test instructions, deviations with reason, new dependencies per workspace.
- No mock arrays or in-memory fallback remain in a migrated module.
- Docs under `docs/` are updated in the same commit as the code that changes them. Conventional commits.
- If a doc is silent or contradicts code: stop, ask, record the answer in `docs/decisions.md`, fix the doc, then the code.

### Code
- TypeScript, `strict: true` in `apps/api` and `packages/database`.
- Nest modules: `auth users catalog suppliers inventory purchasing invoices orders shipments reports audit mail jobs health`. Allowed dependencies are the arrows in `docs/architecture.md` §3, enforced by `eslint-plugin-boundaries` (a module may import another only via its `index.ts`). `reports` uses read-only `*QueryService` classes.
- Global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`; explicit response DTOs; never return Prisma entities.
- Every route has `@Roles(...)` or `@Public()`; boot fails otherwise. A CI script compares the Nest router against `docs/permissions.yaml` and fails on any route missing from the file. RBAC tests and `docs/role_permission_matrix.md` are **generated** from `permissions.yaml`.
- Field visibility per role follows `permissions.yaml → field_visibility` (`cost_fields`, `stock_internal`, `customer_pii`, `order_prices`), implemented as audience-specific response DTOs.
- Money via `decimal.js`; raw SQL only via `Prisma.sql`.
- Pino with redaction (`password token authorization cookie email`); request bodies never logged for `/auth/*`; no `console.log`.
- Errors: `HttpException` subclasses with stable `code`; filter returns `{ statusCode, code, message, requestId, details? }`.
- Localized fields: `*_en`, `*_ar` plus resolved `name`/`description` from `Accept-Language` (`ar` default) or `?lang=`.

### Database
- Prisma migrations only; expand/contract for breaking changes; never edit an applied migration.
- `prisma migrate deploy` runs as the Railway pre-deploy command; rollback = redeploy previous image + forward-fix migration.
- Two DB roles from migration 1: `app_migrate` (DDL) and `app_runtime` (DML; `UPDATE`/`DELETE` revoked on `stock_movements`, `audit_logs`).
- Schema exactly as `docs/erd.md` once Accepted; constraints and indexes listed there are mandatory (`CHECK (reserved <= on_hand)`, trigram GIN on `*_norm`, etc.).
- Search normalization: `*_norm` columns lowercased, separator-stripped, Arabic-normalized (diacritics removed, `أإآ→ا`, `ى→ي`, `ة→ه`); query input normalized identically; `< 3` chars → prefix `ILIKE`, otherwise `%` filter + `ORDER BY similarity DESC, id`.
- Seeds idempotent, transactional, keyed by natural identifiers, refuse to run when `NODE_ENV=production`; `/v1/admin/reseed` only when `APP_ENV != production`.

### Concurrency (detail in `docs/inventory_invariants.md`)
- Stock mutations: one `prisma.$transaction` at `READ COMMITTED`, `SELECT … FOR UPDATE` on `stock_levels` rows in ascending `part_id` order.
- Retry only SQLSTATE `40P01` and `40001`, max 3 attempts, jittered backoff. Timeout 10 s, max wait 5 s.
- Invariants I1–I7 and every worked example (W1–W5, R1–R6, S1–S5, A1–A5, C1–C5) are tests with the exact numbers given.

### Security
- Argon2id, min 10 chars, top-10k blocklist.
- Access JWT 15 min in memory with `token_version` (D11). Refresh 7 d, `HttpOnly; Secure; SameSite=Lax; Path=/v1/auth`, hashed, family-tracked, rotated on use; `REFRESH_GRACE_SECONDS=10`; reuse outside the grace window revokes the family and writes `SECURITY_TOKEN_REUSE` to audit (sequence 1).
- CSRF: token returned in login/refresh body, sent as `X-CSRF-Token`; `Origin` allowlist check on `/auth/refresh`, `/auth/logout*`. Same-origin via proxy, so no cross-origin CORS in deployed envs; local CORS only for `localhost` dev ports.
- Brute force: Redis counters keyed `ip+account` with progressive delay (1 s → 60 s cap); throttler on Redis storage; `trust proxy` configured for the exact proxy chain found by the D1 spike.
- No enumeration: login, register, verify-email, reset, invite, guest checkout, tracking.
- TOTP mandatory for `ADMIN` and `FINANCE`: encrypted secret (AES-256-GCM, key from env), 10 hashed recovery codes, `mfa_token` (5 min) exchanged at `/v1/auth/2fa/verify`.
- One-time tokens: 32-byte random, SHA-256 hashed, single use; invite 72 h, reset 30 min; reset bumps `token_version` and revokes all families.
- Last-Admin guard on role change, suspend, delete, under `FOR UPDATE` on the admin set.
- `helmet`; `_headers` on Cloudflare Pages: CSP (report-only until step 12), `frame-ancestors 'none'`, HSTS only once a domain exists.
- Audit `before`/`after` from per-entity allowlists; never hashes, secrets, TOTP seeds.
- `gitleaks` + Dependabot + `npm audit --audit-level=high` from step 1.

### Testing
- Unit (Jest, mocked Prisma); integration (Jest + Supertest) against real Postgres/Redis containers; template database per test file.
- Playwright smoke suite from step 7; k6 run before exit (`/v1/catalog/search` p95 < 300 ms at 50 RPS; no lost stock at 100 concurrent checkouts).
- Coverage: 80 % for `inventory`, `auth`, `orders`; 60 % overall.

### CI / CD
- `ci.yml`: install, `turbo lint typecheck test build`, integration tests with services, `api:openapi` diff clean, permissions-coverage check, boundary lint, `npm audit`, `gitleaks`.
- Railway: root-context `apps/api/Dockerfile` (multi-stage, `prisma generate`), watch paths `apps/api/**`, `packages/**`, root manifests; worker service from the same image (`WORKER=1`).
- Cloudflare Pages: Git integration, PR previews, Pages Function proxying `/v1/*`.
- Backup: Railway snapshots + nightly `pg_dump`; restore rehearsal right after the first staging migration (step 3) and before exit.
- Health: `/health/live` (process), `/health/ready` (Postgres + Redis; no dependency details in production); Railway checks `/live`.
- Redis `maxmemory-policy noeviction`; repeatable jobs use fixed `jobId`.

---

## 2. Steps

### Step 0 — Owner prerequisites
- Railway project (`staging`, optionally `production`), Cloudflare Pages project, Resend account (owner address only until a domain exists), Sentry project. Values go into the dashboards, never into chat or repo.
- Approve `docs/decisions.md` (done 2026-10-10), keep `docs/erd.md` and `docs/permissions.yaml` at *Proposed* until step 2 review.

### Step 1 — Monorepo restructure + security baseline
- Root `package.json` (`private`, workspaces, `turbo.json`), scripts per `AGENTS.md` (`dev:web dev:api build lint typecheck test db:migrate db:seed db:studio api:openapi`).
- `git mv` `index.html`, `vite.config.js`, `src/**` → `apps/web/`; `inventory-dashboard.html` → `apps/web/public/`; drop the `copyFileSync` hack; mechanical TS rename; `vite.config.ts` with `VITE_BASE_PATH` (default `/`) and a `/v1` dev proxy to `localhost:4000`.
- `apps/api` skeleton: Nest, `/v1` prefix, Pino + request-id, global filter, validation pipe, Zod env schema, Swagger (non-prod) at `/api/docs`, `/health/live`, `/health/ready` (static until step 4), `Dockerfile`, `@Roles/@Public` boot check, Sentry.
- `packages/database`: datasource + generator only, `src/index.ts`.
- Root: `docker-compose.yml` (Postgres 16, Redis 7 `noeviction`, Mailpit), `.env.example`, ESLint with `eslint-plugin-boundaries` configured from `docs/architecture.md` §3, Prettier, `.editorconfig`, `.gitignore` additions.
- CI: `ci.yml`, `dependabot.yml`, `gitleaks`; `deploy.yml` removed in favour of Cloudflare Pages Git integration; `_headers`, `_redirects`, Pages Function `functions/v1/[[path]].ts` proxying to `API_ORIGIN`.
- **D1 proxy spike:** deploy the skeleton to staging and record in `docs/decisions.md` D1 whether `Set-Cookie`, all methods and `X-Forwarded-For` pass through, and the resulting `trust proxy` value.
- `docs/threat_model.md` (STRIDE per trust boundary in `docs/architecture.md` §4) and `docs/state_machines.md` (Order, PurchaseOrder, Reservation, Invoice, RefreshToken) created so `AGENTS.md` references resolve.
- **Deps:** api: `@nestjs/{core,common,platform-express,config,swagger}`, `nestjs-pino`, `pino`, `pino-http`, `class-validator`, `class-transformer`, `zod`, `reflect-metadata`, `rxjs`, `@sentry/node`; dev: `@nestjs/{cli,testing}`, `typescript`, `ts-node`, `tsconfig-paths`, `@types/{node,express,supertest}`, `jest`, `ts-jest`, `supertest`. database: `prisma`, `@prisma/client`. web: `typescript`, `@types/react`, `@types/react-dom`, `@sentry/react`. root: `turbo`, `eslint`, `@typescript-eslint/*`, `eslint-plugin-boundaries`, `prettier`.
- **Exit:** `npm run dev:web` identical behaviour; `npm run dev:api` serves `/health/live`, `/api/docs`; Cloudflare Pages preview serves the storefront and proxies `/v1/health/live`; CI green; spike result recorded.

### Step 2 — Written artifacts
- Agent proposes an ERD; owner diffs it against `docs/erd.md`; `erd.md` is the one that gets edited and then set to **Accepted**.
- `docs/openapi.json` generated by `api:openapi` from stub controllers carrying the final routes, DTOs and error catalog; `docs/api_contract.md` rendered from it.
- `docs/role_permission_matrix.md` generated from `docs/permissions.yaml` (no hand-written list); `permissions.yaml` set to **Accepted**.
- `docs/setup.md`, final `.env.example`.
- **Exit:** `erd.md` and `permissions.yaml` Accepted. Step 3 cannot start before that.

### Step 3 — Schema, migrations, seed, DB roles
- `schema.prisma` exactly per `erd.md`. Enums per `erd.md` (`MovementType = RECEIVE ISSUE UNFULFILLED ADJUST RETURN`, `POStatus = DRAFT SUBMITTED RECEIVED CANCELLED`, `OrderStatus = PENDING CONFIRMED PACKED SHIPPED DELIVERED CANCELLED`, `DefectStatus = OPEN CLOSED`, …).
- Migration 1: extensions, tables, `*_norm` generated columns, GIN/btree indexes, CHECKs, `app_migrate`/`app_runtime` roles and grants.
- Unified seed: car-parts catalog primary; dashboard demo parts mapped with `machine_line` set; mojibake fixed; `SupplierPart` rows (preferred supplier per part); vehicle makes/models/engines + fitments; one user per role incl. one `Vendor` with a `VENDOR` user; sample POs/invoices/orders.
- `PrismaService` in api on `app_runtime`.
- Deploy to staging; `docs/runbook_backup.md` with the first restore rehearsal.
- **Tests:** seed idempotency (×2, no duplicates); schema snapshot; `UPDATE stock_movements` as `app_runtime` fails; CHECK constraints reject `reserved > on_hand`.

### Step 4 — Infrastructure services
- `/health/ready` real checks; BullMQ queues + worker entrypoint; mail module (Resend/Mailpit, AR/EN templates, `EMAIL_VERIFICATION_REQUIRED` switch); `AuditService.record(tx, …)` with allowlists; Redis throttler storage; progressive-delay store.
- **Deps:** `bullmq`, `ioredis`, `resend`, `nodemailer`, `@nestjs/throttler`, `helmet`, `argon2`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `cookie-parser`, `decimal.js`, `otplib`, `qrcode`.
- **Exit:** readiness flips with stopped containers; a job round-trips via Redis; Mailpit receives a templated email.

### Step 5 — Auth and users (sequence 1)
- Endpoints exactly as `permissions.yaml` `auth` and `users` sections; `/v1/account/export` and `DELETE /v1/account` (anonymize) added to `permissions.yaml` first.
- Guards: `JwtAuthGuard` (+ `token_version`), `RolesGuard`, `MfaGuard`.
- **Tests:** rotation, 10 s grace, reuse revocation + audit row, progressive delay, `token_version` invalidation within one request after suspend, TOTP enforced for Admin/Finance, last-admin on role/suspend/delete, mass assignment (`role`, `status`, `vendor_id` → 400), enumeration parity, generated RBAC matrix for this section.

### Step 6 — Catalog and suppliers
- Public catalog, staff parts (incl. legacy numbers, compatibility, fitments), suppliers, supplier-part prices, defects, metrics (defect rate thresholds 0.5 % / 1.5 %).
- `POST /parts` accepts `standard_cost` (reference) only; `wac` starts at 0 until the first receive (W1/W5).
- **Early vertical slice:** generate the TS client from `docs/openapi.json`; wire `PartsSearchPage` and `ProductDetailPage` to the API; delete `src/data/products.js` once the Playwright smoke passes.
- **Tests:** normalized search (Arabic variants, OEM separators, short queries, ranking), fitment matcher, public DTO never contains `cost_fields`/`stock_internal`.

### Step 7 — Inventory ledger (`docs/inventory_invariants.md` is the contract)
- `InventoryService`: `receive`, `issue` (manual, on available, fill/short, `UNFULFILLED` rows, `is_pick_error` from DTO), `issueReserved` (PACKED path, can never be short → `INVARIANT_VIOLATION` + alert), `reserve`, `release`, `adjust` (reason required, no WAC change, may not breach I1/I2).
- Reservation expiry job (sequence 6, `SKIP LOCKED`, fixed `jobId`, every 5 min).
- Endpoints per `permissions.yaml` `inventory` section; derived status order per `inventory_invariants.md`; aging buckets.
- Playwright: dashboard login → issue stock.
- **Tests:** W1–W5, R1–R6, S1–S5, A1–A5, C1–C5 with the exact numbers; deadlock retry path.

### Step 8 — Purchasing and invoices (sequence 5)
- POs `DRAFT → SUBMITTED → RECEIVED | CANCELLED`; `receive` (Idempotency-Key) receives in full in Phase 3 (`qty_received` column populated), creates the invoice (`amount = Σ qty × unit_cost`, due +30 d, `UNPAID`), calls `inventory.receive` per line in ascending `part_id`, bumps `Supplier.received_qty`; all-or-nothing.
- Auto-PO (`POST /purchase-orders/auto` and daily job): per CONTEXT §5 — candidate when `on_hand ≤ reorder_level` and no PO for the part in `DRAFT|SUBMITTED`; qty `max(reorder_level*2 − on_hand, 1)`; supplier = preferred `SupplierPart` (fallback: any supplier of the part); cost = `SupplierPart.unit_price` else current `wac`; ETA +8 d; one `DRAFT` PO per supplier, `is_auto=true`. Considering `reserved`/incoming is a Phase 3.1 refinement.
- Invoices list/pay; `OVERDUE` computed.
- **Tests:** receive atomicity (invoice rolled back when a line fails), idempotent replay, auto-PO skips parts with open PO and groups by supplier.

### Step 9 — Orders, checkout, shipments (sequences 2–4)
- `POST /v1/checkout/quote` (no side effects) and `POST /v1/checkout` (Idempotency-Key, D14 math, reservations in ascending `part_id`, `Order PENDING/COD/UNPAID`, item snapshots, `vehicle_snapshot`, tracking token shown once, hashed in DB).
- Guest checkout: email required, `EMAIL_VERIFICATION_REQUIRED` respected, strict throttle, max 5 lines per order.
- State machine and roles exactly as `permissions.yaml → order_transitions`; cancel from PACKED (staff) returns stock via `ADJUST` with a fixed reason.
- `POST /v1/orders/:id/tracking` with `tracking_token`; shipments (`/orders/:id/shipment`, `/shipments/queue`) with `VENDOR` object-level scoping (D6).
- **Tests:** client totals ignored, idempotent replay (C5), object-level access (customer A vs B, vendor A vs B), cancel releases reservations, illegal transitions 409, expiry job cancels stale PENDING orders.

### Step 10 — Reports
- `InventorySnapshot` nightly job; KPIs per CONTEXT §5 (turnover with month-end snapshots and ledger-replay backfill, stockout rate, pick accuracy, lead time, valuation) with thresholds; usage-by-line, supplier performance, orders summary; CSV export only (D13).
- PII retention job: anonymize `shipping_address`/phone on orders delivered > 24 months ago (flag Egypt Law 151/2020 for legal review).

### Step 11 — Storefront integration
- Cart stores `part_id + qty`; totals from `/checkout/quote`; checkout, order status (tracking token), account pages, auth pages.
- Delete `vehicleCatalog.js` mock, `OrderContext` fabrication, unused `src/content/*.html`; delete `legacy/` and `scripts/` after confirming the step 3 seed does not read them.
- Playwright storefront flow green.

### Step 12 — Web hardening and legacy page rebuild
- Build-time Tailwind, remove the CDN script; CSP enforce mode.
- Vendor dispatch queue and admin fitment ledger rebuilt as React routes; `LegacyHtmlPage`, `domTranslate.js`, `useLegacyPageContent.js` removed; `rg dangerouslySetInnerHTML apps/web` empty.

### Step 13 — Dashboard rewrite and exit
- `/dashboard` tabs: Overview, Orders, Inventory, Purchasing, Suppliers, Invoices, Users (+ vendor queue view for `VENDOR`); `react-chartjs-2`; `POST /v1/admin/reseed` per D12.
- Delete `inventory-dashboard.html` and its links; `rg innerHTML apps/web` empty.
- `docs/security_review.md` (OWASP Top 10 evidence), header/CSP checks on Pages preview and API, k6 run, second restore rehearsal, `docs/phase_3_exit.md` with the final deviation list.

---

## 3. Review gates

- Every step: owner reads the end-of-step summary, runs the tests, checks the matching doc changed in the same commit, then merges.
- Steps 5, 7, 8, 9 (auth, inventory, orders): second review pass of the diff against `docs/threat_model.md` and `docs/inventory_invariants.md` before merge.
- After any step that adds an endpoint or data store: revisit `docs/threat_model.md`.

---

## 4. Known deviations from the spec (with reason)

| Spec item | Deviation | Reason |
|---|---|---|
| `MovementType` includes `RESERVE`, `RELEASE`, `ADJUSTMENT` | Ledger has `RECEIVE ISSUE UNFULFILLED ADJUST RETURN`; reservations live in `Reservation` | Ledger reconciles to `on_hand` (I4); reservation history is in its own table |
| Shipping options table | `SHIPPING_FEE=0.00` flat | D7 |
| Partial PO receipt | Column present, endpoint receives in full | Scope; D-free, noted in `erd.md` |
| PDF generation via BullMQ | CSV only | D13 (no object storage) |
| `PartCompatibility.machine_model` vs `VehicleFitment` | Both kept: `PartCompatibility` for the dashboard cross-reference list, `Fitment` for vehicles | CONTEXT §5 cross-reference search needs it |
| CONTEXT §5 manual issue clamps `reserved` | Issue works on `available`; reservations are never shrunk | D5 |
| CONTEXT §5 industrial demo data | Mapped onto the car-parts seed with `machine_line` optional | Spec §3.2 seed decision |

---

## 5. Open items

- D1 revisit when a domain is bought (same-site subdomains, Resend domain verification, HSTS, `EMAIL_VERIFICATION_REQUIRED=true`).
- Legal review outcome for Law 151/2020 may add consent text and retention changes.
- Auto-PO refinement (consider `reserved` and incoming qty): Phase 3.1.
- Returns/refunds: Phase 3.1 (D10).
