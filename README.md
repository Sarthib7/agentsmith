<div align="center">

# Agentsmith

Agent rules and reusable skills from my daily setup, with a separate workspace for plugin packaging.

<a href="https://tenor.com/view/iron-man-iron-man-hammer-iron-hammer-robert-downey-robert-downey-jr-gif-15959050">
  <img src="https://media1.tenor.com/m/cUDKyJkDr6kAAAAd/iron-man-iron-man-hammer.gif" alt="Tony Stark hammering metal" width="360">
</a>

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

Browse the collection on [Skills.sh](https://www.skills.sh/sarthib7/agentsmith) or open the full generated [skill catalog](SKILLS.md).

Changes and new skills: [CONTRIBUTING.md](CONTRIBUTING.md).

## Repository layout

```text
agentsmith/
├── AGENTS.md          rules for contributing to this repository
├── CONTRIBUTING.md    contributor workflow and validation steps
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

## DYOR

Treat every skill as untrusted until you review it. Inclusion in this collection is not a security review or endorsement.

Before installing a skill:

- Read its `SKILL.md`, scripts, hooks, and requested permissions.
- Check its source and license in [ATTRIBUTION.md](ATTRIBUTION.md).
- Record the commit SHA you reviewed when reproducibility matters.
- Test unfamiliar skills in an isolated repository or worktree.

## Known limitations

- Some Solana and DeFi skills reference `../../../data/...`. Those paths depend on the installation layout.
- `skills/spec-build/` declares `name: build` because the skills CLI treats a directory named `build` as generated output.
- `skills/tempo-request/` declares `name: tempo`, matching its upstream source.
- Provenance is incomplete for skills that arrived without author metadata, a license, or a recorded source.

Generated files should not be edited by hand. Follow [CONTRIBUTING.md](CONTRIBUTING.md) when changing the collection.
