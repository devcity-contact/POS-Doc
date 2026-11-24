"""Build the two diagrams on repository.html:

  1. Repository map         -> assets/repo-map.svg and repository.html (marker repo-map)
  2. From branch to release -> assets/git-flow.svg and repository.html (marker git-flow)

Usage:  python Doc/tools/build_repo_diagrams.py
Edit the box lists below when a folder, CI job or release step changes, then run it again.
"""
import html
import pathlib

DOC = pathlib.Path(__file__).resolve().parent.parent
esc = html.escape

# colour groups: be backend, pk packages, ap apps, sh shared data, in infra/docs, out built output,
#                me your computer, gh GitHub, ci GitHub Actions, st staging, rl release
STYLE = """
.rpo{--be:#2F68D8;--be-bg:#EAF1FD;--pk:#D2612B;--pk-bg:#FDEEE5;--ap:#7A4FD0;--ap-bg:#F2ECFC;--sh:#16855A;--sh-bg:#E4F5EC;
 --in:#4A5568;--in-bg:#EEF0F4;--out:#0E7C86;--out-bg:#E2F4F5;--me:#4A5568;--me-bg:#EEF0F4;--gh:#2F68D8;--gh-bg:#EAF1FD;--ci:#7A4FD0;--ci-bg:#F2ECFC;
 --st:#16855A;--st-bg:#E4F5EC;--rl:#C2410C;--rl-bg:#FDEDE3;--ln:#5E6779;--gen:#B5418C;--frame:#2E3A5A;--bgc:#fff;
 --tx:var(--text,#272932);--tx2:var(--text-3,#6F7889);font-family:Inter,"Segoe UI",system-ui,sans-serif}
.rpo .b rect{stroke-width:1.6}
.rpo .b.be rect{fill:var(--be-bg);stroke:var(--be)} .rpo .b.pk rect{fill:var(--pk-bg);stroke:var(--pk)} .rpo .b.ap rect{fill:var(--ap-bg);stroke:var(--ap)}
.rpo .b.sh rect{fill:var(--sh-bg);stroke:var(--sh)} .rpo .b.in rect{fill:var(--in-bg);stroke:var(--in)} .rpo .b.out rect{fill:var(--out-bg);stroke:var(--out);stroke-dasharray:5 3}
.rpo .b.me rect{fill:var(--me-bg);stroke:var(--me)} .rpo .b.gh rect{fill:var(--gh-bg);stroke:var(--gh)} .rpo .b.ci rect{fill:var(--ci-bg);stroke:var(--ci)}
.rpo .b.st rect{fill:var(--st-bg);stroke:var(--st)} .rpo .b.rl rect{fill:var(--rl-bg);stroke:var(--rl)}
.rpo .b.be{color:var(--be)} .rpo .b.pk{color:var(--pk)} .rpo .b.ap{color:var(--ap)} .rpo .b.sh{color:var(--sh)} .rpo .b.in{color:var(--in)} .rpo .b.out{color:var(--out)}
.rpo .b.me{color:var(--me)} .rpo .b.gh{color:var(--gh)} .rpo .b.ci{color:var(--ci)} .rpo .b.st{color:var(--st)} .rpo .b.rl{color:var(--rl)}
.rpo .t{font-size:13px;font-weight:800;fill:currentColor;font-family:Consolas,"Cascadia Code",monospace}
.rpo .t.plain{font-family:Inter,"Segoe UI",system-ui,sans-serif;letter-spacing:.04em}
.rpo .x{font-size:12px;fill:var(--tx)} .rpo .x.code{font-family:Consolas,"Cascadia Code",monospace;font-size:11.5px}
.rpo .sep{stroke:currentColor;opacity:.3}
.rpo .frame{fill:none;stroke:var(--frame);stroke-width:2;stroke-dasharray:8 5} .rpo .ft{font-size:13px;font-weight:800;letter-spacing:.06em;fill:var(--frame)}
.rpo .lane{font-size:12px;font-weight:800;letter-spacing:.08em;fill:var(--tx2)}
.rpo .e{fill:none;stroke-width:1.6} .rpo .e.use{stroke:var(--ln)} .rpo .e.gen{stroke:var(--gen);stroke-dasharray:6 4} .rpo .e.back{stroke:var(--rl);stroke-dasharray:6 4}
.rpo .ah.use{fill:var(--ln)} .rpo .ah.gen{fill:var(--gen)} .rpo .ah.back{fill:var(--rl)}
.rpo .el{font-size:11.5px;font-weight:600;paint-order:stroke;stroke:var(--bgc);stroke-width:5px;stroke-linejoin:round;fill:var(--tx)} .rpo .el.gen{fill:var(--gen)} .rpo .el.back{fill:var(--rl)}
.rpo .lg{font-size:12.5px;fill:var(--tx);font-weight:600} .rpo .lg2{font-size:12.5px;fill:var(--tx2)}
:root[data-theme="dark"] .rpo{--be:#7FA8FF;--be-bg:#1B2840;--pk:#FF9D6B;--pk-bg:#382218;--ap:#B99BFF;--ap-bg:#251C3A;--sh:#5BD49A;--sh-bg:#142D24;
 --in:#A3ABBB;--in-bg:#2A2D37;--out:#4FC9D2;--out-bg:#12292C;--me:#A3ABBB;--me-bg:#2A2D37;--gh:#7FA8FF;--gh-bg:#1B2840;--ci:#B99BFF;--ci-bg:#251C3A;
 --st:#5BD49A;--st-bg:#142D24;--rl:#FF9D6B;--rl-bg:#382218;--ln:#A3ABBB;--gen:#F28AC8;--frame:#B4C0DE;--bgc:#272932}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .rpo{--be:#7FA8FF;--be-bg:#1B2840;--pk:#FF9D6B;--pk-bg:#382218;--ap:#B99BFF;--ap-bg:#251C3A;--sh:#5BD49A;--sh-bg:#142D24;
 --in:#A3ABBB;--in-bg:#2A2D37;--out:#4FC9D2;--out-bg:#12292C;--me:#A3ABBB;--me-bg:#2A2D37;--gh:#7FA8FF;--gh-bg:#1B2840;--ci:#B99BFF;--ci-bg:#251C3A;
 --st:#5BD49A;--st-bg:#142D24;--rl:#FF9D6B;--rl-bg:#382218;--ln:#A3ABBB;--gen:#F28AC8;--frame:#B4C0DE;--bgc:#272932}}
"""
STANDALONE = """
.rpo .bg{fill:#FDFFFC}
@media (prefers-color-scheme:dark){.rpo{--be:#7FA8FF;--be-bg:#1B2840;--pk:#FF9D6B;--pk-bg:#382218;--ap:#B99BFF;--ap-bg:#251C3A;--sh:#5BD49A;--sh-bg:#142D24;
 --in:#A3ABBB;--in-bg:#2A2D37;--out:#4FC9D2;--out-bg:#12292C;--me:#A3ABBB;--me-bg:#2A2D37;--gh:#7FA8FF;--gh-bg:#1B2840;--ci:#B99BFF;--ci-bg:#251C3A;
 --st:#5BD49A;--st-bg:#142D24;--rl:#FF9D6B;--rl-bg:#382218;--ln:#A3ABBB;--gen:#F28AC8;--frame:#B4C0DE;--bgc:#1E2028;--tx:#E6E9EF;--tx2:#9AA3B5}.rpo .bg{fill:#1E2028}}
"""


class Svg:
    def __init__(self, mid):
        self.mid, self.p = mid, []

    def box(self, cls, x, y, w, h, title, lines=(), plain=False, rx=10, code_lines=()):
        p = [f'<g class="b {cls}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/>',
             f'<text class="t{" plain" if plain else ""}" x="{x + 12}" y="{y + 21}">{esc(title)}</text>']
        if lines:
            p.append(f'<line class="sep" x1="{x}" y1="{y + 31}" x2="{x + w}" y2="{y + 31}"/>')
        for i, s in enumerate(lines):
            c = "x code" if i in code_lines else "x"
            p.append(f'<text class="{c}" x="{x + 12}" y="{y + 48 + i * 16}">{esc(s)}</text>')
        p.append("</g>")
        self.p.append("".join(p))

    def pill(self, cls, x, y, w, h, text):
        self.p.append(f'<g class="b {cls}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h / 2}"/>'
                      f'<text class="t plain" x="{x + w / 2}" y="{y + h / 2 + 4.5}" text-anchor="middle">{esc(text)}</text></g>')

    def arrow(self, d, kind="use", label=None, lx=0, ly=0, anchor="middle"):
        self.p.append(f'<path class="e {kind}" d="{d}" marker-end="url(#{self.mid}-{kind})"/>')
        if label:
            self.p.append(f'<text class="el {kind}" x="{lx}" y="{ly}" text-anchor="{anchor}">{esc(label)}</text>')

    def text(self, cls, x, y, s, anchor="start"):
        self.p.append(f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}">{esc(s)}</text>')

    def legend(self, items, y=30):
        x = 30
        for cls, label in items:
            self.p.append(f'<g class="b {cls}"><rect x="{x}" y="{y - 11}" width="14" height="14" rx="3"/></g>')
            self.text("lg", x + 21, y, label)
            x += 21 + len(label) * 7.2 + 24

    def render(self, width, height, title, standalone):
        defs = "<defs>" + "".join(
            f'<marker id="{self.mid}-{k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ah {k}" d="M0,0 L10,5 L0,10 z"/></marker>'
            for k in ("use", "gen", "back")) + "</defs>"
        css = STYLE + (STANDALONE if standalone else "")
        bg = f'<rect class="bg" width="{width}" height="{height}"/>' if standalone else ""
        head = '<?xml version="1.0" encoding="UTF-8"?>\n' if standalone else ""
        return (f'{head}<svg class="rpo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img" '
                f'aria-labelledby="{self.mid}-title"><title id="{self.mid}-title">{esc(title)}</title><style>{css}</style>{defs}{bg}{"".join(self.p)}</svg>')


def repo_map(standalone):
    s = Svg("rm" + ("s" if standalone else ""))
    s.legend([("be", "Backend"), ("pk", "Shared packages"), ("ap", "Apps"), ("sh", "Shared test data"), ("in", "Infra and docs"), ("out", "What it produces")])
    s.text("lg2", 30, 56, "Solid arrow: uses or is checked against. Dashed pink arrow: generated from.")
    # repo frame
    s.p.append('<rect class="frame" x="16" y="72" width="860" height="636" rx="16"/>')
    s.text("ft", 32, 94, "RETAILOS · ONE PRIVATE GITHUB REPOSITORY")
    s.text("lane", 902, 94, "WHAT IT PRODUCES")
    # row 1
    s.box("sh", 30, 110, 236, 96, "shared/test-vectors/", ["JSON cases: tax, pricing,", "rounding, GS1 parsing;", "checked by Java and TS"])
    s.box("be", 300, 110, 556, 102, "backend/", ["Spring Boot 4 · Java 25 · Gradle", "15 modules, each web → service → repository (ADR-015)", "Flyway migrations · unit, Modulith and Testcontainers tests"])
    s.pill("out", 902, 140, 250, 40, "Docker image → GHCR")
    s.arrow("M266,150 L294,150")
    s.arrow("M856,160 L896,160")
    # packages column
    s.box("pk", 300, 262, 250, 70, "packages/api-client", ["generated from the OpenAPI", "used by admin and register"])
    s.box("pk", 300, 346, 250, 70, "packages/register-core", ["cart, pricing, tax, sale, shift", "pure TypeScript, no UI"])
    s.box("pk", 300, 430, 250, 70, "packages/ui", ["shared React components", "design tokens, light and dark"])
    s.box("pk", 300, 514, 250, 54, "packages/i18n", ["English · Sinhala · Tamil"])
    s.arrow("M425,212 L425,256", "gen", "OpenAPI → client", 436, 240, "start")
    s.arrow("M148,206 L148,381 L294,381", "use", "same cases", 156, 300, "start")
    # apps column
    s.box("ap", 590, 262, 250, 72, "apps/admin", ["React back-office web app", "Vite · TanStack · Tailwind"])
    s.box("ap", 590, 362, 250, 72, "apps/register", ["React register UI", "one UI for both shells"])
    s.box("ap", 590, 466, 250, 62, "apps/register-electron", ["Windows shell · SQLCipher"])
    s.box("ap", 590, 552, 250, 62, "apps/register-android", ["Android shell · Kotlin plugin"])
    s.arrow("M550,297 L584,297")
    s.arrow("M550,381 L584,397")
    s.text("lg2", 300, 596, "ui and i18n are used by both apps")
    # register wrapped by the two shells
    s.arrow("M840,398 L858,398 L858,486 L846,486", "use")
    s.arrow("M858,486 L858,572 L846,572", "use")
    s.text("el", 866, 440, "wrapped by", "start")
    # outputs
    s.pill("out", 902, 278, 250, 40, "Static site → CDN")
    s.pill("out", 902, 488, 250, 40, "Signed Windows installer")
    s.pill("out", 902, 574, 250, 40, "AAB / APK → Play or MDM")
    s.arrow("M840,298 L896,298")
    s.arrow("M840,508 L896,508")
    s.arrow("M840,594 L896,594")
    # infra and docs
    s.box("in", 30, 430, 236, 84, "infra/", ["docker compose, Caddy,", "CI scripts, deploy scripts"])
    s.box("in", 30, 540, 236, 70, "docs/", ["this documentation site", "(see the open decision)"])
    s.pill("out", 30, 640, 236, 40, "Docs site")
    s.arrow("M148,610 L148,634")
    return s.render(1180, 724, "RetailOS repository map: folders, how they depend on each other, and what each produces", standalone)


def git_flow(standalone):
    s = Svg("gf" + ("s" if standalone else ""))
    s.legend([("me", "On your computer"), ("gh", "GitHub"), ("ci", "GitHub Actions"), ("st", "Staging"), ("rl", "Release")])
    W, G, X0, Y1, Y2 = 196, 34, 30, 92, 392
    xs = [X0 + i * (W + G) for i in range(5)]
    s.box("me", xs[0], Y1, W, 126, "1 · BRANCH", ["git switch -c", "feat/AUTN-09-refresh", "small: merged in days", "feat(iam): rotate …"], plain=True, code_lines=(0, 1, 3))
    s.box("gh", xs[1], Y1, W, 126, "2 · PULL REQUEST", ["gh pr create --fill", "template + checklist", "links the task ID", "self-review, AI review"], plain=True, code_lines=(0,))
    s.box("ci", xs[2], Y1, W, 206, "3 · CI CHECKS", ["only what changed:", "backend: tests, boundary,", "  ArchUnit, OpenAPI diff", "admin: build and tests", "register: core tests,", "  Windows + Android build", "docs: rebuild, link check", "always: scans and lint"], plain=True)
    s.box("gh", xs[3], Y1, W, 126, "4 · SQUASH MERGE", ["all checks green", "one commit on main", "branch deleted", "main stays deployable"], plain=True)
    s.box("st", xs[4], Y1, W, 126, "5 · STAGING", ["main deploys itself", "migrations run first", "Try it steps checked", "demo data can be reset"], plain=True)
    for i in range(4):
        s.arrow(f"M{xs[i] + W},{Y1 + 40} L{xs[i + 1] - 6},{Y1 + 40}")
    # a failing check sends you back
    cx = xs[2] + 40
    s.arrow(f"M{cx},{Y1 + 206} L{cx},{Y1 + 236} L{xs[1] + W / 2},{Y1 + 236} L{xs[1] + W / 2},{Y1 + 132}", "back", "a check fails: fix it, push again", xs[1] + W / 2 + 12, Y1 + 230, "start")
    # staging -> release when ready
    sx = xs[4] + W / 2
    s.arrow(f"M{sx},{Y1 + 126} L{sx},{Y2 - 30} L{xs[0] + W / 2},{Y2 - 30} L{xs[0] + W / 2},{Y2 - 6}", "use", "when a version is ready to ship", xs[3] + 10, Y2 - 36, "start")
    wide = 2 * W + G
    s.box("rl", xs[0], Y2, W, 110, "6 · TAG A RELEASE", ["backend-v1.4.0", "register-v1.6.0", "admin-v1.3.0"], plain=True, code_lines=(0, 1, 2))
    s.box("rl", xs[1], Y2, wide, 110, "7 · RELEASE BUILD (from the tag)", ["backend: Docker image · admin: static site", "register: signed Windows installer, signed AAB/APK", "release notes from the commit messages"], plain=True)
    s.box("rl", xs[3], Y2, wide, 110, "8 · PRODUCTION AND SHOPS", ["backend: manual approval, health-gated deploy", "Windows: auto-update, staged roll-out", "Android: Play staged roll-out, or MDM"], plain=True)
    s.arrow(f"M{xs[0] + W},{Y2 + 40} L{xs[1] - 6},{Y2 + 40}")
    s.arrow(f"M{xs[1] + wide},{Y2 + 40} L{xs[3] - 6},{Y2 + 40}")
    return s.render(1180, 520, "From branch to release: how a change travels from a branch to production", standalone)


def inject(page, marker, svg):
    p = DOC / page
    s = p.read_text(encoding="utf-8")
    a, b = f"<!-- {marker}:start -->", f"<!-- {marker}:end -->"
    if a not in s:
        raise SystemExit(f"Add the {marker} markers to {page} first")
    i, j = s.index(a) + len(a), s.index(b)
    p.write_text(s[:i] + "\n" + svg + "\n" + s[j:], encoding="utf-8")


if __name__ == "__main__":
    (DOC / "assets" / "repo-map.svg").write_text(repo_map(True), encoding="utf-8")
    (DOC / "assets" / "git-flow.svg").write_text(git_flow(True), encoding="utf-8")
    inject("repository.html", "repo-map", repo_map(False))
    inject("repository.html", "git-flow", git_flow(False))
    print("repo-map.svg, git-flow.svg -> assets/ and repository.html")
