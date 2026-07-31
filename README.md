# agentsmith

My agentic coding setup: 115 skills, the rules file that governs every session, and the config that ties them together. Harness-agnostic. Install into Claude Code, Cursor, Codex, Windsurf, or anything else the `skills` CLI supports.

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

## What is here

| Path | What it holds |
|---|---|
| `skills/rules/` | 18 skills that run every session: output rules, session control, skill authoring |
| `skills/coding/` | 58 skills for writing, reviewing, and shipping code. Chain-agnostic |
| `skills/crypto/` | 24 skills for Solana, EVM, and agent payment rails |
| `skills/writing/` | 6 skills for drafting prose and stripping the AI tells out of it |
| `skills/product/` | 9 skills for validation and go to market |
| `SKILLS.md` | Generated index of all 115, grouped, with one-line descriptions |
| `rules/CLAUDE.md` | The global rules file. Communication style, confirmation gates, doc lookup order, git policy |
| `rules/settings.example.json` | Claude Code settings: model, plugins, marketplaces |
| `skills.sh.json` | Grouping manifest for the skills.sh directory |
| `scripts/build-index.py` | Regenerates `SKILLS.md` and `skills.sh.json` from what is on disk |
| `data/` | Shared reference data some of the Solana and DeFi skills read from |

The split is the organizing idea. `coding` is where most skill collections stop. Splitting `crypto` out keeps chain-specific assumptions from leaking into general engineering work, which matters because a Solana skill pointed at EVM produces confident nonsense. `writing` and `product` are the non-coding halves of the job. `rules` is always on and never invoked by name.

## The idea

Most of what makes an agent useful is not the model. It is the standing instructions: what to check before answering, when to stop and ask, which sources to trust, how much to say. Those live in two places here.

`rules/CLAUDE.md` is the always-on layer. It sets output shape, bans the writing patterns that make agent output obvious, orders documentation sources so the agent stops answering API questions from memory, and defines four confirmation gates that need an explicit yes before the agent acts.

`skills/` is the on-demand layer. A skill loads when the task matches, and it carries a procedure the agent would otherwise improvise. Some are process (how to debug, how to review, how to plan). Some are domain (Solana, EVM, Masumi payments, Render). Process skills run first and set the approach; domain skills carry it out.

## What is worth stealing

**Caveman mode.** Output compression that keeps technical substance exact. Code blocks unchanged, errors quoted verbatim, everything else cut to fragments. Measured at roughly 65% fewer output tokens.

**Spec-driven development.** `spec` writes SPEC.md, `build` implements against it, `check` reports drift read-only, and `backprop` turns every bug into an invariant plus a test so the same class cannot come back. `backprop` is the piece that plan-then-execute setups usually skip.

**Verify in both directions.** `prove-it` confirms the fix passes, then breaks it on purpose and confirms it fails. A test that has never failed is not evidence.

**The documentation lookup order** in `rules/CLAUDE.md`. Five ranked sources with training data last. This is the single change that most reduces invented API signatures.

Full catalog: [SKILLS.md](SKILLS.md), or run `npx skills add Sarthib7/agentsmith --list`.

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
