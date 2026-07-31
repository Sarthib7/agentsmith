# Prompt skeletons

Adapt, do not paste blindly. The bracketed parts are what make it work.

## Mode 1 — Corroborate a diagnosis

```
You are giving an INDEPENDENT diagnosis. Someone else has already formed a
theory; you are deliberately not being told it, so that if you land in the same
place it means something.

Repo: <path>. READ-ONLY: read code freely, GETs are fine, but do NOT write
files, commit, or POST/PUT/DELETE anything.
<access details: base URL, which token env var, what it may and may not do>

## Observations, gathered today. Explain them.

1. <raw observation, no interpretation>
2. <...>
6. <...>

## Code worth reading

- <file>: <function names to look at, and what to notice>

## What to produce

- Your best explanation of observations <N> and <M> specifically.
- Rank your candidate explanations by confidence, and say what single cheap
  observation would discriminate between them.
- Anything in the code that looks like an unstated assumption that could be
  false.
- If the evidence genuinely supports more than one explanation, say so. "Not
  determinable from this evidence" is a valid and useful answer — do not force a
  single story.

Be concrete, cite file:line. Max ~600 words.
```

**Why each part is there.** Numbered raw observations stop you smuggling in a
narrative. "Not determinable is valid" stops it inventing certainty. Asking for
the discriminating observation converts disagreement into a next action.

## Mode 2 — Adversarially review an artifact

```
You are doing an ADVERSARIAL security review of <what>. Your job is to find what
is wrong with it. The author believes it is correct; assume they are wrong
somewhere.

Repo: <path>. READ-ONLY: read and reason, but do NOT modify files, commit, or
make network calls to third parties.

## The change

<files, what it does, and — importantly — any deliberate design decision the
author made and their stated reason. Naming the author's reasoning invites it to
be attacked rather than accepted.>

## Attack the following, specifically

1. <named attack surface, with concrete variants to try>
2. <...>
5. **The tests.** Do they actually test what they claim? Find any that would
   still pass if the protection were removed. Look hard at the monkeypatching —
   if a test patches the very thing it claims to verify, say so.

## Output

A ranked list of findings, worst first. For each: what breaks, a concrete
exploit or failure scenario, file:line, and whether it is exploitable in
practice or only theoretically. Explicitly separate REAL findings from NITS.

If you conclude something is genuinely sound, say so plainly rather than
inventing a finding — but only after trying hard to break it. Max ~700 words.
```

**Why each part is there.** Enumerating the attack surface beats "review this",
which returns style notes. The tests question is the highest-yield single item.
"Say it is sound rather than inventing a finding" prevents noise, but only
paired with "after trying hard to break it".

## Anti-patterns

- Leading the witness: "I think X is the cause, confirm?"
- Reviewing your own summary instead of the artifact — give it the files.
- Running it after you are already committed. Do it before the PR, not after.
- Accepting a finding without checking it. It has no context, so it will
  sometimes be confidently wrong about intent. Verify before acting.
