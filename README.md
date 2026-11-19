# RetailOS documentation

System design for RetailOS, DevCity's offline-first POS for retail, pharmacy and grocery (2027/2028 ready).

## Open it
- Double-click `index.html`, or serve the folder: `python -m http.server 8080` inside `Doc/`, then open http://localhost:8080.
- Diagrams load Mermaid from a CDN (cdn.jsdelivr.net). Offline, the diagram source text is shown instead.

## Layout
| Path | Content |
|---|---|
| `*.html` | The documentation pages (navigation is built by `assets/site.js`) |
| `assets/site.css`, `assets/site.js` | Shared styles and behaviour (theme, search, TOC, diagrams) |
| `assets/search-index.js` | Search index, regenerate after editing headings: `python tools/build_search_index.py` |
| `llms.txt` | Page index for AI tools |
| `ai/AGENTS.md` | Copy to repo root for AI coding agents |
| `ai/system-context.md` | Condensed design to paste into any assistant |
| `DESIGN.md` | Design system (palette, tokens, contrast rules) + all Google Stitch prompts in Markdown. Regenerate after editing `stitch-prompts.html`: `python tools/build_design_md.py` |
| `tools/` | Doc maintenance scripts |

## Editing rules
- Add a page: copy an existing page's skeleton, add it to `NAV` in `assets/site.js` and to `llms.txt`, then rebuild the search index.
- Give every `h2` an `id` so links and search stay stable.
- Diagrams: write Mermaid inside `<pre class="mermaid">`, escape `<` and `>` as `&lt;` and `&gt;`.
- Keep invariant IDs (INV-nn), requirement IDs (F-, BR-, NFR-) and ADR numbers stable; never renumber.
