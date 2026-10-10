# Inventory invariants and worked examples

Every example below must exist as an automated test using these exact numbers. Rules marked *(D5)* follow decision D5 (Accepted) in `docs/decisions.md`.

## Definitions

- `on_hand`: physical units. `reserved`: units held for active order reservations. `available = on_hand - reserved`.
- `wac`: weighted average cost, `Decimal(12,4)`, rounded half-up.
- All stock mutations happen in one transaction after `SELECT ... FOR UPDATE` on the `StockLevel` rows, locked in ascending `part_id` order.

## Invariants

| ID | Invariant |
|---|---|
| I1 | `on_hand >= 0` and `reserved >= 0` always (also a DB CHECK). |
| I2 | `reserved <= on_hand` always (D5). `adjust` may not push `on_hand` below `reserved`. |
| I3 | `reserved` equals the sum of ACTIVE `Reservation.qty` for that part. |
| I4 | For any part: `sum(RECEIVE) + sum(positive ADJUST) - sum(ISSUE) - sum(negative ADJUST) = on_hand` (ledger reconciles). `UNFULFILLED` rows never change `on_hand`. |
| I5 | WAC changes only on `RECEIVE`. `ISSUE`, `ADJUST`, reserve, and release never change WAC. |
| I6 | Quantities are positive integers. A request with quantity `<= 0` is rejected with 400. |
| I7 | The ledger is append-only. Corrections are new rows, never edits. |

## WAC on receive

Formula: `new_wac = round4_half_up((on_hand * wac + qty * unit_cost) / (on_hand + qty))`, computed under the lock from the locked row.

| # | Before (on_hand, wac) | Receive (qty @ cost) | After (on_hand, wac) | Note |
|---|---|---|---|---|
| W1 | 0, 0.0000 | 10 @ 100.0000 | 10, 100.0000 | Zero stock: WAC resets to unit cost |
| W2 | 10, 100.0000 | 10 @ 120.0000 | 20, 110.0000 | Simple average |
| W3 | 3, 110.0000 | 5 @ 99.9900 | 8, 103.7438 | `(330 + 499.95) / 8 = 103.74375`, half-up to 103.7438 |
| W4 | 10, 100.0000 | 5 @ 100.0000 | 15, 100.0000 | Equal cost leaves WAC unchanged |
| W5 | 0, 87.5000 (stale) | 4 @ 90.0000 | 4, 90.0000 | Zero stock ignores the old WAC |

Each `RECEIVE` movement stores `previous_wac` and `new_wac`.

## Reserve and release

| # | State (on_hand, reserved) | Operation | Result |
|---|---|---|---|
| R1 | 10, 0 | reserve 4 | 10, 4 |
| R2 | 10, 7 | reserve 3 | 10, 10 (available 0) |
| R3 | 10, 7 | reserve 4 | rejected `INSUFFICIENT_STOCK`, state unchanged |
| R4 | 10, 4 | release 4 | 10, 0 |
| R5 | 10, 4 | release 5 | rejected `INVALID_RELEASE`, state unchanged |
| R6 | 10, 4 | reserve 0 or -1 | 400 validation error |

Multi-line checkout is all-or-nothing: if line 2 of 3 fails, line 1's reservation is rolled back (same transaction).

## Issue

Order-driven issue (`issueReserved`, at PACKED), D5:

| # | State | Operation | Result |
|---|---|---|---|
| S1 | 10, 4 | issueReserved 4 | 6, 0, one `ISSUE` row of 4, `last_movement_at` updated |

Manual staff issue (`POST /inventory/parts/:id/issue`) works on available stock: `fill = min(available, qty)`, `short = qty - fill`.

| # | State | Operation | Result |
|---|---|---|---|
| S2 | 10, 0 | issue 4 | 6, 0; `ISSUE 4`; status `SHIPPED` |
| S3 | 6, 0 | issue 10 | 0, 0; `ISSUE 6` and `UNFULFILLED 4`; status `BACKORDER` |
| S4 | 10, 7 | issue 5 | available 3: `ISSUE 3` and `UNFULFILLED 2`; result 7, 7 |
| S5 | 0, 0 | issue 1 | `UNFULFILLED 1` only; `on_hand` stays 0 |

`is_pick_error=true` marks a ledger row as a pick error for the pick-accuracy KPI. It is supplied by the caller (staff action), validated as a boolean, and defaults to false.

## Adjust

| # | State | Operation | Result |
|---|---|---|---|
| A1 | 10, 0 | adjust +3 (reason required) | 13, 0 |
| A2 | 10, 0 | adjust -4 | 6, 0 |
| A3 | 10, 7 | adjust -4 | rejected: would make on_hand 6 < reserved 7 (I2) |
| A4 | 10, 0 | adjust -11 | rejected: on_hand would be negative (I1) |
| A5 | any | adjust with empty reason | 400 validation error |

Adjust never changes WAC (I5).

## Concurrency tests (against real Postgres)

| # | Scenario | Expected |
|---|---|---|
| C1 | 20 parallel manual `issue` of 1 against `on_hand=10, reserved=0` | exactly 10 `ISSUE`, 10 `UNFULFILLED`, final `on_hand=0`, ledger reconciles (I4) |
| C2 | 20 parallel `reserve` of 1 against `on_hand=10` | exactly 10 succeed, 10 get `INSUFFICIENT_STOCK`, final `reserved=10`, I3 holds |
| C3 | parallel `receive` and `issue` on the same part | final `on_hand` equals ledger sum; WAC equals a sequential replay of the lock order |
| C4 | two checkouts with lines in opposite order (A,B) and (B,A) | no deadlock (ascending lock order), both complete or one fails cleanly |
| C5 | same `Idempotency-Key` sent 5 times in parallel | one order, 4 replays, reserved increased once |

## Derived status (inventory list)

Evaluated in this order:

1. `on_hand = 0` gives **Out of Stock**
2. `available = 0` gives **Reserved**
3. `on_hand <= reorder_level` gives **Low Stock**
4. otherwise **In Stock**

Checked against `statusOf` in `CONTEXT.md` section 5: the dashboard rule "reserved > 0 and reserved >= stock" is the same as "available = 0 and on_hand > 0" once invariant I2 holds. Order and thresholds are identical.

## Aging buckets

Based on `last_movement_at`: `<= 90 days`, `91-180 days`, `> 180 days`. Capital share per bucket is `sum(on_hand * wac)` for the bucket divided by total valuation, rounded to 2 dp.

## Rules carried over from CONTEXT.md section 5, and how they map

| Dashboard rule | Server implementation |
|---|---|
| Age resets on receive and on issue with `fill > 0` | `last_movement_at` is set on `RECEIVE` and on `ISSUE` (manual or order). `ADJUST`, reserve, release, and `UNFULFILLED` do not change it. |
| COGS += fill x WAC | Each `ISSUE` movement stores `unit_cost = current wac`. COGS = sum of `quantity x unit_cost` over `ISSUE` rows. |
| Demand and unfulfilled counters | Demand = sum of `ISSUE` + `UNFULFILLED` quantities. Stockout rate = sum(`UNFULFILLED`) / demand x 100. Example: `ISSUE 6` and `UNFULFILLED 4` on one part gives 40%. |
| Pick counters (`total++`, `correct++` unless flagged) | One counted pick per `ISSUE` movement. Correct unless `is_pick_error = true`. Pick accuracy = correct / total x 100. Order packing counts one pick per line. |
| "Reserve toggle": reserve all current stock, or release | Staff `reserve` creates a `Reservation` with `source = MANUAL`, no `order_id`, no expiry, `created_by` set. "Reserve all" reserves the part's current **available** quantity. "Release" releases that part's MANUAL reservations. Order reservations are never touched by it. |
| Issue clamps reserved to new stock | **Replaced by D5.** The server never lets `reserved` exceed `on_hand`, so no clamp is needed. |
| Defect rate = defects / received x 100 | Supplier counters `defect_qty` and `received_qty`; thresholds good <= 0.5, warn <= 1.5, else bad. Open RMAs = `SupplierDefect` rows with status `OPEN`. |
| Invoice: due +30 days, `INV-n` | `Invoice.number` is a human-readable sequence; `issued_at` = receipt time. Status Paid, else Overdue if `due_at < now`, else Unpaid. |
| Auto-PO: qty = max(reorder x 2 - stock, 1), cost = WAC, ETA +8 days | Same formulas; one PO per supplier; skip parts with a DRAFT or SUBMITTED PO. |
| Add part validation | OEM unique and non-empty, name required (both languages), cost >= 0; `sku` auto-generated as `SP-n`. |
