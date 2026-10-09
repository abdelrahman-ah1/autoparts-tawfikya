# Decisions register

Status values: **Accepted** (binding), **Proposed** (recommended, awaiting approval), **Needs input** (human must choose before the dependent step starts), **Deferred** (consciously postponed; an interim rule applies).
The agent must not build on anything that is not **Accepted**. Project scope: demo.

| ID | Decision | Status | Blocks |
|---|---|---|---|
| D1 | Domain and cookie topology | Deferred (interim design Accepted) | Revisit when a domain is bought |
| D2 | Web hosting: Cloudflare Pages | Accepted | none |
| D3 | Split `Part` and `StockLevel` | Accepted | none |
| D4 | `Reservation` entity with TTL | Accepted | none |
| D5 | No partial fills for orders (`on_hand >= reserved` invariant) | Accepted | none |
| D6 | Vendor model | Accepted | none |
| D7 | Currency and tax | Accepted | none |
| D8 | Idempotency keys | Accepted | none |
| D9 | Order-status roles | Accepted | none |
| D10 | Returns and refunds | Accepted (deferred to Phase 3.1) | none |
| D11 | Access-token revocation via `token_version` | Accepted | none |
| D12 | Environments | Accepted | none |
| D13 | Product images: static URLs, no uploads | Accepted | none |
| D14 | Money precision and rounding | Accepted | none |
| D15 | Email provider | Accepted (Resend; see D1 for the domain limitation) | none |
| D16 | Payments stub | Accepted | none |

All decisions are Accepted or Deferred (D1, interim design in force). Nothing blocks step 1 except the D1 proxy spike that step 1 must run.

Settled 2026-10-10 by the owner: D1 (interim proxy design), D2, D6, D7, D10, D13 confirmed; D5 explicitly **Accepted** over the earlier build-plan wording (plan step 7 "clamps `stock_reserved`" is withdrawn). `docs/phase_3_backend_plan.md` rev 3 is aligned with this register; where the two differ, this file wins.

Not yet decided (record here when answered):
- D15 Email provider beyond Resend: none needed for the demo; Resend stays, blocked on a domain (D1).
- D16 Payments: stub only (`COD`, `CARD_PENDING`; `payment_status`), no provider integration in Phase 3. **Accepted.**

---

## D1. Domain and cookie topology: Deferred, interim design Accepted
**Problem.** A web app on `*.pages.dev` and an API on `*.up.railway.app` are cross-site. A `SameSite=None` refresh cookie is a third-party cookie, blocked by Safari and increasingly by other browsers, so sessions would not survive a reload.
**Decision.** No domain for now. Interim design:
- The browser talks to **one origin** only. Cloudflare Pages serves `apps/web` and proxies `/v1/*` to the Railway API (Pages Function or equivalent rewrite). Locally, the Vite dev server proxies `/v1` the same way.
- The refresh cookie is first-party: `HttpOnly; Secure; SameSite=Lax; Path=/v1/auth`. No cross-origin CORS is needed in staging or production.
- **Step 1 spike (must pass before step 5):** confirm the proxy forwards `Cookie` and `Set-Cookie`, request methods, and the real client IP (`X-Forwarded-For`), and configure the API's `trust proxy` for exactly that chain so throttling keys on the client IP and not the proxy.
- **Fallback if the spike fails:** accept `SameSite=None` with a documented limitation (users on browsers that block third-party cookies must log in again after a reload). Acceptable for a demo only.
- **Email:** Resend cannot send to arbitrary recipients without a verified domain. Until a domain exists: Mailpit locally; in deployed environments set `EMAIL_VERIFICATION_REQUIRED=false` and use the email adapter only for the owner's own address. Real customer email (verification, reset) is blocked until the domain exists.
**When a domain is bought:** move to `app.<domain>` and `api.<domain>` (same-site), verify the sending domain (SPF, DKIM, DMARC), enable HSTS, and set `EMAIL_VERIFICATION_REQUIRED=true`.

## D2. Web hosting: Accepted (Cloudflare Pages)
`apps/web` deploys to Cloudflare Pages. This gives response headers (`_headers` file for CSP, HSTS, frame-ancestors) and preview deploys. Consequences: `deploy.yml` changes from GitHub Pages to Cloudflare Pages; the app is served from the site root, so `VITE_BASE_PATH` defaults to `/`; SPA fallback via `_redirects`.

## D3. Split `Part` and `StockLevel`: Accepted
`Part` (catalog-owned): identity, names, prices, `standard_cost`, `reorder_level`. `StockLevel` (inventory-owned, 1:1): `on_hand`, `reserved`, `wac`, `last_movement_at`. Only `InventoryService` writes `StockLevel`. `PATCH /parts` cannot touch stock or WAC. `FOR UPDATE` locks `StockLevel` rows.
`standard_cost` is a human-entered reference cost. `wac` is computed by receipts. They are different fields.

## D4. `Reservation` entity: Accepted
Each order line creates a `Reservation` (`order_id`, `part_id`, `qty`, `status`, `expires_at`). `StockLevel.reserved` equals the sum of ACTIVE reservations and is updated in the same transaction. Default TTL for PENDING orders: `RESERVATION_TTL_HOURS=24` (env). A BullMQ job cancels expired PENDING orders and releases their reservations.

## D5. No partial fills for orders: Accepted (confirmed 2026-10-10; supersedes CONTEXT.md §5 "reserved clamped to new stock")
Invariant: `0 <= reserved <= on_hand` always. `adjust()` may not reduce `on_hand` below `reserved`. Issuing an order's reserved stock at PACKED can therefore never be short. Short fills (`UNFULFILLED` ledger rows) occur only on the staff manual `issue` endpoint, which operates on **available** stock (`on_hand - reserved`). This replaces plan step 7's "clamps `stock_reserved`" wording.

## D6. Vendor model: Accepted
VENDOR is a login role in Phase 3. A `Vendor` entity (fulfilment partner) has N users (`User.vendor_id`). A `Shipment` belongs to one `Vendor`. A VENDOR user sees only shipments of their own vendor and can update dispatch status. They cannot see order prices, cost data, or other vendors' data. Vendor-owned catalog listings are out of scope. No vendor self-registration; Admin invites vendor users.

## D7. Currency and tax: Accepted
- Currency: `CURRENCY=EGP`, single currency per deployment.
- Tax: `TAX_RATE=0.14` (env). **Displayed and stored selling prices are tax-inclusive.**
- Shipping: ignored for now. `SHIPPING_FEE` (env) defaults to `0.00`; the shipping options table from the original plan is deferred. `shipping_method` is still stored on the order.
- The order stores `currency`, `subtotal`, `tax`, `shipping`, `total` as immutable snapshots (see D14 for the formulas).

## D8. Idempotency keys: Accepted
`POST /v1/checkout` and `POST /v1/purchase-orders/:id/receive` require an `Idempotency-Key` header. Stored in `IdempotencyKey` (unique per scope + key) with request hash and response, TTL 24 h. Same key with a different body returns 422 `IDEMPOTENCY_KEY_REUSED`.

## D9. Order-status roles: Accepted
See `docs/permissions.yaml` (`order_transitions`). Summary: staff confirm; Warehouse Operator packs and ships; customers can cancel while PENDING or CONFIRMED; staff can cancel until SHIPPED.

## D10. Returns and refunds: Accepted (deferred to Phase 3.1)
No return or refund flow in Phase 3. `RETURN` stays in `MovementType` and `REFUNDED` stays in `PaymentStatus` for forward compatibility; nothing in Phase 3 writes them.

## D11. `token_version`: Accepted
`User.token_version` is embedded in the access JWT and checked on every request (cached in Redis for 30 s). Suspend, role change, delete, and password reset increment it, so stale tokens fail within seconds instead of 15 minutes.

## D12. Environments: Accepted
Two Railway environments, `staging` and `production`, each with its own Postgres and Redis. Seeds and `/admin/reseed` are allowed only where `APP_ENV != production`. Staging holds no real customer data. As this is a demo, a single deployed environment is acceptable if you prefer; then treat it as staging (seeds allowed).

## D13. Product images: Accepted (static URLs, no uploads)
Phase 3 stores image URLs or serves static assets from `apps/web`. No upload endpoints, no object storage, no signed URLs.

## D14. Money precision and rounding: Accepted
Prices, taxes, shipping, order totals, invoice amounts: `Decimal(12,2)`. Unit cost and WAC: `Decimal(12,4)`. Rounding: half-up. JSON serialization: strings.

Tax-inclusive order math (server-side, `decimal.js`):

1. `line_total = round2(unit_price * qty)` where `unit_price` is tax-inclusive
2. `subtotal = sum(line_total)` (tax-inclusive)
3. `tax = round2(subtotal * TAX_RATE / (1 + TAX_RATE))` (the tax portion contained in the subtotal)
4. `shipping = SHIPPING_FEE` (0.00 for now)
5. `total = subtotal + shipping`

Examples at 14%: subtotal 114.00 gives tax 14.00; subtotal 100.00 gives tax 12.28 (12.2807, rounded). Purchase-order and invoice amounts use supplier unit cost and are not taxed in Phase 3.
