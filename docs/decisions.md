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
| D15 | What "machine line" means for car parts | Needs input | Step 2 |
| D16 | What the dashboard "Orders" tab shows | Needs input | Step 2 |
| D17 | Vendor attribution on products | Needs input | Step 2 |
| D18 | Ratings, reviews, and stock counts on the storefront | Needs input | Step 2 |
| D19 | Payments scope | Needs input | Step 2 |

D1 to D14 are Accepted or Deferred (D1, interim design in force). D15 to D19 came from reading `CONTEXT.md` and need an answer before step 2. Step 1 is only blocked by the D1 proxy spike it must run.

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

## D5. No partial fills for orders: Accepted
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

---

## D15. "Machine line" for car parts: Needs input
The dashboard tracks usage per production line (CNC, Press, Conveyor, Packaging) because its seed data is industrial spare parts. The storefront sells car parts, so that grouping has no meaning.
**Recommendation.** Drop `Part.machine_line`. Rename the report "usage by line" to "usage by category" and group by `Part.category`. Seed the unified catalog with car parts (22 or more, 6 suppliers, matching the dashboard's size).

## D16. Dashboard "Orders" tab: Needs input
In the dashboard, "Orders" lists fulfilment records created by the manual issue action (Shipped or Backorder). In the storefront, orders are customer purchases.
**Recommendation.** The dashboard Orders tab shows customer orders. Manual issue stays an inventory action: the response reports `SHIPPED` or `BACKORDER`, and the result is visible in the part's movement history. No separate fulfilment-record table.

## D17. Vendor attribution on products: Needs input
`CONTEXT.md` section 4 shows storefront products with `vendor`, `vendorRating`, and `vendorOrders`. D6 says vendors do not own listings.
**Recommendation.** Add a nullable `Part.vendor_id` used only for a "sold by" label. Drop `vendorRating` and `vendorOrders` in Phase 3 (they would need a computed or seeded source).

## D18. Ratings, reviews, and stock counts: Needs input
Products show `rating`, `reviews`, and `stockCount`; there is no review entity, and D3 hides exact stock from the public.
**Recommendation.** Keep `rating` and `review_count` as seeded, read-only columns on `Part` (no review submission). Public stock shows `in_stock` plus `stock_hint = min(available, 10)` so the "only N left" style message keeps working without exposing exact counts.

## D19. Payments scope: Needs input
`CONTEXT.md` section 9 asks whether payments need a design stub now. The ERD currently lists `CARD_PENDING` as a placeholder.
**Recommendation.** Cash on delivery only. Remove `CARD_PENDING` from the enum; no payment provider and no stub. Add card payments as a later phase. Email provider stays Resend (with the D1 interim email rule).
