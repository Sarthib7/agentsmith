# Repository instructions

## Skill ownership

- Put collected skills in `skills/<name>/`.
- Put skills with verified `sarthib7` authorship in `my-skills/<name>/`.
- Every skill directory must contain `SKILL.md` with `name` and `description` frontmatter.
- Keep each declared skill name unique across both roots.

## Generated files

Do not edit `SKILLS.md`, `skills.sh.json`, or README count markers by hand. Run:

```bash
python3 scripts/build-index.py
```

## Plugin work

Keep plugin-only agents, commands, hooks, and manifests under `plugin/`. Skills remain in their ownership roots so source and packaging do not become mixed.

## Verification

Run the index builder after moving, adding, or updating a skill. The command must exit successfully before committing.
