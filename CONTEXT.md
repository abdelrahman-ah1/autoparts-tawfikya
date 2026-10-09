# CONTEXT.md — AutoParts Marketplace (current state)

Hand-off context for building Phase 3 (see `phase_3_technical_specification.md`).
Everything below describes the repository **as it is today** (frontend-only prototype, no backend).

- Repo: https://github.com/abdelrahman-ah1/autoparts-tawfikya (branch `main`)
- Deploy today: GitHub Pages via `.github/workflows/deploy.yml` (Vite base path `/autoparts-tawfikya/`).
- Languages: Arabic (default, RTL) and English (LTR). Arabic + English only.

---

## 1. Stack

| Area | Current |
|---|---|
| UI | React 19, React Router 7, Vite 8 (JS, no TypeScript) |
| Styling | Tailwind via **CDN script** in `index.html` (config inline in `<script id="tailwind-config">`), plus `src/index.css` (dark-mode overrides, RTL tweaks). Design tokens: `DESIGN.md` |
| Fonts | Inter, JetBrains Mono, **Cairo** (Arabic), Material Symbols Outlined |
| State | React contexts only, persisted in `localStorage` |
| Backend | **None.** All data is hardcoded/mock |
| Tests / lint / CI checks | **None** (CI only builds and deploys) |

Scripts: `npm run dev` (port 3000), `npm run build`, `npm run preview`. Single dependency set: react, react-dom, react-router-dom; dev: vite, @vitejs/plugin-react.

---

## 2. Repository layout

```text
index.html                    # Vite entry; Tailwind CDN + config; sets <html dir/lang> before React loads
inventory-dashboard.html      # STANDALONE inventory dashboard (vanilla JS + Chart.js CDN), ~1000 lines, own state
vite.config.js                # base path, SPA 404 fallback, copies inventory-dashboard.html into dist/
DESIGN.md                     # design system tokens ("Technical Precision Auto System")
legacy/                       # original static HTML prototypes (reference only, not used at runtime)
scripts/                      # one-off page extraction scripts (not part of the build)
src/
  main.jsx, App.jsx           # provider tree + routes
  components/                 # AppLayout, AppHeader, AppFooter, ExecutiveToolbar (demo bar),
                              # VehicleModal, VinScannerModal, MechanicShareModal,
                              # ProductExplodedView, LegacyHtmlPage
  pages/                      # HomePage, PartsSearchPage, ProductDetailPage, CheckoutPage,
                              # OrderStatusPage (React); VendorDashboardPage, AdminCatalogPage (wrap raw HTML)
  content/*.html              # raw HTML fragments rendered with dangerouslySetInnerHTML
                              # (vendorDashboard.html, adminCatalog.html used; others are unused leftovers)
  context/                    # Language, Theme, Toast, Vehicle, Cart, Order
  data/products.js            # 4 hardcoded products + checkFitment()
  lib/vehicleCatalog.js       # make -> model -> engines map, DEFAULT_VEHICLE, vehicleDisplayName
  lib/routes.js               # legacy data-path key -> route map
  hooks/useLegacyPageContent.js  # wires data-path links, copy-to-clipboard, vehicle bindings in raw HTML
  i18n/translations.js        # flat en/ar dictionaries
  i18n/domTranslate.js        # Arabic text-node translator for raw HTML fragments
```

---

## 3. Routes (React Router, `basename = import.meta.env.BASE_URL`)

| Path | Page | Notes |
|---|---|---|
| `/` | HomePage | hero, vehicle picker, categories |
| `/catalog` (`/search` redirects) | PartsSearchPage | filters, sort, fitment badges, add to cart |
| `/product` | ProductDetailPage | always shows `PRODUCTS[0]`; specs, exploded view, share-with-mechanic |
| `/checkout` (`/cart` redirects) | CheckoutPage | order summary, place order |
| `/orders` | OrderStatusPage | latest order tracking with a **demo status switcher** |
| `/vendor` | VendorDashboardPage | raw HTML dispatch queue (static) |
| `/admin` | AdminCatalogPage | raw HTML fitment ledger (static) |
| external | `inventory-dashboard.html` | linked from header/mobile menu/toolbar; deployed alongside `dist/` |

Wildcard routes redirect to `/`. There is **no authentication and no route protection**.

---

## 4. State and mock data (what the API must replace)

| Context | Storage key | Content |
|---|---|---|
| LanguageContext | `autoparts_lang` (`ar`/`en`, default `ar`) | `t(key)`, `isRTL`; sets `html.dir` and `html.lang` |
| ThemeContext | `autoparts_theme` (`light`/`dark`) | toggles `html.dark` class |
| CartContext | `autoparts_cart` | line items `{product, quantity, shippingSpeed, shippingCost}`, seeded with 2 items |
| OrderContext | `autoparts_latest_order` | one order object (id, date, status, `statusStep` 1–3, carrier, trackingNumber, hub, estimatedDelivery, vehicleName, paymentMethod, items, subtotal, shipping, tax, total); `placeOrder()` fabricates ids/tracking locally |
| VehicleContext | (in-memory/localStorage) | active vehicle `{year, make, model, engine, vin, trim}`, vehicle modal open state |
| ToastContext | none | `showToast(msg)` |

**Product shape** (`src/data/products.js`, 4 items): `id, sku, oem, brand, title, category, price, msrp, rating, reviews, inStock, stockCount, warehouse, vendor, vendorRating, vendorOrders, shippingSpeed, image(url), description, tags[], compatibleMakes[], compatibleModels{make:[models]}, specs{label:value}`.
`checkFitment(product, vehicle)` is the only fitment logic (make/model lookup in the product itself).

**Vehicle catalog** (`src/lib/vehicleCatalog.js`): Toyota, Honda, Ford, BMW with models and engine lists. `VIN decode` in `VehicleModal` and `VinScannerModal` is **faked** (any ≥10 chars returns a canned vehicle).

**Order/pricing logic** currently lives in the client: tax is 8%, shipping options (standard free/6.99, priority, courier), totals computed in `CheckoutPage`. The server must take ownership of this.

---

## 5. Standalone inventory dashboard (`inventory-dashboard.html`)

Vanilla JS, Chart.js 4.4.3 (CDN), in-memory state `S` re-seeded from constants (`seed()`); "Reset demo data" button restores it. Tabs: **Overview, Orders, Inventory, Invoices, Users**. It shares only `autoparts_theme` and `autoparts_lang` with the React app. Dark/light theme and AR/EN toggle (own translator at the bottom of the script).

Domain note: its demo data is **industrial spare parts** (CNC/Press/Conveyor/Packaging lines, 22 parts like bearings and hydraulics, 6 suppliers), whereas the storefront sells **car parts**. The spec decides to unify the seed; this mismatch must be resolved.

### Business rules implemented in the dashboard (authoritative until reimplemented server-side)

- **Stock status** (`statusOf`): `stock<=0` → Out of Stock; `reserved>0 && reserved>=stock` → Reserved; `stock<=reorder` → Low Stock; else In Stock.
- **Issue stock**: `fill=min(stock,qty)`, `short=qty-fill`. Demand += qty, unfulfilled += short. If `fill>0`: stock -= fill, COGS += fill × WAC, age reset to 0, usage for the part's line += fill, reserved clamped to new stock, pick counters (`total++`, `correct++` unless "flag next pick as error" was checked). If `short>0` the fulfilment record status is **Backorder**, else **Shipped**. Toast warnings at/below safety level.
- **Receive stock / WAC**: `newWAC = ((stock*WAC) + (qty*unitCost)) / (stock+qty)`; stock += qty; age reset to 0; supplier received += qty.
- **Reserve toggle**: reserve all current stock, or release.
- **Receive PO**: marks received now, **creates an invoice** (`INV-n`, issued now, due +30 days, amount = qty × cost, unpaid), then runs the receive logic.
- **Auto-PO**: for each part with `stock<=reorder` and no open PO: qty = `max(reorder*2 - stock, 1)`, cost = current WAC, ETA = +8 days, supplier = part's supplier.
- **Invoice status**: Paid if paid; else Overdue if `due < now`; else Unpaid.
- **Supplier defect**: "+ Defect" increments defects and open RMAs. Defect rate = defects / received × 100 (good ≤0.5%, warn ≤1.5%, else bad).
- **Stock aging buckets** (by days since last movement, value = stock × WAC): active ≤90d, slow 91–180d, dead >180d. Note shows capital tied in slow+dead as % of total.
- **KPIs**:
  - Inventory turnover = COGS / average inventory (average of 11 monthly snapshots plus current valuation); target ≥6, warn ≥4.
  - Stockout rate = Σ unfulfilled / Σ demand × 100; good ≤2%, warn ≤4%.
  - Pick accuracy = correct / total × 100; good ≥99, warn ≥98.
  - Order lead time = mean (received − ordered) days across received POs; good ≤10, warn ≤14.
  - Inventory valuation = Σ stock × WAC.
- **Users**: roles `Admin, Inventory Manager, Procurement, Finance, Warehouse Operator, Viewer`; the last Admin cannot be removed or demoted; users can be suspended/reactivated; invites require name + valid email and unique email.
- **Add part**: OEM number must be unique and non-empty, name required, cost ≥ 0; id auto `SP-n`.
- **Cross-reference search** matches id, OEM, name, category, legacy numbers, and compatible models.

---

## 6. Internationalization

- `LanguageContext` default `ar`; applies `dir="rtl"` / `lang` to `<html>`; `index.html` also applies it pre-paint.
- React pages use `t('key')` from `src/i18n/translations.js` (flat `en` and `ar` objects).
- `LegacyHtmlPage` (vendor/admin) translates raw HTML via `src/i18n/domTranslate.js` (exact-match dictionary of text nodes/attributes; unknown strings stay English).
- The dashboard has its own translator (exact dictionary + regex, MutationObserver).
- Product data, mock orders, and some modal progress text are still English only.
- The spec moves bilingual content to the DB (`name_en`/`name_ar`); keep `translations.js` for UI chrome.

---

## 7. Known issues and technical debt

- `dangerouslySetInnerHTML` pages (`vendor`, `admin`) and `innerHTML` rendering in the dashboard (XSS risk once data is dynamic).
- Tailwind via CDN (not suitable for production/CSP).
- Product detail page is hardcoded to the first product; vendor/admin pages are static mockups.
- No auth, no validation layer, no error boundaries, no tests, no lint config, no TypeScript.
- Prices/tax/shipping computed on the client.
- `src/content/{checkout,home,orderStatus,partsSearch,productDetail}.html`, `legacy/`, and `scripts/` are leftovers from the original static prototype.
- Some source files contain mojibake characters from earlier copy-paste (e.g. `QuietCast�,�`, `A�C`); fix during data migration.
- GitHub Pages deployment will not host the API; production hosting is undecided.

---

## 8. Conventions to keep

- Material 3-style design tokens only (see `DESIGN.md` and the inline Tailwind config); fonts as listed above.
- Every user-visible string must exist in both Arabic and English.
- RTL must keep working: use logical utilities (`start`/`end`, `rtl:` variants), keep `.material-symbols-outlined` direction LTR.
- Dark mode via `html.dark` class and the overrides in `src/index.css`.
- Do not break the existing `localStorage` keys until the API replaces them.

---

## 9. What I need back from the building session

Please deliver in this order, one step at a time, stopping after each for review:

1. **Plan confirmation** before coding: monorepo move to `apps/web`, `apps/api`, `packages/database`, with the exact file moves and how `base`/GitHub Pages deploy will be handled (or the replacement deploy).
2. **Written artifacts** (commit them under `docs/`):
   - Mermaid **ERD** of the final Prisma schema.
   - **API contract**: method, path, role, request/response, errors; OpenAPI generated from NestJS.
   - **Role-permission matrix** (six staff roles plus customer and vendor vs. every endpoint).
   - **Env var list** (`.env.example`, names only) and a local setup README (Docker Compose, migrate, seed, run).
3. **Per step**: summary of changes, how to run and test it, and any deviations from the spec with a reason.
4. **Questions that need my decision** (do not guess): hosting target and domains, email provider for invites/password reset, and whether payments need a design stub now.
5. **Tests and CI**: unit tests for WAC and reserve boundaries, concurrency tests for `SELECT ... FOR UPDATE`, auth/RBAC integration tests, and a CI workflow running lint, test, and build.
6. **Do not**: remove the working storefront before the API replacement works, add dependencies without listing them, or leave mock data in place after a module is migrated (the exit criterion forbids static mock arrays).
