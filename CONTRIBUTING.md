# Contributing

Keep each change limited to the skill, rule, workflow, or plugin component being updated.

## Add or update a skill

1. Put collected work in `skills/<name>/` or verified original work in `my-skills/<name>/`.
2. Add the skill to one catalog group in `scripts/build-index.py`.
3. Record its author, source, and license in `ATTRIBUTION.md` when known.
4. Regenerate and validate:

```bash
python3 scripts/build-index.py
```

Commit the generated `SKILLS.md`, `skills.sh.json`, and README badge changes with the source change.

## Before committing

Run:

```bash
python3 scripts/build-index.py
git diff --check
```

Review the generated diff. Do not edit generated catalog files by hand.
