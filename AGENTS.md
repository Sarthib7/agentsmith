# Repository instructions

## Skill ownership

- Put collected skills in `skills/<name>/`.
- Put skills with verified `sarthib7` authorship in `my-skills/<name>/`.
- Every skill directory must contain `SKILL.md` with `name` and `description` frontmatter.
- Keep each declared skill name unique across both roots.

## YAGNI

Apply YAGNI to all work in this repository (rule text: `rules/CLAUDE.md`, skill: `skills/ponytail/`): laziest solution that works. Question whether the change needs to exist, reuse before writing, stdlib and native before dependencies, shortest working diff. No unrequested abstractions or scaffolding "for later". Never simplify away validation at trust boundaries, error handling that prevents data loss, security, or anything explicitly requested.

## Generated files

Do not edit `SKILLS.md`, `skills.sh.json`, or README count markers by hand. Run:

```bash
python3 scripts/build-index.py
```

## Plugin work

Keep plugin-only agents, commands, hooks, and manifests under `plugin/`. Skills remain in their ownership roots so source and packaging do not become mixed.

## Workflows

- [Agentic engineering repository protocol](workflows/agentic-engineering.md): read this workflow when two or more agents work on one repository outcome.

## Verification

Run the index builder after moving, adding, or updating a skill. The command must exit successfully before committing.
