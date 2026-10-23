# Agentsmith handoff

## Current review state

VERIFIED correction, 2026-10-23: The earlier working handoff said both feature PRs were unpublished. Map-only [PR #7](https://github.com/Sarthib7/agentsmith/pull/7) is now open. Its exact-head [CI run 39943337652](https://github.com/Sarthib7/agentsmith/actions/runs/39943337652) passed for `86af90fb8cc7d950085fc66a6c6d9672c7cfbb21`. Cleanup [PR #6](https://github.com/Sarthib7/agentsmith/pull/6) was merged separately. The coordinator did not initiate a merge or deployment in this release pass.

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

REQUIRED: Review the exact staged files, publish the optional-demo branch as a second PR, and verify its exact-head CI. Keep both feature PRs unmerged for human review. This record reports local integration evidence, not a successful demo CI run or deployment.
