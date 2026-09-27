# Agentsmith

My setup for agentic engineering: rules, workflows, harness configuration, and skills.

<!-- VERIFIED: rules/README.md and workflows/orchestration.md name OMP as the primary harness. rules/omp-config.example.yml records its model roles. -->

Oh My Pi (`omp`) is my primary harness. This repository records how I configure it and coordinate agents.

**[Read the setup guide](https://sarthib7.github.io/agentsmith/)** · [Search skills](https://sarthib7.github.io/agentsmith/skills.html) · [Contribute](CONTRIBUTING.md)

## Explore the setup

<!-- VERIFIED: The linked rules, workflows, configuration example, and skill catalog define these four parts. -->

| Part | What it does | Start here |
|---|---|---|
| Rules | Govern how agents work and when they need approval. | [Rules guide](rules/README.md), [rules snapshot](rules/AGENTS.md) |
| Workflows | Coordinate agents and record decisions. | [Agent orchestration](workflows/orchestration.md), [repository protocol](workflows/agentic-engineering.md) |
| OMP harness | Runs sessions and tool tasks with assigned model roles. | [OMP config example](rules/omp-config.example.yml), [operating workflow](workflows/orchestration.md) |
| Skills | Provide instructions for specific tasks. | [Searchable catalog](https://sarthib7.github.io/agentsmith/skills.html), [GitHub index](SKILLS.md) |

## Adapt the setup

<!-- VERIFIED: rules/README.md documents personal calibration and config snapshots. workflows/orchestration.md defines file ownership and task briefs. -->

1. Read the [rules guide](rules/README.md). Adapt the personal background, response preferences, and approval rules to your work.
2. Review the [OMP config](rules/omp-config.example.yml). Adapt `modelRoles` and `task.agentModelOverrides` to your available models.
3. Read the [orchestration workflow](workflows/orchestration.md). Use the [repository protocol](workflows/agentic-engineering.md) when several agents share an outcome.
4. Choose one skill for a real task. Read its instructions and dependencies before installing it.

The OMP file is a configuration snapshot. The workflow explains how its model roles are used. [Claude Code settings](rules/settings.example.json) are another configuration example.

## Find and install skills

The skills CLI installs task instructions. Configure the rules, workflows, and harness separately through the guides above.

The badges count skills in each catalog category.

<!-- counts:start -->
![skills](https://img.shields.io/badge/skills-147-1a1a1a?style=flat-square&labelColor=1a1a1a&color=FF51FF)
![setup skills](https://img.shields.io/badge/setup%20skills-31-1a1a1a?style=flat-square)
![coding](https://img.shields.io/badge/coding-77-1a1a1a?style=flat-square)
![crypto](https://img.shields.io/badge/crypto-25-1a1a1a?style=flat-square)
![writing](https://img.shields.io/badge/writing-6-1a1a1a?style=flat-square)
![product](https://img.shields.io/badge/product-8-1a1a1a?style=flat-square)
<!-- counts:end -->

Browse skill categories: [Coding](SKILLS.md#coding) · [Crypto](SKILLS.md#crypto) · [Writing](SKILLS.md#writing) · [Product](SKILLS.md#product) · [Response and session skills](SKILLS.md#rules).

Choose skills interactively:

```bash
npx skills add Sarthib7/agentsmith --full-depth
```

Install one skill:

```bash
npx skills add Sarthib7/agentsmith --full-depth --skill prove-it
```

List available skills before installing:

```bash
npx skills add Sarthib7/agentsmith --full-depth --list
```

<!-- VERIFIED: Cached skills CLI 1.7.0 discovered all 147 catalog names with --full-depth, including eight entries in my-skills/. CLI flags are documented at https://github.com/vercel-labs/skills. -->

The [skills CLI](https://github.com/vercel-labs/skills) supports Claude Code, Codex, Cursor, and other coding agents. Add `-g` for a global installation or `--agent codex` to select an agent. `--full-depth` includes both skill folders.

<!-- VERIFIED: Ownership roots and source gaps are recorded in ATTRIBUTION.md. plugin/README.md describes unfinished packaging. Inspected research/ and data/ contain notes and reference material. -->

## Source and supporting files

[Collected skills](skills/) contain procedures gathered for my setup. [My skills](my-skills/) contain skills attributed to `sarthib7`. [Attribution](ATTRIBUTION.md) records source and license evidence, including gaps.

[Research](research/) holds notes about agent engineering. [Data](data/) holds shared references used by some skills. [Plugin packaging](plugin/) is unfinished.

<!-- VERIFIED: Shared data references occur in collected Solana and DeFi skills. skills/spec-build/SKILL.md declares build; skills/tempo-request/SKILL.md declares tempo. -->

Some skills need external tools, accounts, or files under `data/`. Read their prerequisites and [license notes](ATTRIBUTION.md) before installing. A separate skill installation may need those shared files too.

Install by the declared skill name. `skills/spec-build/` declares `build`; `skills/tempo-request/` declares `tempo`.

## Contribute or preview locally

<!-- VERIFIED: scripts/build-index.py and scripts/build-site.py implement the build commands. CONTRIBUTING.md records source ownership and preview checks. -->

Read [CONTRIBUTING.md](CONTRIBUTING.md) to propose changes to rules, workflows, harness examples, or skills.

```bash
python3 -B scripts/build-index.py
python3 -B scripts/build-site.py
python3 -m http.server 8000 --directory _site
```

Open the [setup guide](http://localhost:8000/) or the [skill catalog](http://localhost:8000/skills.html). Edit `site/` to change the website, then rebuild it.
