"""Build the whole-database diagram (data-model.html#db-map and assets/db-map.svg).

Usage:  python Doc/tools/build_db_map.py
Edit TABLES / EDGES below when the schema changes, then run it again.
Colours: 1 Store & staff (blue), 2 Catalog (orange), 3 Inventory (green), 4 Sales (navy).
Line ends: bar = one, fork = many, circle = optional. tenant_id is on every table and is not shown.
"""
import html
import pathlib
import re

DOC = pathlib.Path(__file__).resolve().parent.parent

W, G, P, M, TOP = 200, 56, 165, 30, 132      # box width, column gutter, row pitch, margin, top offset
ROW_H, HEAD = 16, 30                         # field line height, title height
CATS = {"st": "1 · Store & staff", "ca": "2 · Catalog", "in": "3 · Inventory", "sa": "4 · Sales"}

# name: (category, column, row, [fields]); a field ending in "@xx" points to a table in category xx (drawn as a coloured dot)
TABLES = {
    # 1 Store & staff (columns 5-6)
    "tenant": ("st", 5, 0, ["id PK", "name, vat_number", "status, plan", "timezone"]),
    "tenant_module": ("st", 6, 0, ["tenant_id FK", "module_key", "enabled"]),
    "branch": ("st", 5, 1, ["id PK", "code (CMB01), name", "address"]),
    "app_user": ("st", 6, 1, ["id PK", "email, password_hash", "pin_hash", "mfa_enabled"]),
    "register": ("st", 5, 2, ["id PK", "branch_id FK", "code (R02)", "last_receipt_seq"]),
    "user_role": ("st", 6, 2, ["user_id FK", "role_id FK", "branch_id (scope)"]),
    "cash_session": ("st", 5, 3, ["id PK", "register_id FK", "opened_by FK", "opening_float, counted", "status"]),
    "role": ("st", 6, 3, ["id PK", "name", "builtin"]),
    "cash_movement": ("st", 5, 4, ["id PK", "cash_session_id FK", "kind (IN OUT DROP)", "amount, reason"]),
    "role_permission": ("st", 6, 4, ["role_id FK", "permission"]),
    "cash_count": ("st", 5, 5, ["cash_session_id FK", "denomination", "qty"]),
    "refresh_token": ("st", 6, 5, ["id PK", "user_id FK", "family_id", "expires_at, revoked_at"]),
    "device": ("st", 5, 6, ["id PK", "register_id FK", "platform, app_version", "public_key", "last_seen_at"]),
    "device_enrollment": ("st", 6, 6, ["id PK", "register_id FK", "code_hash", "expires_at, used_at"]),
    "device_heartbeat": ("st", 5, 7, ["device_id FK", "at", "queue_depth", "printer_status"]),
    "audit_log": ("st", 6, 7, ["seq PK", "actor_id, action", "entity, entity_id", "before, after", "prev_hash, hash"]),
    "sync_change_log": ("st", 5, 8, ["seq PK", "branch_id (null = all)", "scope, entity, entity_id", "op, payload"]),
    "sync_cursor": ("st", 6, 8, ["device_id FK", "scope", "last_seq"]),
    "sync_inbox": ("st", 5, 9, ["client_id PK (sale or return id)", "register_id FK", "kind", "result (stored reply)"]),
    "catalog_snapshot": ("st", 6, 9, ["id PK", "branch_id FK", "cursor", "file_url"]),
    # 2 Catalog (columns 0-1)
    "brand": ("ca", 0, 0, ["id PK", "name"]),
    "category": ("ca", 1, 0, ["id PK", "parent_id FK", "name", "sort_order, colour"]),
    "tax_rate": ("ca", 0, 1, ["id PK", "name", "rate", "valid_from, valid_to"]),
    "product": ("ca", 1, 1, ["id PK", "category_id, brand_id FK", "name, name_si, name_ta", "batch_tracked", "tax_rate_id FK"]),
    "unit": ("ca", 0, 2, ["id PK", "name, symbol", "decimals"]),
    "sku": ("ca", 1, 2, ["id PK", "product_id FK", "sku_code, variant_label", "base_unit_id FK", "reorder_level"]),
    "unit_conversion": ("ca", 0, 3, ["sku_id FK", "unit_id FK", "factor (1 box = 12)"]),
    "barcode": ("ca", 1, 3, ["id PK", "sku_id FK", "code (unique/tenant)", "type (EAN13 GS1 PLU)"]),
    "price_list": ("ca", 0, 4, ["id PK", "name (RETAIL …)", "branch_id FK@st"]),
    "price_list_item": ("ca", 1, 4, ["price_list_id FK", "sku_id, unit_id FK", "price", "valid_from"]),
    "discount_rule": ("ca", 0, 5, ["id PK", "role_id FK@st", "max_pct, max_amount", "above (PIN NO)"]),
    # 3 Inventory (columns 2-4, rows 0-3)
    "supplier": ("in", 2, 0, ["id PK", "name, phone", "vat_no", "terms_days"]),
    "goods_receipt": ("in", 3, 0, ["id PK", "supplier_id FK", "branch_id FK@st", "supplier_invoice_no", "status"]),
    "stock_location": ("in", 4, 0, ["id PK", "branch_id FK@st", "name"]),
    "goods_receipt_line": ("in", 2, 1, ["id PK", "receipt_id FK", "sku_id FK@ca", "batch_no, expiry_date", "qty, unit_cost"]),
    "batch": ("in", 3, 1, ["id PK", "sku_id, location_id FK", "batch_no, expiry_date", "unit_cost", "status (OPEN BLOCKED)"]),
    "stock_balance": ("in", 4, 1, ["batch_id PK", "sku_id, location_id", "on_hand", "updated_at"]),
    "stock_count": ("in", 2, 2, ["id PK", "location_id FK", "type (FULL CYCLE)", "status"]),
    "stock_movement": ("in", 4, 2, ["id PK, seq", "batch_id FK", "type, qty (signed)", "ref_type, ref_id", "reason_code, occurred_at"]),
    "stock_count_line": ("in", 2, 3, ["count_id FK", "sku_id FK@ca", "expected, counted"]),
    "stock_exception": ("in", 4, 3, ["id PK", "sale_id FK@sa", "type (NEGATIVE_STOCK…)", "status, resolution"]),
    # 4 Sales (columns 2-4, rows 3-8)
    "sale_line_allocation": ("sa", 3, 3, ["sale_line_id FK", "batch_id FK", "qty", "unit_cost (snapshot)"]),
    "sale_return_line": ("sa", 2, 4, ["return_id FK", "sale_line_id FK", "qty, amount"]),
    "sale_line": ("sa", 3, 4, ["id PK", "sale_id FK", "sku_id FK@ca", "qty, unit_price (snapshot)", "discount, tax, total"]),
    "sale": ("sa", 4, 4, ["id PK (register UUID)", "register_id FK@st", "receipt_no, status", "totals, completed_at", "business_date"]),
    "sale_return": ("sa", 2, 5, ["id PK", "sale_id FK", "reason, approved_by", "refund_total"]),
    "refund_payment": ("sa", 3, 5, ["id PK", "return_id FK", "tender_id FK", "amount"]),
    "payment": ("sa", 4, 5, ["id PK", "sale_id FK", "tender_id FK", "amount, reference"]),
    "tax_document": ("sa", 2, 6, ["id PK", "type (TI CN DN), number", "sale_id / return_id FK", "buyer_vat_no", "fiscal_status"]),
    "fiscal_submission": ("sa", 3, 6, ["id PK", "document_id FK", "status, attempts", "(no-op until R3)"]),
    "tender_type": ("sa", 4, 6, ["id PK", "code (CASH CARD QR CREDIT)"]),
    "credit_ledger": ("sa", 2, 7, ["id PK", "account_id FK", "ref (sale or payment)", "amount (signed)"]),
    "credit_account": ("sa", 3, 7, ["customer_id FK", "credit_limit", "terms_days"]),
    "customer": ("sa", 4, 7, ["id PK", "name, phone, vat_no", "consent_sms, consent_email"]),
    "held_bill": ("sa", 2, 8, ["id PK", "register_id FK@st", "cart (json)", "held_at"]),
    "receipt_registry": ("sa", 3, 8, ["register_id, receipt_seq PK@st", "sale_id FK", "business_date"]),
}

# (from, side, offset, to, side, offset, end_at_from, end_at_to, via); ends: one, many, zone (0..1), zmany (0..n)
# via: list of ("x", value) / ("y", value) moves; value may be "gx<c>" (gutter right of column c), "cy<r>" (corridor
# below row r), "cx<name>" (centre of a box), "rx" (right edge), with optional +/- pixel offset like "gx1+10".
EDGES = [
    ("category", "B", 0, "product", "T", 0, "one", "many", []),
    ("brand", "R", 0, "product", "L", -14, "one", "many", [("x", "gx0")]),
    ("tax_rate", "R", 14, "product", "L", 14, "one", "many", []),
    ("product", "B", 0, "sku", "T", 0, "one", "many", []),
    ("unit", "R", -14, "sku", "L", -14, "one", "many", []),
    ("sku", "B", 0, "barcode", "T", 0, "one", "many", []),
    ("unit", "B", 0, "unit_conversion", "T", 0, "one", "many", []),
    ("sku", "L", 14, "unit_conversion", "R", 0, "one", "many", [("x", "gx0")]),
    ("sku", "R", 14, "price_list_item", "R", 0, "one", "many", [("x", "gx1-10")]),
    ("price_list", "R", 0, "price_list_item", "L", 0, "one", "many", []),
    ("sku", "R", -14, "batch", "B", -40, "one", "many", [("x", "gx1+10"), ("y", "cy1")]),
    ("supplier", "R", 0, "goods_receipt", "L", 0, "one", "many", []),
    ("goods_receipt", "B", -40, "goods_receipt_line", "T", 30, "one", "many", [("y", "cy0")]),
    ("goods_receipt_line", "R", 0, "batch", "L", 0, "one", "one", []),
    ("stock_location", "B", 0, "batch", "T", 40, "one", "many", [("y", "cy0")]),
    ("batch", "R", -14, "stock_balance", "L", -14, "one", "one", []),
    ("batch", "R", 14, "stock_movement", "L", 0, "one", "many", [("x", "gx3")]),
    ("stock_movement", "B", 0, "stock_exception", "T", 0, "one", "zmany", []),
    ("stock_count", "B", 0, "stock_count_line", "T", 0, "one", "many", []),
    ("batch", "B", 0, "sale_line_allocation", "T", 0, "one", "many", []),
    ("branch", "L", -14, "stock_location", "R", 0, "one", "many", [("x", "gx4+10")]),
    ("sale_line", "T", 0, "sale_line_allocation", "B", 0, "one", "many", []),
    ("sale", "L", 0, "sale_line", "R", 0, "one", "many", []),
    ("sale_line", "L", 0, "sale_return_line", "R", 0, "one", "zmany", []),
    ("sale_return", "T", 0, "sale_return_line", "B", 0, "one", "many", []),
    ("sale", "B", -40, "sale_return", "T", 40, "one", "zmany", [("y", "cy4")]),
    ("sale", "B", 20, "payment", "T", 20, "one", "many", []),
    ("tender_type", "T", 0, "payment", "B", 0, "one", "many", []),
    ("sale_return", "R", 0, "refund_payment", "L", 0, "one", "many", []),
    ("sale", "L", 28, "tax_document", "T", 40, "one", "zone", [("x", "gx3"), ("y", "cy5")]),
    ("sale_return", "B", -40, "tax_document", "T", -40, "one", "zone", []),
    ("tax_document", "R", 0, "fiscal_submission", "L", 0, "one", "zmany", []),
    ("customer", "L", 0, "credit_account", "R", 0, "one", "zone", []),
    ("credit_account", "L", 0, "credit_ledger", "R", 0, "one", "many", []),
    ("customer", "R", 0, "sale", "R", 14, "zone", "zmany", [("x", "gx4+10")]),
    ("cash_session", "L", 0, "sale", "R", -14, "one", "many", [("x", "gx4-10")]),
    ("tenant", "R", 0, "tenant_module", "L", 0, "one", "many", []),
    ("tenant", "B", 0, "branch", "T", 0, "one", "many", []),
    ("tenant", "R", 14, "app_user", "L", 0, "one", "many", [("x", "gx5-10")]),
    ("branch", "B", 0, "register", "T", 0, "one", "many", []),
    ("register", "B", 0, "cash_session", "T", 0, "one", "many", []),
    ("cash_session", "B", 0, "cash_movement", "T", 0, "one", "zmany", []),
    ("cash_session", "R", 14, "cash_count", "R", 0, "one", "many", [("x", "gx5-10")]),
    ("register", "R", 0, "device", "R", -14, "one", "zone", [("x", "gx5+10")]),
    ("device", "B", 0, "device_heartbeat", "T", 0, "one", "many", []),
    ("app_user", "B", 0, "user_role", "T", 0, "one", "many", []),
    ("role", "T", 0, "user_role", "B", 0, "one", "many", []),
    ("role", "B", 0, "role_permission", "T", 0, "one", "many", []),
    ("app_user", "R", 0, "refresh_token", "R", 0, "one", "many", [("x", "rx+18")]),
]


def col_x(c): return M + c * (W + G)
def row_y(r): return TOP + r * P
def box_h(name): return HEAD + len(TABLES[name][3]) * ROW_H + 10
MAXH = max(box_h(n) for n in TABLES)


def box(name):
    _, c, r, _ = TABLES[name]
    return col_x(c), row_y(r), W, box_h(name)


def anchor(name, side, off):
    x, y, w, h = box(name)
    ay = y + 44 + off                          # side anchors line up across a row
    return {"L": (x, ay, -1, 0), "R": (x + w, ay, 1, 0), "T": (x + w / 2 + off, y, 0, -1), "B": (x + w / 2 + off, y + h, 0, 1)}[side]


def resolve(v):
    m = re.match(r"(gx|cy|cx|rx)([a-z_0-9]*)([+-]\d+)?$", v)
    kind, arg, off = m.group(1), m.group(2), int(m.group(3) or 0)
    if kind == "gx": base = col_x(int(arg)) + W + G / 2
    elif kind == "cy": base = row_y(int(arg)) + (MAXH + P) / 2
    elif kind == "cx": base = box(arg)[0] + W / 2
    else: base = col_x(6) + W
    return base + off


def end_marks(px, py, dx, dy, kind):
    """dx,dy point from the line into the box. Returns svg for bar / fork / circle at that end."""
    nx, ny = -dy, dx
    out = []
    def ln(x1, y1, x2, y2): out.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"/>')
    if kind in ("many", "zmany"):
        ax, ay = px - dx * 13, py - dy * 13
        for s in (-1, 0, 1): ln(ax, ay, px + nx * 7 * s, py + ny * 7 * s)
        bx, by = px - dx * 17, py - dy * 17
        if kind == "many": ln(bx + nx * 7, by + ny * 7, bx - nx * 7, by - ny * 7)
        else: out.append(f'<circle cx="{px - dx * 22:.1f}" cy="{py - dy * 22:.1f}" r="4"/>')
    else:
        bx, by = px - dx * 8, py - dy * 8
        ln(bx + nx * 7, by + ny * 7, bx - nx * 7, by - ny * 7)
        if kind == "zone": out.append(f'<circle cx="{px - dx * 18:.1f}" cy="{py - dy * 18:.1f}" r="4"/>')
        else:
            cx, cy = px - dx * 13, py - dy * 13
            ln(cx + nx * 7, cy + ny * 7, cx - nx * 7, cy - ny * 7)
    return "".join(out)


def edge_svg(e):
    a, sa, oa, b, sb, ob, ka, kb, via = e
    x1, y1, dxa, dya = anchor(a, sa, oa)
    x2, y2, dxb, dyb = anchor(b, sb, ob)
    pts = [(x1, y1)]
    cx, cy = x1, y1
    for axis, v in via:
        val = resolve(v)
        if axis == "x": cx = val
        else: cy = val
        pts.append((cx, cy))
    if sb in ("L", "R"):
        if cy != y2: pts.append((cx, y2))
    else:
        if cx != x2: pts.append((x2, cy))
    pts.append((x2, y2))
    d = "M" + " L".join(f"{px:.1f},{py:.1f}" for px, py in pts)
    marks = end_marks(x1, y1, -dxa, -dya, ka) + end_marks(x2, y2, -dxb, -dyb, kb)
    return f'<path d="{d}"/>{marks}'


def table_svg(name):
    cat, c, r, fields = TABLES[name]
    x, y, w, h = box(name)
    out = [f'<g class="t {cat}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9"/>',
           f'<text class="tn" x="{x + 12}" y="{y + 20}">{html.escape(name.upper())}</text>',
           f'<line class="sep" x1="{x}" y1="{y + HEAD}" x2="{x + w}" y2="{y + HEAD}"/>']
    for i, f in enumerate(fields):
        ref = None
        if "@" in f: f, ref = f.split("@")
        fy = y + HEAD + 15 + i * ROW_H
        m = re.match(r"(.*?)( PK| FK)?( \(.*\))?$", f)
        main, key, note = m.group(1), (m.group(2) or "").strip(), (m.group(3) or "").strip()
        parts = [f'<tspan>{html.escape(main)}</tspan>']
        if key: parts.append(f'<tspan class="k"> {key}</tspan>')
        if note: parts.append(f'<tspan class="k"> {html.escape(note)}</tspan>')
        out.append(f'<text class="f" x="{x + 12}" y="{fy}">{"".join(parts)}</text>')
        if ref: out.append(f'<circle class="dot {ref}" cx="{x + w - 14}" cy="{fy - 4}" r="4.5"><title>Points to {html.escape(CATS[ref])}</title></circle>')
    out.append("</g>")
    return "".join(out)


def build(standalone):
    width = col_x(6) + W + M + 20
    height = row_y(9) + box_h("catalog_snapshot") + M
    lanes = [("ca", 0, 1), ("in", 2, 4), ("st", 5, 6)]
    labels = "".join(f'<text class="lane {k}" x="{col_x(a)}" y="{TOP - 16}">{html.escape(CATS[k].upper())}</text>' for k, a, b in lanes)
    labels += f'<text class="lane sa" x="{col_x(2)}" y="{row_y(4) - 16}">{html.escape(CATS["sa"].upper())}</text>'
    leg_y = 34
    legend = "".join(f'<g class="t {k}"><rect x="{M + i * 170}" y="{leg_y - 11}" width="14" height="14" rx="3"/></g><text class="lg" x="{M + i * 170 + 22}" y="{leg_y}">{html.escape(v)}</text>' for i, (k, v) in enumerate(CATS.items()))
    legend += (f'<text class="lg2" x="{M}" y="{leg_y + 26}">Line ends: bar = one, fork = many, circle = optional. A coloured dot marks a key that points to another area. '
               f'tenant_id is on every table and is not shown. Numbers are the build order.</text>')
    css = STYLE if not standalone else STYLE + STANDALONE
    body = "".join(table_svg(n) for n in TABLES)
    edges = "".join(edge_svg(e) for e in EDGES)
    bg = f'<rect class="bg" width="{width}" height="{height}"/>' if standalone else ""
    head = '<?xml version="1.0" encoding="UTF-8"?>\n' if standalone else ""
    return (f'{head}<svg class="dbm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img" '
            f'aria-labelledby="dbm-title"><title id="dbm-title">RetailOS database: {len(TABLES)} tables in four areas</title><style>{css}</style>{bg}'
            f'{legend}{labels}<g class="edges">{edges}</g>{body}</svg>')


STYLE = """
.dbm{--st:#2F68D8;--st-bg:#EAF1FD;--ca:#D2612B;--ca-bg:#FDEEE5;--in:#16855A;--in-bg:#E4F5EC;--sa:#2E3A5A;--sa-bg:#E8EBF2;--ln:#98A1B3;
 --tx:var(--text,#272932);--tx2:var(--text-3,#6F7889);font-family:Inter,"Segoe UI",system-ui,sans-serif}
.dbm .t rect{stroke-width:1.6}
.dbm .st rect{fill:var(--st-bg);stroke:var(--st)} .dbm .ca rect{fill:var(--ca-bg);stroke:var(--ca)}
.dbm .in rect{fill:var(--in-bg);stroke:var(--in)} .dbm .sa rect{fill:var(--sa-bg);stroke:var(--sa)}
.dbm .st .tn,.dbm .lane.st{fill:var(--st)} .dbm .ca .tn,.dbm .lane.ca{fill:var(--ca)} .dbm .in .tn,.dbm .lane.in{fill:var(--in)} .dbm .sa .tn,.dbm .lane.sa{fill:var(--sa)}
.dbm .st .sep{stroke:var(--st)} .dbm .ca .sep{stroke:var(--ca)} .dbm .in .sep{stroke:var(--in)} .dbm .sa .sep{stroke:var(--sa)} .dbm .sep{stroke-width:1;opacity:.35}
.dbm .tn{font-size:12.5px;font-weight:700;letter-spacing:.04em}
.dbm .f{font-size:12px;fill:var(--tx)} .dbm .f .k{fill:var(--tx2)}
.dbm .dot.st{fill:var(--st)} .dbm .dot.ca{fill:var(--ca)} .dbm .dot.in{fill:var(--in)} .dbm .dot.sa{fill:var(--sa)}
.dbm .edges path,.dbm .edges line{fill:none;stroke:var(--ln);stroke-width:1.4} .dbm .edges circle{fill:var(--bgc,#fff);stroke:var(--ln);stroke-width:1.4}
.dbm .lane{font-size:13px;font-weight:800;letter-spacing:.08em}
.dbm .lg{font-size:13px;fill:var(--tx);font-weight:600} .dbm .lg2{font-size:12.5px;fill:var(--tx2)}
:root[data-theme="dark"] .dbm{--st:#7FA8FF;--st-bg:#1B2840;--ca:#FF9D6B;--ca-bg:#382218;--in:#5BD49A;--in-bg:#142D24;--sa:#B4C0DE;--sa-bg:#252B3B;--ln:#6E778A;--bgc:#272932}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .dbm{--st:#7FA8FF;--st-bg:#1B2840;--ca:#FF9D6B;--ca-bg:#382218;--in:#5BD49A;--in-bg:#142D24;--sa:#B4C0DE;--sa-bg:#252B3B;--ln:#6E778A;--bgc:#272932}}
"""
STANDALONE = """
.dbm .bg{fill:#FDFFFC}
@media (prefers-color-scheme:dark){.dbm{--st:#7FA8FF;--st-bg:#1B2840;--ca:#FF9D6B;--ca-bg:#382218;--in:#5BD49A;--in-bg:#142D24;--sa:#B4C0DE;--sa-bg:#252B3B;--ln:#6E778A;--tx:#E6E9EF;--tx2:#9AA3B5;--bgc:#1E2028}.dbm .bg{fill:#1E2028}}
"""

if __name__ == "__main__":
    (DOC / "assets" / "db-map.svg").write_text(build(True), encoding="utf-8")
    page = DOC / "data-model.html"
    s = page.read_text(encoding="utf-8")
    start, end = "<!-- db-map:start -->", "<!-- db-map:end -->"
    if start not in s:
        raise SystemExit("Add the db-map markers to data-model.html first")
    i, j = s.index(start) + len(start), s.index(end)
    s = s[:i] + "\n" + build(False) + "\n" + s[j:]
    page.write_text(s, encoding="utf-8")
    print(f"db-map: {len(TABLES)} tables, {len(EDGES)} relationships -> assets/db-map.svg and data-model.html")
