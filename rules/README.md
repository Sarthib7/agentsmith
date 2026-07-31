# Rules

The always-on layer. Skills load when a task matches; these apply to every message.

## `CLAUDE.md`

Drop it at `~/.claude/CLAUDE.md` for every project, or at a repo root for one project. Other harnesses read the same content from `AGENTS.md`, so symlink rather than copy:

```bash
ln -s ~/.claude/CLAUDE.md ~/AGENTS.md
```

What it covers, in the order the file sets it out:

| Section | What it decides |
|---|---|
| About me | Calibration. Which topics need context and which do not |
| Communication | No filler openers, length matched to complexity, uncertainty flagged before the claim |
| Caveman mode | Terse fragments by default, with named exceptions for security warnings and multi-step sequences |
| Writing rules | Banned constructions. Em dashes, AI vocabulary, rule of three, negative parallelism, vague attribution |
| Output shaping | Lead with the next action, number multi-step work, restate state every turn, cap lists at five |
| Cavekit | SPEC.md is source of truth where it exists. Only `spec` may write it |
| Skills routing | Process skill first, implementation skill second. One skill per job. Announce before following |
| Documentation lookup | A five-step order that puts training data last. Skills, then MCP, then live official docs |
| Default behaviors | Ask rather than assume, show options first, simplest thing that works, stay in scope |
| Confirmation gates | Four categories that need an explicit yes: altering my content, destructive, irreversible, acting on my behalf |
| Git commit rules | Commit identity, one commit at a time, no `Co-Authored-By` trailer |

Two things in there do more work than the rest.

**The documentation lookup order.** Ranking sources and putting training data dead last is what stops an agent inventing a function signature that looked right in 2024.

**The confirmation gates.** Each one names a class of action and demands a yes in the current message. "You mentioned this earlier" explicitly does not count, which closes the gap where an agent treats old approval as standing permission.

## `settings.example.json`

Claude Code settings with the local hook paths stripped. Copy to `~/.claude/settings.json` and adjust. Plugin entries assume you have added the marketplaces they reference.

## Adapting this

Do not take my file as written. The About me section describes one person's background, and the calibration rules read off it. Rewrite that section first, then the rest starts pointing at you instead of me.
