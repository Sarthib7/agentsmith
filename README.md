<div align="center">

# agentsmith

Agent rules and reusable skills from my daily setup, with a separate workspace for plugin packaging.

<!-- counts:start -->
![skills](https://img.shields.io/badge/skills-119-1a1a1a?style=flat-square&labelColor=1a1a1a&color=FF51FF)
![rules](https://img.shields.io/badge/rules-18-1a1a1a?style=flat-square)
![coding](https://img.shields.io/badge/coding-62-1a1a1a?style=flat-square)
![crypto](https://img.shields.io/badge/crypto-24-1a1a1a?style=flat-square)
![writing](https://img.shields.io/badge/writing-6-1a1a1a?style=flat-square)
![product](https://img.shields.io/badge/product-9-1a1a1a?style=flat-square)
<!-- counts:end -->

</div>

## Install

Install selected skills:

```bash
npx skills add Sarthib7/agentsmith
```

Install everything globally:

```bash
npx skills add Sarthib7/agentsmith --all -g
```

Read one skill without installing it:

```bash
npx skills use Sarthib7/agentsmith@caveman
```

Full generated catalog: [SKILLS.md](SKILLS.md).

## Repository layout

```text
agentsmith/
├── AGENTS.md          rules for contributing to this repository
├── rules/             global AGENTS.md and CLAUDE.md files
├── workflows/         reusable operating workflows linked by agent rules
├── skills/            collected skills used in my setup
├── my-skills/         skills with verified sarthib7 authorship
├── plugin/            agents, commands, hooks, and manifests
├── scripts/           catalog generation and validation
├── data/              shared skill reference data
├── SKILLS.md          generated skill catalog
└── skills.sh.json     generated skills.sh grouping manifest
```

Ownership and purpose stay separate. `skills/` answers what I use. `my-skills/` answers what I wrote. [ATTRIBUTION.md](ATTRIBUTION.md) records known authors, licenses, and source gaps.

## My skills

These seven skills declare `author: sarthib7` in their source:

| Skill | Purpose |
|---|---|
| [`adhd`](my-skills/adhd/SKILL.md) | Parallel divergent ideation for coding agents |
| [`bench-it`](my-skills/bench-it/SKILL.md) | Compare performance claims against a named baseline |
| [`deterministic-code-review`](my-skills/deterministic-code-review/SKILL.md) | Review diffs with frozen scope, exact anchors, and a falsification pass |
| [`followup-review`](my-skills/followup-review/SKILL.md) | Review fixes made after an earlier code review |
| [`fresh-eyes`](my-skills/fresh-eyes/SKILL.md) | Get an independent second opinion without shared context |
| [`git-worktree-runner`](my-skills/git-worktree-runner/SKILL.md) | Run isolated agent tasks through `git gtr` worktrees |
| [`prove-it`](my-skills/prove-it/SKILL.md) | Verify that a check passes and can fail |

Authorship stays conservative. A skill remains in `skills/` when its origin is uncertain.

## How the pieces fit

`rules/` contains standing instructions loaded for every session. The AGENTS.md and CLAUDE.md copies target different agent harnesses but carry the same policy.

`skills/` and `my-skills/` contain task procedures. Each skill has a `SKILL.md` entry point and may include references, scripts, templates, or assets.

`plugin/` is the packaging workspace. Its capability split follows the [Vercel plugin](https://github.com/vercel/vercel-plugin): specialist agents, commands, hooks, and platform manifests remain separate from skill source. The plugin is a scaffold today and has no published manifest.

## Add or update a skill

1. Put collected work in `skills/<name>/` or verified original work in `my-skills/<name>/`.
2. Add the skill to one catalog group in `scripts/build-index.py`.
3. Record its author, source, and license in `ATTRIBUTION.md` when known.
4. Regenerate and validate:

```bash
python3 scripts/build-index.py
```

The generator rejects duplicate directories, ungrouped skills, missing skills, and skills placed in the wrong ownership root. It rewrites `SKILLS.md`, `skills.sh.json`, and the count markers above.

## Global rules

`rules/AGENTS.md` and `rules/CLAUDE.md` contain the setup's always-on layer. They define output style, skill routing, documentation lookup order, evidence requirements, confirmation gates, and multi-agent repository coordination.

`rules/settings.example.json` contains an example Claude Code configuration. Review it before copying it into a local setup.

## Plugin companions

Some capabilities ship as external plugins and are not copied into this repository:

```text
/plugin install superpowers@claude-plugins-official
/plugin install vercel@claude-plugins-official
/plugin install rust-analyzer-lsp@claude-plugins-official
/plugin install cartographer@cartographer-marketplace
```

## Known limitations

- Some Solana and DeFi skills reference `../../../data/...`. Those paths depend on the installation layout.
- `skills/spec-build/` declares `name: build` because the skills CLI treats a directory named `build` as generated output.
- `skills/tempo-request/` declares `name: tempo`, matching its upstream source.
- Provenance is incomplete for skills that arrived without author metadata, a license, or a recorded source.

Generated files should not be edited by hand. Change the source or catalog configuration, then run `python3 scripts/build-index.py`.
