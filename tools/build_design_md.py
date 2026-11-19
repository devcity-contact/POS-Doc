"""Generate Doc/DESIGN.md from Doc/stitch-prompts.html, so the Markdown never drifts from the page.

Usage:  python Doc/tools/build_design_md.py
Converts headings, paragraphs, lists, tables, callouts and code blocks; the colour swatch grid
becomes a Markdown table. Internal links become relative links to the HTML pages.
"""
import html
import pathlib
import re
from html.parser import HTMLParser

DOC = pathlib.Path(__file__).resolve().parent.parent
SRC = DOC / "stitch-prompts.html"
OUT = DOC / "DESIGN.md"
VOID = {"br", "hr", "img", "meta", "link", "input"}


class Node:
    def __init__(self, tag, attrs, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []

    def cls(self):
        return (self.attrs.get("class") or "").split()


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", [])
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def find(node, pred):
    if isinstance(node, Node):
        if pred(node):
            return node
        for c in node.children:
            r = find(c, pred)
            if r:
                return r
    return None


def raw_text(node):
    if isinstance(node, str):
        return node
    return "".join(raw_text(c) for c in node.children)


def inline(node):
    """Inline Markdown for a node's children."""
    out = []
    for c in node.children:
        if isinstance(c, str):
            out.append(re.sub(r"\s+", " ", c))
            continue
        t = c.tag
        inner = inline(c)
        if t in ("strong", "b"):
            out.append(f"**{inner.strip()}**" if inner.strip() else "")
        elif t in ("em", "i") and inner.strip():
            out.append(f"*{inner.strip()}*")
        elif t in ("code", "kbd"):
            out.append(f"`{raw_text(c)}`")
        elif t == "a":
            href = c.attrs.get("href", "")
            out.append(f"[{inner.strip()}]({href})" if href else inner)
        elif t == "br":
            out.append("<br>")
        elif "badge" in c.cls() or "inv" in c.cls():
            out.append(f"`{inner.strip()}`")
        else:
            out.append(inner)
    return "".join(out)


def table_md(tb):
    rows = []
    for tr in iter_tags(tb, "tr"):
        cells = [inline(td).strip().replace("|", "\\|") for td in tr.children
                 if isinstance(td, Node) and td.tag in ("td", "th")]
        rows.append(cells)
    if not rows:
        return ""
    width = max(len(r) for r in rows)
    rows = [r + [""] * (width - len(r)) for r in rows]
    lines = ["| " + " | ".join(rows[0]) + " |", "|" + "---|" * width]
    lines += ["| " + " | ".join(r) + " |" for r in rows[1:]]
    return "\n".join(lines)


def iter_tags(node, tag):
    for c in node.children:
        if isinstance(c, Node):
            if c.tag == tag:
                yield c
            yield from iter_tags(c, tag)


def block(node, out):
    for c in node.children:
        if isinstance(c, str):
            if c.strip():
                out.append(re.sub(r"\s+", " ", c).strip())
            continue
        t, cls = c.tag, c.cls()
        if t in ("h1", "h2", "h3", "h4"):
            level = {"h1": "#", "h2": "##", "h3": "###", "h4": "####"}[t]
            out.append(f"{level} {inline(c).strip()}")
        elif t == "p":
            txt = inline(c).strip()
            if txt:
                out.append(txt)
        elif t in ("ul", "ol"):
            items = []
            for n, li in enumerate([x for x in c.children if isinstance(x, Node) and x.tag == "li"], 1):
                bullet = f"{n}." if t == "ol" else "-"
                items.append(f"{bullet} {inline(li).strip()}")
            out.append("\n".join(items))
        elif t == "table":
            out.append(table_md(c))
        elif t == "pre":
            code = raw_text(c).strip("\n")
            out.append("```text\n" + code + "\n```")
        elif t == "div" and "sw" in cls:
            rows = ["| Hex | Role |", "|---|---|"]
            for sw in [x for x in c.children if isinstance(x, Node)]:
                span = find(sw, lambda n: n.tag == "span")
                b = find(span, lambda n: n.tag == "b")
                hexv = raw_text(b).strip()
                role = raw_text(span).replace(hexv, "", 1).strip()
                rows.append(f"| `{hexv}` | {role} |")
            out.append("\n".join(rows))
        elif t == "div" and "callout" in cls:
            title = find(c, lambda n: "ct" in n.cls())
            head = raw_text(title).strip() if title else "Note"
            if head == "Markdown version":   # points at this file itself
                continue
            if title:
                title.children = []
            body = inline(c).strip()
            out.append(f"> **{head}**  \n> {body}")
        elif t == "div" and "meta" in cls:
            out.append(" · ".join(raw_text(s).strip() for s in c.children if isinstance(s, Node)))
        elif t in ("script", "style", "nav", "aside", "header"):
            continue
        else:
            block(c, out)


def main():
    tree = Tree()
    tree.feed(SRC.read_text(encoding="utf-8"))
    article = find(tree.root, lambda n: n.tag == "article")
    out = []
    block(article, out)
    md = "\n\n".join(x for x in out if x.strip())
    md = html.unescape(md)

    # Page anchors (#master) -> GitHub-style heading anchors (#master-prompt-paste-first-...)
    def gh_slug(text):
        text = re.sub(r"[`*]", "", text).strip().lower()
        text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
        return re.sub(r"\s", "-", text)

    ids = {}
    for h in iter_tags(article, "h2"):
        if h.attrs.get("id"):
            ids[h.attrs["id"]] = gh_slug(raw_text(h))
    for h in iter_tags(article, "h3"):
        if h.attrs.get("id"):
            ids[h.attrs["id"]] = gh_slug(raw_text(h))
    md = re.sub(r"\]\(#([\w-]+)\)", lambda m: f"](#{ids.get(m.group(1), m.group(1))})", md)
    md = md.replace("# Google Stitch prompts", "# RetailOS design system & Google Stitch prompts", 1)
    header = (
        "<!-- Generated from stitch-prompts.html by tools/build_design_md.py. Edit the HTML page, then re-run. -->\n\n"
    )
    footer = (
        "\n\n---\n\nRelated: [Screens & navigation](ui-screens.html) · "
        "[UI design & wireframes](ui-design.html) · [Technology stack](tech-stack.html)\n"
    )
    OUT.write_text(header + md + footer, encoding="utf-8")
    print(f"wrote {OUT} ({len(md):,} chars, {md.count('```text')} prompt blocks)")


if __name__ == "__main__":
    main()
