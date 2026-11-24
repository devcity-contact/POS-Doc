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
| `prototype/` | Clickable prototype of every MVP screen (`index.html`, `prototype.js`, `prototype.css`). No build step; open `prototype/index.html#<route>`. Screen-to-route list and demo PINs: `ui-screens.html#prototype` |
| `assets/db-map.svg` | Whole-database diagram (also inline in `data-model.html#db-map`). Regenerate after a schema change: `python tools/build_db_map.py` |
| `data-dictionary.html` | Generated: every table explained. Edit `tools/build_data_dictionary.py` (columns, meanings, rules) and run it after `tools/build_db_map.py` |
| `build-order.html` | Generated: every MVP task (backend, admin web, register app, Try it checks) in build order with progress tick boxes. Edit `tools/build_order.py` (tasks, and the `DONE` set for shared progress) and run it |
| `assets/module-map.svg`, `assets/module-layers.svg` | Module map and inside-a-module diagrams (also inline in `modules.html#map` and `architecture.html`). Regenerate after a module, API, table or event change: `python tools/build_module_map.py` |
| `assets/request-flow.svg` | Request pipeline (filter chain) diagram, also inline in `security.html#request-pipeline`. Regenerate after a filter change: `python tools/build_request_flow.py` |
| `endpoints.html` | Generated: every API endpoint by module with details and build status. Edit `tools/build_endpoints.py` when an endpoint is added, changed or built, then run it (it also refreshes `build-order.html`) |
| `plans.html` | Commercial plans proposal (hand-written). Keep the feature table's release column in step with the roadmap |
| `repository.html` | How the code repository and GitHub are run; its two diagrams come from `tools/build_repo_diagrams.py` |
| `tools/` | Doc maintenance scripts |

## Editing rules
- Add a page: copy an existing page's skeleton, add it to `NAV` in `assets/site.js` and to `llms.txt`, then rebuild the search index.
- Give every `h2` an `id` so links and search stay stable.
- Diagrams: write Mermaid inside `<pre class="mermaid">`, escape `<` and `>` as `&lt;` and `&gt;`.
- Keep invariant IDs (INV-nn), requirement IDs (F-, BR-, NFR-) and ADR numbers stable; never renumber.
