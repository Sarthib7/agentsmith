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

Interface ID: site-v5
Provider: scripts/build-site.py
Consumers: the six page templates, shared assets under site/, six canonical architecture SVGs under docs/diagrams/, and the two generated Anatomy views under site/anatomy/.

REPORTED scope correction: The homepage presents rules, workflows, the OMP harness, and skills as separate parts of the setup. The searchable skill catalog has its own page.

The builder replaces {{SKILL_COUNT}} in site/index.html. It replaces {{SKILL_CARDS}}, {{SECTION_FILTERS}}, and {{SKILL_COUNT}} in site/skills.html. The architecture, rules, workflows, and OMP pages are static HTML without catalog replacements. It emits six pages and shared assets into _site/.

The shared site navigation links the six local pages in this order: The setup (./), Rules, Workflows, OMP, Architecture, and Skills, followed by the existing GitHub link. The catalog keeps canonical URL https://sarthib7.github.io/agentsmith/skills.html; only it loads catalog.js. Homepage source links point to inspected repository files.

Architecture uses relative links for the GitHub Pages project prefix. Its primary view is the whole-system SVG, using the native viewer's initial contain-fit, zoom, pan, keyboard, fullscreen, and minimap behavior. The viewer describes source structure and does not fetch live runtime state. Five detailed reference maps remain below it.
Rules, Workflows, OMP, and Architecture each provide one initially closed `<details class="illustration-disclosure">` for the user-optional visual demo. Each contains a lazy-loaded, same-origin `anatomy/workbench-light.html` iframe and a standalone link to that full-size view; the native primary flowchart viewer and minimap remain first as the page's architecture explanation. The embedded view accesses its parent iframe from the same origin and uses a `ResizeObserver` on the workbench to set iframe height to measured content height, including borders.

The six SVGs are sourced from docs/diagrams/ and emitted byte-for-byte under _site/diagrams/: system-overview.svg, worker-farms.svg, configuration-flow.svg, approval-flow.svg, site-build.svg, and whole-architecture.svg. The native viewer module is emitted as _site/architecture-viewer.mjs. The builder copies only the two generated Anatomy views into _site/anatomy/; it does not package their generator, tests, or vendor inputs.

These disclosures are optional UI only; both generated views remain mandatory builder inputs. Before writing outputs, the builder validates the catalog, renders tokenized templates, and reads all six page templates, all four shared site assets, all six required diagrams, and both required generated views: `site/anatomy/workbench.html` and `site/anatomy/workbench-light.html`. An invalid catalog, missing required input, or missing template token returns an error before creating or modifying `_site`, preserving its previous bytes.
After preflight succeeds, `_site` is builder-owned derived output: the builder removes its previous contents and regenerates the six pages, four shared assets, six diagrams, the two Anatomy views, and `.nojekyll`, so stale files are not included in a successful build. Cleanup is confined to `_site`; canonical inputs under `site/` and `docs/diagrams/` are not removed. A filesystem failure during output replacement or writes can leave `_site` absent or partial; the build does not promise whole-build atomicity.
The map-only first PR remains independently buildable without Anatomy inputs or outputs; this contract adds the two mandatory generated views only in the optional-demo PR. The configured Pages workflow describes publication automation but does not establish that a local artifact was published.

Shared assets are style.css, catalog.js, architecture-viewer.mjs, and icon.svg.

### Flowchart viewer consumers

Rules uses diagrams/approval-flow.svg, Workflows uses diagrams/worker-farms.svg, and OMP and Architecture use diagrams/whole-architecture.svg. All four share the native viewer controls, data-architecture-viewer and data-graph-* hooks, focusable viewport, status output, and minimap. Each loads architecture-viewer.mjs. The module uses each SVG's natural dimensions to size and fit its graph world and minimap. It does not request live runtime state.

Each card is an `article.skill-card` with `data-name`, `data-section`, `data-group`, `data-search`, and `data-authored`. It contains `.skill-name`, `.skill-description`, `.skill-group`, a source link, and a copy button with `data-copy` holding the install command.

Category controls use `data-section-filter`. Search uses `#skill-search`. Results use `#result-count` and `#empty-state`. The original filter value is `all`. A source link remains usable without JavaScript.

Install commands include --full-depth so CLI discovery includes both ownership roots.

Escape skill metadata as HTML. Browser code uses textContent for text updates. Skill names in commands must pass validation first.

The former site-v2 checks predated the Architecture page and do not describe the current six-page builder contract or establish a public deployment. No current build or deployment is claimed here.

### Harness experiment discovery

Interface ID: harness-experiment-discovery-v1

The canonical procedure lives in the package-local `skills/harness-experiment/references/workflow.md`; the public [workflow guide](https://github.com/Sarthib7/agentsmith/blob/main/workflows/harness-experiment.md) is a concise entry, not a second procedure. The packaged [`harness-experiment` skill source](https://github.com/Sarthib7/agentsmith/blob/main/skills/harness-experiment/SKILL.md) contains invocation metadata and its local reference path.

The Workflows page contains one accessible four-stage summary flow and links to the public workflow guide, skill source, and the pinned [Harness2 method source](https://github.com/google-research/harness2/tree/1cfe254e8d25b15f37048c3730134686abe60335). Rules and Architecture link to the same workflow and skill sources; Architecture links to the Workflows summary rather than duplicating its flow.

These are static source links. They do not install a skill or prove local discovery, execution, permission enforcement, or runtime state. No site template tokens, page routes, catalog output, shared JavaScript, framework, viewer, diagram, or CTA contract changes are introduced by this interface.

## Least confident decisions

1. INFERRED: Five existing catalog sections can remain the main filters. Task groups and search provide finer navigation.
