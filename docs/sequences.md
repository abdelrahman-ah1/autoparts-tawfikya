# Sequence diagrams (high-risk flows)

These are the flows where a mistake costs money, stock, or security. Each diagram is a contract: implementation and tests must match it. Decisions referenced: D4, D5, D8, D11.

## 1. Login and refresh rotation

Grace window: `REFRESH_GRACE_SECONDS=10` (env). It exists so two tabs refreshing at once do not look like token theft.

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser
  participant A as API
  participant R as Redis
  participant D as Postgres

  B->>A: POST /v1/auth/login (email, password)
  A->>R: check lockout + IP throttle
  A->>D: load user (generic error if missing)
  A->>A: argon2 verify (constant-time path even if user missing)
  alt bad credentials
    A->>R: increment failed counter
    A-->>B: 401 INVALID_CREDENTIALS (generic)
  else ok
    A->>D: insert RefreshToken (new family_id, token_hash)
    A-->>B: 200 access JWT (15 min, token_version) + Set-Cookie refresh (HttpOnly, Path=/v1/auth) + csrf token in body
  end

  Note over B,A: Later, access token expired
  B->>A: POST /v1/auth/refresh (cookie + X-CSRF-Token + Origin)
  A->>A: verify Origin allowlist and CSRF header
  A->>D: find RefreshToken by hash
  alt not found or expired
    A-->>B: 401 INVALID_REFRESH (cookie cleared)
  else unused
    A->>D: mark used_at, insert child token, set replaced_by_id
    A-->>B: 200 new access JWT + rotated cookie
  else already used within grace window
    A-->>B: 200 new access JWT only (no rotation, no revoke)
  else already used outside grace window
    A->>D: revoke whole family (revoked_at)
    A->>D: audit SECURITY_TOKEN_REUSE
    A-->>B: 401 TOKEN_REUSE (cookie cleared)
  end
```

Per-request check: every authenticated request compares the JWT `token_version` with the user's current value (Redis cache, 30 s TTL, invalidated on bump). A mismatch returns 401.

## 2. Checkout with reservation

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser
  participant A as API (OrdersService)
  participant C as CatalogService
  participant I as InventoryService
  participant D as Postgres

  B->>A: POST /v1/checkout (Idempotency-Key, part_id+qty lines, address, method)
  A->>D: BEGIN
  A->>D: insert IdempotencyKey (scope, key, request_hash)
  alt key exists with same hash
    A-->>B: replay stored response
  else key exists with different hash
    A-->>B: 422 IDEMPOTENCY_KEY_REUSED
  end
  A->>C: get active parts and selling_price (ids only from client)
  A->>A: compute subtotal (tax-inclusive), included tax, shipping, total (decimal.js, half-up, D14) and ignore any client totals
  loop lines sorted by part_id ascending
    A->>I: reserve(part_id, qty, order_ref)
    I->>D: SELECT stock_level FOR UPDATE
    I->>I: require qty <= on_hand - reserved
    I->>D: UPDATE reserved, INSERT Reservation (ACTIVE, expires_at)
  end
  A->>D: INSERT Order (PENDING, COD, UNPAID), OrderItems with snapshots
  A->>D: store response on IdempotencyKey
  A->>D: COMMIT
  A-->>B: 201 order id, totals, tracking token (shown once)
  Note over A,D: Any failure, including INSUFFICIENT_STOCK on line N, rolls back everything: no partial reservations
```

## 3. Pack: reservation becomes an issue

```mermaid
sequenceDiagram
  autonumber
  participant S as Staff (Warehouse Operator)
  participant A as API (OrdersService)
  participant I as InventoryService
  participant U as AuditService
  participant D as Postgres

  S->>A: POST /v1/orders/:id/status {to: PACKED}
  A->>A: state machine: CONFIRMED to PACKED allowed, role allowed
  A->>D: BEGIN
  A->>D: SELECT order FOR UPDATE, re-check status
  loop lines sorted by part_id ascending
    A->>I: issueReserved(part_id, qty, order_ref)
    I->>D: SELECT stock_level FOR UPDATE
    I->>D: on_hand -= qty, reserved -= qty, last_movement_at = now
    I->>D: INSERT StockMovement ISSUE, Reservation CONSUMED
  end
  A->>D: UPDATE order status = PACKED
  A->>U: record(tx, actor, before, after)
  A->>D: COMMIT
  A-->>S: 200
  Note over I: By invariant (D5) this cannot be short. If it is, abort with INVARIANT_VIOLATION and alert.
```

## 4. Cancel: release the reservation

```mermaid
sequenceDiagram
  autonumber
  participant X as Customer or staff
  participant A as API (OrdersService)
  participant I as InventoryService
  participant D as Postgres

  X->>A: POST /v1/orders/:id/status {to: CANCELLED}
  A->>A: object-level check (customer owns order) + state machine
  A->>D: BEGIN, SELECT order FOR UPDATE
  alt status is SHIPPED or DELIVERED
    A-->>X: 409 ILLEGAL_TRANSITION
  else PENDING or CONFIRMED
    loop lines sorted by part_id
      A->>I: release(part_id, qty)
      I->>D: reserved -= qty, Reservation RELEASED
    end
    A->>D: order CANCELLED, audit
    A->>D: COMMIT
    A-->>X: 200
  else PACKED (staff only)
    Note over A,D: Stock was already issued. Return it with an ADJUST (reason: order cancelled after pack), then cancel.
    A->>D: COMMIT
    A-->>X: 200
  end
```

## 5. Purchase order receipt

```mermaid
sequenceDiagram
  autonumber
  participant P as Procurement
  participant A as API (PurchasingService)
  participant I as InventoryService
  participant V as InvoicesService
  participant S as SuppliersService
  participant D as Postgres

  P->>A: POST /v1/purchase-orders/:id/receive (Idempotency-Key)
  A->>D: BEGIN, SELECT po FOR UPDATE
  A->>A: require status SUBMITTED
  loop items sorted by part_id ascending
    A->>I: receive(part_id, qty, unit_cost, po_ref)
    I->>D: SELECT stock_level FOR UPDATE
    I->>I: new_wac = (on_hand*wac + qty*unit_cost) / (on_hand + qty), 4 dp half-up
    I->>D: UPDATE on_hand, wac, INSERT StockMovement RECEIVE (previous_wac, new_wac)
  end
  A->>V: create(po, amount = sum(qty*unit_cost), due = +30d, UNPAID)
  A->>S: add received_qty
  A->>D: PO RECEIVED, audit
  A->>D: COMMIT
  A-->>P: 200
  Note over A,D: Any failure rolls back everything, including the invoice
```

## 6. Reservation expiry job

```mermaid
sequenceDiagram
  autonumber
  participant Q as BullMQ repeatable job (fixed jobId)
  participant A as OrdersService
  participant D as Postgres

  Q->>A: expireStaleOrders()
  A->>D: SELECT PENDING orders with ACTIVE reservations past expires_at FOR UPDATE SKIP LOCKED
  loop each order
    A->>A: same path as cancel (diagram 4), actor = system
  end
```
