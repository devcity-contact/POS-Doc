# RetailOS system context (condensed)

Paste this into any AI assistant to give it the essentials of the RetailOS design.
The full source of truth is the HTML site in `Doc/` (start at `Doc/index.html`).
Version 1.0, 19 Nov 2026, DevCity.

## Product
Offline-first, multi-tenant point of sale + back office for Sri Lanka (LKR, Asia/Colombo, English/Sinhala/Tamil).
Segments: general retail (core), pharmacy and grocery (extension modules, R2). Restaurant and salon later.
Team: one engineer now. MVP ≈ 10–12 months including a 3-shop pilot.

## Architecture
- **Backend**: one Spring Boot 4 / Java 25 modular monolith (Spring Modulith). Same image runs `api` and `worker` profiles.
- **Database**: PostgreSQL 18, shared schema, `tenant_id` + forced row-level security. Fact tables partitioned monthly.
- **Object storage**: S3-compatible (images, catalog snapshots, exports, backups).
- **Admin web**: React + TS SPA (static hosting).
- **Register**: one React + TS app; `register-core` pure TS domain; Electron shell (Windows, MVP) and Capacitor shell (Android, R2); encrypted SQLite (SQLCipher); `DeviceBridge` port for ESC/POS printer, cash drawer, HID scanner, scale.
- **Hosting**: cloud-agnostic containers. Stage 1 = 1 VM + Postgres (≈ US$30–70/month). No Kubernetes, Kafka or Redis until a trigger metric.

## Key technologies (full list: Doc/tech-stack.html)
Backend: Java 25, Spring Boot 4, Spring Modulith 2, Spring Security 7, Hibernate 7 + JdbcClient, Flyway, springdoc-openapi, MapStruct, ShedLock, Bucket4j, Apache POI, AWS SDK v2 (S3).
Data: PostgreSQL 18 (RLS, partitioning, pg_trgm), S3-compatible storage.
Front-end: TypeScript 5, React 19, Vite, pnpm workspaces, TanStack Query/Router/Table, Zustand, React Hook Form + Zod, Tailwind 4 + Radix, ECharts, i18next, decimal.js, date-fns, uuid (v7), openapi-typescript.
Register: Electron + electron-builder/updater + better-sqlite3-multiple-ciphers (Windows); Capacitor + @capacitor-community/sqlite + Kotlin device plugin + ML Kit scanning (Android); receipt-printer-encoder (ESC/POS); SQLite FTS5.
Quality/ops: JUnit, Testcontainers, ArchUnit, Vitest, Playwright, k6; GitHub Actions, Docker, Caddy, Cloudflare, OpenTofu, sops/age; gitleaks, Semgrep, OSV-Scanner, Renovate, Trivy, CycloneDX, cosign, ZAP; OpenTelemetry, Micrometer, Grafana stack, Sentry SDKs.

## Front-ends (full list: Doc/ui-screens.html, design: Doc/ui-design.html)
Register app (R-01..R-33): device setup, PIN sign-in, open shift, checkout (home, scan-first, F-key shortcuts), lookup, batch picker, line editor, manager override, customer, payment, sale complete, held bills, returns, sales history, cash in/out, close shift (blind count), receiving, price check, status/diagnostics, device settings; pharmacy/grocery panels in R2.
Admin web (A-01..A-103): login/MFA, onboarding, dashboard, catalog, import wizard, pricing, stock, batches/recall, goods receipts, counts, expiry, sales, exceptions queue, shifts, customers/credit, tax documents, VAT report, report centre, settings, users/roles, devices, receipt templates, modules, audit log.
Platform console (P-01..P-07) and printed documents (D-01..D-08: receipt, tax invoice, credit note, Z-report, statement, GRN, labels, PO).
Shared `packages/ui` components; en/si/ta; touch + keyboard; WCAG 2.2 AA.
Clickable prototype of every MVP screen: Doc/prototype/index.html (plain HTML/JS, no build; per-screen links and demo PINs in Doc/ui-screens.html#prototype). It is a behaviour and layout reference, not production code.

## Modules (backend)
platform.tenancy, platform.iam, platform.audit, devices, catalog, pricing, inventory, purchasing, sales, payments, cash, customers, tax, sync, reporting, notifications, ext.pharmacy, ext.grocery.
Rules: extensions → core → platform; cross-module calls only via `*Api`, `events`, `spi`; stock deduction happens inside the sale transaction via `InventoryApi.allocateAndDeduct`.
SPIs: ProductAttributeProvider, SaleLineValidator (warnings only), SaleEnricher, PricingRule, ReceiptSectionProvider, BarcodeParser, ReportProvider. Enabled per tenant via `tenant_module`.

## Core data
tenant → branch → register (→ device). product → sku → barcode / unit_conversion. price_list → price_list_item.
batch (sku, location, batch_no, expiry, cost, status) ← stock_movement (append-only ledger) → stock_balance (projection).
sale (register UUIDv7 id, receipt_no, status OPEN/COMPLETED/VOIDED, business_date) → sale_line (price/tax/cost snapshots, staff_id) → sale_line_allocation (batch) ; payment ; sale_return → credit note ; cash_session ; customer → credit_account → credit_ledger ; tax_document ; audit_log (hash chain) ; sync_change_log ; sync_inbox ; receipt_registry.
Money numeric(19,4); qty numeric(14,3); UTC timestamptz.

## Offline & sync
- Register completes a sale in one local transaction: next receipt seq + sale + outbox row; then prints.
- Pull: `GET /sync/v1/changes?scopes=…&cursor=…` from `sync_change_log`; snapshots for bootstrap/reset; staff/settings/batches pulled every 60 s.
- Push: `POST /sync/v1/push` batches ≤ 50 items in device order; per-item result ACCEPTED / DUPLICATE / ACCEPTED_WITH_EXCEPTION; exponential backoff with jitter.
- Server never rejects a completed sale; it raises exceptions (NEGATIVE_STOCK, PRICE_MISMATCH, EXPIRED_BATCH_SOLD, CLOCK_SKEW, RECEIPT_COLLISION).
- Offline guard rails: banners after 24 h/72 h, credit limit uses last balance + local unsynced, server N-1 version support.

## Security
Argon2id passwords + TOTP MFA for owners/admins; staff PINs (lockout); device enrollment with key pair (DPAPI / Android Keystore); JWT 10 min + rotating refresh tokens; fine-grained permissions with manager PIN overrides; RLS; encrypted local DB; hash-chained audit log; out of PCI scope (no card data); OWASP ASVS L2; PDPA No. 9 of 2022; gitleaks, Semgrep, OSV, Trivy, SBOM, ZAP in CI.

## Invariants
INV-01 tenant_id + RLS · INV-02 sales are immutable facts · INV-03 decimals only · INV-04 stock only via ledger · INV-05 client UUID idempotency · INV-06 gap-free receipt seq per register · INV-07 tax only in Tax module · INV-08 module boundaries · INV-09 append-only hash-chained audit · INV-10 price/cost snapshots · INV-11 no card data · INV-12 master=server, facts=register · INV-13 backward compatible N-1 · INV-14 explicit batch else FEFO, lock by id · INV-15 UTC + branch business date.

## Release plan
MVP: Windows register, offline, printing/drawer, catalog+import, batches/FEFO/GS1, weight barcodes, discounts, hold, returns, cash/card/LankaQR/credit, shifts/Z-report, tax invoice + credit notes, roles/PINs/audit, en/si/ta, core reports, backups.
R2: Android, pharmacy & grocery modules, promotions, PO, transfers, loyalty, e-mail receipts, dashboards.
R3: RAMIS e-invoicing + secured POS adapters (IRD timing), integrated card/LankaQR, accounting connectors, SMS/WhatsApp, gift cards.
Later: AI forecasting, e-commerce, delivery apps, self-checkout, restaurant, salon.

## Open questions
Q-01 secured POS spec; Q-02 RAMIS API; Q-03 NMRA pharmacy records; Q-04 supported hardware list; Q-05 pricing model; Q-06 hardware bundles/support; Q-07 payment partners.
