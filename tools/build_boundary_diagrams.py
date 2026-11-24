"""Build the module boundary diagrams for module-boundaries.html:

  1. What one module can see of another -> assets/boundary-map.svg   (marker boundary-map)
  2. Crossing a boundary the right way  -> assets/boundary-cross.svg (marker boundary-cross)
  3. How the boundary check runs        -> assets/boundary-check.svg (marker boundary-check)

Usage:  python Doc/tools/build_boundary_diagrams.py
Shares the colours and drawing helpers of build_repo_diagrams.py.
"""
from build_repo_diagrams import DOC, STANDALONE, STYLE, Svg, esc, inject

# extra styles: allowed (green) and forbidden (red, dashed) arrows, the private frame, events
EXTRA = """
.rpo .e.ok{stroke:var(--st);stroke-width:2} .rpo .ah.ok{fill:var(--st)} .rpo .el.ok{fill:var(--st)}
.rpo .e.no{stroke:var(--fx);stroke-width:2;stroke-dasharray:7 5} .rpo .ah.no{fill:var(--fx)} .rpo .el.no{fill:var(--fx)}
.rpo .e.ev{stroke:var(--ap);stroke-width:2;stroke-dasharray:6 4} .rpo .ah.ev{fill:var(--ap)} .rpo .el.ev{fill:var(--ap)}
.rpo .pv{fill:none;stroke:var(--in);stroke-width:1.4;stroke-dasharray:5 4} .rpo .pvt{font-size:12px;font-weight:800;letter-spacing:.05em;fill:var(--in)}
.rpo .pkg{font-size:12px;fill:var(--tx2);font-family:Consolas,"Cascadia Code",monospace}
.rpo .b.fail rect{fill:var(--bgc);stroke:var(--fx);stroke-width:2} .rpo .b.fail{color:var(--fx)}
.rpo .b.pass rect{fill:var(--st-bg);stroke:var(--st);stroke-width:2} .rpo .b.pass{color:var(--st)}
"""
KINDS = ("use", "ok", "no", "ev")


class BSvg(Svg):
    def render(self, width, height, title, standalone):
        defs = "<defs>" + "".join(
            f'<marker id="{self.mid}-{k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" '
            f'orient="auto-start-reverse"><path class="ah {k}" d="M0,0 L10,5 L0,10 z"/></marker>' for k in KINDS) + "</defs>"
        css = STYLE + EXTRA + (STANDALONE if standalone else "")
        bg = f'<rect class="bg" width="{width}" height="{height}"/>' if standalone else ""
        head = '<?xml version="1.0" encoding="UTF-8"?>\n' if standalone else ""
        return (f'{head}<svg class="rpo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" '
                f'height="{height}" role="img" aria-labelledby="{self.mid}-title"><title id="{self.mid}-title">{esc(title)}</title>'
                f'<style>{css}</style>{defs}{bg}{"".join(self.p)}</svg>')


def module_frame(s, x, name, public, internal):
    """One module: a frame, its public row, and its private internal/ frame with four layer boxes."""
    s.p.append(f'<rect class="frame" x="{x}" y="76" width="400" height="400" rx="16"/>')
    s.text("ft", x + 16, 100, f"MODULE · {name}")
    s.text("pkg", x + 16, 118, f"com.devcity.retailos.{name}")
    px = x + 16
    for title, line, w in public:
        s.box("st", px, 132, w, 62, title, [line])
        px += w + 10
    s.p.append(f'<rect class="pv" x="{x + 16}" y="210" width="368" height="250" rx="12"/>')
    s.text("pvt", x + 30, 232, f"internal/  ·  private to {name}")
    for i, (title, lines) in enumerate(internal):
        bx = x + 30 + (i % 2) * 177
        by = 246 + (i // 2) * 106
        s.box("in", bx, by, 163, 90, title, lines)


def boundary_map(standalone):
    s = BSvg("bmap" + ("s" if standalone else ""))
    s.legend([("st", "Public: other modules may use"), ("in", "Private: internal/"), ("pk", "platform: open to every module")])
    s.text("lg2", 30, 56, "Arrows point from the code that uses to the code it uses. Green: allowed. Red dashed: the boundary check fails the build.")
    module_frame(s, 30, "sales",
                 [("SalesApi", "root package", 116), ("events/", "SaleCompleted", 116), ("spi/", "validators", 116)],
                 [("web/", ["controllers", "REST /api/v1/sales"]), ("service/", ["SaleService", "business rules"]),
                  ("repository/", ["JPA, JdbcClient"]), ("model/", ["entities"])])
    module_frame(s, 750, "inventory",
                 [("InventoryApi", "root package", 180), ("events/", "StockLow, BatchNearExpiry", 178)],
                 [("service/", ["StockService", "FEFO allocation"]), ("web/", ["controllers"]),
                  ("model/", ["entities"]), ("repository/", ["JPA, JdbcClient"])])
    # allowed: sales service -> InventoryApi
    s.arrow("M400,272 L575,272 L575,163 L762,163", "ok", "✓ calls InventoryApi", 668, 152)
    # forbidden: sales service -> inventory internal service
    s.arrow("M400,318 L774,318", "no", "✗ sales → inventory.internal: build fails", 587, 306)
    # platform
    s.box("pk", 30, 520, 1120, 74, "platform  ·  open module (shared kernel)",
          ["Money and quantity types, ids, clock and business date, JSON settings, error responses, request context, "
           "tenant-aware transactions: every module may use all of it."])
    s.arrow("M230,476 L230,514", "ok", "✓ every module may use platform", 242, 500, "start")
    s.arrow("M950,476 L950,514", "ok")
    s.arrow("M590,520 L590,440 L436,440", "no", "✗ platform → a business module", 600, 500, "start")
    return s.render(1180, 620, "What one module can see of another: the public root package, events and spi; "
                                "never another module's internal package. platform is open to all.", standalone)


def boundary_cross(standalone):
    s = BSvg("bcr" + ("s" if standalone else ""))
    s.legend([("be", "Code inside a module"), ("st", "Another module's Api: same transaction"), ("ap", "An event: handled after commit")])
    s.text("lg2", 30, 56, "Arrows show the flow of a call or an event. Both paths only touch public parts.")
    s.box("be", 30, 110, 260, 118, "sales · SaleService", ["recordSale(…)", "@Transactional:", "one database transaction", "for stock, tax and the sale"])
    s.box("st", 470, 76, 330, 62, "inventory · InventoryApi", ["allocateAndDeduct(…): stock leaves now"])
    s.box("st", 470, 150, 330, 62, "tax · TaxApi", ["issueDocument(…): tax invoice number now"])
    s.arrow("M290,140 L380,140 L380,107 L464,107", "ok")
    s.arrow("M290,181 L464,181", "ok", "needs the answer now", 300, 172, "start")
    s.box("ap", 470, 262, 330, 62, "sales/events · SaleCompleted", ["published inside the transaction"])
    s.arrow("M160,228 L160,293 L464,293", "ev", "publishes", 172, 282, "start")
    s.box("be", 900, 206, 260, 78, "customers · listener", ["@ApplicationModuleListener", "updates visit stats"])
    s.box("be", 900, 300, 260, 78, "reporting · listener", ["@ApplicationModuleListener", "updates daily totals"])
    s.arrow("M800,293 L840,293 L840,245 L894,245", "ev")
    s.arrow("M840,293 L840,339 L894,339", "ev", "after commit; retried until handled (outbox)", 845, 404, "middle")
    return s.render(1180, 420, "Crossing a module boundary: call another module's Api when the answer is needed in the same "
                                "transaction; publish an event for work that can happen after commit.", standalone)


def boundary_check(standalone):
    s = BSvg("bchk" + ("s" if standalone else ""))
    s.legend([("me", "Your change"), ("ci", "Where it runs"), ("be", "What the check does"), ("st", "Result")])
    s.box("me", 30, 80, 220, 112, "1 · A CHANGE", ["a class in sales/internal", "imports something from", "inventory/internal"], plain=True)
    s.box("ci", 272, 80, 220, 112, "2 · RUNS IN", ["./gradlew test", "./gradlew modulithVerify", "CI on every PR (SET-10)"], plain=True,
          code_lines=(0, 1))
    s.box("be", 514, 80, 220, 112, "3 · READS THE CODE", ["ApplicationModules.of(", "  RetailOsApplication.class)", "16 modules, every dependency"],
          plain=True, code_lines=(0, 1))
    s.box("be", 756, 80, 220, 112, "4 · verify()", ["another module's internal?", "a cycle between modules?", "platform → business module?"],
          plain=True)
    for x in (250, 492, 734):
        s.arrow(f"M{x},136 L{x + 16},136")
    s.box("pass", 1000, 72, 160, 54, "PASSES", ["the build goes on"], plain=True)
    s.box("fail", 1000, 142, 160, 70, "FAILS", ["names module, class", "and line"], plain=True)
    s.arrow("M976,110 L994,100", "ok")
    s.arrow("M976,162 L994,172", "no")
    return s.render(1180, 232, "How the module boundary check runs: on every test run, on modulithVerify and in CI; "
                                "it reads the compiled code and fails with the module, class and line.", standalone)


if __name__ == "__main__":
    for name, fn in (("boundary-map", boundary_map), ("boundary-cross", boundary_cross), ("boundary-check", boundary_check)):
        (DOC / "assets" / f"{name}.svg").write_text(fn(True), encoding="utf-8")
        inject("module-boundaries.html", name, fn(False))
    print("boundary-map.svg, boundary-cross.svg, boundary-check.svg -> module-boundaries.html")
