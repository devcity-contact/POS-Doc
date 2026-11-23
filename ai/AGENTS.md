# AGENTS.md: RetailOS (DevCity POS)

Copy this file to the repository root as `AGENTS.md` (and `CLAUDE.md` if your tool reads that name).
The full design is in `Doc/` (open `Doc/index.html`). Machine index: `Doc/llms.txt`.

## What this system is
RetailOS is an offline-first, multi-tenant POS for Sri Lankan general retail, pharmacy and grocery.
- `backend/`: Java 25, Spring Boot 4, Spring Modulith **modular monolith**, PostgreSQL 18, Flyway.
- `apps/admin`: React + TS admin web. `apps/register`: React register UI.
- `apps/register-electron` (Windows) and `apps/register-android` (Capacitor): shells.
- `packages/register-core`: pure TypeScript domain (cart, pricing, tax, sale, shift, sync). No React or shell imports.
- `shared/test-vectors`: JSON cases shared by Java and TS tests (tax, rounding, GS1, pricing).

Approved libraries and versions are listed in `Doc/tech-stack.html`. Do not add a dependency that is not
listed there without adding it (with a reason) in the same change; new datastores or brokers need an ADR.

## Invariants (never break; cite IDs in comments and test names)
- INV-01 Every tenant table has `tenant_id`; every transaction sets `app.tenant_id`; RLS forced.
- INV-02 A completed sale is a fact: never rejected, updated or deleted. Corrections are new records.
- INV-03 Money/quantities are decimals (`numeric`, `BigDecimal`, `decimal.js`, JSON strings). Never float/double/number.
- INV-04 Stock changes only via `stock_movement` inserts through the Inventory module.
- INV-05 Register-created facts carry a client UUIDv7 = idempotency key.
- INV-06 Receipt numbers are gap-free per register: `{branch}-{register}-{seq}`.
- INV-07 Tax is computed only by the Tax module / `register-core/tax`. Extensions never compute tax.
- INV-08 Modules talk only via public `*Api`, `events`, `spi`. Never import another module's `internal`.
- INV-09 Audit log is append-only and hash-chained.
- INV-10 Sale lines snapshot price, discount, tax rate and batch cost.
- INV-11 No card numbers, CVV or track data anywhere.
- INV-12 Master data: server wins. Facts: register wins.
- INV-13 Changes are backward compatible with the previous release and register N-1 (expand/contract).
- INV-14 Explicit batch wins, else FEFO skipping expired/blocked; lock batches in id order.
- INV-15 UTC `timestamptz`; `business_date` from the branch time zone / cash session.

## Always
- Run `./backend/gradlew -p backend test modulithVerify` and `pnpm -r test lint` before saying done.
- New table: `tenant_id`, RLS policy, entry in `TenantIsolationIT`, expand-only Flyway script.
- New endpoint: `@PreAuthorize` with a specific permission + a test that a cashier token is refused.
- New UI text: keys in `packages/i18n/{en,si,ta}.json`.
- Audit entry for any action on money, stock, permissions or settings.
- Reference requirement IDs (F-xxx, BR-xx, NFR-xx) in PRs; update the matching `Doc/` page.

## Never
- Update or delete `sale*`, `payment`, `stock_movement`, `audit_log` rows.
- Throw from an SPI validator to block a synced sale (return warnings).
- Edit a merged Flyway migration.
- Log secrets, PINs, tokens or personal data.
- Add Redis/Kafka/Kubernetes/new datastores without an ADR in `Doc/adr.html`.
- Disable or skip failing tests.

## Where to look
| Task | Code | Doc |
|---|---|---|
| Is it in the MVP? (scope, modules, screens, out of scope) | — | `Doc/mvp.html` |
| What task comes next, and is it built? (task IDs like `AUTN-09`) | — | `Doc/build-order.html` (`DONE` in `Doc/tools/build_order.py`) |
| What a table or column means, and how tables relate | `backend/.../db/migration` | `Doc/data-dictionary.html`, `Doc/data-model.html#db-map` |
| Any screen (find by ID R-xx / A-xx / P-xx / D-xx) | `apps/register/src/screens`, `apps/admin/src/routes` | `Doc/ui-screens.html`, `Doc/ui-design.html` |
| What a screen should look and behave like | Reference only, not production code | `Doc/prototype/` (open `index.html#<route>`; route per screen in `Doc/ui-screens.html#prototype`) |
| Checkout / cart | `packages/register-core/src/cart` | `Doc/flows.html#sale-states` |
| Record synced sale | `backend/.../sales/internal/service` (`SaleService`) | `Doc/flows.html#record-sale` |
| Stock / FEFO | `backend/.../inventory` | `Doc/flows.html#fefo` |
| Sync | `backend/.../sync`, `register-core/src/sync` | `Doc/offline-sync.html` |
| Hardware | `register-core/src/ports/DeviceBridge.ts` | `Doc/architecture.html#register` |
| Permissions | `backend/.../platform/iam` | `Doc/security.html#rbac` |
| Industry module | `backend/.../ext/<key>`, `packages/ext-<key>` | `Doc/extensions.html` |
| Debug a sale | support console, logs by `saleId` | `Doc/operations.html#debug-sale` |
