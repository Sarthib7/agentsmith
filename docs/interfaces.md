# Catalog and website contract

Owner: coordinator
Status: Completed

## Catalog source

VERIFIED: `scripts/build-index.py:load_catalog` owns skill discovery, grouping, and validation. `scripts/build-site.py:main` reads that same catalog.

Interface ID: catalog-v1
Provider: `scripts/build-index.py`, function `load_catalog()`
Consumers: index generation and `scripts/build-site.py`

Return a list of dictionaries, one per skill:

```python
{
    "name": "prove-it",
    "description": "The full description from frontmatter.",
    "path": "my-skills/prove-it/SKILL.md",
    "section": "coding",
    "group": "Review and verification",
    "authored": True,
}
```

Validation must finish before writing outputs. Missing names, missing descriptions, duplicate declared names, missing groups, and incorrect ownership roots are errors.

## Website template

Interface ID: site-v4
Provider: scripts/build-site.py
Consumers: the six page templates and shared assets under site/, plus six canonical architecture SVGs under docs/diagrams/.

REPORTED scope correction: The homepage presents rules, workflows, the OMP harness, and skills as separate parts of the setup. The searchable skill catalog has its own page.

The builder replaces {{SKILL_COUNT}} in site/index.html. It replaces {{SKILL_CARDS}}, {{SECTION_FILTERS}}, and {{SKILL_COUNT}} in site/skills.html. The architecture, rules, workflows, and OMP pages are static HTML without catalog replacements. It emits six pages and shared assets into _site/.

The shared site navigation links the six local pages in this order: The setup (./), Rules, Workflows, OMP, Architecture, and Skills, followed by the existing GitHub link. The catalog keeps canonical URL https://sarthib7.github.io/agentsmith/skills.html; only it loads catalog.js. Homepage source links point to inspected repository files.

Architecture uses relative links for the GitHub Pages project prefix. Its primary view is the whole-system SVG, using the native viewer's initial contain-fit, zoom, pan, keyboard, fullscreen, and minimap behavior. The viewer describes source structure and does not fetch live runtime state. Five detailed reference maps remain below it.

The six SVGs are sourced from docs/diagrams/ and emitted byte-for-byte under _site/diagrams/: system-overview.svg, worker-farms.svg, configuration-flow.svg, approval-flow.svg, site-build.svg, and whole-architecture.svg. The native viewer module is emitted as _site/architecture-viewer.mjs.

Before writing outputs, the builder validates the catalog and reads all six page templates, all four shared site assets, and all six required diagrams. A missing or invalid catalog, missing required input, or missing template token returns an error before it creates or modifies `_site`, preserving its previous bytes. After preflight succeeds, `_site` is builder-owned derived output: the builder removes its previous contents and regenerates the six pages, four shared assets, six diagrams, and `.nojekyll`, so stale files are not included in a successful build. Cleanup is confined to `_site`; canonical sources under `site/` and `docs/diagrams/` are not removed. A filesystem failure during output replacement or writes can leave `_site` absent or partial; the build does not promise whole-build atomicity. The map-only build has no Anatomy input or output dependency. The configured Pages workflow describes publication automation; this interface does not establish that a local artifact was published.

Shared assets are style.css, catalog.js, architecture-viewer.mjs, and icon.svg.

### Flowchart viewer consumers

Rules uses diagrams/approval-flow.svg, Workflows uses diagrams/worker-farms.svg, and OMP and Architecture use diagrams/whole-architecture.svg. All four share the native viewer controls, data-architecture-viewer and data-graph-* hooks, focusable viewport, status output, and minimap. Each loads architecture-viewer.mjs. The module uses each SVG's natural dimensions to size and fit its graph world and minimap. It does not request live runtime state.

Each card is an `article.skill-card` with `data-name`, `data-section`, `data-group`, `data-search`, and `data-authored`. It contains `.skill-name`, `.skill-description`, `.skill-group`, a source link, and a copy button with `data-copy` holding the install command.

Category controls use `data-section-filter`. Search uses `#skill-search`. Results use `#result-count` and `#empty-state`. The original filter value is `all`. A source link remains usable without JavaScript.

Install commands include --full-depth so CLI discovery includes both ownership roots.

Escape skill metadata as HTML. Browser code uses textContent for text updates. Skill names in commands must pass validation first.

The former site-v2 checks predated the Architecture page and do not describe the current six-page builder contract or establish a public deployment. No current build or deployment is claimed here.

## Least confident decisions

1. INFERRED: Five existing catalog sections can remain the main filters. Task groups and search provide finer navigation.
