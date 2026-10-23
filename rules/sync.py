#!/usr/bin/env python3
"""Regenerate the repo rules snapshot from the live global file.

    python3 rules/sync.py           rewrite rules/AGENTS.md
    python3 rules/sync.py --check   exit 1 if it is stale, write nothing

The canonical file is the user's ~/AGENTS.md. Each harness entry point
symlinks to it. The repo copy rewrites local paths so the snapshot works
on GitHub. This script owns the mapping. Never edit the generated copy.

If a required rewrite no longer matches, the script stops instead of shipping a
half-converted snapshot. That is the point: drift should fail loudly.
"""

import pathlib
import re
import sys

SOURCE = pathlib.Path.home() / "AGENTS.md"
TARGETS = ("AGENTS.md",)

# Each of these must match exactly once. A miss means the global file changed
# shape and the rewrite below needs updating too.
REQUIRED = (
    (
        "# Skills: routing (catalog: `~/.agents/skills/SKILLS.md`)",
        "# Skills: routing (catalog: `SKILLS.md` at the repo root)",
    ),
    (
        "**Read `~/.agents/skills/SKILLS.md` before picking a skill.**",
        "**Read `SKILLS.md` before picking a skill.**",
    ),
    (
        " Also reachable as `~/.claude/skills/SKILLS.md`. `SKILLS-INDEX.md` beside it is stale; ignore it.",
        "",
    ),
    (
        "(~/.agents/workflows/agentic-engineering.md)",
        "(../workflows/agentic-engineering.md)",
    ),
    (
        "(~/.agents/workflows/orchestration.md)",
        "(../workflows/orchestration.md)",
    ),
    (
        "is set in `~/.claude/settings.json` (2026-08-26)",
        "is set in the live Claude `settings.json` (2026-08-26; shape in `settings.example.json`)",
    ),
    (
        f"Canonical source: {SOURCE}. All harness entrypoints MUST symlink to this file.",
        "Canonical source: ~/AGENTS.md. Point each installed harness entrypoint to this shared file.",
    ),
    (
        "- Skill router: ~/.agents/skills/SKILLS.md. Read the selected skill at ~/.agents/skills/<name>/SKILL.md.",
        "- Skill index: [SKILLS.md](../SKILLS.md) at the repo root. Read selected skills at ../skills/<name>/SKILL.md.",
    ),
    (
        "- Repository coordination: ~/.agents/workflows/agentic-engineering.md. Use when two or more agents share one repository outcome.",
        "- Repository coordination: [agentic-engineering.md](../workflows/agentic-engineering.md). Use when two or more agents share one repository outcome.",
    ),
    (
        "- OMP orchestration: ~/.agents/workflows/orchestration.md. Use for typed subagent batches and handoffs.",
        "- OMP orchestration: [orchestration.md](../workflows/orchestration.md). Use for typed subagent batches and handoffs.",
    ),
    (
        "- OMP runtime and model roles: ~/omp-config/config.yml. Runtime settings remain separate from policy.",
        "- OMP runtime and model roles: [omp-config.example.yml](omp-config.example.yml). Runtime settings remain separate from policy.",
    ),
    (
        "- OMP advisor rules: ~/omp-config/WATCHDOG.yml. Read before changing reviewer roles or instructions.",
        "- OMP advisor rules are harness-local. Keep reviewer scope separate from global policy.",
    ),
    (
        "- OMP agent definitions: ~/omp-config/agents/*.md. Read the selected definition before dispatch.",
        "- OMP agent definitions are harness-local. Read the selected definition before dispatch.",
    ),
    (
        "- OMP commands: ~/omp-config/commands/*.md. Read the matching command file before invoking it.",
        "- OMP commands are harness-local. Read the matching command file before invoking it.",
    ),
    (
        "- Claude runtime settings: ~/.claude/settings.json. Runtime settings remain separate from policy.",
        "- Claude runtime settings: [settings.example.json](settings.example.json). Runtime settings remain separate from policy.",
    ),
    (
        "- Project memory: ~/.omp/agent/memories/sharpshooter/<project>/state.json. Read only the matching project's memory.",
        "- Project memory is harness-local. Read only the matching project's memory.",
    ),
    (
        "- Reference notes: ~/Desktop/learnings.md and ~/Desktop/learnings1.md. These are source notes, not active policy.",
        "- Reference notes are source material, not active policy. Load only when the user points to them.",
    ),
)

# Applied wherever they appear. Absence is fine.
OPTIONAL = (
    ("~/.claude/skills/", "skills/"),
    ("~/.agents/skills/", "skills/"),
)


def fail(message):
    sys.exit(f"sync.py: {message}")


def public_policy(text):
    """Remove personal fields and reject unsafe export leftovers."""
    lines = []
    private_section = False
    for line in text.splitlines(keepends=True):
        if line.startswith("# "):
            private_section = line.strip().casefold() == "# about me"
        if private_section:
            continue
        if line.startswith("- **Commit identity.**"):
            lines.append(
                "- **Commit identity.** Use your configured Git identity. "
                "Keep personal email addresses out of public examples.\n"
            )
        else:
            lines.append(line)

    public = "".join(lines)
    if "~/." in public:
        fail("unmapped machine-local paths remain; update the rewrite list")
    if re.search(r"/(?:Users|Volumes)/|\b[A-Za-z]:\\Users\\", public):
        fail("absolute machine paths remain; update the rewrite list")
    if re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", public):
        fail("email identifiers remain; use generic public guidance")
    return public


def render():
    """Return the repo-relative public form of the rules input."""
    if not SOURCE.exists():
        fail("rules source not found; nothing to sync")
    try:
        text = SOURCE.read_text()
    except (OSError, UnicodeError):
        fail("cannot read the rules source")

    for index, (old, new) in enumerate(REQUIRED, 1):
        count = text.count(old)
        if count != 1:
            fail(
                f"required rewrite {index} matched {count} times, expected 1; "
                "update the rewrite list"
            )
        text = text.replace(old, new)

    for old, new in OPTIONAL:
        text = text.replace(old, new)

    return public_policy(text)


def main():
    check_only = "--check" in sys.argv[1:]
    rendered = render()
    here = pathlib.Path(__file__).parent

    stale = [name for name in TARGETS
             if not (here / name).exists() or (here / name).read_text() != rendered]

    if check_only:
        if stale:
            print("stale: " + ", ".join(stale))
            print(f"run: python3 {pathlib.Path(__file__).name}")
            return 1
        print(f"up to date: {', '.join(TARGETS)}")
        return 0

    for name in TARGETS:
        (here / name).write_text(rendered)
    lines = len(rendered.splitlines())
    changed = ", ".join(stale) if stale else "nothing changed"
    print(f"wrote {', '.join(TARGETS)} ({lines} lines, {changed})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
