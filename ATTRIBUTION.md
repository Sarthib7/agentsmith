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

## Everything else

The remaining skills carry no author field and no license file. Some I wrote, some I adapted, some arrived through skill marketplaces whose provenance I did not record at install time. I am not going to guess and put a name on something I cannot verify. If you recognize your work, tell me and I will credit it.

Correction, 2026-08-07: `deterministic-code-review` and `git-worktree-runner` were initially placed in `skills/` because they had no author field. The user reported writing both. They now live in `my-skills/` with author metadata.

There may be more skills here that I wrote or adapted. The rest stay unattributed until a source settles ownership.

Skills reachable through my own [designskills](https://github.com/Sarthib7/designskills) repo: `diagnose`, `edit-article`, `git-guardrails-claude-code`, `grill-me`, `grill-with-docs`, `handoff`, `improve-codebase-architecture`, `migrate-to-shoehorn`, `obsidian-vault`, `prototype`, `review`, `scaffold-exercises`, `setup-matt-pocock-skills`, `setup-pre-commit`, `tdd`, `to-issues`, `to-prd`, `triage`, `write-a-skill`, `writing-beats`, `writing-fragments`, `writing-shape`, `zoom-out`. That repo is where they are maintained; they are vendored here so a single install gets the whole setup.

## Local refresh, 2026-09-27

VERIFIED: This refresh copied 159 files from the local `~/.agents/skills/` snapshot. All copied file hashes matched their source. That comparison proves snapshot equality; it does not establish upstream freshness or permission to redistribute.

VERIFIED: The refresh added these 22 collected skills:

`apply-grant`, `ask-matt`, `claude-handoff`, `code-review`, `codebase-design`, `diagnosing-bugs`, `domain-modeling`, `grilling`, `impeccable`, `implement`, `implement-spec`, `loop-me`, `research`, `resolving-merge-conflicts`, `retro`, `setup-ts-deep-modules`, `teach`, `to-questionnaire`, `to-spec`, `to-tickets`, `wait-what`, `writing-for-agents`.

REPORTED: The source review found no author or license declaration in these skills' frontmatter, and no standalone license file. Upstream attribution remains undetermined. Keep them in `skills/` until evidence supports a different owner.

VERIFIED correction: The hash comparison above records the initial copy. The final snapshot has these deliberate source changes:

- `temprouter/SKILL.md` uses a folded description scalar. Its original unquoted colon caused the skills CLI to skip it.
- `grill-me/SKILL.md` and `grill-with-docs/SKILL.md` show their prerequisite install commands.
- `apply-grant/SKILL.md` resolves its exporter from the installed skill directory and requires the user to select a transcript. Its telemetry sections were removed because they could send before consent and overwrite unrelated configuration.
- `apply-grant/export-session.sh` copies only the selected file and refuses an existing output. Its fixture tests use disposable transcripts.
- `impeccable/reference/extract.md`, `harden.md`, and `optimize.md` had five trailing spaces and one extra blank line removed. VERIFIED: `git diff --cached --check` identified those six lines during release staging.
