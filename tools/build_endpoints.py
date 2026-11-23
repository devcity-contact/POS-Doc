"""Build endpoints.html: every backend API endpoint, grouped by module, with its details and build status.
It also regenerates build-order.html, which links each task to its endpoints.

Usage (from anywhere):  python Doc/tools/build_endpoints.py

HOW TO UPDATE (do this in the same pull request as the code):
  * New endpoint      -> add an E(...) line under its module, in a sensible place. Give it the build order task.
  * Started building  -> status="building".   Merged and working on staging -> status="built".
  * Changed endpoint  -> edit its line (path, request, response, errors).
  * Removed endpoint  -> delete its line.
  Then run this script and commit the script and the generated pages.

Fields of E(method, path, summary, access, perm=..., req=..., res=..., err=..., notes=..., screens=..., task=..., status=...):
  access  public | token (one-time e-mail link) | code (enrollment code) | cookie (refresh cookie)
          | user (signed-in user) | device (enrolled register) | support (DevCity support staff)
  perm    permission from the matrix in security.html#rbac. Add " (new)" if it isn't in the matrix yet.
  err     only errors special to this endpoint; the common ones are listed once on the page.
  screens screen codes (A-xx admin, R-xx register, P-xx console) or "sync" for background sync.
  task    build order task id (e.g. AUTN-07). The page shows its phase.
"""
import html
import pathlib
import re

DOC = pathlib.Path(__file__).resolve().parent.parent
esc = html.escape

# module key: (title, package, colour group, intro)
MODULES = {
    "tenancy": ("Tenancy", "platform.tenancy", "st", "Sign-up, business profile and settings, branches and registers, industry modules."),
    "iam": ("Identity & access", "platform.iam", "st", "Sign-in, tokens, two-step sign-in, staff PINs, users, roles and permissions."),
    "devices": ("Devices", "devices", "st", "Enrolling registers, device tokens, heartbeat, lock and retire."),
    "audit": ("Audit", "platform.audit", "st", "Reading the audit log. Writing happens inside other modules through AuditApi."),
    "catalog": ("Catalog", "catalog", "ca", "Categories, brands, units, products, SKUs, barcodes, images and product import."),
    "pricing": ("Pricing", "pricing", "ca", "Price lists, bulk price changes, discount rules and limits per role."),
    "tax": ("Tax", "tax", "ca", "Tax rates, tax invoices, credit and debit notes."),
    "sync": ("Sync", "sync", "ed", "The register's API: snapshot and change feed (pull), facts (push). Device token only."),
    "inventory": ("Inventory", "inventory", "in", "Stock on hand, ledger, batches and recalls, adjustments, counts, stock exceptions."),
    "purchasing": ("Purchasing", "purchasing", "in", "Suppliers and goods receipts."),
    "sales": ("Sales", "sales", "sa", "Reading sales, returns and the exception queue. Sales and returns themselves arrive through sync push."),
    "payments": ("Payments", "payments", "sa", "Payment types. Payments arrive with the sale through sync push."),
    "cash": ("Cash", "cash", "sa", "Shifts and Z-reports. Opening, closing and cash in/out arrive through sync push."),
    "customers": ("Customers", "customers", "sa", "Customer records, credit accounts, settlements and statements."),
    "reporting": ("Reporting", "reporting", "ed", "Dashboard, reports and exports. Read-only."),
    "platform": ("Platform support", "platform.support", "ed", "The DevCity support console, and the shop owner's side of support access."),
}

ACCESS = {"public": "Public", "token": "E-mail link", "code": "Enrollment code", "cookie": "Refresh cookie",
          "user": "Signed in", "device": "Register", "support": "Support staff"}
STATUS = {"planned": "Planned", "building": "Building", "built": "Built"}
METHODS = ("GET", "POST", "PUT", "PATCH", "DELETE")

# screen code -> (name, prototype route)
SCREENS = {
    "R-01": ("Device setup", "device"), "R-02": ("PIN sign-in", "signin"), "R-03": ("Open shift", "openshift"),
    "R-04": ("Checkout", "sell"), "R-05": ("Product lookup", "sell"), "R-09": ("Customer", "sell"), "R-10": ("Payment", "sell"),
    "R-13": ("Returns", "returns"), "R-14": ("Sales history", "orders"), "R-16": ("Close shift", "cash"),
    "R-17": ("Goods receiving", "receiving"), "R-18": ("Price & stock check", "pricecheck"), "R-19": ("Status & diagnostics", "status"),
    "A-01": ("Login", "login"), "A-02": ("Two-step sign-in", "login"), "A-03": ("Reset password / accept invite", "login"),
    "A-05": ("Onboarding wizard", "onboard"), "A-90": ("My profile", "profile"), "A-10": ("Dashboard", "dashboard"),
    "A-20": ("Products list", "products"), "A-21": ("Product editor", "products"), "A-22": ("Categories & brands", "categories"),
    "A-23": ("Import wizard", "import"), "A-24": ("Units", "units"), "A-30": ("Price lists", "pricelists"),
    "A-31": ("Bulk price change", "pricing"), "A-32": ("Discount limits", "discounts"), "A-40": ("Stock on hand", "stock"),
    "A-41": ("Batch detail & block", "batch"), "A-42": ("Goods receipts", "grns"), "A-43": ("Stock adjustments", "adjustments"),
    "A-44": ("Stock counts", "counts"), "A-45": ("Expiry board", "expiry"), "A-48": ("Suppliers", "suppliers"),
    "A-50": ("Sales history", "sales"), "A-51": ("Sale detail", "sales"), "A-52": ("Returns", "returnslist"),
    "A-53": ("Exceptions queue", "exceptions"), "A-55": ("Shifts & cash", "shifts"), "A-60": ("Customers", "customers"),
    "A-61": ("Customer detail", "customers"), "A-65": ("Tax documents", "tax"), "A-66": ("Tax rates", "taxrates"),
    "A-67": ("VAT report", "vat"), "A-70": ("Report centre", "reports"), "A-80": ("Business profile", "business"),
    "A-81": ("Branches & registers", "branches"), "A-82": ("Users & roles", "staff"), "A-83": ("Devices", "devices"),
    "A-84": ("Receipts & templates", "receipts"), "A-87": ("Audit log", "audit"),
    "P-01": ("Tenants", "console"), "P-02": ("Tenant detail", "console"), "P-03": ("Register fleet", "console"),
    "P-04": ("Register detail", "console"), "P-05": ("Support access", "console"),
}

ENDPOINTS = []
_mod = None


def module(key):
    global _mod
    assert key in MODULES, key
    _mod = key


def E(method, path, summary, access, perm="", req="", res="", err="", notes="", screens="", task="", status="planned"):
    ENDPOINTS.append(dict(module=_mod, method=method, path=path, summary=summary, access=access, perm=perm, req=req,
                          res=res, err=err, notes=notes, screens=screens, task=task, status=status))


# ==============================================================================================
# THE ENDPOINTS  (keep each module in a sensible reading order: list, create, read, update, actions)
# ==============================================================================================
module("tenancy")
E("POST", "/api/v1/signup", "Create a new shop: tenant, owner and first branch", "public",
  req="businessName, ownerName, email, password, branchName, language", res="201 · tenantId; a verification e-mail is sent",
  err="409 e-mail already used · 429 too many tries", notes="One transaction. Rate limited like login.", screens="A-05", task="BIZ-01")
E("POST", "/api/v1/signup/verify", "Confirm the owner's e-mail address", "token",
  req="token", res="204", err="400 link invalid or expired", screens="A-05", task="BIZ-01")
E("GET", "/api/v1/tenant", "Business profile", "user",
  res="name, address, phone, VAT number, logo URL, enabled modules · ETag", screens="A-80", task="BIZ-02")
E("PUT", "/api/v1/tenant", "Update the business profile", "user", perm="tenant.settings",
  req="name, address, phone, vatNumber · If-Match", res="profile + new ETag", err="412 changed by someone else",
  notes="Audited.", screens="A-80", task="BIZ-02")
E("POST", "/api/v1/tenant/logo", "Upload the business logo", "user", perm="tenant.settings",
  req="multipart: PNG, JPG or SVG, at most 500 KB", res="logo URL", err="400 wrong type or too large", screens="A-80 A-84", task="BIZ-03")
E("GET", "/api/v1/tenant/settings", "Shop settings: receipts, languages, defaults", "user",
  res="receipt header and footer, receipt languages, defaults · ETag", screens="A-84", task="BIZ-03")
E("PUT", "/api/v1/tenant/settings", "Change shop settings", "user", perm="tenant.settings",
  req="settings · If-Match", res="settings", err="412",
  notes="Audited. Registers get the change through the settings sync scope.", screens="A-84", task="BIZ-03")
E("PUT", "/api/v1/tenant/modules/{key}", "Turn an industry module on or off", "user", perm="tenant.modules",
  req="enabled: true or false", res="module state", notes="Keys: pharmacy, grocery (Release 2). Audited.", screens="A-80", task="BIZ-05")
E("GET", "/api/v1/onboarding", "Onboarding wizard progress", "user", res="each step, done or not", screens="A-05", task="BIZ-04")
E("PUT", "/api/v1/onboarding/{step}", "Save one onboarding step", "user", perm="tenant.settings",
  req="that step's data", res="progress", screens="A-05", task="BIZ-04")
E("GET", "/api/v1/branches", "List branches", "user",
  res="branches: code, name, address, time zone", notes="A user scoped to one branch sees only that branch.", screens="A-81", task="DEVC-01")
E("POST", "/api/v1/branches", "Add a branch", "user", perm="tenant.settings",
  req="code, name, address, phone", res="201 · branch", err="409 code already used",
  notes="The branch code is part of every receipt number.", screens="A-81", task="DEVC-01")
E("PUT", "/api/v1/branches/{id}", "Update a branch", "user", perm="tenant.settings",
  req="name, address, phone · If-Match", res="branch", err="412 · 409 code can't change after the first sale", screens="A-81", task="DEVC-01")
E("GET", "/api/v1/branches/{id}/registers", "List a branch's registers", "user",
  res="registers with code, name and enrolled device", screens="A-81 A-83", task="DEVC-01")
E("POST", "/api/v1/branches/{id}/registers", "Add a register", "user", perm="device.manage",
  req="code, name", res="201 · register", err="409 code already used", screens="A-81", task="DEVC-01")
E("PUT", "/api/v1/registers/{id}", "Rename or deactivate a register", "user", perm="device.manage",
  req="name, active · If-Match", res="register", err="412", screens="A-81", task="DEVC-01")

module("iam")
E("POST", "/api/v1/auth/login", "Sign in with e-mail and password (+ TOTP code)", "public",
  req="email, password, totpCode?", res="accessToken (10 min), user, branches · sets the refresh cookie",
  err="401 wrong e-mail or password (same message for both) · 401 TOTP code needed · 429 locked out · 403 TEN-001",
  notes="Rate limited (login group). Owner and admin must use two-step sign-in. Failures are audited.", screens="A-01 A-02", task="AUTN-07")
E("POST", "/api/v1/auth/refresh", "Get a new access token", "cookie",
  res="accessToken · a new refresh cookie (rotated)", err="401 expired, or an old token reused → the whole family is revoked",
  notes="Rate limited. CSRF-protected because it uses a cookie.", screens="A-01", task="AUTN-09")
E("POST", "/api/v1/auth/logout", "Sign out", "user", res="204", notes="Revokes the refresh-token family. CSRF-protected.", screens="A-90", task="AUTN-11")
E("POST", "/api/v1/auth/pin", "Staff sign-in with a PIN on a register (online)", "device",
  req="userId, pin", res="staff access token bound to this device",
  err="401 wrong PIN · 429 after 5 failures (5-minute lockout on this device)",
  notes="Audited. Offline, the register checks the synced PIN hash instead.", screens="R-02", task="AUTN-16")
E("POST", "/api/v1/auth/password-reset", "Ask for a password reset e-mail", "public",
  req="email", res="202 always, so nobody can test which e-mails exist", notes="Rate limited.", screens="A-03", task="AUTN-14")
E("POST", "/api/v1/auth/password-reset/confirm", "Set a new password from the e-mail link", "token",
  req="token, newPassword", res="204 · every session is signed out",
  err="400 link invalid or expired · VAL-001 password too short or on the breached list", screens="A-03", task="AUTN-14")
E("POST", "/api/v1/auth/invitations/accept", "Accept an invitation and set a password", "token",
  req="token, password", res="204", err="400 link invalid or expired · VAL-001",
  notes="If the role needs two-step sign-in, the first login asks to set it up.", screens="A-03", task="AUTN-15")
E("POST", "/api/v1/auth/mfa/setup", "Start setting up two-step sign-in", "user",
  res="otpauth URI for the QR code", screens="A-02 A-90", task="AUTN-08")
E("POST", "/api/v1/auth/mfa/confirm", "Finish setting up two-step sign-in", "user",
  req="code", res="recovery codes (shown once)", err="400 wrong code", notes="Audited.", screens="A-02 A-90", task="AUTN-08")
E("GET", "/api/v1/.well-known/jwks.json", "Public keys that verify access tokens", "public",
  res="the current and the previous signing key", task="AUTN-03")
E("GET", "/api/v1/me", "The signed-in user", "user",
  res="name, e-mail, language, roles, permissions, branches",
  notes="The admin app uses the permissions to show only the menus the user may use.", screens="A-90", task="ADMA-04")
E("PUT", "/api/v1/me/password", "Change my password", "user",
  req="currentPassword, newPassword", res="204 · other sessions signed out", err="400 wrong current password · VAL-001", screens="A-90", task="ADMA-11")
E("GET", "/api/v1/me/sessions", "My signed-in sessions", "user", res="device, browser, last used", screens="A-90", task="ADMA-11")
E("DELETE", "/api/v1/me/sessions/{id}", "Sign out one of my sessions", "user", res="204", screens="A-90", task="ADMA-11")
E("GET", "/api/v1/users", "List users", "user", perm="user.manage",
  req="?branchId, status, q, cursor", res="users with roles and branch scope",
  notes="A manager sees only the users of their branch.", screens="A-82", task="AUTZ-07")
E("POST", "/api/v1/users", "Invite a user", "user", perm="user.manage",
  req="name, email, language, roles [{roleId, branchId?}]", res="201 · user with status INVITED; an e-mail is sent",
  err="409 e-mail already in this shop", notes="Audited.", screens="A-82", task="AUTZ-07")
E("GET", "/api/v1/users/{id}", "One user", "user", perm="user.manage", res="user · ETag", screens="A-82", task="AUTZ-07")
E("PUT", "/api/v1/users/{id}", "Change a user's name, roles or branch", "user", perm="user.manage",
  req="name, roles · If-Match", res="user", err="412",
  notes="Bumps the token version, so the user's old tokens stop working. Audited.", screens="A-82", task="AUTZ-07")
E("POST", "/api/v1/users/{id}/deactivate", "Deactivate a user", "user", perm="user.manage",
  res="204", notes="Signs the user out everywhere. Audited.", screens="A-82", task="AUTZ-07")
E("PUT", "/api/v1/users/{id}/pin", "Set or reset a staff PIN", "user", perm="user.manage",
  req="pin (4–6 digits)", res="204", err="VAL-001 too simple (e.g. 1111, 1234)",
  notes="Registers get the new PIN hash in the users sync scope. Audited.", screens="A-82", task="AUTN-16")
E("GET", "/api/v1/permissions", "All permissions", "user",
  res="permission keys with descriptions", notes="For the role editor.", screens="A-82", task="AUTZ-01")
E("GET", "/api/v1/roles", "List roles", "user", res="roles with their permissions", screens="A-82", task="AUTZ-02")
E("POST", "/api/v1/roles", "Create a custom role", "user", perm="user.manage (owner)",
  req="name, permissions", res="201 · role", notes="Audited.", screens="A-82", task="AUTZ-02")
E("PUT", "/api/v1/roles/{id}", "Change a custom role", "user", perm="user.manage (owner)",
  req="name, permissions · If-Match", res="role", err="409 system roles can't be changed · 412",
  notes="Bumps the token version of everyone with this role. Audited.", screens="A-82", task="AUTZ-02")

module("devices")
E("POST", "/api/v1/registers/{id}/enrollment-codes", "Create a one-time enrollment code", "user", perm="device.manage",
  res="code, expiresAt (short-lived)", notes="Shown once in the admin app. Audited.", screens="A-83", task="DEVC-02")
E("POST", "/api/v1/devices/enroll", "Enroll a register with a code", "code",
  req="code, publicKey, device info (OS, app version)", res="deviceId, device credential, register and branch",
  err="400 code invalid, used or expired · 429", notes="Rate limited like login. The private key never leaves the device. Audited.",
  screens="R-01", task="DEVC-03")
E("POST", "/api/v1/devices/{id}/token", "Get a device access token", "device",
  req="a challenge signed with the device key", res="device access token (with the did claim)",
  err="401 bad signature · 403 DEV-002 device locked or retired", screens="sync", task="DEVC-04")
E("GET", "/api/v1/devices", "List devices", "user", perm="device.manage",
  res="status, app version, last sync, queue depth, last heartbeat", screens="A-83", task="DEVC-08")
E("GET", "/api/v1/devices/{id}", "One device with its recent heartbeats", "user", perm="device.manage", screens="A-83", task="DEVC-08")
E("POST", "/api/v1/devices/{id}/lock", "Lock a device", "user", perm="device.manage",
  req="reason", res="204", notes="Revokes its tokens; it stops selling at the next pull. Audited.", screens="A-83", task="DEVC-06")
E("POST", "/api/v1/devices/{id}/unlock", "Unlock a device", "user", perm="device.manage",
  req="reason", res="204", notes="Audited.", screens="A-83", task="DEVC-06")
E("POST", "/api/v1/devices/{id}/retire", "Retire a device that is being replaced", "user", perm="device.manage",
  res="204", notes="The replacement continues the register's receipt sequence. Audited.", screens="A-83", task="PUSH-09")
E("POST", "/sync/v1/heartbeat", "Register status, every few minutes", "device",
  req="app version, queue depth, printer status, disk space, last sync", res="minimum app version, commands (re-sync, upload logs)",
  notes="Commands are queued by the support console.", screens="R-19", task="DEVC-07")

module("audit")
E("GET", "/api/v1/audit", "Search the audit log", "user", perm="audit.view",
  req="?entity, entityId, actorId, action, from, to, cursor", res="entries: who, when, device, approver, before/after, reason",
  notes="Read-only. The hash chain is checked every night.", screens="A-87", task="AUDT-04")

module("catalog")
E("GET", "/api/v1/categories", "Category tree", "user", res="tree in display order", screens="A-22 A-21", task="CATL-01")
E("POST", "/api/v1/categories", "Add a category", "user", perm="catalog.edit", req="name (en/si/ta), parentId?", res="201 · category", screens="A-22", task="CATL-01")
E("PUT", "/api/v1/categories/{id}", "Rename, move or archive a category", "user", perm="catalog.edit",
  req="name, parentId, archived · If-Match", res="category", err="412", screens="A-22", task="CATL-01")
E("PUT", "/api/v1/categories/order", "Save the category order", "user", perm="catalog.edit",
  req="ids in the new order", res="204", notes="Registers get the new order within a minute.", screens="A-22", task="CATL-01")
E("GET", "/api/v1/brands", "List brands", "user", screens="A-22 A-21", task="CATL-01")
E("POST", "/api/v1/brands", "Add a brand", "user", perm="catalog.edit", req="name", res="201 · brand", err="409 name already used", screens="A-22", task="CATL-01")
E("PUT", "/api/v1/brands/{id}", "Rename or archive a brand", "user", perm="catalog.edit", req="name, archived · If-Match", screens="A-22", task="CATL-01")
E("GET", "/api/v1/units", "List units", "user", res="units: code, name, decimals allowed", screens="A-24 A-21", task="CATL-02")
E("POST", "/api/v1/units", "Add a unit", "user", perm="catalog.edit", req="code, name, decimals allowed", res="201 · unit", screens="A-24", task="CATL-02")
E("PUT", "/api/v1/units/{id}", "Change a unit", "user", perm="catalog.edit", req="name · If-Match", screens="A-24", task="CATL-02")
E("PUT", "/api/v1/skus/{id}/unit-conversions", "Set a SKU's unit conversions", "user", perm="catalog.edit",
  req="[{unitId, factor}], e.g. box = 10 pieces", res="conversions", err="VAL-001 factor must be more than 0", screens="A-21 A-24", task="CATL-02")
E("GET", "/api/v1/products", "List and search products", "user",
  req="?q, categoryId, brandId, status, cursor, limit", res="products with SKUs, barcodes and current price",
  notes="Searches name, SKU code and barcode. Must stay fast with 50,000 products.", screens="A-20", task="CATL-03")
E("POST", "/api/v1/products", "Create a product", "user", perm="catalog.edit",
  req="name (en/si/ta), categoryId, brandId, taxRateId, item type, first SKU with unit and barcodes",
  res="201 · product", err="409 barcode already used", notes="Audited. Publishes ProductChanged.", screens="A-21", task="CATL-03")
E("GET", "/api/v1/products/{id}", "One product with SKUs, barcodes, units and prices", "user", res="product · ETag", screens="A-21", task="CATL-03")
E("PUT", "/api/v1/products/{id}", "Update a product", "user", perm="catalog.edit",
  req="product fields · If-Match", res="product", err="412", notes="Publishes ProductChanged, so registers update.", screens="A-21", task="CATL-03")
E("POST", "/api/v1/products/{id}/archive", "Archive a product", "user", perm="catalog.edit",
  res="204", notes="Never deleted: past sales keep pointing to it.", screens="A-20 A-21", task="CATL-03")
E("POST", "/api/v1/products/{id}/skus", "Add a variant (SKU)", "user", perm="catalog.edit",
  req="code, attributes, unit, flags (track batch, track expiry, sold by weight)", res="201 · SKU", err="409 code already used", screens="A-21", task="CATL-04")
E("PUT", "/api/v1/skus/{id}", "Update a SKU", "user", perm="catalog.edit", req="SKU fields · If-Match", err="412", screens="A-21", task="CATL-04")
E("POST", "/api/v1/skus/{id}/barcodes", "Add a barcode to a SKU", "user", perm="catalog.edit",
  req="code, type", res="201", err="400 wrong check digit · 409 barcode already used", screens="A-21", task="CATL-05")
E("DELETE", "/api/v1/skus/{id}/barcodes/{code}", "Remove a barcode from a SKU", "user", perm="catalog.edit", res="204", screens="A-21", task="CATL-05")
E("GET", "/api/v1/barcodes/{code}", "Find the SKU for a barcode", "user",
  res="SKU, product and unit; the GS1 parts (batch, expiry) for a GS1 code", err="404 unknown barcode",
  notes="Online look-up for the admin app. Registers search their local copy.", screens="A-42 R-17", task="CATL-05")
E("POST", "/api/v1/products/{id}/images", "Upload a product image", "user", perm="catalog.edit",
  req="multipart: PNG or JPG, size limit", res="image URL", err="400 wrong type or too large", screens="A-21", task="CATL-08")
E("POST", "/api/v1/imports/products", "Upload a product file (dry run)", "user", perm="catalog.edit",
  req="multipart: .xlsx or .csv, column mapping", res="202 · jobId", err="400 not a readable file · 429 too many jobs",
  notes="Nothing is saved yet. At most 5 import or export jobs per shop at once.", screens="A-23", task="IMPT-01")
E("GET", "/api/v1/imports/{jobId}", "Import progress and preview", "user", perm="catalog.edit",
  res="progress, how many creates and updates, errors per row", screens="A-23", task="IMPT-02")
E("POST", "/api/v1/imports/{jobId}/commit", "Apply a previewed import", "user", perm="catalog.edit",
  res="202 · follow progress with GET", err="409 already applied, or the preview still has errors", notes="Safe to retry. Audited.", screens="A-23", task="IMPT-03")
E("GET", "/api/v1/imports/templates/products", "Download the import template", "user",
  req="?lang=en|si|ta", res=".xlsx file", screens="A-23", task="IMPT-04")

module("pricing")
E("GET", "/api/v1/price-lists", "List price lists", "user", res="price lists with their branches", screens="A-30", task="PRCE-01")
E("POST", "/api/v1/price-lists", "Create a price list", "user", perm="price.edit", req="name, branchIds", res="201 · price list", screens="A-30", task="PRCE-01")
E("GET", "/api/v1/price-lists/{id}/items", "Prices in a list", "user",
  req="?q, skuId, cursor", res="SKU, unit, price, validFrom", screens="A-30", task="PRCE-01")
E("PUT", "/api/v1/price-lists/{id}/items", "Set prices", "user", perm="price.edit",
  req="[{skuId, unitId, price, validFrom}]", res="saved items",
  notes="Prices are strings with 4 decimals. A future validFrom takes effect on that date. Audited.", screens="A-30", task="PRCE-01")
E("POST", "/api/v1/price-lists/{id}/bulk-change/preview", "Preview a bulk price change", "user", perm="price.edit",
  req="filter (category, brand), percent", res="old and new price per SKU", notes="Rounds up for increases and down for decreases. Saves nothing.", screens="A-31", task="PRCE-03")
E("POST", "/api/v1/price-lists/{id}/bulk-change", "Apply a bulk price change", "user", perm="price.edit",
  req="the same as the preview, validFrom · Idempotency-Key", res="how many prices changed", notes="Audited.", screens="A-31", task="PRCE-03")
E("GET", "/api/v1/discount-rules", "List discount rules", "user", screens="A-32", task="PRCE-04")
E("POST", "/api/v1/discount-rules", "Add a discount rule", "user", perm="price.edit",
  req="line or bill, percent or amount, conditions", res="201 · rule", screens="A-32", task="PRCE-04")
E("PUT", "/api/v1/discount-rules/{id}", "Change or archive a discount rule", "user", perm="price.edit", req="rule · If-Match", err="412", screens="A-32", task="PRCE-04")
E("GET", "/api/v1/discount-limits", "Discount and refund limits per role", "user", res="per role: highest discount, highest refund", screens="A-32", task="AUTZ-05")
E("PUT", "/api/v1/discount-limits", "Change the limits per role", "user", perm="user.manage (owner)",
  req="limits per role · If-Match", res="limits", notes="Registers get them through sync. Audited.", screens="A-32", task="AUTZ-05")

module("tax")
E("GET", "/api/v1/tax-rates", "List tax rates", "user", res="code, name, rate, validFrom", screens="A-66 A-21", task="TAXR-01")
E("POST", "/api/v1/tax-rates", "Add a tax rate", "user", perm="tenant.settings",
  req="code, name, rate, validFrom", res="201 · rate", notes="A rate with a future date reaches registers before it applies. Audited.", screens="A-66", task="TAXR-03")
E("PUT", "/api/v1/tax-rates/{id}", "Change a tax rate not used yet", "user", perm="tenant.settings",
  req="rate fields · If-Match", err="409 already used: add a new rate with a new validFrom instead", screens="A-66", task="TAXR-01")
E("GET", "/api/v1/tax-documents", "List tax invoices, credit and debit notes", "user", perm="tax.documents.view",
  req="?type, from, to, q, cursor", res="documents with number, buyer, totals", screens="A-65", task="TAXD-04")
E("GET", "/api/v1/tax-documents/{id}", "One tax document", "user", perm="tax.documents.view", screens="A-65", task="TAXD-04")
E("GET", "/api/v1/tax-documents/{id}/pdf", "Tax document as an A4 PDF", "user", perm="tax.documents.view",
  res="application/pdf", screens="A-65 A-51", task="TAXD-03")
E("POST", "/api/v1/sales/{id}/tax-invoice", "Issue a tax invoice for an earlier sale", "user", perm="tax.documents.issue",
  req="buyer name, buyer VAT number", res="201 · tax document", err="422 TAX-002 VAT number not valid · 409 already issued",
  notes="Uses the register's tax invoice series. Audited.", screens="A-51", task="TAXD-01")
E("POST", "/api/v1/tax-documents/{id}/debit-notes", "Issue a debit note", "user", perm="tax.documents.issue",
  req="lines, reason", res="201 · debit note", notes="Credit notes are issued automatically from returns. Audited.", screens="A-65", task="TAXD-02")

module("sync")
E("GET", "/sync/v1/snapshot", "Download link for the latest catalog snapshot", "device",
  req="?scope=catalog", res="signed URL (5 minutes) and the cursor", notes="Used on first start and after SYNC-003.", screens="sync", task="PULL-04")
E("GET", "/sync/v1/changes", "Change feed (pull)", "device",
  req="?scopes, cursor, limit", res="changes, nextCursor, hasMore", err="409 SYNC-003 cursor expired: download the snapshot again",
  notes="120 per minute per device.", screens="sync", task="PULL-05")
E("POST", "/sync/v1/push", "Send facts: sales, returns, cash events, customers, audit", "device",
  req="registerId, items [{kind, id, payload}], at most 50 items or 512 KB, gzip allowed",
  res="a result per item: ACCEPTED, ACCEPTED_WITH_EXCEPTION, DUPLICATE (SYNC-001), RETRY",
  err="426 DEV-004 app too old · 403 DEV-002",
  notes="Each item is its own transaction, in deviceSeq order. The item id is the idempotency key (INV-05). 60 per minute per device.",
  screens="sync", task="PUSH-01")
E("GET", "/sync/v1/receipt-sequence", "Next receipt numbers for this register", "device",
  res="next receipt and tax-invoice sequence", notes="For a replacement device, before it sells.", screens="R-01", task="PUSH-09")

module("inventory")
E("GET", "/api/v1/stock-locations", "List stock locations", "user", res="locations per branch", screens="A-40", task="STCK-01")
E("POST", "/api/v1/stock-locations", "Add a stock location", "user", perm="tenant.settings", req="branchId, name", res="201 · location", screens="A-40", task="STCK-01")
E("PUT", "/api/v1/stock-locations/{id}", "Rename or archive a stock location", "user", perm="tenant.settings", req="name, archived · If-Match", screens="A-40", task="STCK-01")
E("GET", "/api/v1/stock", "Stock on hand", "user",
  req="?branchId, locationId, skuId, q, lowOnly, cursor", res="balance per SKU and batch, with expiry", screens="A-40 R-18", task="STCK-05")
E("GET", "/api/v1/stock-movements", "The stock ledger", "user",
  req="?skuId, batchId, locationId, type, from, to, cursor", res="movements with reason, user and source document", screens="A-41", task="STCK-02")
E("GET", "/api/v1/batches", "List batches", "user",
  req="?skuId, expiringBefore, blocked, cursor", res="batch number, expiry, cost, on hand", screens="A-41 A-45", task="STCK-04")
E("GET", "/api/v1/batches/{id}", "One batch with its movements", "user", screens="A-41", task="STCK-04")
E("POST", "/api/v1/batches/{id}/block", "Block a batch (recall)", "user", perm="batch.block",
  req="reason", res="204", notes="Registers stop selling it at their next pull. Audited.", screens="A-41", task="STCK-04")
E("POST", "/api/v1/batches/{id}/unblock", "Unblock a batch", "user", perm="batch.block", req="reason", res="204", notes="Audited.", screens="A-41", task="STCK-04")
E("GET", "/api/v1/stock/adjustments", "List stock adjustments", "user", req="?from, to, reason, cursor", screens="A-43", task="STCK-07")
E("POST", "/api/v1/stock/adjustments", "Adjust stock with a reason", "user", perm="stock.adjust",
  req="lines [{skuId, batchId, locationId, qty in or out}], reasonCode, note, approval? · Idempotency-Key",
  res="201 · adjustment and its movements", err="403 above your limit without approval · 409 INV-004 not enough stock (strict mode)",
  notes="Changes stock only through movements (INV-04). Audited.", screens="A-43", task="STCK-07")
E("POST", "/api/v1/stock-counts", "Start a stock count", "user", perm="stock.adjust",
  req="locationId, scope (all, category, list)", res="201 · count", screens="A-44", task="STCK-08")
E("GET", "/api/v1/stock-counts", "List stock counts", "user", req="?status, cursor", screens="A-44", task="STCK-08")
E("GET", "/api/v1/stock-counts/{id}", "One count with its lines", "user",
  notes="Blind: expected quantities stay hidden until the count is posted.", screens="A-44", task="STCK-08")
E("POST", "/api/v1/stock-counts/{id}/lines", "Enter counted quantities", "user", perm="stock.receive",
  req="[{skuId, batchId, countedQty}]", res="saved lines", err="409 count already posted", screens="A-44", task="STCK-08")
E("POST", "/api/v1/stock-counts/{id}/post", "Post a count", "user", perm="stock.adjust",
  req="Idempotency-Key", res="differences and the adjustment movements", err="409 already posted", notes="Audited.", screens="A-44", task="STCK-08")
E("GET", "/api/v1/stock-exceptions", "Receiving and stock exceptions", "user", req="?status=OPEN, cursor", screens="A-53", task="RECV-05")
E("POST", "/api/v1/stock-exceptions/{id}/resolve", "Resolve a stock exception with a note", "user", perm="exception.resolve",
  req="note", res="204", notes="Audited.", screens="A-53", task="RECV-05")

module("purchasing")
E("GET", "/api/v1/suppliers", "List suppliers", "user", req="?q, cursor", screens="A-48 A-42", task="RECV-01")
E("POST", "/api/v1/suppliers", "Add a supplier", "user", perm="stock.receive",
  req="name, phone, address, VAT number", res="201 · supplier", screens="A-48", task="RECV-01")
E("PUT", "/api/v1/suppliers/{id}", "Update a supplier", "user", perm="stock.receive", req="supplier fields · If-Match", err="412", screens="A-48", task="RECV-01")
E("POST", "/api/v1/suppliers/{id}/archive", "Archive a supplier", "user", perm="stock.receive", res="204", screens="A-48", task="RECV-01")
E("GET", "/api/v1/goods-receipts", "List goods receipts", "user", req="?status, supplierId, from, to, cursor", screens="A-42", task="RECV-02")
E("POST", "/api/v1/goods-receipts", "Start a goods receipt (draft)", "user", perm="stock.receive",
  req="supplierId, locationId, supplier invoice no, lines [{skuId, qty, unitId, cost, batchNo, expiry}]", res="201 · draft",
  notes="A GS1 scan fills the batch and expiry on the client.", screens="A-42 R-17", task="RECV-02")
E("GET", "/api/v1/goods-receipts/{id}", "One goods receipt", "user", res="receipt · ETag", screens="A-42", task="RECV-02")
E("PUT", "/api/v1/goods-receipts/{id}", "Change a draft goods receipt", "user", perm="stock.receive",
  req="receipt · If-Match", err="409 already posted · 412", screens="A-42 R-17", task="RECV-02")
E("POST", "/api/v1/goods-receipts/{id}/post", "Post a goods receipt", "user", perm="stock.receive",
  req="Idempotency-Key", res="the batches and movements created", err="409 already posted",
  notes="Read-only after posting. Publishes GoodsReceived. Price or quantity mismatches become stock exceptions.",
  screens="A-42 R-17", task="RECV-03")
E("GET", "/api/v1/goods-receipts/{id}/pdf", "Goods received note (D-06)", "user", res="application/pdf", screens="A-42", task="RECV-06")

module("sales")
E("GET", "/api/v1/sales", "Sales history", "user",
  req="?branchId, registerId, cashierId, from, to, q, cursor", res="sales with totals and payment types",
  notes="A date range keeps large shops fast.", screens="A-50 R-14", task="SELL-08")
E("GET", "/api/v1/sales/{id}", "Sale detail", "user",
  res="lines with their snapshots, batch allocations, payments, tax documents, exceptions", screens="A-51", task="SELL-08")
E("GET", "/api/v1/sales/by-receipt/{receiptNo}", "Find a sale by its receipt number", "user",
  res="sale with what can still be returned", err="404 unknown receipt", notes="For returns at another register or branch.", screens="R-13 A-52", task="RTRN-05")
E("GET", "/api/v1/sale-exceptions", "Sale exception queue", "user", perm="exception.resolve",
  req="?status=OPEN, type, branchId, cursor", res="NEGATIVE_STOCK, PRICE_MISMATCH, EXPIRED_BATCH_SOLD, CLOCK_SKEW, RECEIPT_COLLISION",
  screens="A-53", task="SELL-06")
E("POST", "/api/v1/sale-exceptions/{id}/resolve", "Resolve a sale exception with a note", "user", perm="exception.resolve",
  req="note", res="204", notes="The sale itself never changes (INV-02). Audited.", screens="A-53", task="SELL-06")
E("GET", "/api/v1/returns", "List returns", "user", req="?branchId, from, to, cursor", screens="A-52", task="RTRN-01")
E("GET", "/api/v1/returns/{id}", "Return detail with its refund and credit note", "user", screens="A-52", task="RTRN-01")

module("payments")
E("GET", "/api/v1/tender-types", "Payment types", "user", res="cash, card, bank transfer, QR, customer credit, with on/off", screens="A-84", task="PAYM-01")
E("PUT", "/api/v1/tender-types/{id}", "Turn a payment type on or off", "user", perm="tenant.settings",
  req="enabled, name · If-Match", notes="Registers get the change through sync.", screens="A-84", task="PAYM-01")

module("cash")
E("GET", "/api/v1/cash-sessions", "List shifts", "user", perm="shift.review_variance",
  req="?branchId, registerId, status, from, to, cursor", res="shifts with expected, counted and variance", screens="A-55", task="CASH-04")
E("GET", "/api/v1/cash-sessions/{id}", "Shift detail", "user", perm="shift.review_variance",
  res="opening float, cash movements, count by note and coin, expected vs counted", screens="A-55", task="CASH-04")
E("GET", "/api/v1/cash-sessions/{id}/z-report", "Z-report for a shift (D-04)", "user", perm="shift.review_variance",
  req="?format=json|pdf", res="Z-report data or PDF", screens="A-55 R-16", task="CASH-03")
E("POST", "/api/v1/cash-sessions/{id}/review", "Approve a shift's variance", "user", perm="shift.review_variance",
  req="note", res="204", err="409 shift still open", notes="Audited.", screens="A-55", task="CASH-04")

module("customers")
E("GET", "/api/v1/customers", "Find customers", "user", req="?q (name or phone), cursor", res="customers with credit balance", screens="A-60 R-09", task="CUST-01")
E("POST", "/api/v1/customers", "Add a customer", "user", perm="customer.edit",
  req="name, phone, email?", res="201 · customer", err="409 phone already used", screens="A-60", task="CUST-01")
E("GET", "/api/v1/customers/{id}", "One customer", "user", res="profile and credit summary · ETag", screens="A-61", task="CUST-01")
E("PUT", "/api/v1/customers/{id}", "Update a customer", "user", perm="customer.edit", req="customer fields · If-Match", err="412", screens="A-61", task="CUST-01")
E("POST", "/api/v1/customers/merge", "Merge two customer records", "user", perm="customer.edit",
  req="keepId, mergeId", res="the kept customer", notes="Moves sales and credit to the kept record. Audited.", screens="A-61", task="CUST-02")
E("GET", "/api/v1/customers/{id}/credit", "Credit account and ledger", "user", perm="customer.credit.manage",
  req="?from, to, cursor", res="limit, balance, ledger entries", screens="A-61", task="CUST-03")
E("PUT", "/api/v1/customers/{id}/credit-account", "Set a credit limit or status", "user", perm="customer.credit.manage",
  req="limit, status · If-Match", notes="Registers get the limit through sync. Audited.", screens="A-61", task="CUST-03")
E("POST", "/api/v1/customers/{id}/credit-payments", "Record a credit settlement", "user", perm="customer.credit.manage",
  req="amount, tender, reference · Idempotency-Key", res="201 · new balance", err="422 more than the balance owed",
  notes="Writes to the append-only credit ledger. Audited.", screens="A-61", task="CUST-04")
E("GET", "/api/v1/customers/{id}/statement", "Customer statement PDF (D-05)", "user", perm="customer.credit.manage",
  req="?from, to", res="application/pdf", screens="A-61", task="CUST-06")

module("reporting")
E("GET", "/api/v1/dashboard", "Dashboard figures", "user", perm="report.view",
  req="?branchId, date", res="sales today, top products, low stock, open exceptions, shift variances", screens="A-10", task="REPT-08")
E("GET", "/api/v1/reports/{reportKey}", "Run a report", "user", perm="report.view",
  req="key: daily-sales, stock-valuation, expiry, vat, credit-ageing, profit · branchId, from, to", res="rows and totals",
  err="403 AUTH-003: profit needs report.view_profit, vat needs tax.documents.view", screens="A-70 A-67", task="REPT-01")
E("POST", "/api/v1/exports", "Start a CSV or Excel export", "user", perm="report.view",
  req="type, format, parameters", res="202 · exportId", err="429 too many jobs (5 per shop)",
  notes="Audited. Phone numbers and e-mails are masked without permission.", screens="A-70", task="REPT-02")
E("GET", "/api/v1/exports/{id}", "Export progress and download link", "user", perm="report.view",
  res="status; a signed download URL (5 minutes) when ready", screens="A-70", task="REPT-02")

module("platform")
E("GET", "/api/v1/platform/tenants", "List shops", "support", req="?q, status, cursor", res="shops with plan, health, device count", screens="P-01", task="SUPP-03")
E("GET", "/api/v1/platform/tenants/{id}", "One shop's health", "support",
  res="devices, sync lag, recent errors; no shop data without approved access", screens="P-02", task="SUPP-03")
E("POST", "/api/v1/platform/tenants/{id}/suspend", "Suspend a shop", "support", req="reason", res="204", notes="Its users get TEN-001. Audited.", screens="P-02", task="SUPP-05")
E("POST", "/api/v1/platform/tenants/{id}/reactivate", "Reactivate a shop", "support", req="reason", res="204", notes="Audited.", screens="P-02", task="SUPP-05")
E("GET", "/api/v1/platform/devices", "Register fleet", "support", req="?tenantId, status, version, cursor", screens="P-03", task="SUPP-03")
E("POST", "/api/v1/platform/devices/{id}/commands", "Send a command to a register", "support",
  req="type: resync, upload-logs or lock", res="202", notes="Delivered in the next heartbeat response. Audited.", screens="P-04", task="SUPP-04")
E("POST", "/api/v1/platform/access-requests", "Ask a shop for support access", "support",
  req="tenantId, reason", res="201 · request waiting for the owner", screens="P-05", task="SUPP-02")
E("GET", "/api/v1/support-access", "Support access requests for my shop", "user", perm="tenant.settings",
  res="requests and any active access", screens="A-80", task="SUPP-02")
E("POST", "/api/v1/support-access/{id}/approve", "Allow support access for 4 hours", "user", perm="tenant.settings",
  res="204", notes="The shop sees a banner while access is active. Audited.", screens="A-80", task="SUPP-02")
E("POST", "/api/v1/support-access/{id}/end", "End support access now", "user", perm="tenant.settings", res="204", notes="Audited.", screens="A-80", task="SUPP-02")


# ==============================================================================================
def ep_id(e):
    return "ep-" + e["method"].lower() + "-" + re.sub(r"[^a-z0-9]+", "-", e["path"].lower().replace("{", "").replace("}", "")).strip("-")


def by_task():
    out = {}
    for e in ENDPOINTS:
        out.setdefault(e["task"], []).append(e)
    return out


def fmt(text):
    out = esc(text)
    out = re.sub(r"\b((?:INV|BR)-\d{2})\b", r'<span class="inv">\1</span>', out)
    out = re.sub(r"\b([A-Z]{2,5}-\d{3})\b", r"<code>\1</code>", out)
    return out


def check(tasks):
    seen = set()
    for e in ENDPOINTS:
        key = (e["method"], e["path"])
        assert key not in seen, f"duplicate endpoint {key}"
        seen.add(key)
        assert e["method"] in METHODS, e
        assert e["path"].startswith(("/api/v1/", "/sync/v1/")), e["path"]
        assert e["access"] in ACCESS, e
        assert e["status"] in STATUS, e
        assert e["task"] in tasks, f"{e['method']} {e['path']}: unknown build order task {e['task']}"
        for s in e["screens"].split():
            assert s == "sync" or s in SCREENS, f"unknown screen {s}"


def build(tasks):
    check(tasks)
    n = len(ENDPOINTS)
    counts = {s: sum(1 for e in ENDPOINTS if e["status"] == s) for s in STATUS}
    new_perms = sorted({e["perm"].replace(" (new)", "") for e in ENDPOINTS if "(new)" in e["perm"]})
    rows = []
    for key, (title, pkg, grp, intro) in MODULES.items():
        es = [e for e in ENDPOINTS if e["module"] == key]
        built = sum(1 for e in es if e["status"] == "built")
        rows.append(f'<tr><td><span class="dd-dot {grp}"></span><a href="#m-{key}">{esc(title)}</a></td><td><code>{pkg}</code></td>'
                    f'<td class="bp-num">{len(es)}</td><td class="bp-num">{built}</td></tr>')
    body = [f'''<h2 id="modules-list">Endpoints by module</h2>
<table class="ep-sum"><thead><tr><th>Module</th><th>Package</th><th>Endpoints</th><th>Built</th></tr></thead>
<tbody>{"".join(rows)}<tr class="ep-total"><td><strong>Total</strong></td><td></td><td class="bp-num"><strong>{n}</strong></td><td class="bp-num"><strong>{counts["built"]}</strong></td></tr></tbody></table>''']

    for key, (title, pkg, grp, intro) in MODULES.items():
        es = [e for e in ENDPOINTS if e["module"] == key]
        body.append(f'<section class="ep-mod" data-mod="{key}">\n<h2 id="m-{key}"><span class="dd-dot {grp}"></span>{esc(title)} '
                    f'<span class="ep-count">{len(es)}</span></h2>\n<p class="ep-intro">{fmt(intro)} Package <code>{pkg}</code>.</p>')
        for e in es:
            task = tasks[e["task"]]
            perm = e["perm"]
            perm_html = ""
            if perm:
                is_new = "(new)" in perm
                perm_html = f'<span class="ep-perm{" new" if is_new else ""}">{esc(perm.replace(" (new)", ""))}{" · new" if is_new else ""}</span>'
            details = []
            for label, val in (("Request", e["req"]), ("Response", e["res"]), ("Errors", e["err"]), ("Notes", e["notes"])):
                if val:
                    details.append(f"<dt>{label}</dt><dd>{fmt(val)}</dd>")
            access = ACCESS[e["access"]] + (f" · <code>{esc(perm.replace(' (new)', ''))}</code>" + (" (new permission)" if "(new)" in perm else "") if perm else "")
            details.insert(0, f"<dt>Who can call it</dt><dd>{access}</dd>")
            if e["screens"]:
                sc = []
                for s in e["screens"].split():
                    if s == "sync":
                        sc.append("Register app (background sync)")
                    else:
                        name, route = SCREENS[s]
                        sc.append(f'<a href="prototype/index.html#{route}" target="_blank" rel="noopener">{s} {esc(name)} ↗</a>')
                details.append(f"<dt>Used by</dt><dd>{' · '.join(sc)}</dd>")
            details.append(f'<dt>Build task</dt><dd><a href="build-order.html#{e["task"].lower()}"><code>{e["task"]}</code> {esc(task["title"])}</a> · phase {task["phase"]}</dd>')
            m = e["method"].lower()
            body.append(
                f'<details class="ep" id="{ep_id(e)}" data-status="{e["status"]}" data-method="{e["method"]}">'
                f'<summary><span class="ep-m {m}">{e["method"]}</span><code class="ep-p">{esc(e["path"])}</code>'
                f'<span class="ep-s">{esc(e["summary"])}</span><span class="ep-meta">{perm_html}'
                f'<span class="ep-st {e["status"]}">{STATUS[e["status"]]}</span></span></summary>'
                f'<dl class="ep-d">{"".join(details)}</dl></details>')
        body.append("</section>")

    new_perm_box = ""
    if new_perms:
        new_perm_box = ('<div class="callout warn"><span class="ct">Permissions to add to the matrix</span>'
                        f'These endpoints need permissions that aren\'t in the <a href="security.html#rbac">permission matrix</a> yet: '
                        + ", ".join(f"<code>{p}</code>" for p in new_perms)
                        + '. Add them there (with which roles get them), then remove “(new)” here.</div>')

    script = """<script>
(function () {
  var eps = Array.prototype.slice.call(document.querySelectorAll("details.ep"));
  var q = document.getElementById("ep-q"), st = document.getElementById("ep-status"), me = document.getElementById("ep-method");
  function apply() {
    var t = q.value.trim().toLowerCase(), s = st.value, m = me.value, shown = 0;
    eps.forEach(function (d) {
      var ok = (!s || d.dataset.status === s) && (!m || d.dataset.method === m) && (!t || d.textContent.toLowerCase().indexOf(t) >= 0);
      d.hidden = !ok; if (ok) shown++;
      if (t && ok) d.open = true;
    });
    document.querySelectorAll(".ep-mod").forEach(function (sec) {
      sec.hidden = !sec.querySelector("details.ep:not([hidden])");
    });
    document.getElementById("ep-shown").textContent = shown + " shown";
  }
  [q, st, me].forEach(function (el) { el.addEventListener(el === q ? "input" : "change", apply); });
  document.getElementById("ep-open").addEventListener("click", function () { eps.forEach(function (d) { if (!d.hidden) d.open = true; }); });
  document.getElementById("ep-close").addEventListener("click", function () { eps.forEach(function (d) { d.open = false; }); });
  function openHash() { if (!location.hash) return; var d = document.getElementById(location.hash.slice(1)); if (d && d.tagName === "DETAILS") { d.open = true; d.scrollIntoView(); } }
  window.addEventListener("hashchange", openHash);
  apply();
  openHash();
})();
</script>"""

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>API endpoints · RetailOS</title>
<meta name="description" content="Every RetailOS backend endpoint, grouped by module: who can call it, request, response, errors, the screens that use it, its build task and whether it is built.">
<link rel="stylesheet" href="assets/site.css">
<script>try{{var t=localStorage.getItem("retailos-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
</head>
<body>
<header id="topbar"></header>
<div class="layout">
<nav id="sidebar"></nav>
<main class="content"><article>
<!-- Generated by tools/build_endpoints.py. Edit the script, not this file. -->

<h1>API endpoints</h1>
<p class="lead">Every backend endpoint for the MVP, grouped by the module that owns it: {n} endpoints in {len(MODULES)} modules. Open an endpoint to see who can call it, what it takes and returns, its errors, the screens that use it and its build task. {counts["built"]} built, {counts["building"]} being built, {counts["planned"]} planned.</p>

<div class="callout tip"><span class="ct">Keep this page up to date</span>
<ul>
<li>When you <strong>start</strong> an endpoint, set its <code>status="building"</code>; when it is merged and works on staging, <code>status="built"</code>.</li>
<li>When you <strong>add, change or remove</strong> an endpoint, change its line in <code>tools/build_endpoints.py</code> in the same pull request as the code.</li>
<li>Then run <code>python tools/build_endpoints.py</code>. It rebuilds this page and the <a href="build-order.html">build order</a> (which links each task to its endpoints), and stops if a task or screen code is wrong.</li>
<li>Once the backend exists, a CI test compares this list with the generated <code>openapi.json</code>, so the two can't drift apart (<a href="build-order.html#core-15">CORE-15</a>).</li>
</ul></div>

<h2 id="rules">Rules for every endpoint</h2>
<table>
<thead><tr><th>Topic</th><th>Rule</th></tr></thead>
<tbody>
<tr><td>Base paths</td><td><code>/api/v1</code> for the admin app and online register calls, <code>/sync/v1</code> for register sync (device token only).</td></tr>
<tr><td>Tenant</td><td>Always taken from the token, never from the path or body. No endpoint has a <code>tenantId</code> parameter (<a href="security.html#tenant-isolation">tenant isolation</a>).</td></tr>
<tr><td>Errors on every signed-in endpoint</td><td>401 <code>AUTH-001</code> (no or expired token), 403 <code>AUTH-003</code> (missing permission), 403 <code>TEN-001</code> (shop suspended), 400 <code>VAL-001</code> (invalid input), 429 (rate limit). The list under each endpoint shows only the errors special to it. Format: <a href="api.html#errors">Problem Details</a>.</td></tr>
<tr><td>Money and quantities</td><td>Strings with 4 decimals, e.g. <code>"320.0000"</code> (<span class="inv">INV-03</span>). Ids are UUIDv7. Times are UTC ISO-8601.</td></tr>
<tr><td>Lists</td><td>Cursor paging: <code>?limit=50&amp;cursor=…</code> returns <code>nextCursor</code>.</td></tr>
<tr><td>Updates</td><td><code>PUT</code> needs <code>If-Match</code> with the <code>ETag</code> from the last read; a mismatch is 412.</td></tr>
<tr><td>Retries</td><td><code>POST</code>s that create money or stock records take an <code>Idempotency-Key</code>. Sync push uses each item's id instead.</td></tr>
<tr><td>Headers</td><td>See <a href="api.html#headers">standard headers</a>; the path a request takes through the filters is in the <a href="security.html#request-pipeline">request pipeline</a>.</td></tr>
</tbody>
</table>

{new_perm_box}

<div class="ep-tools">
<input id="ep-q" type="search" placeholder="Filter (e.g. /stock, credit, A-61, AUTN)" aria-label="Filter endpoints">
<label class="bp-sel">Method <select id="ep-method"><option value="">All</option>{''.join(f'<option>{m}</option>' for m in METHODS)}</select></label>
<label class="bp-sel">Status <select id="ep-status"><option value="">All</option>{''.join(f'<option value="{k}">{v}</option>' for k, v in STATUS.items())}</select></label>
<button type="button" id="ep-open">Open all</button><button type="button" id="ep-close">Close all</button>
<span id="ep-shown" class="ep-shown"></span>
</div>

{chr(10).join(body)}

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
    import build_order                       # the build order's tasks (for task titles, phases and checks)
    tasks = {t[0]: {"title": t[1], "phase": t[4] or c[2].split("–")[0]} for _, c, t in build_order.all_tasks()}
    (DOC / "endpoints.html").write_text(build(tasks), encoding="utf-8")
    (DOC / "build-order.html").write_text(build_order.build(), encoding="utf-8")
    print(f"endpoints.html written: {len(ENDPOINTS)} endpoints in {len(MODULES)} modules; build-order.html refreshed")
