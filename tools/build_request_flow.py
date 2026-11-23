"""Build the request pipeline diagram (security.html#request-pipeline and assets/request-flow.svg).

Usage:  python Doc/tools/build_request_flow.py
Edit ZONES / STEPS below when a filter is added, removed or moved, then run it again.
The order must match the SecurityFilterChain configuration shown on the security page.
"""
import html
import pathlib

DOC = pathlib.Path(__file__).resolve().parent.parent
esc = html.escape

# zone key: (title, [explanation lines])
ZONES = {
    "out": ("Outside the app", ["the client and the", "reverse proxy"]),
    "srv": ("Servlet filters", ["every request, before", "Spring Security"]),
    "sec": ("Spring Security", ["filter chain for /api/v1", "and /sync/v1. Public:", "login, refresh, enroll,", "JWKS, health"]),
    "mvc": ("Spring MVC", ["DispatcherServlet picks", "the controller"]),
    "svc": ("Service and database", ["the module's layers", "(ADR-015)"]),
}

# (zone, number, title, detail, tag, stop) ; tag: ours | spring | proxy | client ; stop: text of the response if it stops here
STEPS = [
    ("out", "", "Admin web app · Register app", "Bearer token; the register adds X-Device-Id, X-App-Version", "client", None),
    ("out", "1", "Caddy reverse proxy", "HTTPS, HSTS, body size limit, coarse limit per IP", "proxy", "413 too large · 429 too many requests"),
    ("srv", "2", "RequestIdFilter", "X-Request-Id (or a new one), trace span, log fields", "ours", None),
    ("srv", "3", "GzipRequestFilter", "unzips gzipped bodies on /sync/v1/push only", "ours", "400 · body is not valid gzip"),
    ("sec", "4", "HeaderWriterFilter", "adds HSTS, nosniff, frame-deny to every response", "spring", None),
    ("sec", "5", "CorsFilter", "only the admin web origin may call /api/v1", "spring", "403 · origin not allowed"),
    ("sec", "6", "CsrfFilter", "refresh cookie on /api/v1/auth only; bearer APIs skip it", "spring", "403 · CSRF token missing"),
    ("sec", "7", "BearerTokenAuthenticationFilter", "JWT signature (JWKS), expiry, token version ver", "spring", "401 AUTH-001 · token missing or expired"),
    ("sec", "8", "RateLimitFilter", "Bucket4j: by IP (login, PIN), user (admin), device (sync)", "ours", "429 · with a Retry-After header"),
    ("sec", "9", "ContextFilter", "builds CurrentContext: tenant, user, branch, device", "ours", None),
    ("sec", "10", "ClientCheckFilter", "device matches token, not locked; app version; tenant", "ours", "403 DEV-002 · 426 DEV-004 · 403 TEN-001"),
    ("sec", "11", "AuthorizationFilter", "URL rules: public, signed in, device only, support only", "spring", "401 / 403 · not allowed for this URL"),
    ("mvc", "12", "IdempotencyInterceptor", "POST creating money or stock: same key → stored response", "ours", "same key again → the stored response"),
    ("mvc", "13", "Controller  (web/)", "@Valid request body; @PreAuthorize permission + branch", "ours", "400 VAL-001 · 403 AUTH-003"),
    ("svc", "14", "Service  (service/)  @Transactional", "transaction starts → set_config('app.tenant_id', …)", "ours", None),
    ("svc", "15", "Repository → PostgreSQL", "row-level security: only this tenant's rows", "ours", "no tenant set → no rows (fails closed)"),
]

WIDTH = 1180
BAND_X, BAND_W = 60, 1100
BOX_X, BOX_W, BOX_H, GAP = 290, 470, 50, 14
PILL_X, PILL_W = 822, 318
ZONE_PAD, ZONE_GAP = 16, 22
TOP = 108


def layout():
    pos, zones, y, last = {}, {}, TOP, None
    for i, (z, *_rest) in enumerate(STEPS):
        if z != last:
            if last is not None:
                zones[last][1] = y - GAP + ZONE_PAD
                y += ZONE_GAP + 2 * ZONE_PAD - GAP
            zones[z] = [y - ZONE_PAD, None]
            last = z
        pos[i] = y
        y += BOX_H + GAP
    zones[last][1] = y - GAP + ZONE_PAD
    return pos, zones, y - GAP + ZONE_PAD


def build(standalone):
    mid = "rq" + ("s" if standalone else "")
    pos, zones, bottom = layout()
    resp_y = bottom + 26
    height = resp_y + 84 + 24
    P = []
    t = lambda cls, x, y, s, a="start": P.append(f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{a}">{esc(s)}</text>')

    # legend
    t("lg", 30, 30, "How one API request travels through the backend, top to bottom. The response goes back up the same way.")
    P.append('<g class="tag ours"><rect x="30" y="46" width="44" height="18" rx="9"/></g>')
    t("tg ours", 52, 59, "OURS", "middle")
    t("lg2", 82, 59, "we write it")
    P.append('<g class="tag spring"><rect x="178" y="46" width="56" height="18" rx="9"/></g>')
    t("tg spring", 206, 59, "SPRING", "middle")
    t("lg2", 242, 59, "built into Spring Security or Spring MVC")
    P.append('<g class="stop"><rect x="530" y="46" width="22" height="18" rx="9"/></g>')
    t("lg2", 560, 59, "the request stops here and gets this response (as Problem Details)")

    # zones
    for z, (y0, y1) in zones.items():
        title, lines = ZONES[z]
        P.append(f'<g class="zone {z}"><rect x="{BAND_X}" y="{y0}" width="{BAND_W}" height="{y1 - y0}" rx="14"/></g>')
        t(f"zt {z}", BAND_X + 16, y0 + 24, title.upper())
        for i, s in enumerate(lines):
            t("zl", BAND_X + 16, y0 + 44 + i * 16, s)

    # flow arrows between steps
    cx = BOX_X + BOX_W / 2
    for i in range(len(STEPS) - 1):
        y_from, y_to = pos[i] + BOX_H, pos[i + 1]
        P.append(f'<path class="flow" d="M{cx},{y_from} L{cx},{y_to - 3}" marker-end="url(#{mid}-flow)"/>')

    # steps
    for i, (z, num, title, detail, tag, stop) in enumerate(STEPS):
        y = pos[i]
        cls = "client" if tag == "client" else z
        P.append(f'<g class="step {cls}"><rect x="{BOX_X}" y="{y}" width="{BOX_W}" height="{BOX_H}" rx="{25 if tag == "client" else 9}"/></g>')
        tx = BOX_X + 16
        if num:
            P.append(f'<g class="num {z}"><circle cx="{BOX_X + 24}" cy="{y + BOX_H / 2}" r="13"/></g>')
            t("nm", BOX_X + 24, y + BOX_H / 2 + 4.5, num, "middle")
            tx = BOX_X + 46
        t("st", tx, y + 21, title)
        t("sd", tx, y + 39, detail)
        if tag in ("ours", "spring", "proxy"):
            w = {"ours": 44, "spring": 56, "proxy": 50}[tag]
            P.append(f'<g class="tag {tag}"><rect x="{BOX_X + BOX_W - w - 10}" y="{y + 9}" width="{w}" height="18" rx="9"/></g>')
            t(f"tg {tag}", BOX_X + BOX_W - w / 2 - 10, y + 22, tag.upper(), "middle")
        if stop:
            fails_closed = "fails closed" in stop or "stored response" in stop
            kind = "info" if fails_closed else "stop"
            my = y + BOX_H / 2
            P.append(f'<path class="side {kind}" d="M{BOX_X + BOX_W},{my} L{PILL_X - 4},{my}" marker-end="url(#{mid}-{kind})"/>')
            P.append(f'<g class="{kind}"><rect x="{PILL_X}" y="{my - 15}" width="{PILL_W}" height="30" rx="15"/></g>')
            t(f"pt {kind}", PILL_X + 16, my + 4.5, stop)

    # response box + return path
    P.append(f'<g class="resp"><rect x="{BOX_X}" y="{resp_y}" width="{PILL_X + PILL_W - BOX_X}" height="84" rx="12"/></g>')
    t("rt", BOX_X + 16, resp_y + 24, "ON THE WAY BACK")
    for i, s in enumerate(["Errors anywhere above become Problem Details with a stable code and the requestId (@RestControllerAdvice).",
                           "The response is compressed (gzip/br) and gets security headers and X-Request-Id.",
                           "ContextFilter clears the context and the log fields in finally, so nothing leaks to the next request."]):
        t("rl", BOX_X + 16, resp_y + 44 + i * 16, s)
    first_mid = pos[0] + BOX_H / 2
    P.append(f'<path class="back" d="M{BOX_X},{resp_y + 42} L36,{resp_y + 42} L36,{TOP - 26} L{cx},{TOP - 26} L{cx},{pos[0] - 4}" marker-end="url(#{mid}-back)"/>')
    P.append(f'<text class="bl" x="26" y="{(TOP + resp_y) / 2}" text-anchor="middle" transform="rotate(-90 26 {(TOP + resp_y) / 2})">RESPONSE GOES BACK UP THROUGH THE SAME FILTERS</text>')

    defs = "<defs>" + "".join(
        f'<marker id="{mid}-{k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ah {k}" d="M0,0 L10,5 L0,10 z"/></marker>'
        for k in ("flow", "stop", "info", "back")) + "</defs>"
    css = STYLE + (STANDALONE if standalone else "")
    bg = f'<rect class="bg" width="{WIDTH}" height="{height}"/>' if standalone else ""
    head = '<?xml version="1.0" encoding="UTF-8"?>\n' if standalone else ""
    return (f'{head}<svg class="rqf" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height}" width="{WIDTH}" height="{height}" role="img" '
            f'aria-labelledby="{mid}-title"><title id="{mid}-title">Request pipeline: the filters an API request passes through, in order</title>'
            f'<style>{css}</style>{defs}{bg}{"".join(P)}</svg>')


STYLE = """
.rqf{--out:#6B7385;--out-bg:#F1F3F7;--srv:#0E7C86;--srv-bg:#E2F4F5;--sec:#2F68D8;--sec-bg:#EAF1FD;--mvc:#7A4FD0;--mvc-bg:#F2ECFC;--svc:#16855A;--svc-bg:#E4F5EC;
 --stop:#C2412D;--stop-bg:#FDECEA;--info:#16855A;--info-bg:#E4F5EC;--card:#FFFFFF;--ln:#5E6779;--back:#B07A10;
 --tx:var(--text,#272932);--tx2:var(--text-3,#6F7889);font-family:Inter,"Segoe UI",system-ui,sans-serif}
.rqf .zone rect{stroke-width:1.2;stroke-opacity:.5}
.rqf .zone.out rect{fill:var(--out-bg);stroke:var(--out)} .rqf .zone.srv rect{fill:var(--srv-bg);stroke:var(--srv)} .rqf .zone.sec rect{fill:var(--sec-bg);stroke:var(--sec)}
.rqf .zone.mvc rect{fill:var(--mvc-bg);stroke:var(--mvc)} .rqf .zone.svc rect{fill:var(--svc-bg);stroke:var(--svc)}
.rqf .zt{font-size:12.5px;font-weight:800;letter-spacing:.07em} .rqf .zl{font-size:12px;fill:var(--tx2)}
.rqf .zt.out{fill:var(--out)} .rqf .zt.srv{fill:var(--srv)} .rqf .zt.sec{fill:var(--sec)} .rqf .zt.mvc{fill:var(--mvc)} .rqf .zt.svc{fill:var(--svc)}
.rqf .step rect{fill:var(--card);stroke-width:1.6}
.rqf .step.out rect,.rqf .step.client rect{stroke:var(--out)} .rqf .step.srv rect{stroke:var(--srv)} .rqf .step.sec rect{stroke:var(--sec)}
.rqf .step.mvc rect{stroke:var(--mvc)} .rqf .step.svc rect{stroke:var(--svc)} .rqf .step.client rect{fill:var(--out-bg)}
.rqf .num circle{stroke:none} .rqf .num.out circle{fill:var(--out)} .rqf .num.srv circle{fill:var(--srv)} .rqf .num.sec circle{fill:var(--sec)} .rqf .num.mvc circle{fill:var(--mvc)} .rqf .num.svc circle{fill:var(--svc)}
.rqf .nm{font-size:12px;font-weight:800;fill:#fff}
.rqf .st{font-size:13.5px;font-weight:700;fill:var(--tx);font-family:Consolas,"Cascadia Code",monospace} .rqf .sd{font-size:12px;fill:var(--tx2)}
.rqf .tag rect{stroke-width:1.3} .rqf .tag.ours rect{fill:var(--sec);stroke:var(--sec)} .rqf .tag.spring rect{fill:none;stroke:var(--tx2)} .rqf .tag.proxy rect{fill:none;stroke:var(--out)}
.rqf .tg{font-size:10px;font-weight:800;letter-spacing:.06em} .rqf .tg.ours{fill:#fff} .rqf .tg.spring{fill:var(--tx2)} .rqf .tg.proxy{fill:var(--out)}
.rqf .flow{stroke:var(--ln);stroke-width:1.6;fill:none} .rqf .ah.flow{fill:var(--ln)}
.rqf .side{fill:none;stroke-width:1.4;stroke-dasharray:4 3} .rqf .side.stop{stroke:var(--stop)} .rqf .side.info{stroke:var(--info)} .rqf .ah.stop{fill:var(--stop)} .rqf .ah.info{fill:var(--info)}
.rqf .stop rect{fill:var(--stop-bg);stroke:var(--stop);stroke-width:1.3} .rqf .info rect{fill:var(--info-bg);stroke:var(--info);stroke-width:1.3}
.rqf .pt{font-size:12px;font-weight:600} .rqf .pt.stop{fill:var(--stop)} .rqf .pt.info{fill:var(--info)}
.rqf .resp rect{fill:var(--out-bg);stroke:var(--back);stroke-width:1.6} .rqf .rt{font-size:12.5px;font-weight:800;letter-spacing:.07em;fill:var(--back)} .rqf .rl{font-size:12px;fill:var(--tx)}
.rqf .back{fill:none;stroke:var(--back);stroke-width:1.8;stroke-dasharray:7 5} .rqf .ah.back{fill:var(--back)} .rqf .bl{font-size:11px;font-weight:800;letter-spacing:.08em;fill:var(--back)}
.rqf .lg{font-size:13px;font-weight:600;fill:var(--tx)} .rqf .lg2{font-size:12.5px;fill:var(--tx2)}
:root[data-theme="dark"] .rqf{--out:#9AA3B5;--out-bg:#2A2D37;--srv:#4FC9D2;--srv-bg:#12292C;--sec:#7FA8FF;--sec-bg:#1B2840;--mvc:#B99BFF;--mvc-bg:#251C3A;--svc:#5BD49A;--svc-bg:#142D24;
 --stop:#FF8A7A;--stop-bg:#3A1A17;--info:#5BD49A;--info-bg:#142D24;--card:#22252E;--ln:#A3ABBB;--back:#F0B45A}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .rqf{--out:#9AA3B5;--out-bg:#2A2D37;--srv:#4FC9D2;--srv-bg:#12292C;--sec:#7FA8FF;--sec-bg:#1B2840;--mvc:#B99BFF;--mvc-bg:#251C3A;--svc:#5BD49A;--svc-bg:#142D24;
 --stop:#FF8A7A;--stop-bg:#3A1A17;--info:#5BD49A;--info-bg:#142D24;--card:#22252E;--ln:#A3ABBB;--back:#F0B45A}}
.rqf .tg.ours{fill:var(--card)}
"""
STANDALONE = """
.rqf .bg{fill:#FDFFFC}
@media (prefers-color-scheme:dark){.rqf{--out:#9AA3B5;--out-bg:#2A2D37;--srv:#4FC9D2;--srv-bg:#12292C;--sec:#7FA8FF;--sec-bg:#1B2840;--mvc:#B99BFF;--mvc-bg:#251C3A;--svc:#5BD49A;--svc-bg:#142D24;
 --stop:#FF8A7A;--stop-bg:#3A1A17;--info:#5BD49A;--info-bg:#142D24;--card:#22252E;--ln:#A3ABBB;--back:#F0B45A;--tx:#E6E9EF;--tx2:#9AA3B5}.rqf .bg{fill:#1E2028}}
"""

if __name__ == "__main__":
    (DOC / "assets" / "request-flow.svg").write_text(build(True), encoding="utf-8")
    page = DOC / "security.html"
    s = page.read_text(encoding="utf-8")
    start, end = "<!-- request-flow:start -->", "<!-- request-flow:end -->"
    if start not in s:
        raise SystemExit("Add the request-flow markers to security.html first")
    i, j = s.index(start) + len(start), s.index(end)
    page.write_text(s[:i] + "\n" + build(False) + "\n" + s[j:], encoding="utf-8")
    print(f"request flow: {len(STEPS)} steps -> assets/request-flow.svg and security.html")
