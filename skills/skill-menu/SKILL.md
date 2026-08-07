---
name: skill-menu
description: Use when the user asks to list, choose, or explicitly invoke skills with skill:<name>; loads local skill files on demand.
---

# Skill Menu

Use this skill only for explicit skill management, not for automatic task routing.

## Triggers

- `skill:list`
- `skill:<name>`
- `show skills`
- `list skills`
- `choose a skill`
- `invoke skill <name>`

## Workflow

1. For listing, read `~/.codex/SKILLS-INDEX.md` first and summarize relevant choices.
2. If the index looks stale, run `~/.codex/bin/codex-skills reindex`.
3. For `skill:<name>`, run `~/.codex/bin/codex-skills show <name>` to find the matching local `SKILL.md`.
4. Read only the selected skill file, then follow its workflow as the active manual skill.
5. Prefer matches in this order:
   - repo-local `.agents/skills`
   - `~/.agents/skills`
   - built-in `~/.codex/skills/.system`
   - dormant duplicate roots such as `~/.codex/skills` and `~/Build/designskills`

## Rules

- Do not load every skill. Load exactly the requested skill.
- Do not re-enable disabled skills automatically.
- If a disabled skill has an enabled duplicate, use the enabled duplicate.
- If a disabled skill is the only copy, read it from disk only when the user explicitly asks for it.
- Codex CLI 0.128.0 does not currently expose a built-in `/skill` slash command. Use `skill:<name>` in chat.
