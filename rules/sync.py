#!/usr/bin/env python3
"""Regenerate the repo rules snapshot from the live global file.

    python3 rules/sync.py           rewrite rules/CLAUDE.md and rules/AGENTS.md
    python3 rules/sync.py --check   exit 1 if they are stale, write nothing

The live file is ~/.claude/CLAUDE.md. It uses absolute paths for a single
machine. The repo copies use repo-relative paths so they read correctly on
GitHub. Everything else must stay identical, so this script owns the rewrite
list and nothing else edits the copies by hand.

If a required rewrite no longer matches, the script stops instead of shipping a
half-converted snapshot. That is the point: drift should fail loudly.
"""

import pathlib
import sys

SOURCE = pathlib.Path.home() / ".claude" / "CLAUDE.md"
TARGETS = ("CLAUDE.md", "AGENTS.md")

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
)

# Applied wherever they appear. Absence is fine.
OPTIONAL = (
    ("~/.claude/skills/", "skills/"),
    ("~/.agents/skills/", "skills/"),
)


def fail(message):
    sys.exit(f"sync.py: {message}")


def render():
    """Return the repo-relative form of the global rules file."""
    if not SOURCE.exists():
        fail(f"{SOURCE} not found. Nothing to sync from.")

    text = SOURCE.read_text()

    for old, new in REQUIRED:
        count = text.count(old)
        if count != 1:
            fail(
                f"required rewrite matched {count} times, expected 1.\n"
                f"  looking for: {old!r}\n"
                f"  Fix the rewrite list in this file, then run again."
            )
        text = text.replace(old, new)

    for old, new in OPTIONAL:
        text = text.replace(old, new)

    leftover = [line for line in text.splitlines() if "~/." in line]
    if leftover:
        fail(
            "machine-local paths survived the rewrite:\n"
            + "\n".join(f"  {line}" for line in leftover)
            + "\n  Add a rewrite for each, then run again."
        )

    return text


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
    print(f"wrote {', '.join(TARGETS)} from {SOURCE} ({lines} lines, {changed})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
