---
name: fresh-eyes
description: Get a second opinion from a subagent that has none of your context, either to independently corroborate a diagnosis or to adversarially break your work. Use before a conclusion blocks or justifies significant work, before merging security-sensitive code, when you have already changed your mind once on the same question, or when the user says "second opinion", "fresh eyes", "challenge this", "red team this", or "get another POV".
author: sarthib7
---

# Fresh Eyes

A long session accumulates anchoring. Each hypothesis feels sound *because* it
was built on the last one. A subagent with no context inherits none of that.

## The one rule

**Give it the evidence, not your conclusion.**

"I concluded X, check X" recruits agreement. "Here are six observations, what do
you make of them" produces an independent read. If it lands where you did
without being told, that is corroboration. If it was handed your chain, it is an
echo.

## Two modes

### Corroborate — for a diagnosis

Use when a conclusion is about to block or justify real work.

Give it: the raw observations (numbered), which files are worth reading, and the
access it needs. Withhold: your theory, your reasoning, your preferred answer.

Ask for: its best explanation, candidates ranked by confidence, and **the single
cheapest observation that would discriminate between them**. That last one is
usually the most valuable output.

Require it to be allowed to say **"not determinable from this evidence"** — and
say so explicitly, or it will invent a story to be useful.

### Refute — for an artifact

Use before merging anything security-sensitive, or any code you believe is
correct.

Say plainly: *the author believes this is correct; assume they are wrong
somewhere.* Name the specific attack surface — do not just say "review this".

Always ask it to check **whether the tests actually test what they claim**, and
to flag any test that would still pass with the protection removed. That single
question found a redirect test that mocked away the very handler it claimed to
verify.

Ask for findings ranked worst-first, each with a concrete failure scenario and
`file:line`, and **REAL findings separated from NITS**. Tell it that concluding
something is genuinely sound is an acceptable answer *after* it has tried hard
to break it.

## When it is worth the cost

- a conclusion that will block or justify a lot of work
- security judgements, especially ones you wrote yourself
- any question where you have already changed your mind once
- a design you are about to commit to

Not worth it for: trivia, lookups, or anything where being wrong is cheap and
immediately visible.

## Handling the verdict

- If it disagrees, **engage, do not defend**. It is not carrying your sunk cost.
- If both readings fit the evidence, report that it is unresolved and name the
  measurement that would settle it. Do not pick to look decisive.
- Report where it corrected you, explicitly. That is the value, not an
  embarrassment.
- Layer it: an adversarial review found four issues in a connector, the fixes
  were written, and a static analyser then found a fifth *in the fix*. Different
  checks catch different classes.

## Prompt skeletons

See [PROMPTS.md](PROMPTS.md) for ready-to-adapt prompts for both modes.
