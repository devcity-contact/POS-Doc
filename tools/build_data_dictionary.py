"""Build data-dictionary.html: every MVP table explained one by one, with its relationships.

Usage:  python Doc/tools/build_data_dictionary.py
The area and order of tables come from build_db_map.py (TABLES), so the dictionary and the diagram
always list the same tables. Relationship sentences are worked out from the column references below.

Column tuple: (name, type, meaning, ref). ref is the table the column points to:
  "branch"   many rows here point to one branch row (required)
  "branch?"  as above, but the column may be empty (optional)
  "batch="   one-to-one: each row here belongs to exactly one batch row, and that row has at most one here
"""
import html
import importlib.util
import pathlib
import re

DOC = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("dbmap", DOC / "tools" / "build_db_map.py")
dbmap = importlib.util.module_from_spec(spec); spec.loader.exec_module(dbmap)
AREA_OF = {n: v[0] for n, v in dbmap.TABLES.items()}

U, T, M, Q, TS, D, B, J = "uuid", "text", "numeric(19,4)", "numeric(14,3)", "timestamptz", "date", "boolean", "jsonb"

AREAS = {
    "st": ("1 · Store &amp; staff", "Who the business is, where it sells, who works there, which devices are allowed, every shift, and the audit trail. Everything else points back to these tables, so they are created first (migration <code>V1__store_and_staff.sql</code>, roadmap P1)."),
    "ca": ("2 · Catalog", "What the shop sells and at what price: products and their variants, barcodes, units, categories, brands, price lists, tax rates and discount limits. Created second (<code>V2__catalog.sql</code>, roadmap P2)."),
    "in": ("3 · Inventory", "Where stock comes from and how much is left: suppliers and goods receipts, batches with expiry dates, the movement ledger, balances, counts and exceptions. Created third (<code>V3__inventory.sql</code>, roadmap P3)."),
    "sa": ("4 · Sales", "What happened at the till: sales and their lines, which batches they used, payments, returns, held bills, customers and credit, and tax documents. Created last because it points to all the others (<code>V4__sales.sql</code>, roadmap P4–P5)."),
}

DICT = {
    # ---------------- 1 Store & staff ----------------
    "tenant": dict(p="One customer business of RetailOS, for example City Pharmacy &amp; Mart. Every other table carries this tenant's id, and row-level security uses it to keep businesses apart.",
        c=[("id", U, "Primary key.", None), ("name", T, "Legal business name, printed on tax documents.", None), ("vat_number", T, "VAT registration number, e.g. 114128890-7000.", None),
           ("status", T, "ACTIVE, TRIAL or SUSPENDED.", None), ("plan", T, "Subscription plan, which limits branches and registers.", None), ("timezone", T, "Asia/Colombo; used to work out each sale's business date.", None)],
        r=["INV-01: every tenant table has tenant_id and a row-level security policy.", "A suspended tenant's registers keep selling for 14 days, then become read-only."], s="A-05, A-80, P-01, P-02"),
    "tenant_module": dict(p="Which optional modules a tenant has switched on, such as pharmacy or grocery (both R2).",
        c=[("tenant_id", U, "The business.", "tenant"), ("module_key", T, "PHARMACY, GROCERY …", None), ("enabled", B, "On or off.", None)], r=["Extensions read this before showing their screens or rules."], s="A-85 (R2), P-02"),
    "branch": dict(p="A shop location. Stock, registers and prices can differ per branch.",
        c=[("id", U, "Primary key.", None), ("tenant_id", U, "The business.", "tenant"), ("code", T, "Short code such as CMB01. Part of every receipt number, so it never changes.", None), ("name", T, "Branch name.", None), ("address", T, "Printed on receipts.", None)],
        r=["INV-06: the code is part of receipt numbers, so it cannot be edited after the first sale."], s="A-81, A-05"),
    "register": dict(p="One till at a branch. Receipt numbers are counted per register.",
        c=[("id", U, "Primary key.", None), ("branch_id", U, "Where the till is.", "branch"), ("code", T, "Such as R02.", None), ("last_receipt_seq", "bigint", "Last receipt number the server has seen from this register.", None)],
        r=["INV-06 and BR-10: receipt numbers are gap-free per register."], s="A-81, A-83, R-01"),
    "app_user": dict(p="A person who signs in: owner, manager, cashier, stock keeper, pharmacist or accountant.",
        c=[("id", U, "Primary key.", None), ("tenant_id", U, "The business.", "tenant"), ("email", T, "Back-office login (managers, owner, accountant).", None), ("password_hash", T, "Never the password itself.", None),
           ("pin_hash", T, "Register PIN, hashed. Checked on the register so sign-in works offline.", None), ("mfa_enabled", B, "Two-step sign-in; always on for the owner.", None)],
        r=["Turning an account off signs the person out everywhere.", "Five wrong PINs lock that person on that register for 5 minutes."], s="R-02, A-01–A-03, A-82, A-90"),
    "user_role": dict(p="Gives a person a role, optionally limited to one branch.",
        c=[("user_id", U, "The person.", "app_user"), ("role_id", U, "The role.", "role"), ("branch_id", U, "Empty means all branches.", "branch?")],
        r=["A manager of branch A cannot approve anything in branch B."], s="A-82"),
    "role": dict(p="A named bundle of permissions: the built-in Owner, Manager, Cashier, Stock keeper, Pharmacist, Accountant, or a custom copy.",
        c=[("id", U, "Primary key.", None), ("name", T, "Role name.", None), ("builtin", B, "Built-in roles cannot be edited, only copied.", None)], r=[], s="A-82"),
    "role_permission": dict(p="The permissions in a role, such as <code>sale.discount.override</code> or <code>stock.adjust</code>.",
        c=[("role_id", U, "The role.", "role"), ("permission", T, "Permission key from the permission matrix.", None)], r=["Checked on the server for every request and on the register for offline actions."], s="A-82"),
    "refresh_token": dict(p="Long-lived sign-in tokens for the back office. Each use replaces the token; reuse of an old one revokes the whole family.",
        c=[("id", U, "Primary key.", None), ("user_id", U, "Whose token.", "app_user"), ("family_id", U, "All tokens issued from one sign-in.", None), ("expires_at", TS, "End of life.", None), ("revoked_at", TS, "Set on sign-out or theft detection.", None)],
        r=["Signing out everywhere revokes every family of the user."], s="A-01, A-90"),
    "cash_session": dict(p="A shift: one cashier on one register from opening to closing, with the cash expected and counted.",
        c=[("id", U, "Primary key.", None), ("register_id", U, "The till.", "register"), ("opened_by", U, "The cashier.", "app_user"), ("opening_float", M, "Cash counted at the start.", None),
           ("counted_cash", M, "Blind count at closing.", None), ("expected_cash", M, "Float + cash sales − refunds ± cash in/out.", None), ("status", T, "OPEN, CLOSED, APPROVED, RECOUNT.", None)],
        r=["BR-08: a register cannot sell without an open shift, and only one shift per register is open.", "A difference above Rs 500 needs a manager's approval."], s="R-03, R-15, R-16, A-55"),
    "cash_movement": dict(p="Cash put into or taken out of the drawer during a shift without a sale: petty cash, float top-up, safe drop.",
        c=[("id", U, "Primary key.", None), ("cash_session_id", U, "The shift.", "cash_session"), ("kind", T, "IN, OUT or SAFE_DROP.", None), ("amount", M, "Always positive; kind gives the direction.", None), ("reason", T, "Required.", None), ("approved_by", U, "Manager, when over the limit.", "app_user?")],
        r=["Cash out above Rs 2,000 or any safe drop needs a manager PIN."], s="R-15, A-55"),
    "cash_count": dict(p="The closing count by note and coin, so a manager can see how the total was reached.",
        c=[("cash_session_id", U, "The shift.", "cash_session"), ("denomination", M, "Rs 5,000 … Rs 20, or coins.", None), ("qty", "int", "How many.", None)], r=["Written once at closing; never edited."], s="R-16"),
    "device": dict(p="A Windows PC or Android tablet that has been enrolled as a register.",
        c=[("id", U, "Primary key.", None), ("register_id", U, "The register it runs.", "register="), ("platform", T, "WINDOWS or ANDROID.", None), ("app_version", T, "For updates and support.", None),
           ("public_key", T, "Signs the device's requests.", None), ("last_seen_at", TS, "Last heartbeat.", None)],
        r=["A locked device stops selling at its next contact.", "The server supports the current and previous app version (INV-13)."], s="R-01, A-83, P-03, P-04"),
    "device_enrollment": dict(p="A one-time code that lets a new device become a register.",
        c=[("id", U, "Primary key.", None), ("register_id", U, "The register it will become.", "register"), ("code_hash", T, "The code itself is never stored.", None), ("expires_at", TS, "24 hours after creation.", None), ("used_at", TS, "Set once; the code cannot be reused.", None)],
        r=[], s="A-81, R-01"),
    "device_heartbeat": dict(p="A short status report each register sends every minute while online.",
        c=[("device_id", U, "Which device.", "device"), ("at", TS, "When.", None), ("queue_depth", "int", "Sales waiting to be sent.", None), ("printer_status", T, "OK, PAPER_LOW, OFFLINE.", None)],
        r=["Kept for a short time only; the device row holds the latest values."], s="A-83, P-03"),
    "audit_log": dict(p="The append-only record of every action on money, stock, prices, staff and settings.",
        c=[("seq", "bigint", "Order of entries.", None), ("actor_id", U, "Who did it (empty for the system).", "app_user?"), ("action", T, "What was done.", None), ("entity", T, "Kind of record, e.g. sale, product.", None),
           ("entity_id", U, "Which record.", None), ("before", J, "Values before a change.", None), ("after", J, "Values after.", None), ("prev_hash", "bytea", "Hash of the previous entry.", None), ("hash", "bytea", "Hash of this entry.", None)],
        r=["INV-09: append-only and hash-chained; a removed or edited entry breaks the chain."], s="A-87, P-05"),
    "sync_change_log": dict(p="The ordered feed of changes the registers pull: products, prices, batches, staff, taxes, settings.",
        c=[("seq", "bigint", "Order of changes; registers remember the last one they have.", None), ("branch_id", U, "Empty means all branches.", "branch?"), ("scope", T, "catalog, prices, batches, staff …", None),
           ("entity", T, "Kind of record.", None), ("entity_id", U, "Which record.", None), ("op", T, "UPSERT or DELETE.", None), ("payload", J, "The new values; empty for DELETE.", None)],
        r=["INV-12: for master data the server wins."], s="R-19 (sync status)"),
    "sync_cursor": dict(p="How far each device has read the change feed, per scope.",
        c=[("device_id", U, "Which device.", "device"), ("scope", T, "Which part of the feed.", None), ("last_seq", "bigint", "Last change received.", None)], r=[], s="R-19, P-04"),
    "sync_inbox": dict(p="One row for every sale, return or cash event a register sends, keyed by the id the register created. If the same item arrives twice, the stored reply is returned and nothing is counted twice.",
        c=[("client_id", U, "Id made on the register, e.g. the sale id.", None), ("register_id", U, "Who sent it.", "register"), ("kind", T, "SALE, RETURN, CASH_EVENT …", None), ("result", J, "Reply stored for replays.", None)],
        r=["INV-05: register-created facts carry a client UUID that is the idempotency key."], s="R-14, P-04"),
    "catalog_snapshot": dict(p="A packed copy of a branch's catalog, prices and batches. A new register downloads it first, then follows the change feed.",
        c=[("id", U, "Primary key.", None), ("branch_id", U, "Which branch.", "branch"), ("cursor", "bigint", "The change-feed position it includes.", None), ("file_url", T, "Signed link in object storage.", None)],
        r=["Rebuilt after large imports (over 5,000 changed rows)."], s="R-01"),
    # ---------------- 2 Catalog ----------------
    "brand": dict(p="Who makes a product, for filters and reports.", c=[("id", U, "Primary key.", None), ("name", T, "Brand name.", None)], r=["A brand with products cannot be deleted."], s="A-22"),
    "category": dict(p="Groups products, including subcategories. The order and colour drive the category buttons on the register.",
        c=[("id", U, "Primary key.", None), ("parent_id", U, "Parent category; empty for top level.", "category?"), ("name", T, "Category name.", None), ("sort_order", "int", "Order on the register.", None), ("colour", T, "Quick-key colour.", None)],
        r=["A category with products cannot be deleted."], s="A-22, R-04"),
    "tax_rate": dict(p="A tax rate with the dates it is valid, such as VAT 18% from 1 January 2024.",
        c=[("id", U, "Primary key.", None), ("name", T, "VAT standard, VAT exempt …", None), ("rate", "numeric(7,4)", "18.0000 or 0.", None), ("valid_from", D, "First day.", None), ("valid_to", D, "Last day; empty while current.", None)],
        r=["BR-11: rates are rules with dates, never hard-coded.", "Past rates cannot be edited; sale lines keep the rate they used (INV-10)."], s="A-66"),
    "product": dict(p="Something the shop sells, such as Paracetamol 500mg. The sellable versions of it are SKUs.",
        c=[("id", U, "Primary key.", None), ("category_id", U, "Category.", "category"), ("brand_id", U, "Brand; empty for none.", "brand?"), ("name", T, "Name in English.", None), ("name_si", T, "Name in Sinhala.", None), ("name_ta", T, "Name in Tamil.", None),
           ("batch_tracked", B, "Whether stock is kept per batch with expiry.", None), ("tax_rate_id", U, "Its tax class.", "tax_rate"), ("attributes", J, "Display-only extras.", None)],
        r=["Archived, never deleted, once it has been sold."], s="A-20, A-21, A-23, R-05"),
    "unit": dict(p="A unit of measure: piece, strip, kilogram, and pack units such as box or case.",
        c=[("id", U, "Primary key.", None), ("name", T, "Piece, Strip, Kilogram …", None), ("symbol", T, "pcs, kg …", None), ("decimals", "int", "0 for counts, 3 for weights.", None)],
        r=["A unit in use cannot be deleted or switched between count and weight."], s="A-24"),
    "sku": dict(p="A sellable variant of a product (size, strength, colour). Stock, prices and barcodes hang off the SKU.",
        c=[("id", U, "Primary key.", None), ("product_id", U, "The product.", "product"), ("sku_code", T, "Shop's own code, e.g. MP-400.", None), ("variant_label", T, "400 g, 500 ml, Red …", None), ("base_unit_id", U, "The unit stock is counted in.", "unit"), ("reorder_level", Q, "Low-stock alert level.", None)],
        r=["Stock is always kept in the base unit."], s="A-21, R-05, R-18"),
    "unit_conversion": dict(p="How many base units are in a pack for one SKU, e.g. 1 box = 10 strips.",
        c=[("sku_id", U, "The SKU.", "sku"), ("unit_id", U, "The pack unit.", "unit"), ("factor", Q, "Base units in one pack.", None)], r=["Receiving converts packs to base units before stock moves."], s="A-24, R-17"),
    "barcode": dict(p="A code that finds an SKU when scanned: EAN-13, a GS1 DataMatrix, a scale PLU or an internal code.",
        c=[("id", U, "Primary key.", None), ("sku_id", U, "What it finds.", "sku"), ("code", T, "Unique per tenant.", None), ("type", T, "EAN13, GS1_DM, PLU, INTERNAL.", None), ("unit_id", U, "Set when the barcode is on a pack, e.g. a box.", "unit?")],
        r=["A barcode belongs to one SKU only; the import checks this."], s="A-21, R-04"),
    "price_list": dict(p="A set of prices: Retail (default), Wholesale, or one branch's own prices.",
        c=[("id", U, "Primary key.", None), ("name", T, "RETAIL, WHOLESALE, or a branch name.", None), ("branch_id", U, "Empty means all branches.", "branch?")],
        r=["A sale uses the customer's list, then the branch list, then Retail."], s="A-30"),
    "price_list_item": dict(p="The price of one SKU in one unit on one price list, from a date.",
        c=[("price_list_id", U, "The list.", "price_list"), ("sku_id", U, "The SKU.", "sku"), ("unit_id", U, "Unit the price is for.", "unit"), ("price", M, "Selling price including VAT.", None), ("valid_from", TS, "When it starts; registers switch at 00:00 even offline.", None)],
        r=["Prices never go below cost through bulk changes.", "Past sales keep their price (INV-10)."], s="A-30, A-31"),
    "discount_rule": dict(p="How much each role may discount at the till.",
        c=[("id", U, "Primary key.", None), ("role_id", U, "The role.", "role"), ("max_pct", "numeric(5,2)", "Largest percent.", None), ("max_amount", M, "Largest amount per line.", None), ("above", T, "PIN (ask a manager) or NO (not allowed).", None)],
        r=["BR-01: above the limit needs a manager override, recorded with who and why."], s="A-32, R-08"),
    # ---------------- 3 Inventory ----------------
    "supplier": dict(p="A business the shop buys from.",
        c=[("id", U, "Primary key.", None), ("name", T, "Supplier name.", None), ("phone", T, "Contact number.", None), ("vat_no", T, "Needed to claim input VAT.", None), ("terms_days", "int", "Payment terms; 0 for cash on delivery.", None)], r=[], s="A-48, R-17"),
    "goods_receipt": dict(p="A delivery from a supplier (GRN). It is a draft until posted; posting adds the stock.",
        c=[("id", U, "Primary key.", None), ("supplier_id", U, "Who delivered.", "supplier"), ("branch_id", U, "Where it arrived.", "branch"), ("supplier_invoice_no", T, "Needed before posting.", None), ("status", T, "DRAFT or POSTED.", None)],
        r=["Posting creates one stock movement per line (INV-04).", "A posted receipt is never edited."], s="R-17, A-42, D-06"),
    "goods_receipt_line": dict(p="One product line on a delivery, with its batch and expiry.",
        c=[("id", U, "Primary key.", None), ("receipt_id", U, "The delivery.", "goods_receipt"), ("sku_id", U, "What arrived.", "sku"), ("batch_no", T, "From the pack or the GS1 code.", None), ("expiry_date", D, "From the pack or the GS1 code.", None),
           ("qty", Q, "In the unit chosen.", None), ("unit_id", U, "Pack or base unit.", "unit"), ("unit_cost", M, "Cost per unit, for valuation.", None), ("batch_id", U, "The batch created or topped up when posted.", "batch=")],
        r=["GS1 Application Identifiers (01), (10), (17) fill SKU, batch and expiry."], s="R-17, A-42"),
    "stock_location": dict(p="A place stock is kept: a branch's shop floor, or a store room.",
        c=[("id", U, "Primary key.", None), ("branch_id", U, "The branch.", "branch"), ("name", T, "Shop floor, store room …", None)], r=[], s="A-40"),
    "batch": dict(p="One lot of an SKU at one location, with its expiry date and cost. This is the level stock is really kept at.",
        c=[("id", U, "Primary key.", None), ("sku_id", U, "What it is.", "sku"), ("location_id", U, "Where it is.", "stock_location"), ("batch_no", T, "Lot number.", None), ("expiry_date", D, "Empty for items without expiry.", None),
           ("unit_cost", M, "Cost per base unit.", None), ("selling_price", M, "Batch price when it differs; empty uses the price list.", None), ("status", T, "OPEN, BLOCKED or DEPLETED.", None)],
        r=["BR-04 and INV-14: a chosen or scanned batch wins, otherwise the earliest expiry is used (FEFO).", "BR-09: expired and blocked batches cannot be sold."], s="A-40, A-41, A-45, R-06, R-18"),
    "stock_balance": dict(p="How much of each batch is on hand now. It is a projection of the movement ledger and can be rebuilt from it.",
        c=[("batch_id", U, "The batch (one row each).", "batch="), ("sku_id", U, "Copied for fast lookups.", "sku"), ("location_id", U, "Copied for fast lookups.", "stock_location"), ("on_hand", Q, "Quantity in base units; can go below zero (BR-05).", None), ("updated_at", TS, "Last change.", None)],
        r=["Rebuilt nightly from stock_movement to catch drift."], s="A-40, R-18"),
    "stock_movement": dict(p="The stock ledger: every change to stock is one row here, with a signed quantity and the document that caused it.",
        c=[("id", U, "Primary key.", None), ("seq", "bigint", "Order of movements.", None), ("batch_id", U, "Which batch.", "batch"), ("type", T, "RECEIPT, SALE, RETURN, ADJUST_IN, ADJUST_OUT, COUNT …", None), ("qty", Q, "Signed, in base units.", None),
           ("unit_cost", M, "Cost at the time.", None), ("ref_type", T, "SALE, GRN, ADJUST, COUNT …", None), ("ref_id", U, "The sale, receipt, adjustment or count.", None), ("reason_code", T, "Damaged, Expired write-off …", None), ("occurred_at", TS, "When.", None)],
        r=["INV-04: stock changes only through new rows here; never UPDATE or DELETE.", "Adjustments above Rs 5,000 at cost need a manager."], s="A-41, A-43"),
    "stock_exception": dict(p="A problem found when a sale reached the server, for a manager to resolve, such as stock going below zero or an old price.",
        c=[("id", U, "Primary key.", None), ("movement_id", U, "The movement that raised it.", "stock_movement?"), ("sale_id", U, "The sale involved.", "sale?"), ("type", T, "NEGATIVE_STOCK, PRICE_MISMATCH, EXPIRED_BATCH_SOLD, CLOCK_SKEW.", None), ("status", T, "OPEN or RESOLVED.", None), ("resolution", T, "Action taken and the manager's note.", None)],
        r=["BR-05: short stock never blocks an offline sale; it raises an exception instead.", "Resolving never edits the sale (INV-02)."], s="A-53"),
    "stock_count": dict(p="A stock count: full, one category, or a short cycle count.",
        c=[("id", U, "Primary key.", None), ("location_id", U, "Where.", "stock_location"), ("type", T, "FULL, CATEGORY or CYCLE.", None), ("blind", B, "Expected quantities hidden while counting.", None), ("status", T, "COUNTING, REVIEW, POSTED.", None)],
        r=["Posting creates one count-correction movement per product that differs."], s="A-44"),
    "stock_count_line": dict(p="One product on a count sheet: what was expected and what was counted.",
        c=[("count_id", U, "The count.", "stock_count"), ("sku_id", U, "The product.", "sku"), ("expected", Q, "Snapshot when the count started.", None), ("counted", Q, "Empty until counted.", None)],
        r=["Lines not counted keep their stock unchanged."], s="A-44"),
    # ---------------- 4 Sales ----------------
    "sale": dict(p="One completed purchase at a register. A sale is a fact: once completed it is never changed; corrections are returns or credit notes.",
        c=[("id", U, "Made on the register (INV-05).", None), ("register_id", U, "Which till.", "register"), ("cash_session_id", U, "Which shift.", "cash_session"), ("customer_id", U, "Empty for walk-in customers.", "customer?"),
           ("receipt_no", T, "e.g. CMB01-R02-000154.", None), ("status", T, "OPEN, COMPLETED or VOIDED.", None), ("subtotal, discount_total, tax_total, grand_total", M, "Totals.", None),
           ("completed_at", TS, "Register clock.", None), ("received_at", TS, "Server clock.", None), ("business_date", D, "Day the sale counts for; also the partition key.", None)],
        r=["INV-02: never rejected, updated or deleted.", "Partitioned by month on business_date."], s="R-04, R-10, R-11, R-14, A-50, A-51"),
    "sale_line": dict(p="One item on a sale, with the price, discount and tax exactly as they were at the time.",
        c=[("id", U, "Primary key.", None), ("sale_id", U, "The sale.", "sale"), ("sku_id", U, "What was sold.", "sku"), ("qty", Q, "Quantity in the unit sold.", None), ("unit_id", U, "Unit sold.", "unit"),
           ("unit_price", M, "Snapshot (INV-10).", None), ("discount", M, "Line discount.", None), ("tax_rate_id", U, "Tax used.", "tax_rate"), ("tax_rate", "numeric(7,4)", "Snapshot of the rate.", None), ("line_total", M, "What the customer paid for this line.", None)],
        r=["BR-02: later price or tax changes never alter past lines."], s="R-04, R-07, A-51"),
    "sale_line_allocation": dict(p="Which batches a sale line took its stock from, and at what cost. One line can draw from more than one batch.",
        c=[("sale_line_id", U, "The line.", "sale_line"), ("batch_id", U, "The batch used.", "batch"), ("qty", Q, "Base units from this batch.", None), ("unit_cost", M, "Snapshot, for profit reports.", None)],
        r=["INV-14: FEFO, skipping expired and blocked batches.", "Gives each sale its exact cost, so profit is right."], s="A-41 (buyers of a batch), A-51"),
    "payment": dict(p="How a sale was paid. A split payment is several rows.",
        c=[("id", U, "Primary key.", None), ("sale_id", U, "The sale.", "sale"), ("tender_id", U, "Cash, card, LankaQR, credit.", "tender_type"), ("amount", M, "Amount for this tender.", None), ("reference", T, "Slip number or last four digits; never card data.", None)],
        r=["INV-11: no card numbers, CVV or track data anywhere."], s="R-10"),
    "tender_type": dict(p="The ways customers can pay.",
        c=[("id", U, "Primary key.", None), ("code", T, "CASH, CARD, LANKAQR, CREDIT.", None)], r=["Credit needs a named customer with a credit account (BR-07)."], s="R-10"),
    "sale_return": dict(p="A return against an earlier sale. Returned stock goes back to its original batch.",
        c=[("id", U, "Made on the register.", None), ("sale_id", U, "The original sale.", "sale"), ("reason", T, "Damaged, wrong item …", None), ("approved_by", U, "Manager, when needed.", "app_user?"), ("refund_total", M, "Total refunded.", None)],
        r=["BR-06: cannot exceed what was bought minus earlier returns; 14-day window by default.", "Refunds above Rs 2,000 need a manager."], s="R-13, A-52"),
    "sale_return_line": dict(p="One line being returned.",
        c=[("return_id", U, "The return.", "sale_return"), ("sale_line_id", U, "The original line.", "sale_line"), ("qty", Q, "How many.", None), ("amount", M, "Refund for this line.", None)], r=[], s="R-13"),
    "refund_payment": dict(p="How a refund was paid back, normally the original way.",
        c=[("id", U, "Primary key.", None), ("return_id", U, "The return.", "sale_return"), ("tender_id", U, "How.", "tender_type"), ("amount", M, "Amount.", None)], r=[], s="R-13"),
    "held_bill": dict(p="A cart put on hold to serve someone else, then resumed or discarded.",
        c=[("id", U, "Primary key.", None), ("register_id", U, "Held bills stay on the register that held them.", "register"), ("cart", J, "The lines and customer.", None), ("held_at", TS, "When.", None)],
        r=["Not a sale: nothing moves stock until it is completed."], s="R-12"),
    "receipt_registry": dict(p="A small helper that keeps receipt numbers unique. The sale table is split by month, and a uniqueness rule cannot span those parts, so each receipt number is also written here in the same transaction.",
        c=[("register_id", U, "Which till.", "register"), ("receipt_seq", "bigint", "The receipt number.", None), ("sale_id", U, "The sale.", "sale="), ("business_date", D, "Finds the sale's partition.", None)],
        r=["INV-06: gap-free and unique per register."], s="R-11 (receipt number)"),
    "customer": dict(p="A known customer. Most sales are to walk-in customers and have no customer row.",
        c=[("id", U, "Primary key.", None), ("name", T, "Name.", None), ("phone", T, "Used to find them at the till; masked in lists.", None), ("vat_no", T, "For tax invoices.", None), ("consent_sms", B, "Marketing by SMS allowed.", None), ("consent_email", B, "Marketing by e-mail allowed.", None)],
        r=["PDPA: keep only what is needed; consent is recorded with time and source."], s="R-09, A-60, A-61"),
    "credit_account": dict(p="Lets a customer buy now and pay later, up to a limit.",
        c=[("customer_id", U, "The customer.", "customer="), ("credit_limit", M, "Most they may owe.", None), ("terms_days", "int", "Days to pay.", None)],
        r=["BR-07: over the limit needs a manager override."], s="A-61, R-10"),
    "credit_ledger": dict(p="Every charge and payment on a credit account. The balance is the sum.",
        c=[("id", U, "Primary key.", None), ("account_id", U, "The account.", "credit_account"), ("sale_id", U, "Set for a credit sale.", "sale?"), ("ref", T, "Sale number or payment reference.", None), ("amount", M, "Positive for a sale, negative for a payment.", None)],
        r=["Payments clear the oldest sales first.", "Never edited; mistakes are fixed with a new entry."], s="A-61, D-05"),
    "tax_document": dict(p="A tax invoice, credit note or debit note, with its own gap-free number series.",
        c=[("id", U, "Primary key.", None), ("type", T, "TAX_INVOICE, CREDIT_NOTE or DEBIT_NOTE.", None), ("number", T, "e.g. CMB01-R02-TI-000031.", None), ("sale_id", U, "For an invoice.", "sale?"), ("return_id", U, "For a credit note from a return.", "sale_return?"),
           ("buyer_vat_no", T, "Buyer's VAT number.", None), ("fiscal_status", T, "NA, PENDING, SENT, FAILED (RAMIS in R3).", None)],
        r=["Never changed after issue; corrections are new notes.", "INV-07: only the Tax module calculates tax."], s="A-65, D-02, D-03"),
    "fiscal_submission": dict(p="Each attempt to send a tax document to the IRD. Does nothing until RAMIS e-invoicing arrives in R3.",
        c=[("id", U, "Primary key.", None), ("document_id", U, "The document.", "tax_document"), ("status", T, "PENDING, ACCEPTED, REJECTED.", None), ("attempts", "int", "Tries so far.", None)], r=[], s="A-65"),
}

ONE = {"": "many", "?": "zero or more", "=": "one"}


def refs_of(name):
    out = []
    for col, typ, mean, ref in DICT[name]["c"]:
        if not ref: continue
        m = re.match(r"([a-z_]+)([?=]?)$", ref)
        out.append((col, m.group(1), m.group(2)))
    return out


def link(t): return f'<a href="#t-{t}"><code>{t}</code></a>'


def relationships(name):
    lines = []
    for col, tgt, kind in refs_of(name):
        if kind == "=": lines.append(f"Each {link(name)} belongs to exactly one {link(tgt)} (via <code>{col}</code>), and each {link(tgt)} has at most one {link(name)}.")
        elif kind == "?": lines.append(f"A {link(name)} may point to one {link(tgt)} (via <code>{col}</code>); the column can be empty.")
        else: lines.append(f"Each {link(name)} belongs to one {link(tgt)} (via <code>{col}</code>).")
    for other in DICT:
        for col, tgt, kind in refs_of(other):
            if tgt != name or other == name and col == "parent_id": continue
            if kind == "=": lines.append(f"One {link(name)} has at most one {link(other)} (its <code>{col}</code>).")
            elif kind == "?": lines.append(f"One {link(name)} can be pointed to by many {link(other)} rows (their optional <code>{col}</code>).")
            else: lines.append(f"One {link(name)} has many {link(other)} rows (their <code>{col}</code>).")
    if name == "category": lines.append(f"A {link('category')} can have subcategories: other categories point to it with <code>parent_id</code>.")
    return lines


def table_html(name):
    d = DICT[name]; area = AREA_OF[name]
    rows = "".join(f"<tr><td><code>{html.escape(c)}</code></td><td><code>{t}</code></td><td>{m}</td><td>{link(re.sub(r'[?=]$', '', r)) if r else ''}</td></tr>" for c, t, m, r in d["c"])
    rel = "".join(f"<li>{x}</li>" for x in relationships(name))
    rules = "".join(f"<li>{x}</li>" for x in d["r"])
    return (f'<h3 id="t-{name}"><span class="dd-dot {area}"></span>{name}</h3>\n<p>{d["p"]}</p>\n'
            f'<table class="dd-cols"><thead><tr><th>Column</th><th>Type</th><th>Meaning</th><th>Points to</th></tr></thead><tbody>'
            f'<tr><td><code>tenant_id</code></td><td><code>uuid</code></td><td>The business (on every table, INV-01).</td><td>{link("tenant") if name != "tenant" else ""}</td></tr>{rows}</tbody></table>\n'
            f'<p class="dd-h">Relationships</p><ul class="dd-rel">{rel or "<li>No links to other tables.</li>"}</ul>\n'
            + (f'<p class="dd-h">Rules</p><ul>{rules}</ul>\n' if rules else "")
            + f'<p class="dd-used"><strong>Used by:</strong> {d["s"]}</p>\n')


def build():
    order = {k: [] for k in AREAS}
    for n, v in dbmap.TABLES.items(): order[v[0]].append(n)
    missing = [n for n in dbmap.TABLES if n not in DICT]
    extra = [n for n in DICT if n not in dbmap.TABLES]
    if missing or extra: raise SystemExit(f"Dictionary and diagram differ. Missing: {missing} Extra: {extra}")
    toc = "".join(f'<tr><td><span class="dd-dot {k}"></span>{AREAS[k][0]}</td><td>{len(order[k])}</td><td>{", ".join(link(n) for n in order[k])}</td></tr>' for k in AREAS)
    body = ""
    for k, (title, intro) in AREAS.items():
        body += f'<h2 id="area-{k}">{title}</h2>\n<p>{intro}</p>\n' + "".join(table_html(n) for n in order[k])
    return TEMPLATE.replace("{{COUNT}}", str(len(DICT))).replace("{{TOC}}", toc).replace("{{BODY}}", body)


TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Data dictionary · RetailOS</title>
<meta name="description" content="Every RetailOS MVP table explained one by one: what it is for, each column, how it relates to other tables, the rules that protect it and the screens that use it.">
<link rel="stylesheet" href="assets/site.css">
<script>try{var t=localStorage.getItem("retailos-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body>
<header id="topbar"></header>
<div class="layout">
<nav id="sidebar"></nav>
<main class="content"><article>
<!-- Generated by tools/build_data_dictionary.py. Edit the script, not this file. -->

<h1>Data dictionary</h1>
<p class="lead">Every MVP table explained one by one: what it is for, each column, how it connects to other tables, the rules that protect it, and the screens that use it. The tables and areas are the same as in the <a href="data-model.html#db-map">whole-database diagram</a>; the exact SQL for the most important tables is in <a href="data-model.html#key-tables">key table definitions</a>.</p>

<div class="callout tip"><span class="ct">How to read the relationships</span>
“Each <code>sale_line</code> belongs to one <code>sale</code>” means the line has a <code>sale_id</code> column that must be filled in. “One <code>sale</code> has many <code>sale_line</code> rows” is the same link seen from the other side. “May point to” means the column can be empty, for example a sale without a known customer. Click any table name to jump to it.</div>

<h2 id="overview">The {{COUNT}} tables by area</h2>
<table>
<thead><tr><th>Area (build order)</th><th>Tables</th><th>Names</th></tr></thead>
<tbody>{{TOC}}</tbody>
</table>

<h2 id="common">Columns every table shares</h2>
<table>
<thead><tr><th>Column</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td><code>tenant_id</code></td><td>The business the row belongs to. Row-level security uses it, so one business can never read another's data (<span class="inv">INV-01</span>).</td></tr>
<tr><td><code>created_at, created_by</code></td><td>When and by whom the row was made. On every table.</td></tr>
<tr><td><code>updated_at, updated_by, version</code></td><td>Only on tables that can change (master data). <code>version</code> stops two people overwriting each other's edits.</td></tr>
<tr><td><code>archived_at</code></td><td>Master data is archived, not deleted. Facts such as sales and stock movements are never deleted.</td></tr>
</tbody>
</table>
<p>Ids are UUID version 7. Money is <code>numeric(19,4)</code>, quantities <code>numeric(14,3)</code>, times <code>timestamptz</code> in UTC (<span class="inv">INV-03</span>, <span class="inv">INV-15</span>). Full conventions: <a href="data-model.html#conventions">Data model › Conventions</a>.</p>

{{BODY}}
<h2 id="later">Tables that come after the MVP</h2>
<p>These are designed in the requirements but not built in the first release: promotions, purchase orders and their lines, stock transfers, supplier returns, loyalty accounts, notifications and message templates (R2); the pharmacy tables <code>ph_*</code> and grocery tables <code>gr_*</code> (R2); gift cards and accounting exports (R3). They will be added here when their release is planned.</p>

</article></main>
<aside id="toc"></aside>
</div>
<script src="assets/search-index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
<script src="assets/site.js"></script>
</body>
</html>
"""

if __name__ == "__main__":
    (DOC / "data-dictionary.html").write_text(build(), encoding="utf-8")
    print(f"data-dictionary.html: {len(DICT)} tables")
