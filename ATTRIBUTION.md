# Attribution

This repository collects skills I use. VERIFIED: `my-skills/` contains eight skills with `author: sarthib7` in their frontmatter. REPORTED: The user identified `deterministic-code-review` and `git-worktree-runner` as their work on 2026-08-07. Their frontmatter now records that attribution. `skills/` contains collected work and skills whose source is not fully recorded.

VERIFIED correction, 2026-09-27: The previous introduction said seven skills, but the author table listed eight. The introduction had not kept pace with the collection. All eight current `my-skills/*/SKILL.md` files declare `author: sarthib7`.

This file records what the repository can verify. Author and license claims come from each skill's files unless a source is named explicitly.

If you wrote something here and want it removed or credited differently, open an issue and I will fix it.

## Declared authors

Taken from the `author:` field in each `SKILL.md`.

| Author | Skills |
|---|---|
| sarthib7 | `adhd`, `bench-it`, `deterministic-code-review`, `followup-review`, `fresh-eyes`, `git-worktree-runner`, `prove-it`, `research-url` |
| Render | `render-background-workers`, `render-blueprints`, `render-cli`, `render-cron-jobs`, `render-debug`, `render-deploy`, `render-disks`, `render-docker`, `render-domains`, `render-env-vars`, `render-keyvalue`, `render-mcp`, `render-migrate-from-heroku`, `render-monitor`, `render-networking`, `render-postgres`, `render-private-services`, `render-scaling`, `render-static-sites`, `render-web-services`, `render-workflows` |
| Supabase | `supabase`, `supabase-postgres-best-practices` |
| Solana Foundation | `solana-dev` |
| Conor Bronsdon | `avoid-ai-writing` |
| shadcn | `improve` |

## Bundled licenses

These directories carry their own license file, which governs that directory:

| Skill | License |
|---|---|
| `avoid-ai-writing` | MIT, Copyright (c) 2026 Conor Bronsdon |
| `humanizer` | MIT, Copyright (c) 2025 Siqi Chen |
| `openai-docs` | Apache 2.0 |
| `skill-creator` | Apache 2.0 |

## Other known sources

| Skill | Source |
|---|---|
| `pay` | `solana-foundation/pay`, recorded in the original `skills-lock.json` |
| `using-superpowers` | Ships with the `superpowers` Claude Code plugin |
| `harness-experiment` | Repository process adaptation inspired by [Google Research Harness2](https://github.com/google-research/harness2/tree/1cfe254e8d25b15f37048c3730134686abe60335), especially its pinned [selection.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/selection.py) and [ledger.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/ledger.py). Individual authorship is not verified. |

The Harness2 files identify Apache License 2.0; the pinned tree's [LICENSE](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/LICENSE) states the same. The [harness-experiment skill package](skills/harness-experiment/SKILL.md) is a separate repository process guide, not a Google-authored or published Harness2 skill; no Harness2 source code is copied.

## Everything else

The remaining skills carry no author field and no license file. Some I wrote, some I adapted, some arrived through skill marketplaces whose provenance I did not record at install time. I am not going to guess and put a name on something I cannot verify. If you recognize your work, tell me and I will credit it.

Correction, 2026-08-07: `deterministic-code-review` and `git-worktree-runner` were initially placed in `skills/` because they had no author field. The user reported writing both. They now live in `my-skills/` with author metadata.

There may be more skills here that I wrote or adapted. The rest stay unattributed until a source settles ownership.

Skills reachable through my own [designskills](https://github.com/Sarthib7/designskills) repo: `diagnose`, `edit-article`, `git-guardrails-claude-code`, `grill-me`, `grill-with-docs`, `handoff`, `improve-codebase-architecture`, `migrate-to-shoehorn`, `obsidian-vault`, `prototype`, `review`, `scaffold-exercises`, `setup-matt-pocock-skills`, `setup-pre-commit`, `tdd`, `to-issues`, `to-prd`, `triage`, `write-a-skill`, `writing-beats`, `writing-fragments`, `writing-shape`, `zoom-out`. That repo is where they are maintained; they are vendored here so a single install gets the whole setup.

## Local refresh, 2026-09-27

VERIFIED historical record: The 2026-09-27 refresh copied 159 files from a maintainer-selected skills snapshot. All copied file hashes matched their source. That comparison proves snapshot equality; it does not establish upstream freshness or permission to redistribute.

Privacy correction, 2026-10-21: The source machine path has been omitted from that historical record. Its recorded count, comparison method, and limits are unchanged.

VERIFIED: The refresh added these 22 collected skills:

`apply-grant`, `ask-matt`, `claude-handoff`, `code-review`, `codebase-design`, `diagnosing-bugs`, `domain-modeling`, `grilling`, `impeccable`, `implement`, `implement-spec`, `loop-me`, `research`, `resolving-merge-conflicts`, `retro`, `setup-ts-deep-modules`, `teach`, `to-questionnaire`, `to-spec`, `to-tickets`, `wait-what`, `writing-for-agents`.

REPORTED: The source review found no author or license declaration in these skills' frontmatter, and no standalone license file. Upstream attribution remains undetermined. Keep them in `skills/` until evidence supports a different owner.

VERIFIED correction: The hash comparison above records the initial copy. The final snapshot has these deliberate source changes:

- `temprouter/SKILL.md` uses a folded description scalar. Its original unquoted colon caused the skills CLI to skip it.
- `grill-me/SKILL.md` and `grill-with-docs/SKILL.md` show their prerequisite install commands.
- `apply-grant/SKILL.md` resolves its exporter from the installed skill directory and requires the user to select a transcript. Its telemetry sections were removed because they could send before consent and overwrite unrelated configuration.
- `apply-grant/export-session.sh` copies only the selected file and refuses an existing output. Its fixture tests use disposable transcripts.
- `impeccable/reference/extract.md`, `harden.md`, and `optimize.md` had five trailing spaces and one extra blank line removed. VERIFIED: `git diff --cached --check` identified those six lines during release staging.

## Anatomy workbench runtime, 2026-10-21

VERIFIED: The four modules in `site/anatomy/vendor/` and their `LICENSE` match the reviewed five-file closure from [wheresryan22/anatomy at revision 7895e19d2d8d9b585283b6113e25fc091275f0cc](https://github.com/wheresryan22/anatomy/tree/7895e19d2d8d9b585283b6113e25fc091275f0cc). The local `git hash-object` comparison returned:

| File | Git blob |
| --- | --- |
| `iso-kit.mjs` | `248ee01cc00dfaeee9d693f49f63e32913f03115` |
| `lathe.mjs` | `b2fb74dfda69aa6296152d76ec70f314ce2955f1` |
| `tube.mjs` | `94d1c84a7b7a1d1b1000de9ae3c84f53d093901a` |
| `audit.mjs` | `126ec0d83252db3415f32d35acd16567c53dad2d` |
| `LICENSE` | `aa20733917ffc919b6b04834e6a6e22909df7c76` |

VERIFIED: The copied notice is MIT, copyright (c) 2026 Ryan. The standalone workbench builder includes that complete notice in both generated HTML views. The scene and workflow controls build on these helpers; this addition does not change skill ownership metadata.

VERIFIED limitation: This comparison covers those five files only. It does not pin the entire installed Anatomy skill tree or grant a license to other collected material.

## Public policy privacy correction, 2026-10-23

VERIFIED correction: The earlier paths-only review did not remove the personal profile and identity text from the public rules snapshot. The exporter now removes those fields, rejects private-style leftovers, and omits input values from diagnostics. The snapshot was regenerated from already-published bytes, without copying new private input.

VERIFIED: Two collected privacy regression cases failed against the prior exporter. The corrected three-test rules suite passed, including distinct leftover-path and email cases. A synthetic CLI run removed the profile and email while retaining commit policy; a rejected input left prior output unchanged without echoing the input.

VERIFIED: A tracked generated Python cache containing a machine path was removed. Bytecode ignore rules prevent new cache files from being added accidentally. This current-tree correction does not by itself remove historical Git objects or metadata.
