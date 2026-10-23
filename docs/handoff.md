# Agentsmith handoff

## Current review state

VERIFIED correction, 2026-10-23: The earlier working handoff said both feature PRs were unpublished, then listed PR #7 as open. Map-only [PR #7](https://github.com/Sarthib7/agentsmith/pull/7) merged as `92c52719858c3fbd0676b3ed0cb46e74747a590c`. Its main-branch [validation 39965102703](https://github.com/Sarthib7/agentsmith/actions/runs/39965102703) and [Pages deployment 39965102624](https://github.com/Sarthib7/agentsmith/actions/runs/39965102624) passed. All 16 public map resources returned HTTP 200. Cleanup PR #6 was merged separately.

VERIFIED: Optional-demo [PR #8](https://github.com/Sarthib7/agentsmith/pull/8) was published and retargeted to `main` after #7 merged. Its first head, `6e24522ca24e1c7c732d964d1e197b2e46e24b99`, passed [CI run 39962744946](https://github.com/Sarthib7/agentsmith/actions/runs/39962744946). This is the release-preparation snapshot; the linked PR and Actions record current merge and deployment state.

VERIFIED scope: The second branch adds only the optional Anatomy illustration and its build integration. The native viewer, minimap, six pages, and six SVGs remain. Four disclosures start closed. The flowcharts explain architecture; the workbench does not represent live telemetry, provider access, runtime control, or worker capacity.

## Coordinator verification

- VERIFIED: `node --test site/anatomy/model.test.mjs site/architecture-viewer.test.mjs` returned 9 passed, 0 failed. `python3 -B -m unittest discover -s tests -v` returned 28 tests and `OK`. The builders reported 147 skills, 8 verified as mine, six pages, and two Anatomy views.
- VERIFIED: The dark and light geometry audits each sampled 16 poses and returned 16 passed, 0 failed. Finite samples do not prove continuous motion, real hardware, or every renderer.
- VERIFIED: Two collected missing-theme controls failed against the map-only builder with two assertion failures and zero fixture errors. The demo builder passed both and preserved prior output. No tracked source was reverted.
- VERIFIED: Real Brave reached all six routes at desktop and phone widths without document overflow. Four closed disclosures loaded their same-origin iframe when opened. The HTTP probe returned 200 for 18 resources and matched all six SVGs to their canonical bytes.
- VERIFIED: The five-file Anatomy MIT closure matched its pinned public revision. Both generated themes include the complete notice. This covers only the closure documented in `docs/anatomy-figure.md`, not the full upstream repository.

## Limits and private boundary

VERIFIED: A separate phone probe waited for all 71 rendered parts and the actual carriage transform. All six measured controls were within the workbench at 390 × 844. Moving the observed `#workbench` offscreen produced zero animation callbacks during a 250 ms sample; returning it onscreen resumed animation. Home restored the initial phase, count, and pose. These measurements do not cover all devices or browser states.

NOT DETERMINED: Automated accessibility auditing. Manual browser and keyboard checks are not an accessibility certification.

REQUIRED: Keep private configuration, sessions, model profiles, operational notes, and local files outside public PRs. Pattern scans have limited coverage; a clean result is not a privacy certification.

## Publication boundary

VERIFIED: The first demo snapshot's 28-file staged scope passed whitespace and selected privacy-pattern checks with a positive control and zero findings. The published PR body was read back and retained the contributor's explanation.

REPORTED: The user approved sequential merges and their automatic GitHub Pages deployments. REQUIRED: Merge one PR at a time only after exact-head CI passes; inspect the deployed result after each. Local integration evidence and CI success do not alone establish a working public site.
