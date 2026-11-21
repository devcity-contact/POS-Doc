"""Build backend-build.html: every backend task in build order, grouped by stage and category,
with tick boxes so the team can mark what is built.

Usage (from anywhere):  python Doc/tools/build_backend_plan.py

Rules for editing:
  * Task IDs (e.g. "AUTN-06") are stable. Never renumber or reuse one: progress is saved by ID.
    A new task gets the next free number in its category, even if you insert it in the middle.
  * Order in the lists below IS the build order.
  * To record progress for everyone, add finished IDs to DONE below and regenerate.
    (Tick boxes on the page are saved only in the reader's browser.)
  * Detail text: `code` becomes <code>; INV-xx and BR-xx become rule tags.
  * refs: "page#anchor" (".html" added). "dd:sale" links to the data dictionary table.
"""
import html
import pathlib
import re

DOC = pathlib.Path(__file__).resolve().parent.parent

# Finished tasks recorded in the repository (shared with everyone). Example: DONE = {"SET-01", "SET-02"}
DONE: set[str] = set()

# ----------------------------------------------------------------------------------------------
# Stages -> categories -> tasks.  Task: (id, title, detail, refs, phase-override or None)
# ----------------------------------------------------------------------------------------------
STAGES = [
 ("foundation", "Stage 1 · Foundation", "P0–P1",
  "Project setup, the whole database, the shared building blocks, and who may do what. Nothing else can be built safely before this.",
 [
  ("SET", "Project setup", "P0", "One repository, one build, one command to start everything locally, and a CI pipeline that blocks bad merges.", [
   ("SET-01", "Create the monorepo layout", "`backend/`, `admin/`, `register/`, `packages/`, `infra/`. Add `.editorconfig`, `.gitattributes` and a root README.", "dev-guide#setup", None),
   ("SET-02", "Gradle build (Kotlin DSL)", "Java 25 toolchain, version catalog `libs.versions.toml`, dependency locking, build cache.", "tech-stack", None),
   ("SET-03", "Spring Boot 4 application skeleton", "One application, virtual threads on, Actuator health endpoint, starts with an empty database.", "tech-stack", None),
   ("SET-04", "Create the 15 empty modules", "Packages for tenancy, iam, devices, audit, catalog, pricing, inventory, purchasing, sales, payments, cash, customers, tax, sync, reporting, plus `platform` (shared kernel). Each has a public `api` package and an `internal` package.", "modules#module-map", None),
   ("SET-05", "Module boundary test", "`ApplicationModules.verify()` runs in CI and fails on a forbidden dependency (INV-08). Generate the Modulith module docs.", "modules#dependency-rules", None),
   ("SET-06", "ArchUnit rules", "No `double`/`float` for money or quantities (INV-03), no imports of another module's `internal` package, naming rules, constructor injection only.", "dev-guide#java", None),
   ("SET-07", "Configuration and profiles", "`local`, `test`, `staging`, `prod` profiles. Typed `@ConfigurationProperties`. Secrets come only from environment variables.", "security#encryption-and-secrets", None),
   ("SET-08", "Local stack with docker compose", "PostgreSQL 18, S3-compatible storage (MinIO or similar) and Mailpit. `docker compose up` gives a running stack.", "deployment", None),
   ("SET-09", "Integration test base", "Testcontainers with PostgreSQL 18 and `@ServiceConnection`; one shared base class for integration tests.", "dev-guide#testing", None),
   ("SET-10", "Formatting and static checks", "Code formatter plus static checks run in the build, so style is never discussed in review.", "dev-guide#review", None),
   ("SET-11", "CI pipeline (GitHub Actions)", "Build, unit and integration tests, boundary test and ArchUnit on every pull request. Required to merge. Scripts live in `infra/ci/`.", "deployment", None),
   ("SET-12", "Security scans in CI", "Semgrep or CodeQL, OSV-Scanner for dependencies, Renovate for weekly update pull requests.", "security#secure-development-lifecycle", None),
   ("SET-13", "Container image", "Layered jar on a JRE 25 base, runs as non-root, scanned by Trivy, pushed to the container registry.", "deployment", None),
   ("SET-14", "Pull request template and branch protection", "PR template with the security checklist, protected `main`, AGENTS.md for AI assistants.", "security#security-checklist-for-every-pull-request ai-guide", None),
   ("SET-15", "Message bundles en / si / ta", "Server messages (errors, e-mails) in English, Sinhala and Tamil, chosen by `Accept-Language`.", "api#conventions", None),
  ]),
  ("DB", "Database and migrations (all tables first)", "P0–P1", "Create all 56 MVP tables in four migrations, in the order of the four areas, before building features. See the database build order.", [
   ("DB-01", "Flyway setup", "Core migrations in `db/migration`, a separate location for extensions later, validate on start, `clean` disabled outside local.", "data-model#db-build-order", None),
   ("DB-02", "Database roles", "Owner role runs migrations. The app role has no DDL and no `BYPASSRLS`. A read-only reporting role. The app role may only `INSERT` and `SELECT` on `audit_log` (INV-09).", "data-model#conventions", None),
   ("DB-03", "Shared SQL conventions", "`uuidv7()` defaults, `numeric(19,4)` money, `numeric(14,3)` quantities, `timestamptz` (INV-15), audit columns, `version`, `archived_at`.", "data-model#conventions data-dictionary#common", None),
   ("DB-04", "V1 — Store & staff (20 tables)", "`V1__store_and_staff.sql`: tenant, branch, register, users and roles, cash sessions, devices, audit log and the sync tables, with keys, constraints and indexes.", "data-model#db-build-order data-dictionary#overview", None),
   ("DB-05", "V2 — Catalog (11 tables)", "`V2__catalog.sql`: brand, category, tax rate, product, unit, SKU, unit conversion, barcode, price lists, discount rules.", "data-model#db-build-order", None),
   ("DB-06", "V3 — Inventory (10 tables)", "`V3__inventory.sql`: suppliers, goods receipts, locations, batches, stock balance, stock movement, counts, stock exceptions.", "data-model#db-build-order", None),
   ("DB-07", "V4 — Sales (15 tables)", "`V4__sales.sql`: sale, lines, allocations, returns, payments, tender types, tax documents, fiscal submissions, customers, credit, held bills, receipt registry. Unique (register, seq) for receipts (INV-06).", "data-model#db-build-order dd:receipt_registry", None),
   ("DB-08", "Row-level security on every tenant table", "`ENABLE` and `FORCE ROW LEVEL SECURITY`, policy on `current_setting('app.tenant_id', true)`. A missing setting returns no rows (fail closed, INV-01).", "security#tenant-isolation data-model#conventions", None),
   ("DB-09", "Append-only guards on facts", "Grants or triggers stop `UPDATE`/`DELETE` on sales, lines, payments, stock movements, credit ledger and audit log (INV-02, INV-04, INV-09).", "data-model#conventions", None),
   ("DB-10", "Partitioning", "Partition large fact tables by `business_date` (monthly). A job creates partitions ahead; alert if rows land in the default partition.", "data-model#conventions", None),
   ("DB-11", "Seed data", "System permissions, default roles (Owner, Manager, Cashier, Stock keeper, Pharmacist, Accountant), tender types, common units, Sri Lanka VAT rates. A demo tenant for local only.", "security#authorisation-and-permission-matrix", None),
   ("DB-12", "Migration tests", "CI runs all migrations on an empty PostgreSQL 18 and checks every table in the data dictionary exists with RLS forced.", "data-dictionary", None),
   ("DB-13", "Persistence pattern", "JPA entities for master data (`ddl-auto=validate`), `JdbcClient` repositories for facts, allocation and reports. One example of each for others to copy.", "tech-stack", None),
  ]),
  ("CORE", "Shared building blocks", "P0–P1", "Used by every module. Getting these right once avoids the same bug in fifteen places.", [
   ("CORE-01", "Money and Quantity types", "Value objects on `BigDecimal` (scale 4 and 3) with fixed rounding rules; UUIDv7 id generator (INV-03).", "data-model#conventions", None),
   ("CORE-02", "JSON settings", "`BigDecimal` written as a string with 4 decimals (INV-03), ISO-8601 UTC times, strict unknown-field policy for commands.", "api#conventions", None),
   ("CORE-03", "Clock and business date", "Injectable `Clock`; `business_date` from the branch time zone (Asia/Colombo). Store UTC `timestamptz` (INV-15).", "offline-sync#clocks-and-dates", None),
   ("CORE-04", "Error responses", "RFC 9457 Problem Details with a stable `code` from the error catalog, `requestId`, localised `detail`, never a stack trace or SQL.", "api#error-format modules#error-code-catalog", None),
   ("CORE-05", "Request validation", "Bean Validation on request bodies → `VAL-001` with a list of field errors.", "api#error-format", None),
   ("CORE-06", "Cursor pagination, filters, sorting", "`?limit=50&cursor=…` returns `nextCursor`. Shared parsing for `from`, `to`, `branchId`, `sort`. No offset paging on large tables.", "api#conventions", None),
   ("CORE-07", "Optimistic locking with ETag", "Mutable resources return `ETag` from `version`. `PUT`/`PATCH` require `If-Match`; a mismatch returns 412.", "api#conventions", None),
   ("CORE-08", "Idempotency-Key for REST", "Every REST `POST` that creates money or stock records stores the key and its response; a retry returns the same response.", "api#conventions", None),
   ("CORE-09", "Request context and logging fields", "Read `X-Request-Id`, `traceparent`, `X-App-Version`, `X-Device-Id`; put tenant, user, device and request id in the log context.", "api#standard-headers", None),
   ("CORE-10", "Structured logs with masking", "JSON logs. Phone numbers, e-mails, tokens and PINs are masked or never logged.", "security#encryption-and-secrets", None),
   ("CORE-11", "OpenAPI document", "springdoc groups for `/api/v1` and `/sync/v1`; Swagger UI only in local and staging; `openapi.json` saved by CI.", "api#openapi-and-client-generation", None),
   ("CORE-12", "Generated TypeScript client", "CI generates the client into `packages/` and fails on a breaking API change (INV-13).", "api#openapi-and-client-generation", None),
   ("CORE-13", "Minimum app version", "Registers below the minimum supported version get 426 `DEV-004`.", "api#standard-headers", None),
   ("CORE-14", "Compression", "gzip/br responses over 1 KB; accept gzipped request bodies on sync push.", "api#conventions", None),
   ("CORE-15", "Rate limiting (Bucket4j)", "Login, PIN, enroll, refresh 10/min then lockout; admin 300/min per user; sync pull 120/min and push 60/min per device; 429 with `Retry-After`.", "api#rate-limits", None),
   ("CORE-16", "File storage", "S3 client behind a port; keys prefixed `tenants/{tenantId}/`; downloads by 5-minute signed URL after a permission check.", "security#tenant-isolation", None),
   ("CORE-17", "Domain events with outbox", "Spring Modulith event publication registry, idempotent listener pattern, incomplete events retried on start (ADR-007).", "modules#domain-event-catalog", None),
   ("CORE-18", "Scheduled jobs", "Scheduler with ShedLock (one instance runs each job) and a tenant-aware job runner that sets the tenant before touching data.", "tech-stack", None),
   ("CORE-19", "E-mail sending", "Mail port: Mailpit locally, a provider in production; templates in en/si/ta.", "tech-stack", None),
  ]),
  ("TNT", "Tenancy and isolation", "P1", "One business can never see another's data. Proven by a test that runs on every pull request.", [
   ("TNT-01", "Tenant context from the token", "The tenant comes only from the signed token (`tid`), never from a URL or body.", "security#tenant-isolation", None),
   ("TNT-02", "Set the tenant per transaction", "`set_config('app.tenant_id', …, true)` at the start of every transaction, for both JPA and `JdbcClient` (INV-01).", "security#tenant-isolation", None),
   ("TNT-03", "Tenant in jobs, events and caches", "Jobs and listeners set the tenant explicitly; every cache key and job payload includes the tenant id.", "security#tenant-isolation", None),
   ("TNT-04", "Tenant status and modules", "Suspended tenant → `TEN-001`. Check `tenant_module` before industry features.", "dd:tenant_module", None),
   ("TNT-05", "Branch scope", "Users scoped to branches through `user_role.branch_id`; a manager of branch A can't act in branch B.", "security#authorisation-and-permission-matrix", None),
   ("TNT-06", "TenantIsolationIT", "Every repository and every REST endpoint called with another tenant's token returns nothing or 403. Runs in CI. (P1 exit test)", "security#tenant-isolation roadmap#mvp-phases-and-exit-tests", None),
  ]),
  ("AUTN", "Authentication", "P1", "Sign-in for the web admin (password + MFA), for staff on a register (PIN), and tokens.", [
   ("AUTN-01", "Argon2id password hashing", "m=64 MB, t=3, p=1 via Spring Security and Bouncy Castle; re-hash on login when settings change.", "security#authentication", None),
   ("AUTN-02", "Password policy", "At least 10 characters, checked against a breached-password list (NIST 800-63B), no forced rotation.", "security#authentication", None),
   ("AUTN-03", "Signing keys and JWKS", "EdDSA or ES256 key pair with `kid`; JWKS publishes the current and previous key; rotation every 90 days.", "security#tokens-and-sessions", None),
   ("AUTN-04", "Access tokens", "10-minute JWT with `sub`, `tid`, `bid`, `did`, `roles`, `ver`.", "security#tokens-and-sessions", None),
   ("AUTN-05", "Resource server", "Nimbus JWT validation, claims → current user, `AUTH-001` for a missing or expired token.", "security#tokens-and-sessions", None),
   ("AUTN-06", "Login endpoint", "`POST /api/v1/auth/login`: e-mail + password (+ TOTP). Same error for wrong e-mail or password; failures counted, locked out and audited.", "api#auth-and-devices", None),
   ("AUTN-07", "TOTP multi-factor", "Set up with a QR code and a confirm code, recovery codes, required for OWNER and ADMIN.", "security#authentication", None),
   ("AUTN-08", "Refresh token rotation", "Opaque, stored hashed, 30-day sliding life, rotated on every use. Reuse of an old one revokes the whole family. `POST /auth/refresh`.", "security#tokens-and-sessions dd:refresh_token", None),
   ("AUTN-09", "Admin web cookie", "Refresh token in an `HttpOnly; Secure; SameSite=Strict` cookie scoped to `/api/v1/auth`. Access token kept in memory only.", "security#tokens-and-sessions", None),
   ("AUTN-10", "Logout", "`POST /auth/logout` revokes the refresh-token family.", "api#auth-and-devices", None),
   ("AUTN-11", "Token version check", "A permission change or deactivation increments `ver`; older tokens are rejected (small in-memory cache).", "security#tokens-and-sessions", None),
   ("AUTN-12", "Staff PIN", "Set and reset a 4–6 digit PIN (Argon2id, per-user salt). `POST /api/v1/auth/pin` on an enrolled device. 5 failures → 5-minute lockout on that device, audited.", "security#authentication api#auth-and-devices", None),
   ("AUTN-13", "Offline PIN data", "Staff PIN hashes and roles go to the register in the users sync scope, so staff can sign in offline.", "security#authentication offline-sync#who-owns-what", "P2"),
   ("AUTN-14", "Password reset", "Single-use, short-lived e-mail link; signs out all sessions.", "security#authentication", None),
   ("AUTN-15", "Invite a user", "E-mail invitation → set password → set up MFA if the role needs it.", "security#authentication", None),
   ("AUTN-16", "Authentication tests", "Login, MFA, refresh rotation and reuse detection, lockouts, expired and tampered tokens.", "dev-guide#testing", None),
  ]),
  ("AUTZ", "Authorization (roles and permissions)", "P1", "Every request is checked on the server against fine-grained permissions, scoped to branches.", [
   ("AUTZ-01", "Permission catalog in code", "All permissions (`sale.create` … `audit.view`) defined once, seeded into the database and exported for the register.", "security#authorisation-and-permission-matrix", None),
   ("AUTZ-02", "Roles", "System roles plus custom tenant roles made from the same permissions. `GET/POST /api/v1/roles`.", "api#tenant-administration dd:role", None),
   ("AUTZ-03", "User roles with branch scope", "Assign roles per user, optionally limited to one branch (`user_role.branch_id`).", "dd:user_role", None),
   ("AUTZ-04", "Method security", "`@PreAuthorize` with a permission evaluator that also checks the branch; `AUTH-003` names the missing permission.", "security#authorisation-and-permission-matrix", None),
   ("AUTZ-05", "Limits per role", "Discount, refund and stock-adjustment limits stored as data per role and used by those modules.", "security#authorisation-and-permission-matrix", None),
   ("AUTZ-06", "Manager approval", "Actions record `approver_id`; approvals given by PIN on a register are checked when the fact syncs.", "security#audit-logging", None),
   ("AUTZ-07", "Users API", "`GET/POST /api/v1/users`, deactivate (bumps `ver`), assign roles. Managers manage users only in their branch.", "api#tenant-administration", None),
   ("AUTZ-08", "Permission matrix test", "A table-driven test checks every role × permission against the matrix in the security page.", "security#authorisation-and-permission-matrix", None),
  ]),
  ("AUDT", "Audit log", "P1", "Who did what, when, from which device and who approved it. Tamper-evident.", [
   ("AUDT-01", "Audit writer", "Public API in the audit module: actor, approver, device, action, entity, before/after, reason.", "security#audit-logging dd:audit_log", None),
   ("AUDT-02", "Hash chain", "Per-tenant `seq`, `prev_hash`, SHA-256 over the defined fields; safe under concurrent writes (INV-09).", "security#audit-logging", None),
   ("AUDT-03", "Audit the listed actions", "Logins and failures, PIN overrides, voids, refunds, discounts above limit, price changes, no-sale opens, stock adjustments, batch blocks, role changes, device enrollment and lock, settings, exports, support access.", "security#audit-logging", None),
   ("AUDT-04", "Audit search API", "`GET /api/v1/audit?entity=&from=` with cursor paging; needs `audit.view`.", "api#tenant-administration", None),
   ("AUDT-05", "Register audit chains", "Accept AUDIT items from registers through sync push and check each device's chain.", "offline-sync#push-sending-facts", "P4"),
   ("AUDT-06", "Nightly chain check", "Job verifies the chain per tenant and alerts on a break.", "security#audit-logging", None),
  ]),
  ("DEVC", "Branches, registers and devices", "P1", "Registers are enrolled devices with their own credential. (P1 exit test: a device enrolls with a code.)", [
   ("DEVC-01", "Branches and registers", "`GET/POST /api/v1/branches`, `/branches/{id}/registers`. Branch and register codes feed the receipt number.", "api#tenant-administration", None),
   ("DEVC-02", "Enrollment codes", "Create a one-time, short-lived code for a register (`device.manage`).", "offline-sync#enrolling-and-bootstrapping-a-register", None),
   ("DEVC-03", "Enroll endpoint", "`POST /api/v1/devices/enroll`: code + device public key → device record and device credential. The code is used up.", "api#auth-and-devices dd:device_enrollment", None),
   ("DEVC-04", "Device authentication", "Device credential → device token bound to `did`; `X-Device-Id` must match the token.", "security#register-and-device-security", None),
   ("DEVC-05", "Remote lock and unlock", "`POST /devices/{id}/lock` revokes device tokens; a locked device gets `DEV-002` and stops selling at its next pull.", "api#auth-and-devices", None),
   ("DEVC-06", "Heartbeat", "`POST /sync/v1/heartbeat`: version, queue depth, printer status, disk space, saved in `device_heartbeat`.", "api#auth-and-devices dd:device_heartbeat", None),
   ("DEVC-07", "Device list for admin", "Status, version, last sync, queue depth and last heartbeat per device.", "ui-screens", None),
   ("DEVC-08", "Replace a device", "Retire the old device; the new one gets its receipt sequence from `GET /sync/v1/receipt-sequence`.", "offline-sync#receipt-numbering", "P4"),
   ("DEVC-09", "Remote commands", "Forced re-sync and log upload, delivered in the heartbeat response.", "security#register-and-device-security", "P6"),
  ]),
  ("BIZ", "Business setup and onboarding", "P1", "A new shop can sign up and get to its first register without help.", [
   ("BIZ-01", "Sign-up", "Create tenant, owner user and first branch in one transaction; verify the e-mail.", "flows", None),
   ("BIZ-02", "Business profile and settings", "`GET/PUT /api/v1/tenant`, `/tenant/settings`: business details, VAT number, receipt header/footer and languages.", "api#tenant-administration", None),
   ("BIZ-03", "Onboarding wizard steps", "Business, branch, tax registration, first register, invite staff; progress saved between visits.", "ui-screens", None),
   ("BIZ-04", "Industry modules", "`PUT /api/v1/tenant/modules/{key}` turns pharmacy or grocery features on or off (`tenant.modules`).", "api#tenant-administration extensions", None),
   ("BIZ-05", "Settings reach registers", "Settings changes are audited and sent to registers in the settings sync scope.", "offline-sync#pull-the-change-feed", "P2"),
  ]),
 ]),
 ("catalog", "Stage 2 · Catalog and register data", "P2",
  "What a register needs to sell offline: products, prices, tax rates, and the pull sync that keeps them fresh.",
 [
  ("CATL", "Catalog", "P2", "Products, variants, units and barcodes.", [
   ("CATL-01", "Categories and brands", "Category tree and brand list, create, edit, archive.", "dd:category dd:brand", None),
   ("CATL-02", "Units and conversions", "Units (piece, kg, box) and conversions such as box of 10; conversion factors validated.", "dd:unit dd:unit_conversion", None),
   ("CATL-03", "Products API", "`GET/POST /api/v1/products`, `GET/PUT /{id}` with `If-Match`; search and filters; archive instead of delete.", "api#catalog-pricing-inventory dd:product", None),
   ("CATL-04", "SKUs (variants)", "`POST /products/{id}/skus`; flags for batch and expiry tracking and sold by weight.", "dd:sku", None),
   ("CATL-05", "Barcodes", "Several per SKU, unique per tenant, check-digit validation; `GET /api/v1/barcodes/{code}`.", "dd:barcode", None),
   ("CATL-06", "GS1 and weight barcode parser", "Java parser for AIs 01, 10, 17, 21 and weight-embedded barcodes, driven by test vectors shared with the register (ADR-012).", "tech-stack adr", None),
   ("CATL-07", "Product images", "Upload to object storage with type and size checks; served by signed URL.", "security#application-security-controls", None),
   ("CATL-08", "ProductChanged events", "Catalog changes publish events for the sync change log and reporting.", "modules#domain-event-catalog", None),
   ("CATL-09", "Search at 50,000 products", "Indexes for name search and barcode lookup, tested with 50,000 products.", "roadmap#mvp-phases-and-exit-tests", None),
  ]),
  ("PRCE", "Pricing and discounts", "P2", "Prices per branch and date, and discounts within role limits.", [
   ("PRCE-01", "Price lists", "Default list per branch, prices with `validFrom`; `GET/PUT /api/v1/price-lists/{id}/items`.", "api#catalog-pricing-inventory dd:price_list_item", None),
   ("PRCE-02", "Price resolution", "One rule for SKU + branch + date + unit → price, with test vectors shared with the register.", "dd:price_list", None),
   ("PRCE-03", "Bulk price change", "Percentage change with preview; round up for increases, down for decreases.", "ui-screens", None),
   ("PRCE-04", "Discount rules", "Line or bill, percent or amount, role limits (`PRC-001`), override with approval.", "dd:discount_rule modules#error-code-catalog", None),
   ("PRCE-05", "Price history and audit", "Every price change audited, with who changed it and when it takes effect.", "security#audit-logging", None),
  ]),
  ("TAXR", "Tax rates and tax calculation", "P2", "Only the Tax module calculates tax (INV-07).", [
   ("TAXR-01", "Tax rates", "VAT, zero-rated and exempt, with validity dates, linked to products or categories.", "dd:tax_rate", None),
   ("TAXR-02", "Tax calculator", "The single place tax is calculated: tax-inclusive prices, rounding per line, test vectors shared with the register (INV-07).", "modules#module-details", None),
   ("TAXR-03", "Future-dated rate changes", "A new rate with a start date reaches registers before it applies.", "offline-sync#pull-the-change-feed", None),
  ]),
  ("IMPT", "Import and export", "P2", "Shops start from an Excel sheet. Big files must not hurt the server.", [
   ("IMPT-01", "Upload an import file", "`POST /api/v1/imports/products`: Excel (streaming POI) or CSV (FastCSV), macros ignored, size limit.", "api#catalog-pricing-inventory", None),
   ("IMPT-02", "Dry run and preview", "Column mapping, row-by-row errors, counts of creates and updates, nothing saved yet.", "ui-screens", None),
   ("IMPT-03", "Commit an import", "`POST /imports/{jobId}/commit`: apply in batches, safe to retry, progress shown; at most 5 jobs per tenant.", "api#rate-limits", None),
   ("IMPT-04", "Import template", "Downloadable template with headers in en/si/ta.", "ui-screens", None),
   ("IMPT-05", "Exports", "`POST /api/v1/exports`: background CSV/XLSX → signed download URL; audited; personal data masked without permission.", "api#sales-cash-customers-tax", "P5"),
  ]),
  ("PULL", "Sync: pull to registers", "P2", "Master data flows from the server to registers: snapshot first, then a change feed (INV-12: server wins for master data).", [
   ("PULL-01", "Change log", "Every master-data change writes a `sync_change_log` row in the same transaction.", "offline-sync#pull-the-change-feed dd:sync_change_log", None),
   ("PULL-02", "Sync scopes", "catalog, prices, tax, users (PIN hashes, roles), settings, customers and credit limits; filtered by branch and register.", "offline-sync#who-owns-what", None),
   ("PULL-03", "Catalog snapshot builder", "Job writes a compressed snapshot per tenant and branch to object storage, with its cursor (`catalog_snapshot`).", "offline-sync#enrolling-and-bootstrapping-a-register dd:catalog_snapshot", None),
   ("PULL-04", "Snapshot endpoint", "`GET /sync/v1/snapshot?scope=catalog` returns a signed URL and the cursor.", "api#sync", None),
   ("PULL-05", "Change feed endpoint", "`GET /sync/v1/changes?scopes=…&cursor=…` with paging; an expired cursor returns `SYNC-003` (full resync); cursor kept per device.", "api#sync dd:sync_cursor", None),
   ("PULL-06", "Change log clean-up", "Job removes old change-log rows once every device is past them or the retention ends.", "offline-sync#pull-the-change-feed", None),
   ("PULL-07", "Feed contract tests", "Feed shape checked against shared test files; register version N-1 keeps working (INV-13).", "offline-sync", None),
  ]),
 ]),
 ("stock", "Stage 3 · Receiving and stock", "P3",
  "Stock comes in through goods receipts and changes only through the movement ledger.",
 [
  ("STCK", "Inventory", "P3", "Exit test: balances rebuilt from the ledger equal the stored balances after 10,000 random operations.", [
   ("STCK-01", "Stock locations", "Locations per branch (shop floor, store room).", "dd:stock_location", None),
   ("STCK-02", "Movement ledger", "The only way stock changes (INV-04): receipt, sale, return, adjustment, count. Append-only.", "dd:stock_movement", None),
   ("STCK-03", "Balances and locking", "`stock_balance` per SKU, location and batch updated in the same transaction; rows locked in a fixed order to avoid deadlocks.", "dd:stock_balance", None),
   ("STCK-04", "Batches and recalls", "Batch number, expiry and cost; `POST /api/v1/batches/{id}/block` and unblock, audited.", "dd:batch api#catalog-pricing-inventory", None),
   ("STCK-05", "Stock balance API", "`GET /api/v1/stock?locationId=…&skuId=…` by batch.", "api#catalog-pricing-inventory", None),
   ("STCK-06", "Adjustments", "`POST /api/v1/stock/adjustments` with reason codes, role limit, approval and audit.", "api#catalog-pricing-inventory", None),
   ("STCK-07", "Stock counts", "Create, enter lines (blind), post → adjustment movements: `/stock-counts`, `/{id}/lines`, `/{id}/post`.", "dd:stock_count dd:stock_count_line", None),
   ("STCK-08", "FEFO allocation", "Choose batches with the earliest expiry first; skip blocked and expired batches (INV-14). Used when sales sync.", "data-model", None),
   ("STCK-09", "Low-stock and near-expiry alerts", "Daily job publishes `StockLow` and `BatchNearExpiry` events.", "modules#domain-event-catalog", None),
   ("STCK-10", "Nightly ledger check", "Rebuild balances from the ledger, compare with stored balances, alert on any difference.", "operations", None),
   ("STCK-11", "Random ledger test", "10,000 random operations; rebuilt balances equal stored balances. (P3 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
   ("STCK-12", "Stock hints for registers", "Approximate on-hand per branch in the sync feed for the register's stock look-up.", "offline-sync#who-owns-what", None),
  ]),
  ("RECV", "Suppliers and goods receiving", "P3", "Goods receipts (GRNs) create batches and receipt movements.", [
   ("RECV-01", "Suppliers", "`GET/POST /api/v1/suppliers`, edit and archive.", "dd:supplier", None),
   ("RECV-02", "Goods receipt draft", "`POST /api/v1/goods-receipts` with lines: SKU, quantity, unit, cost, batch, expiry. A GS1 scan fills batch and expiry.", "dd:goods_receipt dd:goods_receipt_line", None),
   ("RECV-03", "Post a goods receipt", "`/{id}/post` creates batches, movements and balances and publishes `GoodsReceived`; read-only after posting.", "modules#domain-event-catalog", None),
   ("RECV-04", "Cost price update", "Update the SKU cost on posting (decide: last cost or weighted average).", "requirements", None),
   ("RECV-05", "Receiving exceptions", "Price or quantity mismatches recorded in `stock_exception` for review.", "dd:stock_exception", None),
  ]),
 ]),
 ("selling", "Stage 4 · Checkout and push sync", "P4",
  "Sales are made on the register, offline if needed, and pushed to the server as facts. Exit test: a full offline day on 2 registers syncs with no duplicate and no missing receipt, including a crash mid-push.",
 [
  ("PUSH", "Sync: push from registers", "P4", "Facts flow from registers to the server (INV-12: register wins for facts).", [
   ("PUSH-01", "Push endpoint", "`POST /sync/v1/push`: up to 50 items or 512 KB, gzip, device auth, one result per item.", "offline-sync#push-sending-facts", None),
   ("PUSH-02", "Idempotency with the inbox", "Check `sync_inbox` first; a known id returns the stored result as `DUPLICATE`. The inbox row and the fact are written in one transaction (INV-05).", "offline-sync#push-sending-facts dd:sync_inbox", None),
   ("PUSH-03", "One transaction per item, in order", "Items handled in `deviceSeq` order; a missing dependency gives a retryable result; one bad item doesn't block others.", "offline-sync#push-sending-facts", None),
   ("PUSH-04", "Item dispatcher", "Routes each kind (cash session, sale, return, cash event, customer, audit) to its module through public APIs only (INV-08).", "offline-sync#push-sending-facts", None),
   ("PUSH-05", "Clock checks", "Compare device time with server time; large skew raises `CLOCK_SKEW`; `business_date` comes from the register.", "offline-sync#clocks-and-dates", None),
   ("PUSH-06", "Older register versions", "Accept payloads from register version N-1 (INV-13), with contract tests.", "offline-sync", None),
   ("PUSH-07", "Crash and duplicate test", "Crash mid-push, push again: no duplicates, no missing receipts, 2 registers, a full offline day. (P4 exit test)", "roadmap#mvp-phases-and-exit-tests offline-sync#failure-scenarios", None),
  ]),
  ("SELL", "Sales", "P4", "Sales are facts: recorded once, never edited (INV-02).", [
   ("SELL-01", "Record a sale", "Sale, lines and payments from push; lines keep snapshots of name, price, tax and unit (INV-10).", "dd:sale dd:sale_line", None),
   ("SELL-02", "Receipt registry", "Unique (register, seq), gap check per register; same number with a different sale → `RECEIPT_COLLISION`, register locked, support alerted (INV-06).", "offline-sync#receipt-numbering dd:receipt_registry", None),
   ("SELL-03", "Server-side checks", "Totals add up, tax recomputed by the tax calculator, price compared with the price list → `PRICE_MISMATCH` exception. The sale is still accepted.", "modules#domain-event-catalog", None),
   ("SELL-04", "Stock allocation on sale", "FEFO allocation into `sale_line_allocation` and movements; negative stock is allowed but raises `NEGATIVE_STOCK`; expired batch raises `EXPIRED_BATCH_SOLD`.", "dd:sale_line_allocation", None),
   ("SELL-05", "Sale exception queue", "`GET /api/v1/sale-exceptions?status=OPEN`, `POST /{id}/resolve` with a note, audited.", "api#sales-cash-customers-tax", None),
   ("SELL-06", "SaleCompleted event", "Published for cash, customers and reporting.", "modules#domain-event-catalog", None),
   ("SELL-07", "Sales history API", "`GET /api/v1/sales?branchId=&from=&to=`, `/sales/{id}`, `/sales/by-receipt/{receiptNo}`.", "api#sales-cash-customers-tax", None),
   ("SELL-08", "Voided open sales", "Voids recorded in the audit log with a reason; they never get a receipt number.", "offline-sync#receipt-numbering", None),
   ("SELL-09", "Held bills", "Accept held bills from registers for recovery, and expire old ones.", "dd:held_bill", None),
   ("SELL-10", "Concurrent selling test", "Many registers selling the same batch at once: correct balances, no deadlocks.", "dev-guide#testing", None),
  ]),
  ("PAYM", "Payments", "P4", "No card data is ever stored (INV-11).", [
   ("PAYM-01", "Tender types", "Cash, card, bank transfer, QR, customer credit; enabled per tenant.", "dd:tender_type", None),
   ("PAYM-02", "Split payments and change", "Several payments per sale; payments minus change must equal the total.", "dd:payment", None),
   ("PAYM-03", "Card reference only", "Store only the terminal approval reference, never card numbers (INV-11).", "security#payments-and-pci-dss", None),
  ]),
 ]),
 ("backoffice", "Stage 5 · Cash, credit, returns, tax and reports", "P5",
  "Closing the day. Exit test: the drawer reconciles to the Z-report, and an accountant accepts the tax invoice and credit note.",
 [
  ("CASH", "Cash and shifts", "P5", "Every rupee in the drawer is accounted for.", [
   ("CASH-01", "Shift open and close", "Cash session facts from push, with opening float.", "dd:cash_session", None),
   ("CASH-02", "Cash movements", "Pay-in, pay-out, safe drop and no-sale drawer opens (audited).", "dd:cash_movement", None),
   ("CASH-03", "Blind count and variance", "Count by note and coin; expected vs counted; variance.", "dd:cash_count", None),
   ("CASH-04", "X and Z reports", "Z-report per closed shift (data and PDF), X-report mid-shift.", "flows", None),
   ("CASH-05", "Shift review", "`GET /api/v1/cash-sessions?registerId=`, `POST /{id}/review` to approve the variance; publishes `ShiftClosed`.", "api#sales-cash-customers-tax", None),
   ("CASH-06", "Drawer reconciliation test", "Cash in the drawer equals the Z-report. (P5 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
  ]),
  ("CUST", "Customers and credit", "P5", "Credit (\"naya\") sales and settlements on an append-only ledger.", [
   ("CUST-01", "Customers API", "`GET/POST /api/v1/customers`, phone unique per tenant, search; masked in logs and exports.", "dd:customer", None),
   ("CUST-02", "Customers from registers", "Customers created on a register arrive by push; duplicates can be merged.", "offline-sync#push-sending-facts", None),
   ("CUST-03", "Credit accounts", "Credit limit and status; credit sales post to `credit_ledger` (append-only).", "dd:credit_account dd:credit_ledger", None),
   ("CUST-04", "Credit settlement", "`POST /api/v1/customers/{id}/credit-payments`; balance and statement (`customer.credit.manage`).", "api#sales-cash-customers-tax", None),
   ("CUST-05", "Offline credit limit", "Limits reach registers through sync; an over-limit sale needs approval and raises an exception.", "offline-sync#offline-guard-rails", None),
   ("CUST-06", "Customer statement PDF", "Statement of sales and payments for a period.", "tech-stack", None),
  ]),
  ("RTRN", "Returns and refunds", "P5", "A return always links to the original sale.", [
   ("RTRN-01", "Record a return", "Return facts from push, linked to the original sale and lines; can't return more than was sold (`SALE-005`).", "dd:sale_return dd:sale_return_line", None),
   ("RTRN-02", "Refunds and limits", "Refund payments; above the role limit needs approval.", "dd:refund_payment", None),
   ("RTRN-03", "Stock back in", "Return movement back to the original batch, or to quarantine if damaged.", "dd:stock_movement", None),
   ("RTRN-04", "SaleReturned event", "Published for cash, customers (credit reversal) and tax (credit note).", "modules#domain-event-catalog", None),
   ("RTRN-05", "Online receipt look-up", "Find the original sale by receipt number when returning at another register or branch.", "api#sales-cash-customers-tax", None),
  ]),
  ("TAXD", "Tax documents", "P5", "Tax invoices, credit notes and the VAT report.", [
   ("TAXD-01", "Tax invoice series", "Own gap-free series per register (e.g. `CMB01-R02-TI-000031`); buyer VAT number checked (`TAX-002`).", "offline-sync#receipt-numbering dd:tax_document", None),
   ("TAXD-02", "Credit and debit notes", "Linked to the original tax invoice.", "dd:tax_document", None),
   ("TAXD-03", "Tax document PDF", "A4 layout (OpenPDF or Jasper) an accountant accepts.", "tech-stack", None),
   ("TAXD-04", "Tax documents API", "`GET /api/v1/tax-documents?type=&from=`.", "api#sales-cash-customers-tax", None),
   ("TAXD-05", "Fiscal adapter port", "No-op adapter in the MVP; `fiscal_submission` rows and a retry worker on `TaxDocumentIssued`.", "dd:fiscal_submission", None),
   ("TAXD-06", "VAT report", "Output tax by rate for a period, exportable.", "api#sales-cash-customers-tax", None),
  ]),
  ("REPT", "Reports", "P5", "Read-only reports on a reporting role.", [
   ("REPT-01", "Report framework", "`GET /api/v1/reports/{reportKey}` with parameter checks, permissions and CSV/XLSX export.", "api#sales-cash-customers-tax", None),
   ("REPT-02", "Daily sales", "By branch, register, cashier and payment type.", "requirements", None),
   ("REPT-03", "Stock valuation", "Stock on hand at cost.", "requirements", None),
   ("REPT-04", "Expiry", "Near-expiry and expired stock by batch.", "requirements", None),
   ("REPT-05", "Credit ageing", "Customer balances by age.", "requirements", None),
   ("REPT-06", "Profit and margin", "Needs `report.view_profit`.", "security#authorisation-and-permission-matrix", None),
   ("REPT-07", "Dashboard figures", "Today's sales, top products, low stock, open exceptions, shift variances.", "ui-screens", None),
   ("REPT-08", "Read models", "Views or materialized views for heavy reports, refreshed by jobs.", "data-model", None),
  ]),
 ]),
 ("run", "Stage 6 · Run, protect and ship", "P1–P7",
  "Start these early and grow them with each phase. Most of the P6 pilot and P7 launch work is here.",
 [
  ("OBSV", "Observability", "P1–P7", "Know something is wrong before the shop calls.", [
   ("OBSV-01", "Health checks", "Liveness and readiness with database and storage checks; Actuator not public.", "operations", "P1"),
   ("OBSV-02", "Tracing", "OpenTelemetry; the register's `traceparent` follows a sale end to end.", "operations", "P1"),
   ("OBSV-03", "Business metrics", "Micrometer: sync lag, outbox backlog, push rate, exceptions, login failures.", "operations", "P4"),
   ("OBSV-04", "Error reporting", "Sentry (or GlitchTip) with personal data removed.", "operations", "P1"),
   ("OBSV-05", "Dashboards and alerts", "Error rate, latency, sync lag, backup failure, audit chain break, ledger mismatch.", "operations", "P7"),
   ("OBSV-06", "Log shipping", "Logs to Loki (or similar) with a retention period.", "operations", "P6"),
  ]),
  ("SUPP", "Platform support", "P6", "How DevCity staff help a shop without seeing data they shouldn't.", [
   ("SUPP-01", "Support staff sign-in", "Separate from tenants: SSO plus a hardware key (FIDO2).", "security#authentication", None),
   ("SUPP-02", "Just-in-time tenant access", "Needs the tenant's consent, expires after 4 hours, shown to the owner and audited.", "security#authentication", None),
   ("SUPP-03", "Support console API", "Tenants, health, devices, sync lag, errors; force re-sync, lock a device.", "operations", None),
   ("SUPP-04", "Tenant lifecycle", "Suspend, reactivate, export data on request, deletion policy.", "security#privacy-and-data-protection", None),
   ("SUPP-05", "Runbooks", "One runbook per alert, linked from the alert.", "operations", None),
  ]),
  ("HARD", "Security hardening", "P7", "Most controls are built with the features; this is the final check.", [
   ("HARD-01", "Headers and CORS", "HSTS, strict CORS origins for the admin app, no Swagger in production.", "security#application-security-controls", None),
   ("HARD-02", "Upload safety", "File type sniffing, size limits, zip-bomb protection, XML external entities off.", "security#application-security-controls", None),
   ("HARD-03", "Secrets rotation", "Secrets from the host's secret store, rotated every 90 days or after a staff change.", "security#encryption-and-secrets", None),
   ("HARD-04", "Release scan gates", "Fail on critical or high findings; CycloneDX SBOM per release.", "security#secure-development-lifecycle", None),
   ("HARD-05", "OWASP ZAP on staging", "Baseline dynamic scan before each release.", "security#secure-development-lifecycle", None),
   ("HARD-06", "ASVS review and pen test", "ASVS checklist review and an external pen test; no open critical or high findings. (P7 exit test)", "security roadmap#mvp-phases-and-exit-tests", None),
   ("HARD-07", "Privacy controls", "Retention rules, customer data export and deletion, masking in exports.", "security#privacy-and-data-protection", None),
  ]),
  ("OPS", "Deployment and backups", "P1–P7", "From the first staging server to a rehearsed restore.", [
   ("OPS-01", "Staging environment", "VM with Docker Compose and Caddy (automatic HTTPS); deployed from CI.", "deployment", "P1"),
   ("OPS-02", "Migrations on deploy", "Flyway runs as its own step with the owner role; expand-then-contract changes so register N-1 keeps working.", "deployment", "P1"),
   ("OPS-03", "Release process", "Version, changelog, tag → image → staging → production; minimum register version setting.", "deployment", "P4"),
   ("OPS-04", "Production environment", "Managed PostgreSQL with point-in-time recovery (or WAL-G/pgBackRest), object storage, secrets.", "deployment", "P6"),
   ("OPS-05", "Encrypted backups", "Encrypted with a separate key before leaving the host; object storage backed up too.", "security#encryption-and-secrets", "P6"),
   ("OPS-06", "Health-gated deploy and rollback", "New version must pass health checks; a written rollback plan.", "deployment", "P6"),
   ("OPS-07", "Restore drill", "Restore from backup within the RTO and write down how long it took. (P7 exit test)", "operations roadmap#mvp-phases-and-exit-tests", "P7"),
  ]),
  ("LOAD", "Load and concurrency tests", "P7", "Prove the numbers before launch.", [
   ("LOAD-01", "Sync load test", "k6 scripts for push and pull, including many registers reconnecting after an outage.", "tech-stack", None),
   ("LOAD-02", "Allocation under load", "Concurrent sales on the same stock at peak load, no deadlocks.", "dev-guide#testing", None),
   ("LOAD-03", "Report speed on a year of data", "Partition pruning and index checks on realistic volumes.", "data-model", None),
   ("LOAD-04", "Write down capacity", "Measured limits per server size recorded in Cost & scaling.", "cost", None),
  ]),
 ]),
]

PAGES = {"dev-guide": "Developer guide", "tech-stack": "Tech stack", "modules": "Modules", "security": "Security",
         "deployment": "Deployment", "ai-guide": "AI guide", "api": "API", "data-model": "Data model",
         "data-dictionary": "Data dictionary", "offline-sync": "Offline & sync", "roadmap": "Roadmap",
         "flows": "Key flows", "ui-screens": "Screens", "extensions": "Extensions", "adr": "Decisions",
         "requirements": "Requirements", "operations": "Operations", "cost": "Cost & scaling"}

esc = html.escape


def fmt(text: str) -> str:
    out = esc(text)
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    out = re.sub(r"\b((?:INV|BR)-\d{2})\b", r'<span class="inv">\1</span>', out)
    return out


def ref_link(r: str) -> str:
    if r.startswith("dd:"):
        t = r[3:]
        return f'<a href="data-dictionary.html#t-{t}"><code>{t}</code></a>'
    page, _, anchor = r.partition("#")
    label = PAGES[page]
    if anchor and not anchor.startswith("t-"):
        nice = {"db-build-order": "build order", "db-map": "diagram", "mvp-phases-and-exit-tests": "exit tests"}
        label += " › " + nice.get(anchor, anchor.replace("-", " "))
    return f'<a href="{page}.html{"#" + anchor if anchor else ""}">{esc(label)}</a>'


def all_tasks():
    for st in STAGES:
        for cat in st[4]:
            for t in cat[4]:
                yield st, cat, t


def check():
    ids = [t[0] for _, _, t in all_tasks()]
    dup = {i for i in ids if ids.count(i) > 1}
    assert not dup, f"duplicate task ids: {dup}"
    for _, cat, t in all_tasks():
        assert t[0].startswith(cat[0] + "-"), f"{t[0]} is not in category {cat[0]}"
    unknown = DONE - set(ids)
    assert not unknown, f"DONE has unknown ids: {unknown}"
    return ids


def build():
    ids = check()
    n = len(ids)
    ncat = sum(len(st[4]) for st in STAGES)
    body = []
    # Stage overview table
    rows = []
    for key, name, ph, intro, cats in STAGES:
        cnt = sum(len(c[4]) for c in cats)
        rows.append(f'<tr data-stage="{key}"><td><a href="#s-{key}">{esc(name)}</a></td><td>{ph}</td><td>'
                    + ", ".join(f'<a href="#c-{c[0].lower()}">{esc(c[1])}</a>' for c in cats)
                    + f'</td><td class="bp-num"><span class="bp-stage-count">0</span> / {cnt}</td></tr>')
    body.append('<h2 id="stages">Stages at a glance</h2>\n<table class="bp-stages">\n<thead><tr><th>Stage</th><th>Phase</th><th>Categories</th><th>Built</th></tr></thead>\n<tbody>'
                + "".join(rows) + "</tbody>\n</table>")

    for key, name, ph, intro, cats in STAGES:
        body.append(f'<h2 id="s-{key}" class="bp-stage" data-stage="{key}">{esc(name)} <span class="bp-ph">{ph}</span></h2>\n<p>{fmt(intro)}</p>')
        for code, cname, cph, cintro, tasks in cats:
            cid = code.lower()
            body.append(f'<section class="bp-cat" data-cat="{code}">\n<h3 id="c-{cid}">{esc(cname)} <span class="bp-ph">{cph}</span></h3>\n'
                        f'<div class="bp-catbar"><div class="bp-bar"><span></span></div><span class="bp-catnum">0 / {len(tasks)}</span></div>\n'
                        f'<p class="bp-intro">{fmt(cintro)}</p>\n<ol class="bp-list">')
            for tid, title, detail, refs, phase in tasks:
                p = phase or cph.split("–")[0]
                links = " · ".join(ref_link(r) for r in refs.split()) if refs else ""
                rec = ' data-recorded="1"' if tid in DONE else ""
                body.append(f'<li class="bp-task" id="{tid.lower()}" data-id="{tid}" data-phase="{p}"{rec}>'
                            f'<label class="bp-row"><input type="checkbox" aria-label="Mark {tid} as built">'
                            f'<code class="bp-id">{tid}</code><span class="bp-title">{esc(title)}</span>'
                            f'<span class="bp-ph">{p}</span></label>'
                            f'<div class="bp-detail">{fmt(detail)}'
                            + (f' <span class="bp-refs">→ {links}</span>' if links else "") + "</div></li>")
            body.append("</ol>\n</section>")

    phases = ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7"]
    toolbar = f"""<div class="bp-panel" id="bp-panel">
<div class="bp-overall"><div><strong id="bp-done">0</strong> of <strong>{n}</strong> tasks built · <span id="bp-pct">0%</span></div><div class="bp-bar big"><span id="bp-bar"></span></div></div>
<div class="bp-tools">
<div class="bp-seg" role="group" aria-label="Show"><button type="button" data-show="all" class="on">All</button><button type="button" data-show="todo">To build</button><button type="button" data-show="done">Built</button></div>
<label class="bp-sel">Phase <select id="bp-phase"><option value="">All</option>{''.join(f'<option>{p}</option>' for p in phases)}</select></label>
<input id="bp-q" type="search" placeholder="Filter tasks (e.g. refresh, FEFO, AUTN)" aria-label="Filter tasks">
</div>
<div class="bp-tools small">
<button type="button" id="bp-export">Export progress</button>
<label class="bp-file">Import progress<input type="file" id="bp-import" accept="application/json,.json"></label>
<button type="button" id="bp-copy">Copy built IDs</button>
<button type="button" id="bp-reset">Clear my ticks</button>
<span id="bp-msg" role="status"></span>
</div>
</div>"""

    nextup = """<div class="callout tip" id="bp-next"><span class="ct">Next up</span><ol id="bp-next-list"></ol></div>"""

    script = """<script>
(function () {
  var KEY = "retailos-backend-done";
  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { store = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  var tasks = Array.prototype.slice.call(document.querySelectorAll(".bp-task"));
  var show = "all";
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function isDone(li) { return li.dataset.recorded === "1" || !!store[li.dataset.id]; }
  function msg(t) { var m = document.getElementById("bp-msg"); m.textContent = t; clearTimeout(msg.t); msg.t = setTimeout(function () { m.textContent = ""; }, 4000); }

  tasks.forEach(function (li) {
    var cb = li.querySelector("input");
    if (li.dataset.recorded === "1") { cb.disabled = true; li.title = "Recorded as built in tools/build_backend_plan.py"; }
    cb.addEventListener("change", function () {
      if (cb.checked) store[li.dataset.id] = today(); else delete store[li.dataset.id];
      save(); render();
    });
  });

  function render() {
    var q = document.getElementById("bp-q").value.trim().toLowerCase();
    var ph = document.getElementById("bp-phase").value;
    var done = 0, next = [];
    tasks.forEach(function (li) {
      var d = isDone(li);
      li.querySelector("input").checked = d;
      li.classList.toggle("done", d);
      if (d) done++; else if (next.length < 6) next.push(li);
      var vis = (show === "all" || (show === "done") === d) && (!ph || li.dataset.phase === ph) &&
                (!q || li.textContent.toLowerCase().indexOf(q) >= 0);
      li.hidden = !vis;
    });
    document.querySelectorAll(".bp-cat").forEach(function (sec) {
      var items = sec.querySelectorAll(".bp-task"), d = 0, vis = 0;
      items.forEach(function (li) { if (isDone(li)) d++; if (!li.hidden) vis++; });
      sec.querySelector(".bp-catnum").textContent = d + " / " + items.length;
      sec.querySelector(".bp-bar span").style.width = (100 * d / items.length) + "%";
      sec.classList.toggle("complete", d === items.length);
      sec.hidden = vis === 0;
    });
    document.querySelectorAll(".bp-stages tr[data-stage]").forEach(function (tr) {
      var st = tr.dataset.stage, h = document.getElementById("s-" + st), d = 0, el = h.nextElementSibling;
      while (el && !(el.tagName === "H2")) { el.querySelectorAll && el.querySelectorAll(".bp-task").forEach(function (li) { if (isDone(li)) d++; }); el = el.nextElementSibling; }
      tr.querySelector(".bp-stage-count").textContent = d;
    });
    var pct = Math.round(100 * done / tasks.length);
    document.getElementById("bp-done").textContent = done;
    document.getElementById("bp-pct").textContent = pct + "%";
    document.getElementById("bp-bar").style.width = (100 * done / tasks.length) + "%";
    var nl = document.getElementById("bp-next-list");
    nl.innerHTML = next.length ? next.map(function (li) {
      return '<li><a href="#' + li.id + '"><code>' + li.dataset.id + '</code></a> ' + li.querySelector(".bp-title").textContent + ' <span class="bp-ph">' + li.dataset.phase + '</span></li>';
    }).join("") : "<li>Everything is built.</li>";
  }

  document.querySelectorAll(".bp-seg button").forEach(function (b) {
    b.addEventListener("click", function () {
      show = b.dataset.show;
      document.querySelectorAll(".bp-seg button").forEach(function (x) { x.classList.toggle("on", x === b); });
      render();
    });
  });
  document.getElementById("bp-phase").addEventListener("change", render);
  document.getElementById("bp-q").addEventListener("input", render);

  document.getElementById("bp-export").addEventListener("click", function () {
    var data = { page: "backend-build", exported: new Date().toISOString(), done: store };
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = "retailos-backend-progress.json"; document.body.appendChild(a); a.click(); a.remove();
    msg("Exported " + Object.keys(store).length + " ticks.");
  });
  document.getElementById("bp-import").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result).done || {}, known = {}, n = 0;
        tasks.forEach(function (li) { known[li.dataset.id] = 1; });
        Object.keys(d).forEach(function (id) { if (known[id] && !store[id]) { store[id] = d[id]; n++; } });
        save(); render(); msg("Imported " + n + " new ticks.");
      } catch (err) { msg("That file isn't a progress export."); }
      e.target.value = "";
    };
    r.readAsText(f);
  });
  document.getElementById("bp-copy").addEventListener("click", function () {
    var ids = tasks.filter(isDone).map(function (li) { return '"' + li.dataset.id + '"'; }).join(", ");
    var text = "DONE = {" + ids + "}";
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
      function () { msg("Copied. Paste it over DONE in tools/build_backend_plan.py."); },
      function () { window.prompt("Copy this into tools/build_backend_plan.py:", text); });
  });
  document.getElementById("bp-reset").addEventListener("click", function () {
    if (!Object.keys(store).length) { msg("No ticks to clear."); return; }
    if (confirm("Clear the ticks saved in this browser? Tasks recorded in the repository stay built.")) { store = {}; save(); render(); msg("Cleared."); }
  });
  render();
})();
</script>"""

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Backend build order · RetailOS</title>
<meta name="description" content="Every RetailOS backend task in build order, from project setup to launch, grouped into stages and categories, with tick boxes to track what is built.">
<link rel="stylesheet" href="assets/site.css">
<script>try{{var t=localStorage.getItem("retailos-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
</head>
<body>
<header id="topbar"></header>
<div class="layout">
<nav id="sidebar"></nav>
<main class="content"><article>
<!-- Generated by tools/build_backend_plan.py. Edit the script, not this file. -->

<h1>Backend build order</h1>
<p class="lead">Every backend task for the MVP, from an empty repository to launch: {n} tasks in {ncat} categories and six stages. Build them in this order. Tick each one when it is built, so everyone can see what is done and what comes next.</p>

<div class="callout"><span class="ct">How to use this page</span>
<ul>
<li><strong>Order:</strong> stages and categories follow the <a href="roadmap.html#mvp-phases-and-exit-tests">roadmap phases</a> P0–P7. Inside a category, tasks are in build order. The database is built first, all four areas (<a href="data-model.html#db-build-order">database build order</a>).</li>
<li><strong>Done means:</strong> merged to <code>main</code> with tests, CI green, and the <a href="dev-guide.html#dod">definition of done</a> met. Exit tests at the end of a phase are tasks too.</li>
<li><strong>Your ticks are saved in this browser only.</strong> To share progress, use <em>Copy built IDs</em> and paste the result over <code>DONE</code> in <code>tools/build_backend_plan.py</code>, then regenerate and commit. Those tasks then show as built for everyone (locked tick). <em>Export</em> and <em>Import</em> move your own ticks between browsers.</li>
<li><strong>IDs never change.</strong> Quote them in branch names, commits and pull requests, e.g. <code>feat/AUTN-08-refresh-rotation</code>.</li>
</ul></div>

{toolbar}

{nextup}

{chr(10).join(body)}

<h2 id="not-here">Not on this page</h2>
<p>Front-end work (admin web app, register app, printing, local database) has its own list in the <a href="mvp.html">MVP build list</a>. Release 2 and 3 backend work (promotions, purchase orders, transfers, loyalty, pharmacy and grocery tables, fiscal submission to IRD) is in the <a href="roadmap.html">roadmap</a> and will be added here when planned.</p>

</article></main>
<aside id="toc"></aside>
</div>
{script}
<script src="assets/search-index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
<script src="assets/site.js"></script>
</body>
</html>
"""


if __name__ == "__main__":
    (DOC / "backend-build.html").write_text(build(), encoding="utf-8")
    ids = check()
    print(f"backend-build.html written: {len(ids)} tasks, {len(DONE)} recorded as built")
