# Status

Last updated: 2026-10-23
Updated by: coordinator
Current phase: Harness experiment instruction-layer rollout

## Scope

REPORTED: The user requested a refresh, restructuring, and easier discovery. The user chose both the GitHub README and a searchable Pages site.

REPORTED correction: The user clarified that Agentsmith covers rules, workflows, and the OMP harness as well as skills. The earlier homepage and README gave skills too much prominence.

## Architecture release evidence

### Optional demo validation, 2026-10-23

- DEMO-PREP, owner coordinator, status Completed: The optional illustration was published as [PR #8](https://github.com/Sarthib7/agentsmith/pull/8), initially stacked on PR #7. Exact-head [CI run 39962744946](https://github.com/Sarthib7/agentsmith/actions/runs/39962744946) passed for the first demo head, `6e24522ca24e1c7c732d964d1e197b2e46e24b99`. Current merge and deployment state is recorded on GitHub.

VERIFIED correction: PR #7 was previously listed as OPEN. It merged as `92c52719858c3fbd0676b3ed0cb46e74747a590c`. Main-branch [validation 39965102703](https://github.com/Sarthib7/agentsmith/actions/runs/39965102703) and [Pages deployment 39965102624](https://github.com/Sarthib7/agentsmith/actions/runs/39965102624) both passed. The public resource probe returned HTTP 200 for all 16 map resources. This records the map release only, not a demo deployment.

VERIFIED demo stack: `node --test site/anatomy/model.test.mjs site/architecture-viewer.test.mjs` returned 9 passed, 0 failed. The Python suite returned `Ran 28 tests in 27.042s` and `OK`. The catalog reported 147 skills, 8 verified as mine; the site builder reported six pages and two Anatomy views. Both geometry audits sampled 16 poses and returned 16 passed, 0 failed. These finite samples do not prove continuous motion or real hardware.

VERIFIED demo failure controls: Against the map-only entry point, two collected missing-theme cases produced two assertion failures and zero fixture errors. The demo entry point passed both cases and preserved the previous output. No tracked source was reverted for this comparison.

VERIFIED demo surface: Real Brave reached all six routes at desktop and phone widths without document overflow. All four disclosures started closed; opening each loaded its same-origin iframe with the controls present. A resource probe returned HTTP 200 for 18 resources, matched all six SVGs to their canonical bytes, and found the complete MIT notice in both themes. These checks do not certify arbitrary browsers or accessibility.

- MAP-UI, owner implementer, status Completed: Keep the map-only pages on the native viewer and independent of optional demo assets.
- MAP-BUILD, owner implementer, status Completed: Preflight preserves output on missing input; successful builds regenerate only the owned output set.
- MAP-VERIFY, owner coordinator, status Completed: Corrected build, behavior regressions, browser paths, and resource checks passed. Publication remains separate.

### Current review and correction, 2026-10-23

VERIFIED corrected working tree: `node --test site/architecture-viewer.test.mjs` returned 5 passed, 0 failed. The Python suite returned `Ran 28 tests in 0.739s` and `OK`. The catalog reported `147 skills total; 8 verified as mine`, and the site builder reported six pages.

VERIFIED pre-correction probe: An obsolete generated HTML page was placed in `_site`; the valid map build left it there and it still returned HTTP 200. The Pages workflow uploads the whole `_site` tree. The builder reused the output directory without removing stale files.

REQUIRED correction: Read and validate every input before changing output. Missing input must leave the prior output unchanged. After successful preflight, regenerate only the builder-owned output set. This does not claim whole-build atomicity after later filesystem failures.

VERIFIED negative controls: The original missing-input behavior and the pre-correction stale-output behavior each failed one collected consumer test with one assertion failure and zero fixture errors. The corrected entry point passed both cases. The retired generated page changed from HTTP 200 before the correction to HTTP 404 after it. Real Brave navigation reached all six map-only pages at desktop and phone widths without document overflow; fit, zoom, and reset were exercised. These checks do not certify arbitrary browser states or external content.

## Completed

- REPO-METADATA, owner coordinator, status Completed: VERIFIED, GitHub's About fields now include the website URL and the full setup description. `rules/README.md` includes the migration approval gate.
- HARNESS-AUDIT, owner setup-reviewer, status Completed: REPORTED, the initial Claude example had one differing field and one field absent locally. VERIFIED by coordinator after correction: all 19 remaining Claude fields and all 21 OMP fields match their local sources.
- RELEASE-SKILLS, owner coordinator, status Completed: VERIFIED, commit `0d61289` was pushed to `main`. Git returned `3fa86f9..0d61289  main -> main`.
- RELEASE-RULES, owner coordinator, status Completed: VERIFIED, commit `7040365` was pushed to `main`. Git returned `0d61289..7040365  main -> main`. The staged snapshot returned `up to date: AGENTS.md` and `OMP exported fields checked: 7; mismatches: []`.
- RELEASE-SITE, owner coordinator, status Completed: VERIFIED, commit `9606ba0` was pushed to `main`. Git returned `7040365..9606ba0  main -> main`. The [validation run](https://github.com/Sarthib7/agentsmith/actions/runs/36310806659) and [Pages deployment](https://github.com/Sarthib7/agentsmith/actions/runs/36310917068) returned `conclusion: success` for `9606ba0ba933c79775c88c0da7b359dcce6d3c57`.
- REVIEW-SKILLS, owner skill-reviewer, status Completed: REPORTED, the review found no concrete blocker. Scope and limits appear below.
- REVIEW-SITE, owner site-reviewer, status Completed: REPORTED, the review found no publication blocker. Scope and limits appear below.
- HOME and DOCS: VERIFIED, `site/index.html` and `README.md` present rules, workflows, OMP, and skills. `site/skills.html` holds the searchable catalog. `CONTRIBUTING.md` covers each source type.
- SCOPE INTEGRATION: VERIFIED, the builder renders both pages. Catalog labels now call the former rules category "Agent setup"; badges say "setup skills". The OMP example matches seven exported fields from the local source. Evidence follows.
- REFRESH, owner refresh: VERIFIED, 22 skills added and 23 existing skill trees refreshed. The final catalog reports `147 skills total; 8 verified as mine`. This is a local snapshot comparison, not an upstream version audit.
- VALIDATE, owner validator: VERIFIED, required metadata, declared names, ownership roots, and groups are checked before output writes. Evidence: `tests/test_build_index.py` and the test run below.
- BROWSE, owner site: VERIFIED, `site/` provides search, category filters, source links, and install commands. Browser evidence is below.
- INTEGRATE, owner coordinator: VERIFIED, README navigation, shared generation, provenance, and Pages packaging are connected. Contract: `docs/interfaces.md`. Decisions: `docs/decisions.md`.

## Decisions

See `docs/decisions.md` for the static-site choice, source adaptations, and the 2026-10-23 map-only release boundary and stale-output invariant. Skill ownership roots remain stable.

## Verification and handoff

### Setup audit after publication

VERIFIED: `gh repo view Sarthib7/agentsmith --json homepageUrl,description` returned:

```json
{"description":"Rules, workflows, harness configuration, and skills for agentic engineering.","homepageUrl":"https://sarthib7.github.io/agentsmith/"}
```

VERIFIED correction: GitHub's homepage field was empty, although `README.md:9` already linked the website. The About fields now include that link and describe rules, workflows, harness configuration, and skills.

VERIFIED: `python3 -B rules/sync.py --check` returned `up to date: AGENTS.md`. Both workflow files matched their local sources byte for byte. All three global `AGENTS.md` entrypoints resolved to the shared rules source.

VERIFIED correction: `rules/README.md` still listed five approval gates. The source has six, including database migrations. The guide now includes that gate. The rule itself was already current.

VERIFIED correction: The Claude example's `model` was `claude-fable-5[1m]`; the local source uses `claude-fable-5-1[1m]`. The local source no longer has `fastMode`. The example now uses the source model and omits that stale field.

VERIFIED commands returned:

```text
Claude example: exported fields checked: 19; differences: []
OMP example: exported fields checked: 21; differences: []
Shared rules entrypoints checked: 3; different targets: []
Approval gates checked: 6; migration rule included in source and guide
README website links: homepage and skill catalog present
```

VERIFIED: Configuration comparisons cover exported leaf values. They do not test provider access or harness behavior. REPORTED by setup-reviewer: local-only hooks and `autoMode` include machine-specific or personal policy. Those fields remain excluded from the public example.

### Release checks

REPORTED: The user authorized sequential publication with "push one by one feat and update", then "go ahead". The three content commits were created and pushed one at a time.

VERIFIED: The website commit's staged snapshot returned `Ran 23 tests in 0.208s` and `OK`. Both builders succeeded. Generated catalog files matched the staged bytes. JavaScript syntax and staged whitespace checks exited 0.

VERIFIED correction: Successful GitHub checks did not establish that the public website was available. Both pages initially returned HTTP `404`. The Pages API returned `build_type: legacy` with source `main` at `/`. After changing `build_type` to `workflow` and running the Pages workflow, public checks returned:

```text
index.html: HTTP 200; matches local generated file: True; bytes: 13202
skills.html: HTTP 200; matches local generated file: True; bytes: 191478
style.css: HTTP 200; matches local generated file: True; bytes: 27324
catalog.js: HTTP 200; matches local generated file: True; bytes: 3279
icon.svg: HTTP 200; matches local generated file: True; bytes: 257
```

VERIFIED: These checks compared HTTP response bytes with `_site/`. They did not repeat browser interactions against the public origin. The earlier browser checks below used a local server.

VERIFIED correction: Earlier `git diff --check` runs did not cover untracked files. Staging the additions exposed five trailing spaces and one extra blank line in three Impeccable reference files. The release removes those whitespace errors; `ATTRIBUTION.md` records the source change.

VERIFIED: The first commit's temporary snapshot returned `Ran 20 tests in 0.806s` and `OK`. With only the catalog source restored to its original version, two collected regression tests returned `FAILED (failures=5)`. Restoring the new source returned `Ran 2 tests in 0.035s` and `OK`.

REPORTED by skill-reviewer: No concrete blocker found in the skill changes. The review checked metadata, companion links, script syntax, and common credential patterns. Pattern scans cannot prove that private data is absent. Upstream attribution remains undetermined.

REPORTED by site-reviewer: No blocker found in the website and publishing files. The review checked generated cards, source paths, JavaScript syntax, and action manifests. Public deployment remains to be checked.

VERIFIED correction: The public deployment check above now completes the site review's remaining release step. The earlier review covered files; it did not inspect the repository's Pages setting.

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

- PROVENANCE, owner maintainer, status Planned: Record upstream source and license evidence for the additions when available. The current gaps remain explicit in ATTRIBUTION.md.

## Scope preserved

VERIFIED: The pre-existing untracked `research/masumi-citadel.md` remains outside this work. Local active skills and live harness settings were not edited. Personal runtime bindings and the private benchmark example were excluded from the refresh.

## Least confident decisions

1. INFERRED: Five existing sections should be enough for initial browsing. No developer usability study was performed.

## Homepage link cleanup, 2026-10-21

REPORTED: The user requested removal of an obsolete contact link and the duplicate repository link in the homepage hero. The navbar GitHub link and Book a call remain in scope.

VERIFIED: Before the HTML change, `python3 -B -m unittest discover -s tests -p test_build_site.py -v` returned `Ran 4 tests in 0.098s` and `FAILED (failures=1)`. The failure was the rendered obsolete contact link, not a collection or fixture error.

VERIFIED: After the change, the focused `-k rendered_homepage` run returned `Ran 1 test in 0.107s` and `OK`. This result covers the homepage link regression, not the full test suite.

VERIFIED: A real Brave check of generated `_site/index.html` returned `{"obsoleteContact":false,"duplicateHeroRepository":false,"bookCall":true,"navbarGitHub":true}` and `console: clean`. The check did not visit external contact destinations.

The earlier release records remain historical. REPORTED: The user approved sequential merges and automatic GitHub Pages publication. Current PR and deployment state is recorded on GitHub.

## Homepage booking CTA, 2026-10-23

REPORTED: The user requested Book a call instead of Explore the setup in the homepage hero and approved promoting the existing booking link.

VERIFIED working tree: The hero has one primary Book a call link with the existing destination. The duplicate contact block and its unused styles were removed. The Architecture link and setup accessibility skip link remain.

VERIFIED: The focused site-builder suite returned 7 tests and `OK`. Both builders passed with 147 skills, six pages, and two Anatomy views. Isolated Brave checks at desktop and phone widths found one booking link, no document overflow, a focusable primary CTA, and clean consoles. The booking destination was not opened or submitted.

## Harness experiment checkpoint, 2026-10-23

REPORTED: The user approved R1, the opt-in workflow, an invocation skill, a conditional repository rule, and two sequential PRs. Private global installation is excluded.

VERIFIED: The catalog builder returned `OK 148 skills total; 8 verified as mine`. The site builder reported six pages, two Anatomy views, and 148 skills. The existing Python suite returned `Ran 30 tests` and `OK`; the Node suite returned 9 passed, 0 failed.

VERIFIED: `skills@1.7.0` listed 148 skills in the checkout, including `harness-experiment`. A targeted project-scope copy installation for Codex included both `SKILL.md` and its package-local `references/workflow.md`; both installed files were opened. This does not establish installation or discovery in a user's OMP runtime.

VERIFIED: One negative control removed only the new catalog registration in memory. The builder returned exit 1 for the ungrouped skill and preserved the prior generated outputs. No source was edited for that control.

VERIFIED controlled artifact checks: Two separate CSV fixture episodes used one baseline and one candidate execution each. The regressing candidate passed 2 of 4 cases against a 4-of-4 baseline and was rejected. The valid candidate passed 4 of 4 against a 2-of-4 baseline and was eligible for task-local use. All four executor exits were 0. These fault-injected, deterministic controls are not a live model pilot or evidence of general agent compliance, model quality, or savings. The probes made no model API calls; parent model billing was not measured.

VERIFIED local limit: The unchanged Anatomy audit was interrupted by the local command's 60-second deadline after two sampled poses passed. A complete audit is not claimed here. Exact-head GitHub CI remains the publication gate.

At this checkpoint, commits and publication have not occurred. The original working trees, generated global-policy snapshot, private settings, and credentials were not modified by this feature.

## Harness experiment site checkpoint

VERIFIED: [PR #11](https://github.com/Sarthib7/agentsmith/pull/11) merged as `3ad05e6b28a4fd4d1acb0e0d533970e2bceffdc7`. Exact-head [CI 40083555595](https://github.com/Sarthib7/agentsmith/actions/runs/40083555595) passed for `8c570c7b8d33c31b11cf0d519a05001b1c684efa`, including the complete audit. [Pages deployment 40084280345](https://github.com/Sarthib7/agentsmith/actions/runs/40084280345) passed for the merge revision. The live catalog contains `harness-experiment` and its install command; the primary Book a call destination remains unchanged.

VERIFIED: The integrated site branch builds six pages, two Anatomy views, and 148 skills. The focused site-builder suite returned `Ran 7 tests in 0.151s` and `OK`.

VERIFIED sampled UI: Brave rendered the workflow at desktop width 1200 and phone width 390. The document and measured process containers fit both widths. The phone Rules and Architecture pages exposed the new guide and fit the document width. Keyboard activation of Architecture's Workflows link reached the experiment section. The browser error log was empty for that local navigation check. Screenshots were inspected; these checks do not certify arbitrary browsers or accessibility.

This checkpoint records the site changes before their own publication. Private global installation and runtime configuration remain outside scope. The packaging and controlled fixture results do not establish real-task model benefits or automatic enforcement.
