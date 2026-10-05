# Rules

The always-on layer. Skills load when a task matches; these apply to every message.

Because this file loads into every session, size has a cost in adherence as well as tokens. Claude Code's docs target under 200 lines per file and warn that longer files "reduce adherence". Anything that is only true during one kind of work belongs in `workflows/` or in a skill, not here. Note that `@path` imports do not help: imported files load at launch too.

## `AGENTS.md`

The live policy has one canonical file: ~/AGENTS.md. Oh My Pi and Codex load AGENTS.md natively. Claude Code reads ~/.claude/CLAUDE.md, a symlink to the canonical file.

Keep the real global policy at ~/AGENTS.md. After moving your existing policy into that file, link each harness entrypoint to it:

```bash
ln -sfn ~/AGENTS.md ~/.agents/AGENTS.md
ln -sfn ~/AGENTS.md ~/.claude/CLAUDE.md
ln -sfn ~/AGENTS.md ~/.codex/AGENTS.md
```

What it covers, in the order the file sets it out:

| Section | What it decides |
|---|---|
| About me | Calibration. Which topics need context and which do not |
| Communication | Open with the answer, length matched to complexity, STE sentences, full sentences while coding |
| Caveman mode | Terse fragments by default, with named exceptions for security warnings and coding explanations |
| YAGNI | The laziest solution that works, and the short list of things never to simplify away |
| Writing rules | Banned constructions. Em dashes, AI vocabulary, rule of three, negative parallelism, vague attribution |
| Output shaping | Lead with the next action, restate status at phase changes, cap lists at five |
| Cavekit | SPEC.md is source of truth where it exists. Only `spec` may write it |
| Skills routing | Process skill first, implementation skill second. One skill per job. Announce before following |
| Ultra gates | Maximum depth on planning and brainstorming |
| Documentation lookup | A five-step order that puts training data last. Skills, then MCP, then live official docs |
| Written records | Provenance tags, quoted evidence, method blind spots, explicit corrections |
| Default behaviors | Label uncertainty, ask only about material choices, recommend options when trade-offs matter |
| Confirmation gates | Approval for content changes, destructive actions, irreversible actions, database migrations, acting on my behalf, and formal backtracking |
| Git commit rules | Commit identity, one commit at a time, no `Co-Authored-By` trailer |
| Workflows | Links out to the agentic engineering protocol and the orchestration workflow, so they load only when the work needs them |
| Model rule | Opus 5 is banned everywhere. Opus 4.8 is the only Opus; otherwise Sonnet or Haiku |

Two things in there do more work than the rest.

**The documentation lookup order.** Ranking sources and putting training data dead last is what stops an agent inventing a function signature that looked right in 2024.

**The confirmation gates.** Each one names a class of action and demands a yes in the current message. "You mentioned this earlier" explicitly does not count, which closes the gap where an agent treats old approval as standing permission.

## `sync.py`

The copy above is generated. Edit the live ~/AGENTS.md, then run the sync script. Never edit the copy by hand.

```bash
python3 rules/sync.py           # rebuild the copy from the live file
python3 rules/sync.py --check   # exit 1 if it has gone stale
```

It rewrites machine-local paths to repo-relative ones. If it meets a path it has no rewrite for, or a rewrite that no longer matches, it stops and says which. Drift fails loudly rather than shipping a half-converted snapshot. This repo has drifted before: the `Ultra gates` section existed in the live file and was missing from the copies.

## `settings.example.json`

Selected Claude Code settings. Local hooks and approval overrides are omitted. Copy to `~/.claude/settings.json` and adjust. Plugin entries assume you have added the marketplaces they reference.

## `omp-config.example.yml`

Snapshot of [`~/.omp/agent/config.yml`](omp-config.example.yml), the Oh My Pi harness config. It records the `modelRoles` mapping, `task.agentModelOverrides` (which model runs task subagents and which reviews), the work style (one-at-a-time steering, fresh agents, sharpshooter memory, autolearn) and the shared advisor limits. Theme, status line, credentials and local permissions are left out. [`workflows/orchestration.md`](../workflows/orchestration.md) explains how those roles get used.

## `omp-advisors.example.yml`

Snapshot of [`~/.omp/agent/WATCHDOG.yml`](omp-advisors.example.yml): three read-only advisors, each with its own scope and note limit. `astra` checks correctness, invariants and security. `fable` checks architecture, API design and YAGNI. `grok` checks obvious regressions and test gaps. They attach to the main session only, never to a subagent. The file holds the full instructions, and its header explains why the name `grok` says nothing about which model runs.

## `agent-profiles.example.md`

[Snapshot](agent-profiles.example.md) of the four custom agent profiles: `proxy-fix-builder`, `proxy-verifier`, `sonnet-builder` and `sonnet-tester`. Two builders write code, two testers only observe and report. The file has the full prompts, with product-specific wording generalized.

## Adapting this

Do not take my file as written. The About me section describes one person's background, and the calibration rules read off it. Rewrite that section first, then the rest starts pointing at you instead of me.
