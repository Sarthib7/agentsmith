---
name: research-url
description: Research a URL (repo, gist, article, doc) with one dedicated subagent per URL, producing a fixed-format distilled report plus entries in the project learnings file. Use when the user drops a link and asks to research it, learn from it, or extract tips, rules, or lessons ("research this URL", "have an agent learn from this", "what does this repo teach"). Not for quick API/doc lookups (use find-docs) or fetching a single fact from one page (fetch it directly).
author: sarthib7
---

# research-url

One URL = one named subagent = one report file. The parent never reads the source; it verifies the report landed and folds new learnings into `.superstack/learnings.md`.

## Workflow

1. Pick the report path: `<repo>/research/<short-slug>.md`. Default repo is `~/masumi/agentsmith` unless the user names another. Create `research/` if missing.
2. Spawn one `general-purpose` agent per URL (parallel when multiple URLs arrive together). Name it `research-<slug>`. Use the brief template below verbatim, filling URL, report path, and today's date.
3. If a later URL is another file of the SAME source (same gist, same repo), SendMessage the existing agent to fold it into the same report. Do not spawn a second agent per file.
4. When the agent reports done, run the landing check yourself: `wc -l <report>` and `head -8 <report>`. The agent's claim alone is not evidence; a dead agent and a clean result look identical.
5. Fold learnings: read the report's "Rules to adopt" section, append only entries NOT already covered in `.superstack/learnings.md` (check existing keys first), format per the learn skill (kebab key, one-sentence insight, confidence, Source: learn, Files: the report path, date). Tag untestable claims REPORTED in the insight and score them 6-7/10.
6. Tell the user: report path, line count, what was new, what failed to fetch, and whether all sources share one author (single school of thought is a finding).

## Brief template

Fill the three <angle> slots. Keep everything else, including the style constraints, verbatim.

```
Research task. Source: <URL>

Goal: extract everything this source teaches about the topic: principles, rules,
tips, dos and don'ts, workflows, concrete techniques.

Method:
1. Fetch the source (raw URL for GitHub/gists; enumerate the full file tree via
   the API for repos and read EVERY substantive content file, not just the README).
2. If it links other material central to its argument, fetch that too and label
   it external. Do not chase incidental links; list them as not fetched.
3. Distill into a report.

Write the report to: <REPORT_PATH>

Report format (markdown):
- Title, source URL, date fetched (<DATE>), author, and a provenance line:
  "Provenance: REPORTED. Distilled from the source; claims are the author's,
  not independently verified."
- One-paragraph TLDR of what the source argues.
- A section per major concept: name, core rule in one sentence, why (2-3
  sentences), concrete do/don't bullets, any workflow or code-shape guidance.
- Final section "Rules to adopt": numbered, most actionable rules, one sentence
  each, imperative voice. 15-25 if the source supports it; never pad.
- Under ~400 lines. No em dashes or en dashes anywhere (use periods, commas,
  colons, parentheses). No AI-tell vocabulary (delve, robust, seamless,
  leverage-as-verb, crucial, showcase, foster). Plain direct prose.
- Where the source contradicts itself or walks back earlier claims, keep both
  positions and say so; do not smooth it over.

After writing, verify it landed: read back the first 5 lines and check the line
count. Your final message: file path, line count, sources read, and anything you
could NOT fetch named explicitly. Never silently skip.
```

## Anti-triggers

- A question answerable from official docs: use find-docs.
- One fact from one page: WebFetch it directly, no subagent, no report.
- The user wants the page's content verbatim: fetch and quote, do not distill.
