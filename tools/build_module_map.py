"""Build the two backend module diagrams.

  1. Module map   -> assets/module-map.svg, modules.html#map and architecture.html (backend section)
  2. Inside a module (layers) -> assets/module-layers.svg and architecture.html#layers

Usage:  python Doc/tools/build_module_map.py
Edit MODULES / EDGES below when a module, its API, tables or events change, then run it again.
Colours follow the database diagram: store & staff / platform (blue), catalog (orange),
inventory (green), sales (navy), plus edge modules (teal) and later releases (purple, dashed).
"""
import html
import math
import pathlib

DOC = pathlib.Path(__file__).resolve().parent.parent
esc = html.escape

# ------------------------------------------------------------------------------------------
# 1. Module map
# ------------------------------------------------------------------------------------------
W, G, M = 258, 44, 30          # box width, gutter, margin
LINE, HEAD = 15, 32             # text line height, title height
LABEL_W = 54                    # width of the left label column inside a box
CHARS = 27                      # characters per line in the right column

GROUPS = {
    "pl": "Platform (store & staff)",
    "ca": "Catalog & pricing",
    "in": "Inventory",
    "sa": "Sales & money",
    "ed": "Edge (sync, reports)",
    "ex": "Later releases (R2)",
}

# key: (group, col, row, title, [(label, [items]) ...], later?)
MODULES = {
    # row 1: edge + later
    "sync": ("ed", 0, 1, "Sync", [
        ("API", ["/sync/v1 pull + push"]),
        ("OWNS", ["sync_change_log", "sync_cursor", "sync_inbox", "catalog_snapshot"]),
        ("NOTE", ["no business rules:", "hands facts to modules"])], False),
    "pharmacy": ("ex", 2, 1, "Pharmacy extension", [
        ("OWNS", ["ph_* tables"]),
        ("SPI", ["SaleLineValidator", "ProductAttributeProvider"])], True),
    "grocery": ("ex", 3, 1, "Grocery extension", [
        ("OWNS", ["gr_* tables"]),
        ("SPI", ["ProductAttributeProvider"])], True),
    "notifications": ("ex", 4, 1, "Notifications", [
        ("OWNS", ["notification", "message_template"]),
        ("NOTE", ["listens to events"])], True),
    # row 2: sales & money
    "sales": ("sa", 0, 2, "Sales", [
        ("API", ["SalesApi.recordSale"]),
        ("OWNS", ["sale", "sale_line", "sale_line_allocation", "sale_return", "sale_return_line", "held_bill", "receipt_registry"]),
        ("EVENTS", ["SaleCompleted", "SaleReturned", "SaleException"]),
        ("SPI", ["SaleLineValidator"])], False),
    "payments": ("sa", 1, 2, "Payments", [
        ("API", ["PaymentsApi"]),
        ("OWNS", ["payment", "tender_type", "refund_payment"]),
        ("EVENTS", ["PaymentRecorded", "RefundRecorded"])], False),
    "cash": ("sa", 2, 2, "Cash", [
        ("API", ["CashApi"]),
        ("OWNS", ["cash_session", "cash_movement", "cash_count"]),
        ("EVENTS", ["ShiftClosed"])], False),
    "customers": ("sa", 3, 2, "Customers", [
        ("API", ["CustomersApi"]),
        ("OWNS", ["customer", "credit_account", "credit_ledger"]),
        ("EVENTS", ["CreditSettled", "CreditLimitExceeded"])], False),
    "reporting": ("ed", 4, 2, "Reporting", [
        ("OWNS", ["mv_daily_sales", "mv_stock_valuation", "mv_expiry"]),
        ("NOTE", ["read-only: reads views", "of every module"])], False),
    # row 3: catalog & pricing, inventory
    "catalog": ("ca", 0, 3, "Catalog", [
        ("API", ["CatalogApi.getSku"]),
        ("OWNS", ["product", "sku", "barcode", "unit", "unit_conversion", "category", "brand"]),
        ("EVENTS", ["ProductChanged", "SkuChanged"])], False),
    "pricing": ("ca", 1, 3, "Pricing", [
        ("API", ["PricingApi.priceFor"]),
        ("OWNS", ["price_list", "price_list_item", "discount_rule"]),
        ("SPI", ["PricingRule"])], False),
    "tax": ("ca", 2, 3, "Tax", [
        ("API", ["TaxApi.calculate", "TaxApi.issueDocument"]),
        ("OWNS", ["tax_rate", "tax_document", "fiscal_submission"]),
        ("EVENTS", ["TaxDocumentIssued"])], False),
    "inventory": ("in", 3, 3, "Inventory", [
        ("API", ["InventoryApi.allocateAndDeduct"]),
        ("OWNS", ["stock_location", "batch", "stock_movement", "stock_balance", "stock_count", "stock_exception"]),
        ("EVENTS", ["StockLow", "BatchNearExpiry"])], False),
    "purchasing": ("in", 4, 3, "Purchasing", [
        ("API", ["PurchasingApi"]),
        ("OWNS", ["supplier", "goods_receipt", "goods_receipt_line"]),
        ("EVENTS", ["GoodsReceived"])], False),
    # row 4: platform
    "tenancy": ("pl", 0, 4, "Tenancy", [
        ("API", ["TenancyApi"]),
        ("OWNS", ["tenant", "tenant_module", "branch", "register"]),
        ("NOTE", ["sets app.tenant_id (RLS)"])], False),
    "iam": ("pl", 1, 4, "Identity & access", [
        ("API", ["IamApi"]),
        ("OWNS", ["app_user", "role", "role_permission", "user_role", "refresh_token"]),
        ("NOTE", ["login, 2-step sign-in,", "staff PIN, permissions"])], False),
    "devices": ("pl", 2, 4, "Devices", [
        ("API", ["DevicesApi"]),
        ("OWNS", ["device", "device_enrollment", "device_heartbeat"]),
        ("NOTE", ["enroll, heartbeat, lock"])], False),
    "audit": ("pl", 3, 4, "Audit", [
        ("API", ["AuditApi.record"]),
        ("OWNS", ["audit_log"]),
        ("NOTE", ["hash-chained, append-only"])], False),
}

# (from, side, offset, to, side, offset, kind call|event, label, label position t, label dx, label dy)
EDGES = [
    ("register-app", "B", 0, "sync", "T", 0, "call", "push sales · pull changes", .5, 0, 0),
    ("sync", "B", -40, "sales", "T", -40, "call", "recordSale", .5, 0, 0),
    ("sync", "B", 60, "cash", "T", -30, "call", "cash events", .55, 0, -4),
    ("sales", "R", 6, "payments", "L", 6, "call", "", .5, 0, 0),
    ("sales", "T", 50, "cash", "T", 10, "event", "SaleCompleted", .5, 0, -6),
    ("sales", "T", 80, "customers", "T", 0, "event", "", .5, 0, 0),
    ("payments", "R", 30, "cash", "L", 30, "event", "", .5, 0, 0),
    ("sales", "B", -60, "catalog", "T", -60, "call", "getSku", .5, 0, 0),
    ("sales", "B", 0, "pricing", "T", -40, "call", "priceFor", .55, 0, 0),
    ("sales", "B", 40, "tax", "T", -30, "call", "calculate · issueDocument", .62, 0, 0),
    ("sales", "B", 80, "inventory", "T", -20, "call", "allocateAndDeduct (same transaction)", .7, 0, 0),
    ("purchasing", "L", 40, "inventory", "R", 40, "event", "", .5, 0, 0),
]

ROWS = sorted({m[2] for m in MODULES.values()})


def wrap(items):
    lines, cur = [], ""
    for it in items:
        piece = it if not cur else cur + " · " + it
        if len(piece) <= CHARS:
            cur = piece
        else:
            if cur:
                lines.append(cur)
            cur = it
    if cur:
        lines.append(cur)
    return lines


def box_lines(key):
    out = []
    for label, items in MODULES[key][4]:
        ls = wrap(items) if label == "OWNS" else items
        for i, line in enumerate(ls):
            out.append((label if i == 0 else "", line, label))
    return out


def box_h(key):
    return HEAD + len(box_lines(key)) * LINE + 12


ROW_TOP = {}
_y = 150
for _r in ROWS:
    ROW_TOP[_r] = _y + 26                       # room for the lane label
    _y = ROW_TOP[_r] + max(box_h(k) for k, m in MODULES.items() if m[2] == _r) + 70


def col_x(c):
    return M + c * (W + G)


def box(key):
    if key == "register-app":
        return col_x(0), 74, W, 46
    g, c, r, *_ = MODULES[key]
    return col_x(c), ROW_TOP[r], W, box_h(key)


def anchor(key, side, off):
    x, y, w, h = box(key)
    return {"T": (x + w / 2 + off, y, 0, -1), "B": (x + w / 2 + off, y + h, 0, 1),
            "L": (x, y + 26 + off, -1, 0), "R": (x + w, y + 26 + off, 1, 0)}[side]


def bezier_point(p0, p1, p2, p3, t):
    u = 1 - t
    return tuple(u ** 3 * a + 3 * u * u * t * b + 3 * u * t * t * c + t ** 3 * d for a, b, c, d in zip(p0, p1, p2, p3))


def edge_svg(e, mid):
    a, sa, oa, b, sb, ob, kind, label, t, ldx, ldy = e
    x1, y1, dx1, dy1 = anchor(a, sa, oa)
    x2, y2, dx2, dy2 = anchor(b, sb, ob)
    dist = math.hypot(x2 - x1, y2 - y1)
    k = max(36, dist * .38)
    if sa == "T" and sb == "T":                 # arc over the row
        k = 60 + dist * .12
    elif sa == "B" and sb == "T":               # stay inside the gap between the rows
        k = max(24, (y2 - y1) * .55)
    p0, p1, p2, p3 = (x1, y1), (x1 + dx1 * k, y1 + dy1 * k), (x2 + dx2 * k, y2 + dy2 * k), (x2 + dx2 * 6, y2 + dy2 * 6)
    d = f"M{p0[0]:.1f},{p0[1]:.1f} C{p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f} {p3[0]:.1f},{p3[1]:.1f}"
    lx, ly = bezier_point(p0, p1, p2, p3, t)
    path = f'<path class="e {kind}" d="{d}" marker-end="url(#{mid}-{kind})"/>'
    if not label:
        return path
    return path + f'<text class="el {kind}" x="{lx + ldx:.1f}" y="{ly + ldy + 4:.1f}" text-anchor="middle">{esc(label)}</text>'


def module_svg(key):
    g, c, r, title, _, later = MODULES[key]
    x, y, w, h = box(key)
    cls = f"m {g}" + (" later" if later else "")
    out = [f'<g class="{cls}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10"/>',
           f'<text class="mt" x="{x + 12}" y="{y + 21}">{esc(title.upper())}</text>']
    if later:
        out.append(f'<text class="badge" x="{x + w - 12}" y="{y + 21}" text-anchor="end">R2</text>')
    out.append(f'<line class="sep" x1="{x}" y1="{y + HEAD}" x2="{x + w}" y2="{y + HEAD}"/>')
    for i, (lab, text, kind) in enumerate(box_lines(key)):
        ty = y + HEAD + 16 + i * LINE
        if lab:
            out.append(f'<text class="ml" x="{x + 12}" y="{ty}">{lab}</text>')
        out.append(f'<text class="mf {kind.lower()}" x="{x + LABEL_W + 8}" y="{ty}">{esc(text)}</text>')
    out.append("</g>")
    return "".join(out)


def lane(text, g, c0, c1, row):
    y = ROW_TOP[row] - 14
    return f'<text class="lane {g}" x="{col_x(c0)}" y="{y}">{esc(text.upper())}</text>'


def build_map(standalone):
    mid = "mm" + ("s" if standalone else "")
    width = col_x(4) + W + M
    plat_bottom = max(box(k)[1] + box(k)[3] for k in MODULES if MODULES[k][2] == 4)
    height = plat_bottom + 34 + M
    parts = []
    # legend
    lx = M
    for g, name in GROUPS.items():
        parts.append(f'<g class="m {g}{" later" if g == "ex" else ""}"><rect x="{lx}" y="22" width="14" height="14" rx="3"/></g>'
                     f'<text class="lg" x="{lx + 21}" y="34">{esc(name)}</text>')
        lx += 22 + len(name) * 7.4 + 26
    parts.append(f'<line class="e call" x1="{M}" y1="56" x2="{M + 34}" y2="56" marker-end="url(#{mid}-call)"/>'
                 f'<text class="lg2" x="{M + 44}" y="60">calls the other module\'s public Api (needs the answer now, same transaction)</text>'
                 f'<line class="e event" x1="{M + 520}" y1="56" x2="{M + 554}" y2="56" marker-end="url(#{mid}-event)"/>'
                 f'<text class="lg2" x="{M + 564}" y="60">publishes an event (handled afterwards, through the outbox)</text>')
    # clients
    x, y, w, h = box("register-app")
    parts.append(f'<g class="cl"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="23"/>'
                 f'<text x="{x + w / 2}" y="{y + 20}" text-anchor="middle" class="ct">REGISTER APP</text>'
                 f'<text x="{x + w / 2}" y="{y + 36}" text-anchor="middle" class="cs">offline sales, /sync/v1</text></g>')
    ax, aw = col_x(1) + 30, col_x(4) + W - col_x(1) - 30
    parts.append(f'<g class="cl"><rect x="{ax}" y="{y}" width="{aw}" height="{h}" rx="23"/>'
                 f'<text x="{ax + aw / 2}" y="{y + 20}" text-anchor="middle" class="ct">ADMIN WEB APP</text>'
                 f'<text x="{ax + aw / 2}" y="{y + 36}" text-anchor="middle" class="cs">calls REST /api/v1 → the web/ layer (controllers) of each module below</text></g>')
    # lanes
    parts.append(lane("Edge", "ed", 0, 0, 1) + lane("Later releases", "ex", 2, 4, 1))
    parts.append(lane("Sales & money", "sa", 0, 3, 2) + lane("Edge", "ed", 4, 4, 2))
    parts.append(lane("Catalog & pricing", "ca", 0, 2, 3) + lane("Inventory", "in", 3, 4, 3))
    parts.append(lane("Platform: used by every module", "pl", 0, 3, 4))
    # platform note
    nx, ny = col_x(4), ROW_TOP[4]
    parts.append(f'<g class="note"><rect x="{nx}" y="{ny}" width="{W}" height="{box_h("audit")}" rx="10"/>'
                 f'<text class="nt" x="{nx + 14}" y="{ny + 24}">EVERY MODULE</text>'
                 + "".join(f'<text class="nf" x="{nx + 14}" y="{ny + 46 + i * 17}">{esc(s)}</text>' for i, s in enumerate(
                     ["gets the tenant from Tenancy (RLS)", "checks permissions with IAM", "writes audit entries via AuditApi", "is reached only through its Api", "and its events (INV-08)"]))
                 + "</g>")
    edges = "".join(edge_svg(e, mid) for e in EDGES)
    body = "".join(module_svg(k) for k in MODULES)
    defs = (f'<defs><marker id="{mid}-call" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path class="ah call" d="M0,0 L10,5 L0,10 z"/></marker>'
            f'<marker id="{mid}-event" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path class="ah event" d="M0,0 L10,5 L0,10 z"/></marker></defs>')
    css = STYLE + (STANDALONE if standalone else "")
    bg = f'<rect class="bg" width="{width}" height="{height}"/>' if standalone else ""
    head = '<?xml version="1.0" encoding="UTF-8"?>\n' if standalone else ""
    return (f'{head}<svg class="mmap" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height:.0f}" width="{width}" height="{height:.0f}" role="img" '
            f'aria-labelledby="{mid}-title"><title id="{mid}-title">RetailOS backend modules: {len(MODULES)} modules, their public APIs, tables and events</title>'
            f'<style>{css}</style>{defs}{bg}{"".join(parts)}<g class="edges">{edges}</g>{body}</svg>')


# ------------------------------------------------------------------------------------------
# 2. Inside a module (layers)
# ------------------------------------------------------------------------------------------
def build_layers(standalone):
    mid = "ml" + ("s" if standalone else "")
    width, height = 1130, 760
    P = []

    def rect(cls, x, y, w, h, rx=10):
        P.append(f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/>')

    def text(cls, x, y, s, anchor="start"):
        P.append(f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}">{esc(s)}</text>')

    def layer(cls, x, y, w, h, title, folder, lines):
        P.append(f'<g class="ly {cls}">')
        rect("", x, y, w, h)
        text("lt", x + 14, y + 22, title)
        text("lf", x + w - 14, y + 22, folder, "end")
        P.append(f'<line class="sep" x1="{x}" y1="{y + 32}" x2="{x + w}" y2="{y + 32}"/>')
        for i, s in enumerate(lines):
            text("lx", x + 14, y + 50 + i * 16, s)
        P.append("</g>")

    def arrow(d, kind="call", label=None, lx=0, ly=0, anchor="middle"):
        P.append(f'<path class="e {kind}" d="{d}" marker-end="url(#{mid}-{kind})"/>')
        if label:
            P.append(f'<text class="el {kind}" x="{lx}" y="{ly}" text-anchor="{anchor}">{esc(label)}</text>')

    # legend
    text("lg", 30, 34, "Inside one module: the sales module as the example. Every module has the same folders (ADR-015).")
    P.append(f'<line class="e call" x1="30" y1="58" x2="64" y2="58" marker-end="url(#{mid}-call)"/>')
    text("lg2", 74, 62, "calls")
    P.append(f'<line class="e event" x1="130" y1="58" x2="164" y2="58" marker-end="url(#{mid}-event)"/>')
    text("lg2", 174, 62, "publishes an event")
    P.append(f'<line class="e uses" x1="330" y1="58" x2="364" y2="58"/>')
    text("lg2", 374, 62, "uses")

    # module frame
    fx, fy, fw, fh = 300, 92, 520, 560
    rect("frame", fx, fy, fw, fh, 14)
    text("ft", fx + 16, fy + 24, "SALES MODULE")
    text("fs", fx + fw - 16, fy + 24, "com.devcity.retailos.sales", "end")
    # public row
    py = fy + 40
    pub = [("SalesApi.java", "the only way in;", "SaleService implements it", 318, 170), ("spi/", "SaleLineValidator …", "extensions implement", 500, 140), ("events/", "SaleCompleted", "SaleReturned", 652, 152)]
    for title, l1, l2, x, w in pub:
        P.append('<g class="ly pub">')
        rect("", x, py, w, 74)
        text("lt", x + 12, py + 21, title)
        P.append(f'<line class="sep" x1="{x}" y1="{py + 31}" x2="{x + w}" y2="{py + 31}"/>')
        text("lx", x + 12, py + 49, l1)
        text("lx", x + 12, py + 65, l2)
        P.append("</g>")
    text("pl", 318, py - 6, "PUBLIC: other modules may use these")
    # internal frame
    ix, iy, iw, ih = 314, 236, 492, 400
    rect("inner", ix, iy, iw, ih, 12)
    text("it", ix + 14, iy + 20, "internal/  ·  NOT visible to other modules (the boundary test fails)")
    lx_, lw = 336, 300
    layer("web", lx_, 268, lw, 92, "Controller", "web/",
          ["SaleController, SaleExceptionController", "request/response DTOs, mappers", "HTTP only: validate, check permission"])
    layer("svc", lx_, 392, lw, 108, "Service", "service/",
          ["SaleService, SaleReturnService", "all business rules, @Transactional,", "audit, events; plain helper classes", "e.g. TaxCalculator (shared vectors)"])
    layer("repo", lx_, 532, lw, 88, "Repository", "repository/",
          ["SaleRepository (Spring Data JPA)", "SaleQueryRepository (JdbcClient SQL)", "database access only"])
    layer("mdl", 660, 392, 130, 228, "Model", "model/",
          ["Sale", "SaleLine", "SaleLine-", "  Allocation", "", "Money, Quantity", "", "entities and", "value objects"])
    # database
    dx, dy, dw = 336, 684, 300
    P.append(f'<g class="db"><path d="M{dx},{dy + 10} a{dw / 2},10 0 0 1 {dw},0 v40 a{dw / 2},10 0 0 1 {-dw},0 z"/>'
             f'<path class="top" d="M{dx},{dy + 10} a{dw / 2},10 0 0 0 {dw},0"/></g>')
    text("dbt", dx + dw / 2, dy + 38, "PostgreSQL · sale, sale_line … (RLS on)", "middle")

    # callers (left)
    P.append('<g class="cl">')
    rect("", 30, 280, 220, 66, 33)
    text("ct", 140, 306, "ADMIN WEB APP", "middle")
    text("cs", 140, 324, "REST /api/v1/sales", "middle")
    P.append("</g><g class=\"cl\">")
    rect("", 30, py + 4, 220, 66, 33)
    text("ct", 140, py + 30, "SYNC OR ANOTHER MODULE", "middle")
    text("cs", 140, py + 48, "calls SalesApi.recordSale(…)", "middle")
    P.append("</g>")
    # other modules (right)
    P.append('<g class="ot">')
    rect("", 870, 400, 230, 112)
    text("ot-t", 884, 422, "OTHER MODULES' APIs")
    for i, s in enumerate(["InventoryApi.allocateAndDeduct", "TaxApi.issueDocument", "PaymentsApi · AuditApi.record"]):
        text("lx", 884, 446 + i * 18, s)
    P.append("</g><g class=\"ot\">")
    rect("", 870, py, 230, 92)
    text("ot-t", 884, py + 22, "LISTENERS ELSEWHERE")
    for i, s in enumerate(["Cash, Customers, Reporting", "run after the sale is saved", "(outbox, retried)"]):
        text("lx", 884, py + 44 + i * 16, s)
    P.append("</g>")

    # arrows
    arrow(f"M250,313 L{lx_ - 6},313", "call", "HTTP", 292, 305)
    arrow(f"M250,{py + 37} L312,{py + 37}", "call")
    # SalesApi -> service (down the left channel)
    arrow(f"M326,{py + 74} L326,446 L{lx_ - 6},446", "call")
    arrow(f"M{lx_ + lw / 2},360 L{lx_ + lw / 2},386", "call")
    text("el call", lx_ + lw / 2 + 8, 378, "one method call")
    arrow(f"M{lx_ + lw / 2},500 L{lx_ + lw / 2},526", "call")
    arrow(f"M{lx_ + lw / 2},620 L{lx_ + lw / 2},686", "call", "SQL", lx_ + lw / 2 + 22, 658)
    # uses model
    P.append(f'<path class="e uses" d="M{lx_ + lw},440 L656,440"/><path class="e uses" d="M{lx_ + lw},576 L656,576"/>')
    # service -> other modules
    arrow(f"M{lx_ + lw},470 L644,470 L644,640 L840,640 L840,456 L864,456", "call")
    text("el call", 744, 632, "calls only their Api", "middle")
    # service -> events
    arrow(f"M{lx_ + lw},404 L648,404 L648,248 L728,248 L728,{py + 80}", "event", "publishes", 690, 242)
    # events -> listeners
    arrow(f"M804,{py + 37} L864,{py + 37}", "event")
    # extensions -> spi
    text("el ex", 570, py + 96, "R2 industry extensions plug in here", "middle")

    defs = (f'<defs><marker id="{mid}-call" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path class="ah call" d="M0,0 L10,5 L0,10 z"/></marker>'
            f'<marker id="{mid}-event" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path class="ah event" d="M0,0 L10,5 L0,10 z"/></marker></defs>')
    css = STYLE + (STANDALONE if standalone else "")
    bg = f'<rect class="bg" width="{width}" height="{height}"/>' if standalone else ""
    head = '<?xml version="1.0" encoding="UTF-8"?>\n' if standalone else ""
    return (f'{head}<svg class="mmap" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img" '
            f'aria-labelledby="{mid}-title"><title id="{mid}-title">Inside a RetailOS module: controller, service, repository and model layers</title>'
            f'<style>{css}</style>{defs}{bg}{"".join(P)}</svg>')


# ------------------------------------------------------------------------------------------
STYLE = """
.mmap{--pl:#2F68D8;--pl-bg:#EAF1FD;--ca:#D2612B;--ca-bg:#FDEEE5;--in:#16855A;--in-bg:#E4F5EC;--sa:#2E3A5A;--sa-bg:#E8EBF2;
 --ed:#0E7C86;--ed-bg:#E2F4F5;--ex:#7A4FD0;--ex-bg:#F2ECFC;--ln:#5E6779;--ev:#B5418C;--cl:#F1F3F7;--clb:#B9C0CC;--bgc:#fff;
 --web:#7A4FD0;--web-bg:#F2ECFC;--svc:#2F68D8;--svc-bg:#EAF1FD;--repo:#16855A;--repo-bg:#E4F5EC;--mdl:#D2612B;--mdl-bg:#FDEEE5;--pub:#2E3A5A;--pub-bg:#E8EBF2;
 --tx:var(--text,#272932);--tx2:var(--text-3,#6F7889);font-family:Inter,"Segoe UI",system-ui,sans-serif}
.mmap .m rect{stroke-width:1.6}
.mmap .m.pl rect{fill:var(--pl-bg);stroke:var(--pl)} .mmap .m.ca rect{fill:var(--ca-bg);stroke:var(--ca)} .mmap .m.in rect{fill:var(--in-bg);stroke:var(--in)}
.mmap .m.sa rect{fill:var(--sa-bg);stroke:var(--sa)} .mmap .m.ed rect{fill:var(--ed-bg);stroke:var(--ed)} .mmap .m.ex rect{fill:var(--ex-bg);stroke:var(--ex)}
.mmap .m.later rect{stroke-dasharray:6 4} .mmap .m.later{opacity:.8}
.mmap .pl .mt,.mmap .lane.pl{fill:var(--pl)} .mmap .ca .mt,.mmap .lane.ca{fill:var(--ca)} .mmap .in .mt,.mmap .lane.in{fill:var(--in)}
.mmap .sa .mt,.mmap .lane.sa{fill:var(--sa)} .mmap .ed .mt,.mmap .lane.ed{fill:var(--ed)} .mmap .ex .mt,.mmap .lane.ex,.mmap .badge,.mmap .el.ex{fill:var(--ex)}
.mmap .m .sep,.mmap .ly .sep{stroke:currentColor;opacity:.3}
.mmap .m.pl{color:var(--pl)} .mmap .m.ca{color:var(--ca)} .mmap .m.in{color:var(--in)} .mmap .m.sa{color:var(--sa)} .mmap .m.ed{color:var(--ed)} .mmap .m.ex{color:var(--ex)}
.mmap .mt{font-size:13px;font-weight:800;letter-spacing:.05em} .mmap .badge{font-size:11px;font-weight:800}
.mmap .ml{font-size:9.5px;font-weight:800;letter-spacing:.08em;fill:var(--tx2)}
.mmap .mf{font-size:12px;fill:var(--tx)} .mmap .mf.api{font-weight:700} .mmap .mf.events{fill:var(--ev)} .mmap .mf.spi{fill:var(--ex)} .mmap .mf.note{fill:var(--tx2);font-style:italic}
.mmap .lane{font-size:12.5px;font-weight:800;letter-spacing:.08em}
.mmap .lg{font-size:13px;fill:var(--tx);font-weight:600} .mmap .lg2{font-size:12.5px;fill:var(--tx2)}
.mmap .e{fill:none;stroke-width:1.6} .mmap .e.call{stroke:var(--ln)} .mmap .e.event{stroke:var(--ev);stroke-dasharray:6 4} .mmap .e.uses{stroke:var(--tx2);stroke-dasharray:2 4}
.mmap .ah.call{fill:var(--ln)} .mmap .ah.event{fill:var(--ev)}
.mmap .el{font-size:11.5px;font-weight:600;paint-order:stroke;stroke:var(--bgc);stroke-width:5px;stroke-linejoin:round}
.mmap .el.call{fill:var(--tx)} .mmap .el.event{fill:var(--ev)}
.mmap .cl rect{fill:var(--cl);stroke:var(--clb);stroke-width:1.4} .mmap .ct{font-size:12.5px;font-weight:800;letter-spacing:.06em;fill:var(--tx)} .mmap .cs{font-size:12px;fill:var(--tx2)}
.mmap .note rect{fill:none;stroke:var(--pl);stroke-width:1.4;stroke-dasharray:3 4} .mmap .nt{font-size:12.5px;font-weight:800;letter-spacing:.06em;fill:var(--pl)} .mmap .nf{font-size:12px;fill:var(--tx)}
.mmap .frame{fill:none;stroke:var(--sa);stroke-width:2} .mmap .ft{font-size:14px;font-weight:800;letter-spacing:.06em;fill:var(--sa)} .mmap .fs{font-size:12px;fill:var(--tx2);font-family:Consolas,monospace}
.mmap .inner{fill:none;stroke:var(--tx2);stroke-width:1.3;stroke-dasharray:5 4} .mmap .it{font-size:11.5px;font-weight:700;fill:var(--tx2)} .mmap .pl{font-size:11px;font-weight:800;letter-spacing:.06em;fill:var(--sa)}
.mmap .ly rect{stroke-width:1.6}
.mmap .ly.web{color:var(--web)} .mmap .ly.web rect{fill:var(--web-bg);stroke:var(--web)} .mmap .ly.svc{color:var(--svc)} .mmap .ly.svc rect{fill:var(--svc-bg);stroke:var(--svc)}
.mmap .ly.repo{color:var(--repo)} .mmap .ly.repo rect{fill:var(--repo-bg);stroke:var(--repo)} .mmap .ly.mdl{color:var(--mdl)} .mmap .ly.mdl rect{fill:var(--mdl-bg);stroke:var(--mdl)}
.mmap .ly.pub{color:var(--pub)} .mmap .ly.pub rect{fill:var(--pub-bg);stroke:var(--pub)}
.mmap .lt{font-size:13.5px;font-weight:800;fill:currentColor} .mmap .lf{font-size:12px;font-weight:700;fill:currentColor;font-family:Consolas,monospace} .mmap .lx{font-size:12px;fill:var(--tx)}
.mmap .db path{fill:var(--cl);stroke:var(--clb);stroke-width:1.4} .mmap .db .top{fill:none} .mmap .dbt{font-size:12.5px;font-weight:700;fill:var(--tx)}
.mmap .ot rect{fill:var(--cl);stroke:var(--clb);stroke-width:1.4} .mmap .ot-t{font-size:12px;font-weight:800;letter-spacing:.05em;fill:var(--tx2)}
:root[data-theme="dark"] .mmap{--pl:#7FA8FF;--pl-bg:#1B2840;--ca:#FF9D6B;--ca-bg:#382218;--in:#5BD49A;--in-bg:#142D24;--sa:#B4C0DE;--sa-bg:#252B3B;--ed:#4FC9D2;--ed-bg:#12292C;--ex:#B99BFF;--ex-bg:#251C3A;--ln:#A3ABBB;--ev:#F28AC8;--cl:#2E313B;--clb:#4A4F5D;--bgc:#272932;
 --web:#B99BFF;--web-bg:#251C3A;--svc:#7FA8FF;--svc-bg:#1B2840;--repo:#5BD49A;--repo-bg:#142D24;--mdl:#FF9D6B;--mdl-bg:#382218;--pub:#B4C0DE;--pub-bg:#252B3B}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .mmap{--pl:#7FA8FF;--pl-bg:#1B2840;--ca:#FF9D6B;--ca-bg:#382218;--in:#5BD49A;--in-bg:#142D24;--sa:#B4C0DE;--sa-bg:#252B3B;--ed:#4FC9D2;--ed-bg:#12292C;--ex:#B99BFF;--ex-bg:#251C3A;--ln:#A3ABBB;--ev:#F28AC8;--cl:#2E313B;--clb:#4A4F5D;--bgc:#272932;
 --web:#B99BFF;--web-bg:#251C3A;--svc:#7FA8FF;--svc-bg:#1B2840;--repo:#5BD49A;--repo-bg:#142D24;--mdl:#FF9D6B;--mdl-bg:#382218;--pub:#B4C0DE;--pub-bg:#252B3B}}
"""
STANDALONE = """
.mmap .bg{fill:#FDFFFC}
@media (prefers-color-scheme:dark){.mmap{--pl:#7FA8FF;--pl-bg:#1B2840;--ca:#FF9D6B;--ca-bg:#382218;--in:#5BD49A;--in-bg:#142D24;--sa:#B4C0DE;--sa-bg:#252B3B;--ed:#4FC9D2;--ed-bg:#12292C;--ex:#B99BFF;--ex-bg:#251C3A;--ln:#A3ABBB;--ev:#F28AC8;--cl:#2E313B;--clb:#4A4F5D;--bgc:#1E2028;
 --web:#B99BFF;--web-bg:#251C3A;--svc:#7FA8FF;--svc-bg:#1B2840;--repo:#5BD49A;--repo-bg:#142D24;--mdl:#FF9D6B;--mdl-bg:#382218;--pub:#B4C0DE;--pub-bg:#252B3B;--tx:#E6E9EF;--tx2:#9AA3B5}.mmap .bg{fill:#1E2028}}
"""


def inject(page, marker, svg):
    p = DOC / page
    s = p.read_text(encoding="utf-8")
    start, end = f"<!-- {marker}:start -->", f"<!-- {marker}:end -->"
    if start not in s:
        raise SystemExit(f"Add the {marker} markers to {page} first")
    i, j = s.index(start) + len(start), s.index(end)
    p.write_text(s[:i] + "\n" + svg + "\n" + s[j:], encoding="utf-8")


if __name__ == "__main__":
    (DOC / "assets" / "module-map.svg").write_text(build_map(True), encoding="utf-8")
    (DOC / "assets" / "module-layers.svg").write_text(build_layers(True), encoding="utf-8")
    inject("modules.html", "module-map", build_map(False))
    inject("architecture.html", "module-map", build_map(False))
    inject("architecture.html", "module-layers", build_layers(False))
    print(f"module map: {len(MODULES)} modules, {len(EDGES)} links; layers diagram -> assets/ and modules.html, architecture.html")
