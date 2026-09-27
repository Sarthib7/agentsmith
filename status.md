# Status

Last updated: 2026-09-27
Updated by: coordinator
Current phase: Release In Progress

## Scope

REPORTED: The user requested a refresh, restructuring, and easier discovery. The user chose both the GitHub README and a searchable Pages site.

REPORTED correction: The user clarified that Agentsmith covers rules, workflows, and the OMP harness as well as skills. The earlier homepage and README gave skills too much prominence.

## In Progress

- RELEASE, owner coordinator, status In Progress: REPORTED, the user requested "push one by one feat and update". Publish separate commits for the skill catalog, rules and OMP snapshots, then the website and navigation. The coordinator owns staging, commits, pushes, and this record.

## Completed

- RELEASE-SKILLS, owner coordinator, status Completed: VERIFIED, commit `0d61289` was pushed to `main`. Git returned `3fa86f9..0d61289  main -> main`.
- RELEASE-RULES, owner coordinator, status Completed: VERIFIED, commit `7040365` was pushed to `main`. Git returned `0d61289..7040365  main -> main`. The staged snapshot returned `up to date: AGENTS.md` and `OMP exported fields checked: 7; mismatches: []`.
- REVIEW-SKILLS, owner skill-reviewer, status Completed: REPORTED, the review found no concrete blocker. Scope and limits appear below.
- REVIEW-SITE, owner site-reviewer, status Completed: REPORTED, the review found no publication blocker. Scope and limits appear below.
- HOME and DOCS: VERIFIED, `site/index.html` and `README.md` present rules, workflows, OMP, and skills. `site/skills.html` holds the searchable catalog. `CONTRIBUTING.md` covers each source type.
- SCOPE INTEGRATION: VERIFIED, the builder renders both pages. Catalog labels now call the former rules category "Agent setup"; badges say "setup skills". The OMP example matches seven exported fields from the local source. Evidence follows.
- REFRESH, owner refresh: VERIFIED, 22 skills added and 23 existing skill trees refreshed. The final catalog reports `147 skills total; 8 verified as mine`. This is a local snapshot comparison, not an upstream version audit.
- VALIDATE, owner validator: VERIFIED, required metadata, declared names, ownership roots, and groups are checked before output writes. Evidence: `tests/test_build_index.py` and the test run below.
- BROWSE, owner site: VERIFIED, `site/` provides search, category filters, source links, and install commands. Browser evidence is below.
- INTEGRATE, owner coordinator: VERIFIED, README navigation, shared generation, provenance, and Pages packaging are connected. Contract: `docs/interfaces.md`. Decisions: `docs/decisions.md`.

## Decisions

See `docs/decisions.md` for the static site choice and source adaptations. Skill ownership roots remain stable.

## Verification and handoff

### Release checks

VERIFIED correction: Earlier `git diff --check` runs did not cover untracked files. Staging the additions exposed five trailing spaces and one extra blank line in three Impeccable reference files. The release removes those whitespace errors; `ATTRIBUTION.md` records the source change.

VERIFIED: The first commit's temporary snapshot returned `Ran 20 tests in 0.806s` and `OK`. With only the catalog source restored to its original version, two collected regression tests returned `FAILED (failures=5)`. Restoring the new source returned `Ran 2 tests in 0.035s` and `OK`.

REPORTED by skill-reviewer: No concrete blocker found in the skill changes. The review checked metadata, companion links, script syntax, and common credential patterns. Pattern scans cannot prove that private data is absent. Upstream attribution remains undetermined.

REPORTED by site-reviewer: No blocker found in the website and publishing files. The review checked generated cards, source paths, JavaScript syntax, and action manifests. Public deployment remains to be checked.

### Final scope correction

VERIFIED commands and output:

```text
python3 -B scripts/build-index.py
OK 147 skills total; 8 verified as mine
rules=31, coding=77, crypto=25, writing=6, product=8

python3 -B scripts/build-site.py
OK website: setup homepage and 147 skills in _site/

python3 -B -m unittest discover -s tests -v
Ran 23 tests in 0.279s
OK

local Markdown links checked: 184; missing: []
OMP exported fields checked: 7; mismatches: []
```

VERIFIED: The Markdown check covered paths and fragments in README.md, CONTRIBUTING.md, and SKILLS.md. It did not check remote URLs or links inside collected skills. The OMP comparison covered exported settings only. It did not test provider access or model availability.

VERIFIED: Local Chrome returned `homepage: passed`, `homepage_to_catalog: passed`, `source_links: 147`, `console_errors: []`, and `failed_http: []`. Both pages fit widths 320, 390, 768, and 1440. Search, five filters, empty-state reset, clipboard and fallback, keyboard focus, and JavaScript-disabled browsing passed. Desktop and mobile homepage screenshots were inspected. Public Pages deployment remains untested.

VERIFIED: The writing detector returned `issues: []` for README.md, CONTRIBUTING.md, ATTRIBUTION.md, the three coordination documents, and visible prose from both HTML templates. JavaScript syntax and `git diff --check` exited 0. The running local preview returned HTTP `200`.

### Earlier refresh verification

VERIFIED at the earlier skill-focused stage:

```text
python3 -B -m unittest discover -s tests -v
Ran 23 tests in 3.039s
OK

python3 -B scripts/build-index.py
OK 147 skills total; 8 verified as mine
rules=31, coding=77, crypto=25, writing=6, product=8

python3 -B scripts/build-site.py
OK website: 147 skills in _site/

python3 -B rules/sync.py --check
up to date: AGENTS.md
```

VERIFIED: A second generation changed none of the seven checked catalog and website outputs. Local documentation checks examined 185 links and found `missing: []`. They covered README.md, CONTRIBUTING.md, and SKILLS.md, not every link inside collected skills.

VERIFIED: Chrome checks passed for search, five filters, empty-state reset, clipboard success and failure, keyboard focus, and JavaScript-disabled browsing. No horizontal overflow appeared at widths 320, 390, 768, and 1440. Output included `console_errors: []` and `failed_http: []`. The test served the site under `/agentsmith/` on localhost. Public Pages behavior remains untested.

VERIFIED: Disabling HTML escaping or restoring recursive template replacement each caused one collected website test to fail. No working source was left modified by these negative checks.

REPORTED by validator: Cached skills CLI 1.7.0 discovered 147 unique names, with `missing: []`, `unexpected: []`, and all eight authored skills. The original metadata tests failed before the fix. This proves compatibility with that cached CLI version.

REPORTED by refresh: Transcript exporter tests failed before the source change with `Ran 6 tests; FAILED (failures=4)`. The current combined test run includes all six cases.

VERIFIED: `git diff --check`, JavaScript syntax, and shell syntax checks exited 0. The writing detector reported `issues: []` for README.md, CONTRIBUTING.md, ATTRIBUTION.md, docs/interfaces.md, docs/decisions.md, and status.md.

## Next priorities

- RELEASE, owner coordinator, status In Progress: REPORTED correction, the user has now requested publication. The earlier publication gate applied to the build session. Verify each staged commit before its push and check the final Pages deployment.
- PROVENANCE, owner maintainer, status Planned: Record upstream source and license evidence for the additions when available. The current gaps remain explicit in ATTRIBUTION.md.

## Scope preserved

VERIFIED: The pre-existing untracked `research/masumi-citadel.md` remains outside this work. Local active skills and live harness settings were not edited. Personal runtime bindings and the private benchmark example were excluded from the refresh.

## Least confident decisions

1. INFERRED: Five existing sections should be enough for initial browsing. No developer usability study was performed.
