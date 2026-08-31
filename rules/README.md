# Rules

The always-on layer. Skills load when a task matches; these apply to every message.

Because this file loads into every session, size has a cost in adherence as well as tokens. Claude Code's docs target under 200 lines per file and warn that longer files "reduce adherence". Anything that is only true during one kind of work belongs in `workflows/` or in a skill, not here. Note that `@path` imports do not help: imported files load at launch too.

## `AGENTS.md`

One rules snapshot under the neutral name. Oh My Pi (`omp`, the primary harness) and Codex load `AGENTS.md` files natively. Claude Code reads the same policy from the live source at `~/.claude/CLAUDE.md`. A `CLAUDE.md` twin used to sit here; one copy under the shared name serves every harness, so it is gone.

For one shared global source, install the live file as `~/.claude/CLAUDE.md` (same content as `AGENTS.md` here), then symlink each harness entry point:

```bash
ln -s ~/.claude/CLAUDE.md ~/AGENTS.md
ln -s ~/.claude/CLAUDE.md ~/.agents/AGENTS.md
ln -s ~/.claude/CLAUDE.md ~/.codex/AGENTS.md
```

What it covers, in the order the file sets it out:

| Section | What it decides |
|---|---|
| About me | Calibration. Which topics need context and which do not |
| Communication | Open with the answer, length matched to complexity, STE sentences, full sentences while coding |
| Caveman mode | Terse fragments by default, with named exceptions for security warnings and coding explanations |
| YAGNI | The laziest solution that works, and the short list of things never to simplify away |
| Writing rules | Banned constructions. Em dashes, AI vocabulary, rule of three, negative parallelism, vague attribution |
| Output shaping | Lead with the next action, number multi-step work, restate state every turn, cap lists at five |
| Cavekit | SPEC.md is source of truth where it exists. Only `spec` may write it |
| Skills routing | Process skill first, implementation skill second. One skill per job. Announce before following |
| Ultra gates | Maximum depth on planning and brainstorming |
| Documentation lookup | A five-step order that puts training data last. Skills, then MCP, then live official docs |
| Written records | Provenance tags, quoted evidence, method blind spots, explicit corrections |
| Default behaviors | Ask rather than assume, show options first, stay in scope, cap retries at three |
| Confirmation gates | Five categories that need an explicit yes: altering my content, destructive, irreversible, acting on my behalf, formal backtracking |
| Git commit rules | Commit identity, one commit at a time, no `Co-Authored-By` trailer |
| Workflows | Links out to the agentic engineering protocol and the orchestration workflow, so they load only when the work needs them |
| Model rule | Opus 5 is banned everywhere. Opus 4.8 is the only Opus; otherwise Sonnet or Haiku |

Two things in there do more work than the rest.

**The documentation lookup order.** Ranking sources and putting training data dead last is what stops an agent inventing a function signature that looked right in 2024.

**The confirmation gates.** Each one names a class of action and demands a yes in the current message. "You mentioned this earlier" explicitly does not count, which closes the gap where an agent treats old approval as standing permission.

## `sync.py`

The copy above is generated, so edit the live `~/.claude/CLAUDE.md` and never the copy.

```bash
python3 rules/sync.py           # rebuild the copy from the live file
python3 rules/sync.py --check   # exit 1 if it has gone stale
```

It rewrites machine-local paths to repo-relative ones. If it meets a path it has no rewrite for, or a rewrite that no longer matches, it stops and says which. Drift fails loudly rather than shipping a half-converted snapshot. This repo has drifted before: the `Ultra gates` section existed in the live file and was missing from the copies.

## `settings.example.json`

Claude Code settings with the local hook paths stripped. Copy to `~/.claude/settings.json` and adjust. Plugin entries assume you have added the marketplaces they reference.

## `omp-config.example.yml`

Snapshot of `~/.omp/agent/config.yml`, the Oh My Pi harness config. The part that matters is `modelRoles` plus `task.agentModelOverrides`: which model plans, which model runs task subagents, and which vendor reviews. [`workflows/orchestration.md`](../workflows/orchestration.md) explains how those roles get used.

## Adapting this

Do not take my file as written. The About me section describes one person's background, and the calibration rules read off it. Rewrite that section first, then the rest starts pointing at you instead of me.
