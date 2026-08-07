<div align="center">

```
╭───────────────────────────────────────────────────────╮
│                                                       │
│    a g e n t s m i t h                                │
│                                                       │
│    18   rules    always on, never invoked by name     │
│    98   skills   load when the task matches           │
│                                                       │
╰───────────────────────────────────────────────────────╯
```

**My agentic coding setup: the skills, the rules file that governs every session, and the config that ties them together.**

Harness-agnostic. Install into Claude Code, Cursor, Codex, Windsurf, or anything else the `skills` CLI supports.

<!-- counts:start -->
![skills](https://img.shields.io/badge/skills-116-1a1a1a?style=flat-square&labelColor=1a1a1a&color=FF51FF)
![rules](https://img.shields.io/badge/rules-18-1a1a1a?style=flat-square)
![coding](https://img.shields.io/badge/coding-59-1a1a1a?style=flat-square)
![crypto](https://img.shields.io/badge/crypto-24-1a1a1a?style=flat-square)
![writing](https://img.shields.io/badge/writing-6-1a1a1a?style=flat-square)
![product](https://img.shields.io/badge/product-9-1a1a1a?style=flat-square)
<!-- counts:end -->

</div>

---

## Install

```bash
npx skills add Sarthib7/agentsmith
```

That prompts for which skills and which agents. To take everything, globally:

```bash
npx skills add Sarthib7/agentsmith --all -g
```

To read one skill without installing it:

```bash
npx skills use Sarthib7/agentsmith@caveman
```

## The idea

Most of what makes an agent useful is not the model. It is the standing instructions: what to check before answering, when to stop and ask, which sources to trust, how much to say. Those live in two layers.

```
  ALWAYS ON                        rules/CLAUDE.md + rules/AGENTS.md
  ─────────                        output shape · banned writing patterns
  every turn, never invoked        doc lookup order · four confirmation gates
        │
        │  sets the frame
        ▼
  ON DEMAND                        skills/
  ─────────                        process skills pick the approach
  loads when the task matches      domain skills carry it out
```

`rules/CLAUDE.md` and `rules/AGENTS.md` are matching copies of the always-on layer for Claude Code and AGENTS.md-compatible harnesses. They set output shape, ban the writing patterns that make agent output obvious, order documentation sources so the agent stops answering API questions from memory, define evidence rules, and coordinate multi-agent repositories. Four confirmation gates need an explicit yes before the agent acts.

`skills/` is the on-demand layer. A skill loads when the task matches, and it carries a procedure the agent would otherwise improvise. Some are process (how to debug, how to review, how to plan). Some are domain (Solana, EVM, Masumi payments, Render). Process skills run first and set the approach; domain skills carry it out.

## What is worth stealing

> **Caveman mode.** Output compression that keeps technical substance exact. Code blocks unchanged, errors quoted verbatim, everything else cut to fragments. Measured at roughly 65% fewer output tokens.

> **Spec-driven development.** `spec` writes SPEC.md, `build` implements against it, `check` reports drift read-only, and `backprop` turns every bug into an invariant plus a test so the same class cannot come back. `backprop` is the piece that plan-then-execute setups usually skip.

> **Verify in both directions.** `prove-it` confirms the fix passes, then breaks it on purpose and confirms it fails. A test that has never failed is not evidence.

> **Nothing is fast on its own.** `bench-it` refuses a claim of faster, cheaper, or better with nothing on the other side of it. It asks whether you are benching against your own past or against something outside, then holds both sides to the same input, machine, and statistic.

> **The documentation lookup order** in `rules/CLAUDE.md`. Five ranked sources with training data last. This is the single change that most reduces invented API signatures.

Full catalog: **[SKILLS.md](SKILLS.md)**, or run `npx skills add Sarthib7/agentsmith --list`.

## Written here

Most of this repo is collected. These three are mine:

| Skill | What it stops you doing |
|---|---|
| [`prove-it`](skills/coding/prove-it/SKILL.md) | Calling a check green without ever watching it go red |
| [`bench-it`](skills/coding/bench-it/SKILL.md) | Shipping a number with nothing named beside it |
| [`fresh-eyes`](skills/coding/fresh-eyes/SKILL.md) | Corroborating your own conclusion with a subagent that shares your context |

```bash
npx skills add Sarthib7/agentsmith@prove-it
npx skills add Sarthib7/agentsmith@bench-it
npx skills add Sarthib7/agentsmith@fresh-eyes
```

`followup-review` and `adhd` carry my author field too. [ATTRIBUTION.md](ATTRIBUTION.md) records who wrote everything else.

## What is here

| Path | What it holds |
|---|---|
| `skills/rules/` | Runs every session: output rules, session control, skill authoring |
| `skills/coding/` | Writing, reviewing, and shipping code. Chain-agnostic |
| `skills/crypto/` | Solana, EVM, and agent payment rails |
| `skills/writing/` | Drafting prose and stripping the AI tells out of it |
| `skills/product/` | Validation and go to market |
| `SKILLS.md` | Generated index of all of them, grouped, with one-line descriptions |
| `rules/CLAUDE.md` | Global rules for Claude Code |
| `rules/AGENTS.md` | Matching global rules for Codex and other AGENTS.md-compatible harnesses |
| `rules/settings.example.json` | Claude Code settings: model, plugins, marketplaces |
| `skills.sh.json` | Grouping manifest for the skills.sh directory |
| `scripts/build-index.py` | Regenerates `SKILLS.md`, `skills.sh.json`, and the counts above |
| `data/` | Shared reference data some of the Solana and DeFi skills read from |

The split is the organizing idea. `coding` is where most skill collections stop. Splitting `crypto` out keeps chain-specific assumptions from leaking into general engineering work, which matters because a Solana skill pointed at EVM produces confident nonsense. `writing` and `product` are the non-coding halves of the job. `rules` is always on and never invoked by name.

## Plugins I run alongside

Not vendored here, since they ship and version on their own. Installed through Claude Code:

```
/plugin install superpowers@claude-plugins-official
/plugin install vercel@claude-plugins-official
/plugin install rust-analyzer-lsp@claude-plugins-official
/plugin install cartographer@cartographer-marketplace
```

## Provenance

I wrote some of these. Many I did not. See [ATTRIBUTION.md](ATTRIBUTION.md) for what came from where. Skills that carry their own LICENSE keep it in their directory.

## Known rough edges

- Some Solana and DeFi skills reference `../../../data/...`, which resolves correctly only when `data/` sits three levels above the skill directory. Installed globally it will not resolve. Fixing the paths is on the list.
- Two directory names do not match the skill name they declare. `skills/coding/spec-build/` declares `name: build`, because the skills CLI skips nested directories literally named `build`. `skills/crypto/tempo-request/` declares `name: tempo`, which is upstream's choice. Install both by the declared name.
- `SKILLS-INDEX.md` from the original setup was stale and was not carried over. `SKILLS.md` replaces it and is generated, so run `python3 scripts/build-index.py` after adding a skill.

<div align="center">
<sub>Counts and the header block are generated. Run <code>python3 scripts/build-index.py</code> after adding a skill.</sub>
</div>
