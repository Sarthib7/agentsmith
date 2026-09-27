# Developer discovery decisions

Date: 2026-09-27
Owner: coordinator
Status: Completed

## Correction: the full agent setup

REPORTED: The user clarified that skills are one part of Agentsmith. Rules, workflows, and the OMP harness need equal visibility.

INFERRED correction: The earlier homepage treated the repository as a skill directory because the first audit measured skills. That framing missed the setup documents already present in `rules/` and `workflows/`.

INFERRED decision: Give the full setup the homepage and move the searchable skill catalog to `skills.html`. Update the README to use the same entry points. Preserve the existing source paths and skill search behavior.

VERIFIED: Local Chrome returned `homepage: passed` and `homepage_to_catalog: passed`. README.md now has separate entry points for rules, workflows, OMP, and skills. The catalog uses "Agent setup" for its response and session skills, so that category is distinct from standing rules.

VERIFIED: The OMP snapshot comparison returned `OMP exported fields checked: 7; mismatches: []`. Only the public example changed. The comparison did not test provider access or model availability.

## Static catalog

REPORTED: The user chose both GitHub documentation and a searchable Pages site.

INFERRED decision: Use the existing Python catalog and a static HTML page. A larger application would add maintenance without supporting another requested behavior.

VERIFIED: `scripts/build-site.py` reads `load_catalog()` from `scripts/build-index.py`. The HTML contains the skill cards before JavaScript runs. JavaScript adds filtering and clipboard controls. The browser check confirmed that source links remain usable with JavaScript disabled.

VERIFIED: `.github/workflows/pages.yml` uploads `_site/`. It no longer uploads the repository root. This describes workflow configuration; the deployment was not run.

## Stable source paths

INFERRED decision: Keep `skills/` and `my-skills/` as the ownership roots. Organize discovery through catalog sections, task groups, README entry points, and search.

VERIFIED: Existing skill paths were retained. Generated commands include `--full-depth` for both roots. The [official CLI documentation](https://github.com/vercel-labs/skills#skill-discovery) describes that flag. REPORTED: Local CLI 1.7.0 found all eight authored skills with the flag and omitted them without it.

## Source adaptations

VERIFIED: The initial copy matched 159 source files by hash. Subsequent packaging and transcript-export corrections are listed in `ATTRIBUTION.md`. The rules snapshot was regenerated through `rules/sync.py`.

INFERRED decision: Exclude personal session bindings and private production examples. Require an explicit transcript path instead of selecting the newest conversation across projects.

## Least confident decisions

1. INFERRED: The five main catalog sections fit the initial audience. Search and task groups may need changes after developer feedback.
2. VERIFIED limitation: The refresh checked local source bytes and packaging. It did not establish upstream freshness or missing licenses.
