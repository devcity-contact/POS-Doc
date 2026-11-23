"""Build build-order.html: every MVP task (backend, admin web, register app) in build order,
grouped into stages, with tick boxes so the team can mark what is built.

Usage (from anywhere):  python Doc/tools/build_order.py

The order: project setup -> all database tables, migrations and the test base -> features area by
area (store & staff, catalog, inventory, sales), each as a vertical slice: backend API + tests, the
admin or register screen connected to it, and a "Try it" flow to check the stage end to end.

Rules for editing:
  * Task IDs (e.g. "AUTN-09") are stable. Never renumber or reuse one: progress is saved by ID.
    A new task gets the next free number in its category, even if you insert it in the middle.
  * Order in the lists below IS the build order.
  * To record progress for everyone, add finished IDs to DONE below and regenerate.
    (Tick boxes on the page are saved only in the reader's browser.)
  * Detail text: `code` becomes <code>; INV-xx and BR-xx become rule tags.
  * refs: "page#anchor" (".html" added), "dd:table" (data dictionary), "proto:route" (prototype screen).
"""
import html
import pathlib
import re

DOC = pathlib.Path(__file__).resolve().parent.parent

# Finished tasks recorded in the repository (shared with everyone). Example: DONE = {"SET-01", "SET-02"}
DONE: set[str] = set()

KINDS = {"be": "Backend", "web": "Admin web", "reg": "Register app", "try": "Try it"}

# Stage: (key, name, phase, db-area dot or "", intro, categories)
# Category: (code, name, phase, kind, intro, tasks)
# Task: (id, title, detail, refs, phase-override or None)
STAGES = [
 ("setup", "Stage 1 · Project setup and shared building blocks", "P0", "",
  "Everything that isn't a feature: the repository, both builds, CI, the app shells, staging, and the rules every module follows. It ends with a walking skeleton: one tiny path through every layer, deployed by CI, before any real feature.",
 [
  ("SET", "Backend project setup", "P0", "be", "One build, one command to start everything locally, and CI that blocks bad merges.", [
   ("SET-01", "Create the monorepo layout", "`backend/`, `apps/admin`, `apps/register`, `packages/`, `infra/`. Add `.editorconfig`, `.gitattributes` and a root README.", "dev-guide#setup", None),
   ("SET-02", "Gradle build (Kotlin DSL)", "Java 25 toolchain, version catalog `libs.versions.toml`, dependency locking, build cache.", "tech-stack", None),
   ("SET-03", "Spring Boot 4 application skeleton", "One application, virtual threads on, starts against an empty database.", "tech-stack", None),
   ("SET-04", "Create the 15 empty modules", "tenancy, iam, devices, audit, catalog, pricing, inventory, purchasing, sales, payments, cash, customers, tax, sync, reporting, plus `platform` (shared kernel). Each has a public `api` package and an `internal` package with `web/`, `service/`, `repository/` and `model/` (ADR-015).", "modules#module-map", None),
   ("SET-05", "Module boundary test", "`ApplicationModules.verify()` runs in CI and fails on a forbidden dependency (INV-08). Generate the Modulith module docs.", "modules#dependency-rules", None),
   ("SET-06", "ArchUnit rules", "No `double`/`float` for money or quantities (INV-03), no imports of another module's `internal` package, naming rules, constructor injection only.", "dev-guide#java", None),
   ("SET-07", "Configuration and profiles", "`local`, `test`, `staging`, `prod` profiles. Typed `@ConfigurationProperties`. Secrets come only from environment variables.", "security#encryption-and-secrets", None),
   ("SET-08", "Local stack with docker compose", "PostgreSQL 18, S3-compatible storage and Mailpit. `docker compose up` gives a running stack.", "deployment", None),
   ("SET-09", "Formatting and static checks", "Formatter and static checks run in the build for Java and TypeScript, so style is never discussed in review.", "dev-guide#review", None),
   ("SET-10", "CI pipeline (GitHub Actions)", "Backend and front-end jobs: build, tests, boundary test, ArchUnit, lint. Required to merge. Scripts live in `infra/ci/`.", "deployment", None),
   ("SET-11", "Security scans in CI", "Semgrep or CodeQL, OSV-Scanner for dependencies, Renovate for weekly update pull requests.", "security#secure-development-lifecycle", None),
   ("SET-12", "Container image", "Layered jar on a JRE 25 base, runs as non-root, scanned by Trivy, pushed to the container registry.", "deployment", None),
   ("SET-13", "Pull request template and branch protection", "PR template with the security checklist, protected `main`, AGENTS.md for AI assistants.", "security#security-checklist-for-every-pull-request ai-guide", None),
   ("SET-14", "Message bundles en / si / ta", "Server messages (errors, e-mails) in English, Sinhala and Tamil, chosen by `Accept-Language`.", "api#conventions", None),
  ]),
  ("WEB", "Front-end setup", "P0", "web", "The shared front-end base for the admin web app and the register app.", [
   ("WEB-01", "pnpm workspaces", "`apps/admin`, `apps/register`, `packages/ui`, `packages/api-client`, `packages/register-core`; strict TypeScript.", "tech-stack", None),
   ("WEB-02", "Admin web app skeleton", "Vite + React 19 + TanStack Router + TanStack Query.", "tech-stack", None),
   ("WEB-03", "Shared UI package", "Tailwind design tokens from the UI design (light and dark), Radix-based buttons, inputs, tables, dialogs, toasts. Match the prototype.", "ui-design", None),
   ("WEB-04", "Languages", "i18next with English, Sinhala and Tamil, Sinhala and Tamil fonts, and a CI check for missing keys.", "tech-stack", None),
   ("WEB-05", "Forms pattern", "React Hook Form + Zod; `VAL-001` field errors from the API shown on the right fields.", "api#error-format", None),
   ("WEB-06", "Admin shell layout", "Sidebar, top bar, branch switcher, language and theme switch, as in the prototype.", "proto:dashboard ui-screens", None),
   ("WEB-07", "Front-end tests", "Vitest + Testing Library for components; Playwright for end-to-end tests, run in CI.", "tech-stack", None),
  ]),
  ("CORE", "Shared building blocks", "P0", "be", "Used by every module. Build them once, before any feature, so the same bug doesn't appear in fifteen places. (Smaller blocks such as rate limiting and file storage are built later, with the first feature that needs them.)", [
   ("CORE-01", "Money and Quantity types", "Value objects on `BigDecimal` (scale 4 and 3) with fixed rounding rules; UUIDv7 id generator (INV-03).", "data-model#conventions", None),
   ("CORE-02", "JSON settings", "`BigDecimal` written as a string with 4 decimals (INV-03), ISO-8601 UTC times, strict unknown-field policy for commands.", "api#conventions", None),
   ("CORE-03", "Clock and business date", "Injectable `Clock`; `business_date` from the branch time zone (Asia/Colombo). Store UTC `timestamptz` (INV-15).", "offline-sync#clocks-and-dates", None),
   ("CORE-04", "Error responses", "RFC 9457 Problem Details with a stable `code`, `requestId`, localised `detail`; never a stack trace or SQL.", "api#error-format modules#error-code-catalog", None),
   ("CORE-05", "Request validation", "Bean Validation on request bodies → `VAL-001` with a list of field errors.", "api#error-format", None),
   ("CORE-06", "Cursor pagination, filters, sorting", "`?limit=50&cursor=…` returns `nextCursor`. Shared parsing for `from`, `to`, `branchId`, `sort`.", "api#conventions", None),
   ("CORE-07", "Optimistic locking with ETag", "`ETag` from `version`; `PUT`/`PATCH` require `If-Match`; a mismatch returns 412.", "api#conventions", None),
   ("CORE-08", "Request context and log fields", "Read `X-Request-Id`, `traceparent`, `X-App-Version`, `X-Device-Id`; tenant, user, device and request id in the log context.", "api#standard-headers", None),
   ("CORE-09", "Structured logs with masking", "JSON logs. Phone numbers, e-mails, tokens and PINs are masked or never logged.", "security#encryption-and-secrets", None),
   ("CORE-10", "OpenAPI document", "springdoc groups for `/api/v1` and `/sync/v1`; Swagger UI only in local and staging.", "api#openapi-and-client-generation", None),
   ("CORE-11", "Generated TypeScript client", "CI generates `packages/api-client` from OpenAPI and fails on a breaking change (INV-13). Money stays a string.", "api#openapi-and-client-generation", None),
   ("CORE-12", "Domain events with outbox", "Spring Modulith event publication registry, idempotent listener pattern, incomplete events retried on start (ADR-007).", "modules#domain-event-catalog", None),
   ("CORE-13", "Scheduled jobs", "Scheduler with ShedLock and a tenant-aware job runner that sets the tenant before touching data.", "tech-stack", None),
   ("CORE-14", "Health checks", "Liveness and readiness with database and storage checks; Actuator not public.", "operations", None),
  ]),
  ("DEPL", "Staging from day one", "P0", "be", "A shared place to try every feature as soon as it merges.", [
   ("DEPL-01", "Staging environment", "VM with Docker Compose and Caddy (automatic HTTPS).", "deployment", None),
   ("DEPL-02", "Deploy on merge", "Every merge to `main` builds the images and deploys to staging.", "deployment", None),
   ("DEPL-03", "Migrations as their own step", "Flyway runs before the app starts, with the owner role.", "deployment", None),
   ("DEPL-04", "Reset staging", "One command recreates the staging database with demo data.", "deployment", "P1"),
  ]),
  ("T1", "Try it: walking skeleton", "P0", "try", "Check the whole chain works before building features.", [
   ("T1-01", "One command starts everything locally", "`docker compose up` plus the backend and the admin app in dev mode.", "dev-guide#day-one", None),
   ("T1-02", "Admin shell talks to the backend", "The admin shell opens in en/si/ta, light and dark, and shows a value fetched from the backend through the generated client.", "", None),
   ("T1-03", "Pull requests are checked", "A PR runs every check (build, tests, boundary, ArchUnit, scans) and can't merge if one fails.", "", None),
   ("T1-04", "Merge deploys to staging", "Merging to `main` puts the new version on staging over HTTPS. (P0 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
  ]),
 ]),
 ("database", "Stage 2 · Database, migrations and test base", "P0–P1", "",
  "Create all 56 tables in four migrations, in area order, with row-level security, plus the test tools every feature will use. Until the pilot, V1–V4 are a draft: edit them in place and rebuild the database when a feature shows the design was wrong. From the pilot on, only add new migrations.",
 [
  ("DB", "Database and migrations", "P0", "be", "The order follows the four areas in the database build order.", [
   ("DB-01", "Flyway setup", "Core migrations in `db/migration`, a separate location for extensions later, validate on start, `clean` disabled outside local.", "data-model#db-build-order", None),
   ("DB-02", "Database roles", "Owner role runs migrations. The app role has no DDL and no `BYPASSRLS`. A read-only reporting role. The app role may only `INSERT` and `SELECT` on `audit_log` (INV-09).", "data-model#conventions", None),
   ("DB-03", "Shared SQL conventions", "`uuidv7()` defaults, `numeric(19,4)` money, `numeric(14,3)` quantities, `timestamptz` (INV-15), audit columns, `version`, `archived_at`.", "data-model#conventions data-dictionary#common", None),
   ("DB-04", "V1 — Store & staff (20 tables)", "`V1__store_and_staff.sql`: tenant, branch, register, users and roles, cash sessions, devices, audit log, sync tables.", "data-model#db-build-order data-dictionary#overview", None),
   ("DB-05", "V2 — Catalog (11 tables)", "`V2__catalog.sql`: brand, category, tax rate, product, unit, SKU, unit conversion, barcode, price lists, discount rules.", "data-model#db-build-order", None),
   ("DB-06", "V3 — Inventory (10 tables)", "`V3__inventory.sql`: suppliers, goods receipts, locations, batches, stock balance, stock movement, counts, stock exceptions.", "data-model#db-build-order", None),
   ("DB-07", "V4 — Sales (15 tables)", "`V4__sales.sql`: sale, lines, allocations, returns, payments, tender types, tax documents, fiscal submissions, customers, credit, held bills, receipt registry (unique register + seq, INV-06).", "data-model#db-build-order dd:receipt_registry", None),
   ("DB-08", "Row-level security on every tenant table", "`ENABLE` and `FORCE ROW LEVEL SECURITY`, policy on `current_setting('app.tenant_id', true)`. A missing setting returns no rows (INV-01).", "security#tenant-isolation", None),
   ("DB-09", "Append-only guards on facts", "Grants or triggers stop `UPDATE`/`DELETE` on sales, lines, payments, stock movements, credit ledger and audit log (INV-02, INV-04, INV-09).", "data-model#conventions", None),
   ("DB-10", "Partitioning", "Large fact tables partitioned by `business_date` (monthly); a job creates partitions ahead.", "data-model#conventions", None),
   ("DB-11", "Reference data", "System permissions, default roles (Owner, Manager, Cashier, Stock keeper, Pharmacist, Accountant), tender types, common units, Sri Lanka VAT rates.", "security#authorisation-and-permission-matrix", None),
   ("DB-12", "Persistence pattern", "JPA entities for master data (`ddl-auto=validate`), `JdbcClient` repositories for facts and reports. One example of each for others to copy.", "tech-stack", None),
  ]),
  ("TEST", "Test base", "P0", "be", "Every feature after this point comes with tests that use these tools.", [
   ("TEST-01", "Integration test base", "Testcontainers with PostgreSQL 18 and `@ServiceConnection`; one shared base class.", "dev-guide#testing", None),
   ("TEST-02", "Test data builders", "Builders per area (tenant, user, product, batch, sale) so tests read like the business.", "dev-guide#testing", None),
   ("TEST-03", "Migration test", "All migrations run on an empty database; every table in the data dictionary exists and has RLS forced.", "data-dictionary", None),
   ("TEST-04", "RLS smoke test", "Rows of tenant A are invisible with tenant B set, and nothing is visible with no tenant set.", "security#tenant-isolation", None),
   ("TEST-05", "Append-only test", "`UPDATE` and `DELETE` on facts fail for the app role.", "data-model#conventions", None),
   ("TEST-06", "Demo data", "Local and staging only: two shops (general retail and pharmacy) with staff, products, stock and some sales history, for the screens and the Try it flows.", "", "P1"),
   ("TEST-07", "Definition of done for a feature", "Write down in the developer guide: API with tests, screen connected to the real API, Try it step passes on staging.", "dev-guide#dod", None),
  ]),
  ("T2", "Try it: database", "P1", "try", "", [
   ("T2-01", "Database from empty in one command", "Starting the app on an empty database creates all 56 tables.", "", None),
   ("T2-02", "Schema matches the docs", "The migration test is green against the data dictionary.", "", None),
   ("T2-03", "Isolation holds in SQL", "Load the demo data, connect as the app role, set shop B: none of shop A's rows are visible.", "", None),
  ]),
 ]),
 ("store", "Stage 3 · Store & staff features", "P1", "st",
  "The first real features, on the V1 tables: sign-up, sign-in, staff, roles, branches, registers and devices. Each feature is a slice: API with tests, its admin or register screen, then the Try it step on staging. The cash-session tables are in V1 too, but shifts are built in stage 6, when the register can sell.",
 [
  ("TNT", "Tenancy and isolation", "P1", "be", "One business can never see another's data.", [
   ("TNT-01", "Tenant context from the token", "The tenant comes only from the signed token (`tid`), never from a URL or body.", "security#tenant-isolation", None),
   ("TNT-02", "Set the tenant per transaction", "`set_config('app.tenant_id', …, true)` at the start of every transaction, for JPA and `JdbcClient` (INV-01).", "security#tenant-isolation", None),
   ("TNT-03", "Tenant in jobs, events and caches", "Jobs and listeners set the tenant explicitly; cache keys and job payloads include the tenant id.", "security#tenant-isolation", None),
   ("TNT-04", "Tenant status and modules", "Suspended tenant → `TEN-001`. Check `tenant_module` before industry features.", "dd:tenant_module", None),
   ("TNT-05", "Branch scope", "Users scoped to branches through `user_role.branch_id`; a manager of branch A can't act in branch B.", "security#authorisation-and-permission-matrix", None),
   ("TNT-06", "TenantIsolationIT", "Every repository and REST endpoint called with another tenant's token returns nothing or 403. Grows with every new endpoint.", "security#tenant-isolation", None),
  ]),
  ("AUTN", "Authentication", "P1", "be", "Web sign-in with password and two-step, staff PIN on registers, and tokens.", [
   ("AUTN-01", "Argon2id password hashing", "m=64 MB, t=3, p=1; re-hash on login when settings change.", "security#authentication", None),
   ("AUTN-02", "Password policy", "At least 10 characters, checked against a breached-password list, no forced rotation.", "security#authentication", None),
   ("AUTN-03", "Signing keys and JWKS", "EdDSA or ES256 with `kid`; JWKS publishes the current and previous key; rotation every 90 days.", "security#tokens-and-sessions", None),
   ("AUTN-04", "Access tokens", "10-minute JWT with `sub`, `tid`, `bid`, `did`, `roles`, `ver`.", "security#tokens-and-sessions", None),
   ("AUTN-05", "Resource server", "Nimbus JWT validation, claims → current user, `AUTH-001` for a missing or expired token.", "security#tokens-and-sessions", None),
   ("AUTN-06", "Rate limiting", "Bucket4j: login, PIN, enroll and refresh 10 per minute then lockout; admin 300 per minute per user; 429 with `Retry-After`. Sync limits are added in later stages.", "api#rate-limits", None),
   ("AUTN-07", "Login endpoint", "`POST /api/v1/auth/login`: e-mail + password (+ TOTP). Same error for a wrong e-mail or password; failures locked out and audited.", "api#auth-and-devices", None),
   ("AUTN-08", "TOTP two-step sign-in", "Set up with a QR code and a confirm code, recovery codes, required for OWNER and ADMIN.", "security#authentication", None),
   ("AUTN-09", "Refresh token rotation", "Opaque, stored hashed, 30-day sliding life, rotated on every use; reuse revokes the family. `POST /auth/refresh`.", "security#tokens-and-sessions dd:refresh_token", None),
   ("AUTN-10", "Admin web cookie", "Refresh token in an `HttpOnly; Secure; SameSite=Strict` cookie scoped to `/api/v1/auth`.", "security#tokens-and-sessions", None),
   ("AUTN-11", "Logout", "`POST /auth/logout` revokes the refresh-token family.", "api#auth-and-devices", None),
   ("AUTN-12", "Token version check", "A permission change or deactivation increments `ver`; older tokens are rejected.", "security#tokens-and-sessions", None),
   ("AUTN-13", "E-mail sending", "Mail port: Mailpit locally, a provider in production; templates in en/si/ta.", "tech-stack", None),
   ("AUTN-14", "Password reset", "Single-use, short-lived e-mail link; signs out all sessions.", "security#authentication", None),
   ("AUTN-15", "Invite a user", "E-mail invitation → set password → set up two-step if the role needs it.", "security#authentication", None),
   ("AUTN-16", "Staff PIN", "Set and reset a 4–6 digit PIN; `POST /api/v1/auth/pin` on an enrolled device; 5 failures → 5-minute lockout on that device, audited.", "security#authentication api#auth-and-devices", None),
   ("AUTN-17", "Authentication tests", "Login, two-step, refresh rotation and reuse detection, lockouts, expired and tampered tokens.", "dev-guide#testing", None),
  ]),
  ("AUTZ", "Authorization (roles and permissions)", "P1", "be", "Every request is checked on the server against fine-grained permissions.", [
   ("AUTZ-01", "Permission catalog in code", "All permissions (`sale.create` … `audit.view`) defined once, seeded, and exported for the apps.", "security#authorisation-and-permission-matrix", None),
   ("AUTZ-02", "Roles", "System roles plus custom tenant roles from the same permissions. `GET/POST /api/v1/roles`.", "api#tenant-administration dd:role", None),
   ("AUTZ-03", "User roles with branch scope", "Assign roles per user, optionally limited to one branch.", "dd:user_role", None),
   ("AUTZ-04", "Method security", "`@PreAuthorize` with a permission evaluator that also checks the branch; `AUTH-003` names the missing permission.", "security#authorisation-and-permission-matrix", None),
   ("AUTZ-05", "Limits per role", "Discount, refund and stock-adjustment limits stored per role, used by later stages.", "security#authorisation-and-permission-matrix", None),
   ("AUTZ-06", "Manager approval", "Actions record `approver_id`; approvals given by PIN on a register are checked when the fact syncs.", "security#audit-logging", None),
   ("AUTZ-07", "Users API", "`GET/POST /api/v1/users`, deactivate (bumps `ver`), assign roles; managers manage only their branch.", "api#tenant-administration", None),
   ("AUTZ-08", "Permission matrix test", "A table-driven test checks every role × permission against the security page.", "security#authorisation-and-permission-matrix", None),
  ]),
  ("AUDT", "Audit log", "P1", "be", "Who did what, when, from which device, and who approved it. Tamper-evident.", [
   ("AUDT-01", "Audit writer", "Public API: actor, approver, device, action, entity, before/after, reason.", "security#audit-logging dd:audit_log", None),
   ("AUDT-02", "Hash chain", "Per-tenant `seq`, `prev_hash`, SHA-256 over the defined fields; safe under concurrent writes (INV-09).", "security#audit-logging", None),
   ("AUDT-03", "Audit this stage's actions", "Logins and failures, PIN lockouts, role and permission changes, device enrollment and lock, settings changes. Later stages add their own.", "security#audit-logging", None),
   ("AUDT-04", "Audit search API", "`GET /api/v1/audit?entity=&from=` with cursor paging; needs `audit.view`.", "api#tenant-administration", None),
   ("AUDT-05", "Nightly chain check", "Job verifies the chain per tenant and alerts on a break.", "security#audit-logging", None),
  ]),
  ("DEVC", "Branches, registers and devices", "P1", "be", "Registers are enrolled devices with their own credential.", [
   ("DEVC-01", "Branches and registers", "`GET/POST /api/v1/branches`, `/branches/{id}/registers`; branch and register codes feed the receipt number.", "api#tenant-administration", None),
   ("DEVC-02", "Enrollment codes", "One-time, short-lived code for a register (`device.manage`).", "offline-sync#enrolling-and-bootstrapping-a-register", None),
   ("DEVC-03", "Enroll endpoint", "`POST /api/v1/devices/enroll`: code + device public key → device and device credential; the code is used up.", "api#auth-and-devices dd:device_enrollment", None),
   ("DEVC-04", "Device authentication", "Device credential → device token bound to `did`; `X-Device-Id` must match.", "security#register-and-device-security", None),
   ("DEVC-05", "Minimum app version", "Registers below the minimum supported version get 426 `DEV-004`.", "api#standard-headers", None),
   ("DEVC-06", "Remote lock and unlock", "`POST /devices/{id}/lock` revokes device tokens; a locked device gets `DEV-002`.", "api#auth-and-devices", None),
   ("DEVC-07", "Heartbeat", "`POST /sync/v1/heartbeat`: version, queue depth, printer status, disk space.", "api#auth-and-devices dd:device_heartbeat", None),
   ("DEVC-08", "Device list API", "Status, version, last sync, queue depth and last heartbeat per device.", "ui-screens", None),
  ]),
  ("BIZ", "Business setup and onboarding", "P1", "be", "A new shop can sign up and get to its first register without help.", [
   ("BIZ-01", "Sign-up", "Create tenant, owner and first branch in one transaction; verify the e-mail.", "flows", None),
   ("BIZ-02", "Business profile and settings", "`GET/PUT /api/v1/tenant`, `/tenant/settings`: business details, VAT number.", "api#tenant-administration", None),
   ("BIZ-03", "Receipt settings", "Header, footer, logo and languages for receipts.", "api#tenant-administration", None),
   ("BIZ-04", "Onboarding wizard steps", "Business, branch, tax registration, first register, invite staff; progress saved between visits.", "ui-screens", None),
   ("BIZ-05", "Industry modules", "`PUT /api/v1/tenant/modules/{key}` turns pharmacy or grocery features on or off.", "api#tenant-administration extensions", None),
  ]),
  ("OBS", "Errors and traces on staging", "P1", "be", "So testers' problems can be found without guessing.", [
   ("OBS-01", "Error reporting", "Sentry (or GlitchTip) for backend and admin, with personal data removed.", "operations", None),
   ("OBS-02", "Tracing", "OpenTelemetry; the request id in every error message the user sees.", "operations", None),
  ]),
  ("ADMA", "Admin screens: access and setup", "P1", "web", "Connected to the real API as each backend piece lands.", [
   ("ADMA-01", "Login and two-step sign-in (A-01, A-02)", "Access token in memory, silent refresh through the cookie, logout.", "proto:login", None),
   ("ADMA-02", "Reset password and accept invite (A-03)", "", "proto:login", None),
   ("ADMA-03", "Onboarding wizard (A-05)", "", "proto:onboard", None),
   ("ADMA-04", "Permission-aware menus and routes", "Hide what the user can't do (the server still checks); friendly 403 page.", "", None),
   ("ADMA-05", "Business profile (A-80)", "", "proto:business", None),
   ("ADMA-06", "Branches & registers (A-81)", "", "proto:branches", None),
   ("ADMA-07", "Users & roles (A-82)", "Invite, roles, branch scope, PIN reset, deactivate.", "proto:staff", None),
   ("ADMA-08", "Devices (A-83)", "Create an enrollment code, see status, lock and unlock.", "proto:devices", None),
   ("ADMA-09", "Receipts & templates (A-84)", "", "proto:receipts", None),
   ("ADMA-10", "Audit log (A-87)", "", "proto:audit", None),
   ("ADMA-11", "My profile (A-90)", "Password, two-step sign-in, sessions.", "proto:profile", None),
   ("ADMA-12", "Playwright tests for these screens", "", "dev-guide#testing", None),
  ]),
  ("REGA", "Register app: shell, enrolment and PIN", "P1", "reg", "The register starts here, so device and staff features can be tested on a real device.", [
   ("REGA-01", "Hardened Electron shell", "`contextIsolation`, `sandbox`, no `nodeIntegration`, typed IPC allowlist, strict CSP.", "security#register-and-device-security", None),
   ("REGA-02", "Encrypted local database", "SQLite with SQLCipher, key wrapped by Windows DPAPI, local migrations.", "security#register-and-device-security", None),
   ("REGA-03", "Device setup (R-01)", "Enter the code, create a key pair, enroll, store the credential.", "proto:device", None),
   ("REGA-04", "PIN sign-in, online (R-02)", "", "proto:signin", None),
   ("REGA-05", "Heartbeat and status screen (R-19)", "", "proto:status", None),
   ("REGA-06", "Device settings (R-20)", "", "proto:settings", None),
   ("REGA-07", "Locked device", "A locked device shows a lock screen and can't be used.", "", None),
  ]),
  ("T3", "Try it: open a shop", "P1", "try", "On staging, by someone who didn't build it.", [
   ("T3-01", "Sign up a new shop", "Verify the e-mail and finish the onboarding wizard.", "", None),
   ("T3-02", "Sign in", "Log in with two-step sign-in; a page reload keeps you signed in; logout works.", "", None),
   ("T3-03", "Add staff", "Add a branch and a register; invite a cashier, who accepts and sets a password.", "", None),
   ("T3-04", "Enroll a register", "Create an enrollment code, enroll the register app, the cashier signs in with a PIN. (P1 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
   ("T3-05", "Lock it", "Lock the device from the admin: the register stops. Five wrong PINs lock it for 5 minutes.", "", None),
   ("T3-06", "Check the audit log", "Every step above is there, and the chain is intact.", "", None),
   ("T3-07", "Shops stay apart", "A second shop sees none of it; `TenantIsolationIT` is green. (P1 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
  ]),
 ]),
 ("catalog", "Stage 4 · Catalog features", "P2", "ca",
  "Products, prices and tax rates on the V2 tables, and the pull sync that takes them to the register, which now works offline.",
 [
  ("CATL", "Catalog", "P2", "be", "Products, variants, units and barcodes.", [
   ("CATL-01", "Categories and brands", "Category tree and brand list: create, edit, reorder, archive.", "dd:category dd:brand", None),
   ("CATL-02", "Units and conversions", "Units (piece, kg, box) and conversions such as box of 10.", "dd:unit dd:unit_conversion", None),
   ("CATL-03", "Products API", "`GET/POST /api/v1/products`, `GET/PUT /{id}` with `If-Match`; search and filters; archive instead of delete.", "api#catalog-pricing-inventory dd:product", None),
   ("CATL-04", "SKUs (variants)", "`POST /products/{id}/skus`; batch and expiry tracking and sold-by-weight flags.", "dd:sku", None),
   ("CATL-05", "Barcodes", "Several per SKU, unique per tenant, check digits validated; `GET /api/v1/barcodes/{code}`.", "dd:barcode", None),
   ("CATL-06", "GS1 and weight barcode parser (Java)", "AIs 01, 10, 17, 21 and weight-embedded barcodes, with test vectors shared with the register (ADR-012).", "tech-stack adr", None),
   ("CATL-07", "File storage", "S3 client behind a port; keys prefixed `tenants/{tenantId}/`; 5-minute signed URLs after a permission check.", "security#tenant-isolation", None),
   ("CATL-08", "Product images", "Upload with type and size checks; served by signed URL.", "security#application-security-controls", None),
   ("CATL-09", "ProductChanged events", "Catalog changes publish events for the sync change log and reporting.", "modules#domain-event-catalog", None),
   ("CATL-10", "Search at 50,000 products", "Indexes for name search and barcode look-up, tested with 50,000 products.", "roadmap#mvp-phases-and-exit-tests", None),
  ]),
  ("PRCE", "Pricing and discounts", "P2", "be", "Prices per branch and date, and discounts within role limits.", [
   ("PRCE-01", "Price lists", "Default list per branch, prices with `validFrom`; `GET/PUT /api/v1/price-lists/{id}/items`.", "api#catalog-pricing-inventory dd:price_list_item", None),
   ("PRCE-02", "Price resolution", "One rule for SKU + branch + date + unit → price, with test vectors shared with the register.", "dd:price_list", None),
   ("PRCE-03", "Bulk price change", "Percentage change with preview; round up for increases, down for decreases.", "ui-screens", None),
   ("PRCE-04", "Discount rules", "Line or bill, percent or amount, role limits (`PRC-001`), override with approval.", "dd:discount_rule", None),
   ("PRCE-05", "Price history and audit", "Every price change audited, with who changed it and when it takes effect.", "security#audit-logging", None),
  ]),
  ("TAXR", "Tax rates and tax calculation", "P2", "be", "Only the Tax module calculates tax (INV-07).", [
   ("TAXR-01", "Tax rates", "VAT, zero-rated and exempt, with validity dates, linked to products or categories.", "dd:tax_rate", None),
   ("TAXR-02", "Tax calculator", "The single place tax is calculated: tax-inclusive prices, rounding per line, test vectors shared with the register (INV-07).", "modules#module-details", None),
   ("TAXR-03", "Future-dated rate changes", "A new rate with a start date reaches registers before it applies.", "offline-sync#pull-the-change-feed", None),
  ]),
  ("IMPT", "Product import", "P2", "be", "Shops start from an Excel sheet. Big files must not hurt the server.", [
   ("IMPT-01", "Upload an import file", "`POST /api/v1/imports/products`: Excel (streaming) or CSV, macros ignored, size limit.", "api#catalog-pricing-inventory", None),
   ("IMPT-02", "Dry run and preview", "Column mapping, row-by-row errors, counts of creates and updates; nothing saved yet.", "ui-screens", None),
   ("IMPT-03", "Commit an import", "`POST /imports/{jobId}/commit`: batches, safe to retry, progress; at most 5 jobs per tenant.", "api#rate-limits", None),
   ("IMPT-04", "Import template", "Downloadable template with headers in en/si/ta.", "ui-screens", None),
  ]),
  ("PULL", "Sync: pull to registers", "P2", "be", "Master data flows from the server to registers: snapshot first, then a change feed (INV-12).", [
   ("PULL-01", "Change log", "Every master-data change writes a `sync_change_log` row in the same transaction.", "offline-sync#pull-the-change-feed dd:sync_change_log", None),
   ("PULL-02", "Sync scopes", "catalog, prices, tax, users, settings; filtered by branch and register.", "offline-sync#who-owns-what", None),
   ("PULL-03", "Catalog snapshot builder", "Job writes a compressed snapshot per tenant and branch to object storage, with its cursor.", "offline-sync#enrolling-and-bootstrapping-a-register dd:catalog_snapshot", None),
   ("PULL-04", "Snapshot endpoint", "`GET /sync/v1/snapshot?scope=catalog` returns a signed URL and the cursor.", "api#sync", None),
   ("PULL-05", "Change feed endpoint", "`GET /sync/v1/changes?scopes=…&cursor=…` with paging; an expired cursor returns `SYNC-003`; 120 pulls per minute per device.", "api#sync dd:sync_cursor", None),
   ("PULL-06", "Staff PINs for offline sign-in", "The users scope carries PIN hashes and roles, so staff can sign in offline.", "security#authentication", None),
   ("PULL-07", "Settings scope", "Business and receipt settings reach registers.", "offline-sync#who-owns-what", None),
   ("PULL-08", "Change log clean-up", "Job removes old rows once every device is past them or retention ends.", "offline-sync#pull-the-change-feed", None),
   ("PULL-09", "Feed contract tests", "Feed shape checked against shared test files; register version N-1 keeps working (INV-13).", "offline-sync", None),
  ]),
  ("ADMC", "Admin screens: catalog and pricing", "P2", "web", "", [
   ("ADMC-01", "Products list (A-20)", "Large virtualised table, filters, search.", "proto:products", None),
   ("ADMC-02", "Product editor (A-21)", "SKUs, barcodes, units, tax rate, images.", "proto:products", None),
   ("ADMC-03", "Categories & brands (A-22)", "", "proto:categories", None),
   ("ADMC-04", "Units (A-24)", "", "proto:units", None),
   ("ADMC-05", "Import wizard (A-23)", "Upload → map columns → preview errors → commit.", "proto:import", None),
   ("ADMC-06", "Price lists (A-30)", "", "proto:pricelists", None),
   ("ADMC-07", "Bulk price change (A-31)", "", "proto:pricing", None),
   ("ADMC-08", "Discount limits (A-32)", "", "proto:discounts", None),
   ("ADMC-09", "Tax rates (A-66)", "", "proto:taxrates", None),
  ]),
  ("REGC", "Register app: offline catalog", "P2", "reg", "", [
   ("REGC-01", "First download", "Download and apply the catalog snapshot on first start.", "offline-sync#enrolling-and-bootstrapping-a-register", None),
   ("REGC-02", "Pull loop", "Change feed with cursor and backoff; full resync on `SYNC-003`.", "offline-sync#pull-the-change-feed", None),
   ("REGC-03", "Local search", "SQLite FTS5 in en/si/ta, under 100 ms with 50,000 products.", "tech-stack", None),
   ("REGC-04", "Scanner and barcode parsing", "Keyboard-style scanner input; GS1 and weight barcode parser in TypeScript using the shared test vectors.", "tech-stack", None),
   ("REGC-05", "Product look-up (R-05)", "", "proto:sell", None),
   ("REGC-06", "Price check (R-18)", "", "proto:pricecheck", None),
   ("REGC-07", "Offline PIN sign-in", "Checked against the synced hash; 5 failures → 5-minute lockout.", "security#authentication", None),
   ("REGC-08", "Offline banner and sync status", "", "offline-sync#offline-guard-rails", None),
  ]),
  ("T4", "Try it: products on the register", "P2", "try", "", [
   ("T4-01", "Import a catalog", "Import 500 products from the Excel template and fix the rows it rejects.", "", None),
   ("T4-02", "Change a price", "Change a price and a tax rate; the register has them within a minute.", "", None),
   ("T4-03", "Scan offline", "Unplug the network: a scan finds the right product and price in under 100 ms with 50,000 products. (P2 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
   ("T4-04", "Sign in offline", "A cashier signs in with a PIN while offline.", "", None),
  ]),
 ]),
 ("inventory", "Stage 5 · Inventory features", "P3", "in",
  "Stock comes in through goods receipts and changes only through the movement ledger (V3 tables).",
 [
  ("STCK", "Inventory", "P3", "be", "", [
   ("STCK-01", "Stock locations", "Locations per branch (shop floor, store room).", "dd:stock_location", None),
   ("STCK-02", "Movement ledger", "The only way stock changes (INV-04): receipt, sale, return, adjustment, count. Append-only.", "dd:stock_movement", None),
   ("STCK-03", "Balances and locking", "`stock_balance` per SKU, location and batch updated in the same transaction; rows locked in a fixed order.", "dd:stock_balance", None),
   ("STCK-04", "Batches and recalls", "Batch number, expiry, cost; `POST /api/v1/batches/{id}/block` and unblock, audited.", "dd:batch api#catalog-pricing-inventory", None),
   ("STCK-05", "Stock balance API", "`GET /api/v1/stock?locationId=…&skuId=…` by batch.", "api#catalog-pricing-inventory", None),
   ("STCK-06", "Idempotency-Key for REST", "REST `POST`s that create stock or money records store the key and response; a retry returns the same response.", "api#conventions", None),
   ("STCK-07", "Adjustments", "`POST /api/v1/stock/adjustments` with reason codes, role limit, approval, audit.", "api#catalog-pricing-inventory", None),
   ("STCK-08", "Stock counts", "Create, enter lines (blind), post → adjustment movements.", "dd:stock_count dd:stock_count_line", None),
   ("STCK-09", "FEFO allocation", "Earliest expiry first; skip blocked and expired batches (INV-14). Used when sales sync.", "data-model", None),
   ("STCK-10", "Low-stock and near-expiry alerts", "Daily job publishes `StockLow` and `BatchNearExpiry`.", "modules#domain-event-catalog", None),
   ("STCK-11", "Nightly ledger check", "Rebuild balances from the ledger, compare, alert on any difference.", "operations", None),
   ("STCK-12", "Random ledger test", "10,000 random operations; rebuilt balances equal stored balances.", "roadmap#mvp-phases-and-exit-tests", None),
   ("STCK-13", "Stock hints for registers", "Approximate on-hand per branch in the sync feed.", "offline-sync#who-owns-what", None),
  ]),
  ("RECV", "Suppliers and goods receiving", "P3", "be", "", [
   ("RECV-01", "Suppliers", "`GET/POST /api/v1/suppliers`, edit, archive.", "dd:supplier", None),
   ("RECV-02", "Goods receipt draft", "`POST /api/v1/goods-receipts` with SKU, quantity, unit, cost, batch, expiry; a GS1 scan fills batch and expiry.", "dd:goods_receipt dd:goods_receipt_line", None),
   ("RECV-03", "Post a goods receipt", "Creates batches, movements and balances, publishes `GoodsReceived`; read-only after posting.", "modules#domain-event-catalog", None),
   ("RECV-04", "Cost price update", "Update the SKU cost on posting (decide: last cost or weighted average).", "requirements", None),
   ("RECV-05", "Receiving exceptions", "Price or quantity mismatches recorded in `stock_exception`.", "dd:stock_exception", None),
   ("RECV-06", "Goods received note (D-06)", "Printable GRN.", "mvp#frontend-documents", None),
  ]),
  ("ADMS", "Admin screens: stock", "P3", "web", "", [
   ("ADMS-01", "Suppliers (A-48)", "", "proto:suppliers", None),
   ("ADMS-02", "Goods receipts (A-42)", "", "proto:grns", None),
   ("ADMS-03", "Stock on hand (A-40)", "", "proto:stock", None),
   ("ADMS-04", "Batch detail & block (A-41)", "", "proto:batch", None),
   ("ADMS-05", "Stock adjustments (A-43)", "", "proto:adjustments", None),
   ("ADMS-06", "Stock counts (A-44)", "", "proto:counts", None),
   ("ADMS-07", "Expiry board (A-45)", "", "proto:expiry", None),
  ]),
  ("REGS", "Register app: receiving", "P3", "reg", "", [
   ("REGS-01", "Goods receiving (R-17)", "GS1 scan fills batch and expiry; online.", "proto:receiving", None),
   ("REGS-02", "Stock in price check (R-18)", "Show stock from the synced hints.", "proto:pricecheck", None),
  ]),
  ("T5", "Try it: receive and count stock", "P3", "try", "", [
   ("T5-01", "Receive goods", "Add a supplier, receive a delivery by GS1 scan with batch and expiry, print the GRN.", "", None),
   ("T5-02", "Adjust and count", "Stock shows by batch; adjust with a manager's approval; run a count and post it.", "", None),
   ("T5-03", "Block a batch", "Block a batch; it shows as blocked everywhere.", "", None),
   ("T5-04", "Ledger holds", "The random ledger test and the nightly check are green. (P3 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
  ]),
 ]),
 ("checkout", "Stage 6 · Sales features, part 1: checkout and sync", "P4", "sa",
  "Selling on the register, offline if needed, and pushing sales to the server as facts (V4 tables). The biggest stage.",
 [
  ("PUSH", "Sync: push from registers", "P4", "be", "Facts flow from registers to the server (INV-12).", [
   ("PUSH-01", "Push endpoint", "`POST /sync/v1/push`: up to 50 items or 512 KB, device auth, one result per item; 60 pushes per minute per device.", "offline-sync#push-sending-facts", None),
   ("PUSH-02", "Compression", "gzip request bodies on push; gzip/br responses over 1 KB.", "api#conventions", None),
   ("PUSH-03", "Idempotency with the inbox", "Check `sync_inbox` first; a known id returns `DUPLICATE`. Inbox row and fact in one transaction (INV-05).", "offline-sync#push-sending-facts dd:sync_inbox", None),
   ("PUSH-04", "One transaction per item, in order", "`deviceSeq` order; a missing dependency gives a retryable result; one bad item doesn't block others.", "offline-sync#push-sending-facts", None),
   ("PUSH-05", "Item dispatcher", "Routes each kind to its module through public APIs only (INV-08).", "offline-sync#push-sending-facts", None),
   ("PUSH-06", "Clock checks", "Large device clock skew raises `CLOCK_SKEW`; `business_date` comes from the register.", "offline-sync#clocks-and-dates", None),
   ("PUSH-07", "Older register versions", "Accept payloads from register version N-1 (INV-13), with contract tests.", "offline-sync", None),
   ("PUSH-08", "Register audit chains", "Accept AUDIT items and check each device's chain.", "security#audit-logging", None),
   ("PUSH-09", "Replace a device", "Retire the old device; the new one gets its sequence from `GET /sync/v1/receipt-sequence`.", "offline-sync#receipt-numbering", None),
   ("PUSH-10", "Crash and duplicate test", "Crash mid-push and push again: no duplicates, no missing receipts.", "offline-sync#failure-scenarios", None),
  ]),
  ("SELL", "Sales", "P4", "be", "Sales are facts: recorded once, never edited (INV-02).", [
   ("SELL-01", "Shift opened", "Accept `CASH_SESSION_OPENED` with the opening float; sales need an open shift. (Closing comes in stage 7.)", "dd:cash_session", None),
   ("SELL-02", "Record a sale", "Sale, lines and payments from push; lines keep snapshots of name, price, tax and unit (INV-10).", "dd:sale dd:sale_line", None),
   ("SELL-03", "Receipt registry", "Unique (register, seq) with a gap check; same number with a different sale → `RECEIPT_COLLISION`, register locked (INV-06).", "offline-sync#receipt-numbering dd:receipt_registry", None),
   ("SELL-04", "Server-side checks", "Totals add up, tax recomputed by the tax calculator, price compared with the price list → `PRICE_MISMATCH`. The sale is still accepted.", "modules#domain-event-catalog", None),
   ("SELL-05", "Stock allocation on sale", "FEFO into `sale_line_allocation` and movements; negative stock allowed but raises `NEGATIVE_STOCK`; expired batch raises `EXPIRED_BATCH_SOLD`.", "dd:sale_line_allocation", None),
   ("SELL-06", "Sale exception queue", "`GET /api/v1/sale-exceptions?status=OPEN`, `POST /{id}/resolve` with a note, audited.", "api#sales-cash-customers-tax", None),
   ("SELL-07", "SaleCompleted event", "Published for cash, customers and reporting.", "modules#domain-event-catalog", None),
   ("SELL-08", "Sales history API", "`GET /api/v1/sales`, `/sales/{id}`, `/sales/by-receipt/{receiptNo}`.", "api#sales-cash-customers-tax", None),
   ("SELL-09", "Voids and overrides in the audit log", "Voided open sales, discounts above limit and price overrides audited with reason and approver.", "security#audit-logging", None),
   ("SELL-10", "Held bills", "Accept held bills for recovery and expire old ones.", "dd:held_bill", None),
   ("SELL-11", "Concurrent selling test", "Many registers selling the same batch at once: correct balances, no deadlocks.", "dev-guide#testing", None),
  ]),
  ("PAYM", "Payments", "P4", "be", "No card data is ever stored (INV-11).", [
   ("PAYM-01", "Tender types", "Cash, card, bank transfer, QR, customer credit; enabled per tenant.", "dd:tender_type", None),
   ("PAYM-02", "Split payments and change", "Several payments per sale; payments minus change equal the total.", "dd:payment", None),
   ("PAYM-03", "Card reference only", "Only the terminal approval reference, never card numbers (INV-11).", "security#payments-and-pci-dss", None),
  ]),
  ("REGX", "Register app: checkout", "P4", "reg", "", [
   ("REGX-01", "Register core", "Cart engine in `packages/register-core`: totals, discounts and tax using the shared test vectors, fully unit-tested.", "tech-stack", None),
   ("REGX-02", "Open shift (R-03)", "Opening float.", "proto:openshift", None),
   ("REGX-03", "Checkout (R-04)", "Keyboard F-keys and touch.", "proto:sell", None),
   ("REGX-04", "Batch picker and line editor (R-06, R-07)", "", "proto:sell", None),
   ("REGX-05", "Manager override (R-08)", "PIN approval within role limits.", "proto:sell", None),
   ("REGX-06", "Payment (R-10)", "Cash, card reference, split payment, change.", "proto:sell", None),
   ("REGX-07", "Sale complete (R-11)", "Receipt number taken in the same local transaction as the sale.", "offline-sync#receipt-numbering proto:sell", None),
   ("REGX-08", "Held bills (R-12)", "", "proto:sell", None),
   ("REGX-09", "Outbox", "Queue with retry, backoff and jitter; holds at least 10,000 sales.", "offline-sync#outbox-item-states", None),
   ("REGX-10", "Receipt printing (D-01)", "ESC/POS receipts in English, Sinhala and Tamil; cash drawer kick.", "tech-stack", None),
   ("REGX-11", "Offline guard rails", "", "offline-sync#offline-guard-rails", None),
  ]),
  ("ADMX", "Admin screens: sales", "P4", "web", "", [
   ("ADMX-01", "Sales history and sale detail (A-50, A-51)", "", "proto:sales", None),
   ("ADMX-02", "Exceptions queue (A-53)", "", "proto:exceptions", None),
   ("ADMX-03", "Dashboard, first version (A-10)", "Today's sales by branch and register.", "proto:dashboard", None),
  ]),
  ("T6", "Try it: sell", "P4", "try", "", [
   ("T6-01", "A normal sale", "Open a shift, sell with cash and a split payment, print the receipt, the drawer opens.", "", None),
   ("T6-02", "A day offline", "Sell offline for a full day on 2 registers and reconnect: every sale arrives once, with no receipt gaps. (P4 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
   ("T6-03", "A crash mid-push", "Kill the app during a push and restart it: no duplicates. (P4 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
   ("T6-04", "Selling below zero", "The sale is accepted, the exception shows in the queue, and a manager resolves it.", "", None),
  ]),
 ]),
 ("close", "Stage 7 · Sales features, part 2: close the day", "P5", "sa",
  "Shifts, customer credit, returns, tax documents and reports, on the rest of the V4 tables.",
 [
  ("CASH", "Cash and shifts", "P5", "be", "Every rupee in the drawer is accounted for.", [
   ("CASH-01", "Cash movements", "Pay-in, pay-out, safe drop and no-sale drawer opens (audited).", "dd:cash_movement", None),
   ("CASH-02", "Close and blind count", "Count by note and coin; expected vs counted; variance.", "dd:cash_count", None),
   ("CASH-03", "X and Z reports (D-04)", "Z-report per closed shift (data and print), X-report mid-shift.", "flows", None),
   ("CASH-04", "Shift review", "`GET /api/v1/cash-sessions`, `POST /{id}/review` approves the variance; publishes `ShiftClosed`.", "api#sales-cash-customers-tax", None),
   ("CASH-05", "Drawer reconciliation test", "Cash in the drawer equals the Z-report.", "roadmap#mvp-phases-and-exit-tests", None),
  ]),
  ("CUST", "Customers and credit", "P5", "be", "Credit sales and settlements on an append-only ledger.", [
   ("CUST-01", "Customers API", "`GET/POST /api/v1/customers`, phone unique per tenant, search; masked in logs and exports.", "dd:customer", None),
   ("CUST-02", "Customers from registers", "Customers created on a register arrive by push; duplicates can be merged.", "offline-sync#push-sending-facts", None),
   ("CUST-03", "Credit accounts", "Credit limit and status; credit sales post to `credit_ledger`.", "dd:credit_account dd:credit_ledger", None),
   ("CUST-04", "Credit settlement", "`POST /api/v1/customers/{id}/credit-payments`; balance and statement.", "api#sales-cash-customers-tax", None),
   ("CUST-05", "Offline credit limit", "Limits reach registers through sync; going over needs approval.", "offline-sync#offline-guard-rails", None),
   ("CUST-06", "Customer statement (D-05)", "PDF statement for a period.", "mvp#frontend-documents", None),
  ]),
  ("RTRN", "Returns and refunds", "P5", "be", "A return always links to the original sale.", [
   ("RTRN-01", "Record a return", "Linked to the original sale and lines; can't return more than was sold (`SALE-005`).", "dd:sale_return dd:sale_return_line", None),
   ("RTRN-02", "Refunds and limits", "Above the role limit needs approval.", "dd:refund_payment", None),
   ("RTRN-03", "Stock back in", "Return movement to the original batch, or to quarantine if damaged.", "dd:stock_movement", None),
   ("RTRN-04", "SaleReturned event", "For cash, customers (credit reversal) and tax (credit note).", "modules#domain-event-catalog", None),
   ("RTRN-05", "Online receipt look-up", "Find the original sale from another register or branch.", "api#sales-cash-customers-tax", None),
  ]),
  ("TAXD", "Tax documents", "P5", "be", "Tax invoices, credit notes and the VAT report.", [
   ("TAXD-01", "Tax invoice series", "Own gap-free series per register; buyer VAT number checked (`TAX-002`).", "offline-sync#receipt-numbering dd:tax_document", None),
   ("TAXD-02", "Credit and debit notes", "Linked to the original tax invoice.", "dd:tax_document", None),
   ("TAXD-03", "Tax document PDF (D-02, D-03)", "A4 layout an accountant accepts; return slip.", "mvp#frontend-documents", None),
   ("TAXD-04", "Tax documents API", "`GET /api/v1/tax-documents?type=&from=`.", "api#sales-cash-customers-tax", None),
   ("TAXD-05", "Fiscal adapter port", "No-op adapter in the MVP; `fiscal_submission` rows and a retry worker.", "dd:fiscal_submission", None),
   ("TAXD-06", "VAT report", "Output tax by rate for a period.", "api#sales-cash-customers-tax", None),
  ]),
  ("REPT", "Reports", "P5", "be", "Read-only reports on the reporting role.", [
   ("REPT-01", "Report framework", "`GET /api/v1/reports/{reportKey}` with parameter checks and permissions.", "api#sales-cash-customers-tax", None),
   ("REPT-02", "Exports", "`POST /api/v1/exports`: background CSV/XLSX → signed download URL; audited; personal data masked without permission.", "api#sales-cash-customers-tax", None),
   ("REPT-03", "Daily sales", "By branch, register, cashier and payment type.", "requirements", None),
   ("REPT-04", "Stock valuation", "Stock on hand at cost.", "requirements", None),
   ("REPT-05", "Expiry", "Near-expiry and expired stock by batch.", "requirements", None),
   ("REPT-06", "Credit ageing", "Customer balances by age.", "requirements", None),
   ("REPT-07", "Profit and margin", "Needs `report.view_profit`.", "security#authorisation-and-permission-matrix", None),
   ("REPT-08", "Dashboard figures", "Top products, low stock, open exceptions, shift variances.", "ui-screens", None),
   ("REPT-09", "Read models", "Views or materialized views for heavy reports, refreshed by jobs.", "data-model", None),
  ]),
  ("REGD", "Register app: cash, customers, returns", "P5", "reg", "", [
   ("REGD-01", "Cash in/out (R-15)", "", "proto:cash", None),
   ("REGD-02", "Close shift (R-16)", "Blind count and Z-report print.", "proto:cash", None),
   ("REGD-03", "Customer on a sale (R-09)", "Find or add a customer; credit sale within the limit.", "proto:sell", None),
   ("REGD-04", "Returns (R-13)", "Look up the receipt, refund, print the return slip.", "proto:returns", None),
   ("REGD-05", "Sales history on the register (R-14)", "", "proto:orders", None),
   ("REGD-06", "Tax invoice at the till", "Buyer VAT number on the sale.", "proto:sell", None),
  ]),
  ("ADMD", "Admin screens: cash, customers, tax, reports", "P5", "web", "", [
   ("ADMD-01", "Shifts & cash (A-55)", "", "proto:shifts", None),
   ("ADMD-02", "Customers and customer detail (A-60, A-61)", "Credit ledger and settlement.", "proto:customers", None),
   ("ADMD-03", "Returns (A-52)", "", "proto:returnslist", None),
   ("ADMD-04", "Tax documents (A-65)", "", "proto:tax", None),
   ("ADMD-05", "VAT report (A-67)", "", "proto:vat", None),
   ("ADMD-06", "Report centre (A-70)", "", "proto:reports", None),
   ("ADMD-07", "Dashboard, complete (A-10)", "", "proto:dashboard", None),
  ]),
  ("T7", "Try it: close the day", "P5", "try", "", [
   ("T7-01", "Close a shift", "Sell in cash and on credit, pay out, close with a blind count: the drawer equals the Z-report. (P5 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
   ("T7-02", "Settle credit", "The customer pays part of the balance; the ageing report shows it.", "", None),
   ("T7-03", "Return at another register", "Return part of a sale at another register; refund and credit note.", "", None),
   ("T7-04", "Accountant check", "An accountant accepts the tax invoice and credit note format. (P5 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
   ("T7-05", "VAT report", "The month's VAT report matches the sales.", "", None),
  ]),
 ]),
 ("launch", "Stage 8 · Pilot, hardening and launch", "P6–P7", "",
  "Support tools, monitoring, security checks, production and load tests, then three real shops.",
 [
  ("MON", "Monitoring and alerts", "P6", "be", "Know something is wrong before the shop calls.", [
   ("MON-01", "Business metrics", "Sync lag, outbox backlog, push rate, exceptions, login failures.", "operations", None),
   ("MON-02", "Dashboards and alerts", "Error rate, latency, sync lag, backup failure, audit chain break, ledger mismatch.", "operations", None),
   ("MON-03", "Log shipping", "Logs to Loki (or similar) with a retention period.", "operations", None),
  ]),
  ("SUPP", "Platform support", "P6", "be", "How DevCity staff help a shop without seeing data they shouldn't.", [
   ("SUPP-01", "Support staff sign-in", "Separate from tenants: SSO plus a hardware key (FIDO2).", "security#authentication", None),
   ("SUPP-02", "Just-in-time tenant access", "Needs the tenant's consent, expires after 4 hours, shown to the owner, audited.", "security#authentication", None),
   ("SUPP-03", "Support console API", "Tenants, health, devices, sync lag, errors.", "operations", None),
   ("SUPP-04", "Remote commands", "Forced re-sync and log upload, delivered in the heartbeat response.", "security#register-and-device-security", None),
   ("SUPP-05", "Tenant lifecycle", "Suspend, reactivate, export data on request, deletion policy.", "security#privacy-and-data-protection", None),
   ("SUPP-06", "Runbooks", "One runbook per alert, linked from the alert.", "operations", None),
  ]),
  ("CONS", "Platform console screens", "P6", "web", "DevCity staff only.", [
   ("CONS-01", "Tenants and tenant detail (P-01, P-02)", "", "proto:console", None),
   ("CONS-02", "Register fleet and detail (P-03, P-04)", "", "proto:console", None),
   ("CONS-03", "Support access (P-05)", "The shop sees a bar while support is connected.", "proto:console", None),
  ]),
  ("REGR", "Register app: release", "P6", "reg", "", [
   ("REGR-01", "Signed installer and auto-update", "Authenticode-signed; the updater checks signatures.", "security#register-and-device-security", None),
   ("REGR-02", "Staged roll-out", "Release to a few registers first; raise the minimum version only when all are updated.", "deployment", None),
  ]),
  ("HARD", "Security hardening", "P7", "be", "Most controls are built with the features; this is the final check.", [
   ("HARD-01", "Headers and CORS", "HSTS, strict CORS for the admin app, no Swagger in production.", "security#application-security-controls", None),
   ("HARD-02", "Upload safety", "File type sniffing, size limits, zip-bomb protection, XML external entities off.", "security#application-security-controls", None),
   ("HARD-03", "Secrets rotation", "Secrets from the host's secret store, rotated every 90 days or after a staff change.", "security#encryption-and-secrets", None),
   ("HARD-04", "Release scan gates", "Fail on critical or high findings; CycloneDX SBOM per release.", "security#secure-development-lifecycle", None),
   ("HARD-05", "OWASP ZAP on staging", "Baseline scan before each release.", "security#secure-development-lifecycle", None),
   ("HARD-06", "ASVS review and pen test", "ASVS checklist and an external pen test.", "security", None),
   ("HARD-07", "Privacy controls", "Retention rules, customer data export and deletion, masking in exports.", "security#privacy-and-data-protection", None),
  ]),
  ("OPS", "Production and backups", "P6", "be", "", [
   ("OPS-01", "Release process", "Version, changelog, tag → image → staging → production.", "deployment", None),
   ("OPS-02", "Production environment", "Managed PostgreSQL with point-in-time recovery, object storage, secrets.", "deployment", None),
   ("OPS-03", "Encrypted backups", "Encrypted with a separate key before leaving the host; object storage backed up too.", "security#encryption-and-secrets", None),
   ("OPS-04", "Health-gated deploy and rollback", "New version must pass health checks; a written rollback plan.", "deployment", None),
   ("OPS-05", "Migrations from now on", "V1–V4 are frozen; every change is a new migration, expand then contract.", "deployment", None),
  ]),
  ("LOAD", "Load and concurrency tests", "P7", "be", "", [
   ("LOAD-01", "Sync load test", "k6 for push and pull, including many registers reconnecting after an outage.", "tech-stack", None),
   ("LOAD-02", "Allocation under load", "Concurrent sales on the same stock at peak load, no deadlocks.", "dev-guide#testing", None),
   ("LOAD-03", "Reports on a year of data", "Partition pruning and index checks on realistic volumes.", "data-model", None),
   ("LOAD-04", "Write down capacity", "Measured limits per server size, in Cost & scaling.", "cost", None),
  ]),
  ("T8", "Try it: launch", "P6", "try", "", [
   ("T8-01", "Pilot", "Three real shops (retail, pharmacy, grocery) trade for four weeks with no manual database fix and no lost sale. (P6 exit test)", "roadmap#mvp-phases-and-exit-tests", None),
   ("T8-02", "Restore drill", "Restore production from backup within the RTO. (P7 exit test)", "roadmap#mvp-phases-and-exit-tests", "P7"),
   ("T8-03", "Security sign-off", "No open critical or high findings. (P7 exit test)", "roadmap#mvp-phases-and-exit-tests", "P7"),
  ]),
 ]),
]

PAGES = {"dev-guide": "Developer guide", "tech-stack": "Tech stack", "modules": "Modules", "security": "Security",
         "deployment": "Deployment", "ai-guide": "AI guide", "api": "API", "data-model": "Data model",
         "data-dictionary": "Data dictionary", "offline-sync": "Offline & sync", "roadmap": "Roadmap",
         "flows": "Key flows", "ui-screens": "Screens", "ui-design": "UI design", "extensions": "Extensions",
         "adr": "Decisions", "requirements": "Requirements", "operations": "Operations", "cost": "Cost & scaling",
         "mvp": "MVP list"}
AREAS = {"st": "1 · Store & staff", "ca": "2 · Catalog", "in": "3 · Inventory", "sa": "4 · Sales"}

esc = html.escape


def proto_routes():
    js = (DOC / "prototype" / "prototype.js").read_text(encoding="utf-8")
    m = re.search(r'if \(\[("sell".*?)\]\.includes\(hash\)\) S\.view = hash;', js)
    return set(re.findall(r'"([a-z]+)"', m.group(1)))


ROUTES = proto_routes()


def fmt(text: str) -> str:
    out = esc(text)
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    out = re.sub(r"\b((?:INV|BR)-\d{2})\b", r'<span class="inv">\1</span>', out)
    return out


def ref_link(r: str) -> str:
    if r.startswith("dd:"):
        t = r[3:]
        return f'<a href="data-dictionary.html#t-{t}"><code>{t}</code></a>'
    if r.startswith("proto:"):
        route = r[6:]
        assert route in ROUTES, f"unknown prototype route: {route}"
        return f'<a href="prototype/index.html#{route}" target="_blank" rel="noopener">Prototype ↗</a>'
    page, _, anchor = r.partition("#")
    label = PAGES[page]
    if anchor:
        nice = {"db-build-order": "build order", "db-map": "diagram", "mvp-phases-and-exit-tests": "exit tests", "dod": "definition of done"}
        label += " › " + nice.get(anchor, anchor.replace("-", " "))
    return f'<a href="{page}.html{"#" + anchor if anchor else ""}">{esc(label)}</a>'


def all_tasks():
    for st in STAGES:
        for cat in st[5]:
            for t in cat[5]:
                yield st, cat, t


def check():
    ids = [t[0] for _, _, t in all_tasks()]
    dup = {i for i in ids if ids.count(i) > 1}
    assert not dup, f"duplicate task ids: {dup}"
    codes = [c[0] for st in STAGES for c in st[5]]
    assert len(codes) == len(set(codes)), "duplicate category codes"
    for _, cat, t in all_tasks():
        assert t[0].startswith(cat[0] + "-"), f"{t[0]} is not in category {cat[0]}"
        assert cat[3] in KINDS
    unknown = DONE - set(ids)
    assert not unknown, f"DONE has unknown ids: {unknown}"
    return ids


def build():
    ids = check()
    n = len(ids)
    ncat = sum(len(st[5]) for st in STAGES)
    count = {k: sum(1 for _, c, _ in all_tasks() if c[3] == k) for k in KINDS}
    body = []
    rows = []
    for key, name, ph, area, intro, cats in STAGES:
        cnt = sum(len(c[5]) for c in cats)
        area_cell = f'<span class="dd-dot {area}"></span>{AREAS[area]}' if area else "—"
        rows.append(f'<tr data-stage="{key}"><td><a href="#s-{key}">{esc(name)}</a></td><td>{ph}</td><td>{area_cell}</td><td>'
                    + ", ".join(f'<a href="#c-{c[0].lower()}">{esc(c[1])}</a>' for c in cats)
                    + f'</td><td class="bp-num"><span class="bp-stage-count">0</span> / {cnt}</td></tr>')
    body.append('<h2 id="stages">Stages at a glance</h2>\n<table class="bp-stages">\n<thead><tr><th>Stage</th><th>Phase</th><th>Database area</th><th>Categories</th><th>Built</th></tr></thead>\n<tbody>'
                + "".join(rows) + "</tbody>\n</table>")

    for key, name, ph, area, intro, cats in STAGES:
        dot = f'<span class="dd-dot {area}"></span>' if area else ""
        body.append(f'<h2 id="s-{key}" class="bp-stage" data-stage="{key}">{dot}{esc(name)} <span class="bp-ph">{ph}</span></h2>\n<p>{fmt(intro)}</p>')
        for code, cname, cph, kind, cintro, tasks in cats:
            cid = code.lower()
            body.append(f'<section class="bp-cat k-{kind}" data-cat="{code}" data-kind="{kind}">\n'
                        f'<h3 id="c-{cid}">{esc(cname)} <span class="bp-kind k-{kind}">{KINDS[kind]}</span> <span class="bp-ph">{cph}</span></h3>\n'
                        f'<div class="bp-catbar"><div class="bp-bar"><span></span></div><span class="bp-catnum">0 / {len(tasks)}</span></div>\n'
                        + (f'<p class="bp-intro">{fmt(cintro)}</p>\n' if cintro else "") + '<ol class="bp-list">')
            for tid, title, detail, refs, phase in tasks:
                p = phase or cph.split("–")[0]
                links = " · ".join(ref_link(r) for r in refs.split()) if refs else ""
                rec = ' data-recorded="1"' if tid in DONE else ""
                extra = fmt(detail) + (f' <span class="bp-refs">→ {links}</span>' if links else "")
                body.append(f'<li class="bp-task" id="{tid.lower()}" data-id="{tid}" data-phase="{p}" data-kind="{kind}"{rec}>'
                            f'<label class="bp-row"><input type="checkbox" aria-label="Mark {tid} as built">'
                            f'<code class="bp-id">{tid}</code><span class="bp-title">{esc(title)}</span>'
                            f'<span class="bp-ph">{p}</span></label>'
                            + (f'<div class="bp-detail">{extra}</div>' if extra.strip() else "") + "</li>")
            body.append("</ol>\n</section>")

    phases = ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7"]
    kind_opts = "".join(f'<option value="{k}">{v} ({count[k]})</option>' for k, v in KINDS.items())
    toolbar = f"""<div class="bp-panel" id="bp-panel">
<div class="bp-overall"><div><strong id="bp-done">0</strong> of <strong>{n}</strong> tasks built · <span id="bp-pct">0%</span></div><div class="bp-bar big"><span id="bp-bar"></span></div></div>
<div class="bp-tools">
<div class="bp-seg" role="group" aria-label="Show"><button type="button" data-show="all" class="on">All</button><button type="button" data-show="todo">To build</button><button type="button" data-show="done">Built</button></div>
<label class="bp-sel">Part <select id="bp-kind"><option value="">All</option>{kind_opts}</select></label>
<label class="bp-sel">Phase <select id="bp-phase"><option value="">All</option>{''.join(f'<option>{p}</option>' for p in phases)}</select></label>
<input id="bp-q" type="search" placeholder="Filter tasks (e.g. refresh, FEFO, A-21)" aria-label="Filter tasks">
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
  var KEY = "retailos-build-done";
  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { store = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  var tasks = Array.prototype.slice.call(document.querySelectorAll(".bp-task"));
  var show = "all";
  function isDone(li) { return li.dataset.recorded === "1" || !!store[li.dataset.id]; }
  function msg(t) { var m = document.getElementById("bp-msg"); m.textContent = t; clearTimeout(msg.t); msg.t = setTimeout(function () { m.textContent = ""; }, 4000); }

  tasks.forEach(function (li) {
    var cb = li.querySelector("input");
    if (li.dataset.recorded === "1") { cb.disabled = true; li.title = "Recorded as built in tools/build_order.py"; }
    cb.addEventListener("change", function () {
      if (cb.checked) store[li.dataset.id] = today(); else delete store[li.dataset.id];
      save(); render();
    });
  });

  function render() {
    var q = document.getElementById("bp-q").value.trim().toLowerCase();
    var ph = document.getElementById("bp-phase").value;
    var kd = document.getElementById("bp-kind").value;
    var done = 0, next = [];
    tasks.forEach(function (li) {
      var d = isDone(li);
      li.querySelector("input").checked = d;
      li.classList.toggle("done", d);
      if (d) done++; else if (next.length < 6 && (!kd || li.dataset.kind === kd)) next.push(li);
      var vis = (show === "all" || (show === "done") === d) && (!ph || li.dataset.phase === ph) &&
                (!kd || li.dataset.kind === kd) && (!q || li.textContent.toLowerCase().indexOf(q) >= 0);
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
      var h = document.getElementById("s-" + tr.dataset.stage), d = 0, el = h.nextElementSibling;
      while (el && el.tagName !== "H2") { el.querySelectorAll(".bp-task").forEach(function (li) { if (isDone(li)) d++; }); el = el.nextElementSibling; }
      tr.querySelector(".bp-stage-count").textContent = d;
    });
    var pct = Math.round(100 * done / tasks.length);
    document.getElementById("bp-done").textContent = done;
    document.getElementById("bp-pct").textContent = pct + "%";
    document.getElementById("bp-bar").style.width = (100 * done / tasks.length) + "%";
    var nl = document.getElementById("bp-next-list");
    nl.innerHTML = next.length ? next.map(function (li) {
      return '<li><a href="#' + li.id + '"><code>' + li.dataset.id + '</code></a> ' + li.querySelector(".bp-title").textContent + ' <span class="bp-ph">' + li.dataset.phase + '</span></li>';
    }).join("") : "<li>Everything here is built.</li>";
  }

  document.querySelectorAll(".bp-seg button").forEach(function (b) {
    b.addEventListener("click", function () {
      show = b.dataset.show;
      document.querySelectorAll(".bp-seg button").forEach(function (x) { x.classList.toggle("on", x === b); });
      render();
    });
  });
  ["bp-phase", "bp-kind"].forEach(function (id) { document.getElementById(id).addEventListener("change", render); });
  document.getElementById("bp-q").addEventListener("input", render);

  document.getElementById("bp-export").addEventListener("click", function () {
    var data = { page: "build-order", exported: new Date().toISOString(), done: store };
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = "retailos-build-progress.json"; document.body.appendChild(a); a.click(); a.remove();
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
      function () { msg("Copied. Paste it over DONE in tools/build_order.py."); },
      function () { window.prompt("Copy this into tools/build_order.py:", text); });
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
<title>Build order · RetailOS</title>
<meta name="description" content="Every RetailOS MVP task in build order: project setup, the whole database, then features area by area with their admin and register screens and a Try it check per stage, with tick boxes to track what is built.">
<link rel="stylesheet" href="assets/site.css">
<script>try{{var t=localStorage.getItem("retailos-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
</head>
<body>
<header id="topbar"></header>
<div class="layout">
<nav id="sidebar"></nav>
<main class="content"><article>
<!-- Generated by tools/build_order.py. Edit the script, not this file. -->

<h1>Build order</h1>
<p class="lead">Every MVP task, from an empty repository to launch, in the order to build it: {n} tasks ({count['be']} backend, {count['web']} admin web, {count['reg']} register app, {count['try']} Try it checks) in {ncat} categories and eight stages. Tick each one when it is built, so everyone can see what is done and what comes next.</p>

<h2 id="approach">The approach</h2>
<ol>
<li><strong>Project setup first</strong> (stage 1): both builds, CI, the app shells, shared building blocks and a staging server, proven by a walking skeleton.</li>
<li><strong>Then the whole database</strong> (stage 2): all 56 tables in four migrations with row-level security, plus the test tools (<a href="data-model.html#db-build-order">database build order</a>).</li>
<li><strong>Then features, area by area</strong>, in the order of the four database areas: <span class="dd-dot st"></span>store &amp; staff (stage 3), <span class="dd-dot ca"></span>catalog (stage 4), <span class="dd-dot in"></span>inventory (stage 5) and <span class="dd-dot sa"></span>sales (stages 6 and 7). Stage 8 is the pilot and launch.</li>
<li><strong>Each feature is a vertical slice:</strong> the backend API with its tests, then the admin or register screen connected to it, then it runs on staging. Each stage ends with a <em>Try it</em> list: steps someone who didn't build it can follow on staging. The phase exit tests from the <a href="roadmap.html#mvp-phases-and-exit-tests">roadmap</a> are part of these lists.</li>
</ol>

<div class="callout"><span class="ct">How to use this page</span>
<ul>
<li><strong>Done means:</strong> merged to <code>main</code> with tests, CI green, the screen works against the real API on staging, and the <a href="dev-guide.html#dod">definition of done</a> is met.</li>
<li><strong>Your ticks are saved in this browser only.</strong> To share progress, use <em>Copy built IDs</em> and paste the result over <code>DONE</code> in <code>tools/build_order.py</code>, then regenerate and commit. Those tasks then show as built for everyone (locked tick). <em>Export</em> and <em>Import</em> move your own ticks between browsers.</li>
<li><strong>Use <em>Part</em> to split the work:</strong> a backend developer filters to Backend, a front-end developer to Admin web or Register app. Inside a stage, the front-end can start a screen against the prototype while its API is being built.</li>
<li><strong>IDs never change.</strong> Quote them in branch names, commits and pull requests, e.g. <code>feat/AUTN-09-refresh-rotation</code>. Screen codes (A-21, R-04) match the <a href="mvp.html#frontend">MVP screen list</a>.</li>
</ul></div>

{toolbar}

{nextup}

{chr(10).join(body)}

<h2 id="not-here">Not on this page</h2>
<p>Release 2 and 3 work (promotions, purchase orders, transfers, loyalty, the Android register, pharmacy and grocery tables, fiscal submission to the IRD) is in the <a href="roadmap.html">roadmap</a> and will be added here when it is planned.</p>

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
    (DOC / "build-order.html").write_text(build(), encoding="utf-8")
    ids = check()
    print(f"build-order.html written: {len(ids)} tasks, {len(DONE)} recorded as built")
