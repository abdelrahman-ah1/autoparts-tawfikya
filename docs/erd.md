# ERD (proposed schema)

Status: **Proposed, ready for review** (all underlying decisions D3 to D14 are Accepted; see `docs/decisions.md`). Approve this file before the agent writes `schema.prisma`. Order amounts are tax-inclusive: `subtotal` includes tax, `tax` is the included portion, `total = subtotal + shipping`. The agent must not create `schema.prisma` until this file is approved.

Conventions: every table has `id uuid PK`, `created_at`, `updated_at` unless stated. `StockMovement` and `AuditLog` are append-only (`created_at` only). Money is `Decimal(12,2)`; cost and WAC are `Decimal(12,4)`. FKs default to `ON DELETE RESTRICT`. Localized fields come in `_en` / `_ar` pairs. Users are never hard-deleted (`deleted_at` plus anonymization).

```mermaid
erDiagram
  Vendor ||--o{ User : "has staff"
  User ||--o{ RefreshToken : "owns"
  User ||--o{ OneTimeToken : "receives"
  User ||--o{ Invite : "sends"
  User |o--o{ Order : "places"
  User ||--o{ AuditLog : "acts in"

  Category ||--o{ Category : "parent of"
  Category ||--o{ Part : "contains"
  Part ||--|| StockLevel : "has"
  Part ||--o{ StockMovement : "ledger"
  Part ||--o{ PartLegacyNumber : "known as"
  Part ||--o{ Fitment : "fits"
  Part ||--o{ SupplierPart : "supplied via"
  Part ||--o{ SupplierDefect : "defects"
  Part ||--o{ PurchaseOrderItem : "ordered in"
  Part ||--o{ OrderItem : "sold in"
  Part ||--o{ Reservation : "reserved"

  VehicleMake ||--o{ VehicleModel : "has"
  VehicleModel ||--o{ VehicleEngine : "has"
  VehicleModel ||--o{ Fitment : "target"
  VehicleEngine |o--o{ Fitment : "narrows"

  Supplier ||--o{ SupplierPart : "offers"
  Supplier ||--o{ SupplierDefect : "caused"
  Supplier ||--o{ PurchaseOrder : "receives"
  PurchaseOrder ||--|{ PurchaseOrderItem : "contains"
  PurchaseOrder ||--o| Invoice : "billed by"

  Order ||--|{ OrderItem : "contains"
  Order |o--o{ Reservation : "holds"
  Order ||--o{ Shipment : "shipped as"
  Vendor ||--o{ Shipment : "dispatches"

  User {
    uuid id PK
    string name
    string email UK
    string password_hash
    string role
    string status
    int token_version
    uuid vendor_id FK
    string totp_secret_enc
    int failed_logins
    timestamp locked_until
    boolean email_verified
    timestamp deleted_at
  }
  Vendor {
    uuid id PK
    string name
    boolean is_active
  }
  RefreshToken {
    uuid id PK
    uuid user_id FK
    uuid family_id
    string token_hash UK
    uuid replaced_by_id
    timestamp used_at
    timestamp revoked_at
    timestamp expires_at
  }
  OneTimeToken {
    uuid id PK
    uuid user_id FK
    string type
    string token_hash UK
    timestamp expires_at
    timestamp used_at
  }
  Invite {
    uuid id PK
    string name
    string email
    string role
    uuid invited_by FK
    string token_hash UK
    timestamp expires_at
    timestamp accepted_at
  }
  Category {
    uuid id PK
    uuid parent_id FK
    string slug UK
    string name_en
    string name_ar
  }
  Part {
    uuid id PK
    string sku UK "auto SP-n"
    string oem_number UK
    string slug UK
    string brand
    string name_en
    string name_ar
    string description_en
    string description_ar
    uuid category_id FK
    decimal selling_price
    decimal msrp
    decimal standard_cost
    int reorder_level
    string image_url
    json specs
    string tags
    string machine_line "pending D15"
    string search_text_norm
    boolean is_active
  }
  StockLevel {
    uuid part_id PK
    int on_hand
    int reserved
    decimal wac
    timestamp last_movement_at
    timestamp updated_at
  }
  StockMovement {
    uuid id PK
    uuid part_id FK
    string type
    int quantity
    decimal unit_cost
    decimal previous_wac
    decimal new_wac
    string ref_type
    uuid ref_id
    boolean is_pick_error
    string reason
    uuid created_by FK
    timestamp created_at
  }
  PartLegacyNumber {
    uuid id PK
    uuid part_id FK
    string number
    string number_norm
  }
  VehicleMake {
    uuid id PK
    string name UK
  }
  VehicleModel {
    uuid id PK
    uuid make_id FK
    string name
  }
  VehicleEngine {
    uuid id PK
    uuid model_id FK
    string code
    string label
  }
  Fitment {
    uuid id PK
    uuid part_id FK
    uuid model_id FK
    uuid engine_id FK
    int year_from
    int year_to
  }
  Supplier {
    uuid id PK
    string name UK
    string contact_email
    int received_qty
    int defect_qty
    boolean is_active
  }
  SupplierPart {
    uuid id PK
    uuid supplier_id FK
    uuid part_id FK
    decimal unit_price
    int lead_time_days
    boolean is_preferred
  }
  SupplierDefect {
    uuid id PK
    uuid supplier_id FK
    uuid part_id FK
    int quantity
    string status
    string note
  }
  PurchaseOrder {
    uuid id PK
    string number UK "PO-n"
    uuid supplier_id FK
    string status
    boolean is_auto
    timestamp eta
    timestamp submitted_at
    timestamp received_at
    uuid created_by FK
  }
  PurchaseOrderItem {
    uuid id PK
    uuid po_id FK
    uuid part_id FK
    int qty
    int qty_received
    decimal unit_cost
  }
  Invoice {
    uuid id PK
    string number UK "INV-n"
    uuid po_id FK
    decimal amount
    timestamp issued_at
    string status
    timestamp due_at
    timestamp paid_at
  }
  Order {
    uuid id PK
    string number UK
    uuid user_id FK
    string guest_email
    string status
    string payment_method
    string payment_status
    string currency
    decimal subtotal
    decimal tax
    decimal shipping
    decimal total
    string shipping_method
    json shipping_address
    string tracking_token_hash
    string vehicle_name "snapshot of active vehicle"
    timestamp placed_at
  }
  OrderItem {
    uuid id PK
    uuid order_id FK
    uuid part_id FK
    int qty
    decimal unit_price
    string name_en_snapshot
    string name_ar_snapshot
    string oem_snapshot
  }
  Reservation {
    uuid id PK
    uuid order_id FK "null when source is MANUAL"
    uuid part_id FK
    int qty
    string source "ORDER or MANUAL"
    string status
    uuid created_by FK "set for MANUAL"
    timestamp expires_at "null for MANUAL"
  }
  Shipment {
    uuid id PK
    uuid order_id FK
    uuid vendor_id FK
    string carrier
    string tracking_number
    string hub
    string method
    string status
    timestamp eta
  }
  IdempotencyKey {
    uuid id PK
    string scope
    string key
    string request_hash
    json response
    int status_code
    timestamp expires_at
  }
  InventorySnapshot {
    uuid id PK
    date snapshot_date UK
    decimal valuation
    decimal cogs_to_date
  }
  AuditLog {
    uuid id PK
    uuid actor_id FK
    string action
    string entity
    uuid entity_id
    json before
    json after
    timestamp created_at
  }
```

## Enums

| Enum | Values |
|---|---|
| `Role` | `ADMIN INVENTORY_MANAGER WAREHOUSE_OPERATOR PROCUREMENT FINANCE VIEWER CUSTOMER VENDOR` |
| `UserStatus` | `ACTIVE SUSPENDED` (`deleted_at` marks anonymized users) |
| `MovementType` | `RECEIVE ISSUE UNFULFILLED ADJUST RETURN` (`RETURN` unused in Phase 3, D10) |
| `POStatus` | `DRAFT SUBMITTED RECEIVED CANCELLED` |
| `InvoiceStatus` | `UNPAID PAID` (`OVERDUE` computed: UNPAID and `due_at < now`) |
| `OrderStatus` | `PENDING CONFIRMED PACKED SHIPPED DELIVERED CANCELLED` |
| `PaymentMethod` | `COD` (`CARD_PENDING` removed if D19 accepted) |
| `PaymentStatus` | `UNPAID PAID REFUNDED` |
| `ReservationStatus` | `ACTIVE CONSUMED RELEASED EXPIRED` |
| `DefectStatus` | `OPEN CLOSED` (CONTEXT.md only mentions "open RMAs"; defect rate counts all defects, open RMAs counts `OPEN`) |
| `OneTimeTokenType` | `VERIFY_EMAIL RESET_PASSWORD` |

## Constraints and indexes the migration must include

- Extensions: `pg_trgm`, `pgcrypto`.
- `CHECK (on_hand >= 0 AND reserved >= 0 AND reserved <= on_hand)` on `StockLevel`.
- `CHECK (qty > 0)` on `OrderItem`, `Reservation`, `PurchaseOrderItem`.
- Unique: `(supplier_id, part_id)` on `SupplierPart`; `(scope, key)` on `IdempotencyKey`; `(part_id, model_id, engine_id, year_from, year_to)` on `Fitment`.
- GIN trigram indexes on `Part.oem_number`, `Part.name_en`, `Part.name_ar`, `Part.search_text_norm`, `PartLegacyNumber.number_norm`. `*_norm` columns hold lowercased, separator-stripped, Arabic-normalized text (diacritics removed, alef and ya variants folded).
- Btree: `Order(user_id, placed_at)`, `Order(status)`, `Reservation(status, expires_at)`, `StockMovement(part_id, created_at)`, `Invoice(status, due_at)`, `RefreshToken(family_id)`, `AuditLog(entity, entity_id)`.
- Runtime DB role: no `UPDATE` or `DELETE` on `StockMovement` and `AuditLog`.
- Open question handled in schema: a PO item can be partially received (`qty_received`), but Phase 3 `receive` endpoint may still receive in full; the column keeps the door open.
