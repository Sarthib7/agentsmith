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

Interface ID: site-v2
Provider: `scripts/build-site.py`
Consumers: `site/index.html`, `site/skills.html`, `site/catalog.js`, `site/style.css`

REPORTED scope correction: The homepage presents rules, workflows, the OMP harness, and skills as separate parts of the setup. The searchable skill catalog has its own page.

The builder replaces `{{SKILL_COUNT}}` in `site/index.html`. It replaces `{{SKILL_CARDS}}`, `{{SECTION_FILTERS}}`, and `{{SKILL_COUNT}}` in `site/skills.html`. It writes both pages and the shared assets into `_site/`.

The homepage links to `skills.html`. The catalog links to `./` and uses canonical URL `https://sarthib7.github.io/agentsmith/skills.html`. Only the catalog loads `catalog.js`. Homepage source links point to inspected repository files.

Each card is an `article.skill-card` with `data-name`, `data-section`, `data-group`, `data-search`, and `data-authored`. It contains `.skill-name`, `.skill-description`, `.skill-group`, a source link, and a copy button with `data-copy` holding the install command.

Category controls use `data-section-filter`. Search uses `#skill-search`. Results use `#result-count` and `#empty-state`. The original filter value is `all`. A source link remains usable without JavaScript.

Install commands include `--full-depth` so CLI discovery includes both ownership roots. Site assets are `style.css`, `catalog.js`, and `icon.svg`.

Escape skill metadata as HTML. Browser code uses textContent for text updates. Skill names in commands must pass validation first.

VERIFIED: The site builder returned `OK website: setup homepage and 147 skills in _site/`. Local Chrome returned `homepage: passed`, `homepage_to_catalog: passed`, and `source_links: 147`. Both pages fit widths 320, 390, 768, and 1440. The checks did not test a public deployment.

## Least confident decisions

1. INFERRED: Five existing catalog sections can remain the main filters. Task groups and search provide finer navigation.
