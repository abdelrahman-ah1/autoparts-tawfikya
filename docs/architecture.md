# Architecture

Topology follows D1 (interim, no domain yet): the browser talks to a single origin. Cloudflare Pages (D2) serves the SPA and proxies `/v1/*` to the Railway API, so the refresh cookie is first-party. When a domain is bought, this moves to `app.<domain>` and `api.<domain>`. Items marked *(D#)* depend on a decision in `docs/decisions.md`.

## 1. Container view

```mermaid
flowchart LR
  customer(["Customer / guest"])
  staff(["Staff: Admin, Inventory, Warehouse, Procurement, Finance, Viewer"])
  vendor(["Vendor user (D6)"])

  subgraph web["apps/web (static SPA)"]
    spa["React app: storefront + /dashboard"]
  end

  subgraph api["apps/api (NestJS)"]
    http["HTTP API /v1 + Swagger"]
    worker["BullMQ workers (in-process or separate)"]
  end

  pg[("PostgreSQL 16")]
  redis[("Redis 7: queues, throttling, lockout, token_version cache")]
  mail["Resend (prod/staging) / Mailpit (local)"]

  customer --> spa
  staff --> spa
  vendor --> spa
  spa -->|"HTTPS + JSON, Bearer access token"| http
  spa -->|"refresh cookie, Path=/v1/auth"| http
  http --> pg
  http --> redis
  worker --> pg
  worker --> redis
  http --> mail
  worker --> mail
```

## 2. Deployment view

```mermaid
flowchart TB
  gh["GitHub: main branch + Actions CI"]

  subgraph envStaging["Environment: staging"]
    sweb["Cloudflare Pages: staging + /v1 proxy"]
    sapi["Railway: API service"]
    spg[("Postgres")]
    sred[("Redis")]
  end

  subgraph envProd["Environment: production"]
    pweb["Cloudflare Pages: production + /v1 proxy"]
    papi["Railway: API service"]
    ppg[("Postgres + backups")]
    pred[("Redis, noeviction")]
  end

  gh -->|"CI green"| sweb
  gh -->|"CI green"| sapi
  gh -->|"release tag"| pweb
  gh -->|"release tag"| papi
  sapi --> spg
  sapi --> sred
  papi --> ppg
  papi --> pred
```

Rules: separate Postgres and Redis per environment; `prisma migrate deploy` runs as a release step before the new API instance takes traffic (expand/contract migrations only); two DB roles (migration owner, runtime with no UPDATE/DELETE on ledgers); Redis `maxmemory-policy noeviction` (BullMQ requirement); API behind Railway's proxy with `trust proxy` set so rate limits key on the real client IP.

## 3. Module dependency rules (enforced by ESLint boundaries)

An arrow means "may call the service of". Anything not drawn is forbidden. No module reads another module's tables directly.

```mermaid
flowchart LR
  auth --> users
  auth --> audit
  auth --> mail
  users --> audit
  catalog --> audit
  suppliers --> audit
  inventory --> audit
  purchasing --> inventory
  purchasing --> suppliers
  purchasing --> invoices
  purchasing --> audit
  invoices --> audit
  orders --> inventory
  orders --> catalog
  orders --> shipments
  orders --> mail
  orders --> audit
  shipments --> audit
  reports -. "read-only query services" .-> inventory
  reports -.-> orders
  reports -.-> purchasing
  reports -.-> suppliers
  reports -.-> invoices
```

Notes: `audit` and `mail` are leaf modules. `catalog` never calls `inventory` to mutate stock. `orders` reads prices from `catalog`, never from `Part` directly. `health` is standalone.

## 4. Trust boundaries

```mermaid
flowchart LR
  subgraph tb0["TB0: Untrusted internet"]
    browser["Browsers, scripts, bots"]
  end
  subgraph tb1["TB1: Edge (CDN / Railway proxy)"]
    edge["TLS, static hosting, proxy headers"]
  end
  subgraph tb2["TB2: API process"]
    guards["Throttler, Helmet, CORS, JwtAuthGuard, RolesGuard, ValidationPipe"]
    svc["Services: object-level checks, business rules"]
  end
  subgraph tb3["TB3: Data tier (private network)"]
    pg[("Postgres")]
    redis[("Redis")]
  end
  subgraph tb4["TB4: Third parties"]
    mail["Resend"]
  end

  browser --> edge --> guards --> svc
  svc --> pg
  svc --> redis
  svc --> mail
```

Every arrow crossing a boundary is an attack surface. See `docs/threat_model.md` for per-boundary threats and mitigations.
