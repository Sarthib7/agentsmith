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

VERIFIED at the local handoff: `.github/workflows/pages.yml` uploads `_site/`. The deployment had not run at that point.

VERIFIED release correction: The repository's Pages setting still returned `build_type: legacy` with source `main` at `/`. Both public pages returned HTTP `404` after the workflows passed. The release changed the setting to `workflow`, as supported by the [GitHub Pages API](https://docs.github.com/en/rest/pages/pages#update-information-about-a-github-pages-site).

VERIFIED: [Deployment 36310917068](https://github.com/Sarthib7/agentsmith/actions/runs/36310917068) returned `conclusion: success` for commit `9606ba0`. The homepage, catalog, CSS, JavaScript, and icon each returned HTTP `200` and matched the generated files exactly. `status.md` records the response sizes and the check's limits.

## Stable source paths

INFERRED decision: Keep `skills/` and `my-skills/` as the ownership roots. Organize discovery through catalog sections, task groups, README entry points, and search.

VERIFIED: Existing skill paths were retained. Generated commands include `--full-depth` for both roots. The [official CLI documentation](https://github.com/vercel-labs/skills#skill-discovery) describes that flag. REPORTED: Local CLI 1.7.0 found all eight authored skills with the flag and omitted them without it.

## Source adaptations

VERIFIED: The initial copy matched 159 source files by hash. Subsequent packaging and transcript-export corrections are listed in `ATTRIBUTION.md`. The rules snapshot was regenerated through `rules/sync.py`.

INFERRED decision: Exclude personal session bindings and private production examples. Require an explicit transcript path instead of selecting the newest conversation across projects.

## Least confident decisions

1. INFERRED: The five main catalog sections fit the initial audience. Search and task groups may need changes after developer feedback.
2. VERIFIED limitation: The refresh checked local source bytes and packaging. It did not establish upstream freshness or missing licenses.

## Map-only release boundary, 2026-10-23

REPORTED: The release is split into two independent PRs. The first is map-only. A second may restore the optional demo with its required generated inputs, licenses, and model/audit gates. "Optional" describes the demo UI, not whether its build inputs can be missing.

INFERRED decision: Keep the map build standalone and independent of Anatomy. Its public source paths include `docs/architecture.md`, `docs/diagrams/`, `site/architecture.html`, `site/architecture-viewer.mjs`, `scripts/build-site.py`, and `docs/interfaces.md`. The viewer is native and read-only, with no React dependency. It presents documented source topology, not live telemetry.

VERIFIED: A pre-correction parent probe placed an obsolete generated HTML page in `_site`, ran the valid map build, and observed the old page still returned HTTP 200. The Pages workflow uploads the whole `_site` tree. The cause was reusing the output directory without removing stale generated files.

REQUIRED invariant: Read and validate all inputs before changing output. Missing input preserves the prior output unchanged. After successful preflight, regenerate only the builder-owned output set so stale files cannot leak into a successful artifact. This makes no whole-build atomicity claim for later filesystem failures.

Ownership:

- `site/architecture.html`, `site/rules.html`, `site/workflows.html`, `site/omp.html`, and `site/style.css`: MAP-UI implementer.
- `scripts/build-site.py`, `tests/test_build_site.py`, `.github/workflows/validate.yml`, `.github/workflows/pages.yml`, and `docs/interfaces.md`: MAP-BUILD implementer.
- Remaining projection files, including `docs/architecture.md`, `docs/diagrams/`, `site/architecture-viewer.mjs`, `status.md`, `docs/decisions.md`, and `ATTRIBUTION.md`: coordinator. The coordinator owns integrated verification and release work.

### Least confident decisions

1. INFERRED: The two-PR boundary is the clearest review split, but no contributor feedback on that split is recorded.
2. INFERRED: The map remains useful as a standalone source view without the demo; that has not been evaluated with contributor feedback.

## Optional illustration PR boundary, 2026-10-23

REPORTED: The optional workbench belongs in a second PR stacked on the map-only PR #7. The map-only PR must remain independently buildable.

VERIFIED correction: Map-only [PR #7](https://github.com/Sarthib7/agentsmith/pull/7), previously recorded as OPEN, merged as `92c52719858c3fbd0676b3ed0cb46e74747a590c`. Main-branch [validation 39965102703](https://github.com/Sarthib7/agentsmith/actions/runs/39965102703) and [Pages deployment 39965102624](https://github.com/Sarthib7/agentsmith/actions/runs/39965102624) passed. The optional-demo PR now targets `main`; the map-only release remains independently buildable.

INFERRED decision: Keep the native map viewer and flowcharts as the primary architecture explanation. Present the workbench only through closed optional disclosures with full-size theme views. Its authored motion is an illustration, not system activity.

REQUIRED invariant: Generate both theme views. The site builder must read both generated views and every other input before changing `_site`, then copy only the two views into `_site/anatomy` while retaining the map cleanup behavior. Optional describes the UI, not a missing-build-input fallback.

VERIFIED integrated demo checks: The Node model/viewer suite returned 9 passed, 0 failed; the Python suite returned 28 tests and `OK`. Dark and light geometry audits each returned 16 sampled poses passed, 0 failed. Two missing-theme controls failed against the map-only entry point and passed against the demo entry point, with zero fixture errors. Real Brave reached all six routes at desktop and phone widths; the four disclosures started closed and loaded their illustrations when opened. The resource probe returned HTTP 200 for 18 resources. These finite checks do not prove continuous geometry or universal accessibility. Provenance and earlier phone/pause measurements remain in `docs/anatomy-figure.md`.

### Least confident decisions

1. INFERRED: The two-PR boundary is clear enough for review, but contributor feedback on the split is not recorded.
2. INFERRED: The workbench adds value when it stays secondary to the maps; this has not been evaluated with contributor feedback.

## Harness experiment instruction layer, 2026-10-23

REPORTED: Approved R1 adds one opt-in `harness-experiment` skill. Its package-local reference is the canonical procedure; the public [`workflows/harness-experiment.md` guide](https://github.com/Sarthib7/agentsmith/blob/main/workflows/harness-experiment.md) is a concise entry and does not copy that procedure.

INFERRED decision: Show one summary process flow on Workflows. Rules and Architecture explain the instruction-versus-enforcement boundary and link to the same [workflow guide](https://github.com/Sarthib7/agentsmith/blob/main/workflows/harness-experiment.md) and [skill source](https://github.com/Sarthib7/agentsmith/blob/main/skills/harness-experiment/SKILL.md). Keep this as an instruction-layer path; add no runtime command, daemon, hook, permission change, Decider dependency, or global self-editing.

REQUIRED boundary: The skill routes an explicitly requested experiment; a recurring failure may prompt a suggestion, not start a run. The procedure is not runtime enforcement, a permission grant, or an OS sandbox. Public links expose source, not installation or runtime use. Method attribution points to [Harness2 at pinned revision `1cfe254e8d25b15f37048c3730134686abe60335`](https://github.com/google-research/harness2/tree/1cfe254e8d25b15f37048c3730134686abe60335); no benchmark gains are claimed.

VERIFIED packaging check: Skills CLI 1.7.0 preserved the package-local reference in a targeted project copy installation for Codex. See the [checkpoint](../status.md#harness-experiment-checkpoint-2026-10-23). This does not establish installation in a user's OMP runtime.

### Least confident decisions

1. UNKNOWN: Other installer versions and targets may handle package-local references differently.
2. UNKNOWN: Actual OMP discovery and compliance with these instructions are not established by the packaging check.
3. UNKNOWN: Real-task benefits and total parent model costs remain unmeasured.
