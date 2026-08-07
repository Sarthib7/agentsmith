---
name: followup-review
description: Re-review a pull request after the author has pushed fixes for your earlier findings. Establishes which bugs are new versus ones you missed, checks each prior finding closed end-to-end rather than at the patched line, and treats the fix commit itself as unreviewed code. Use when returning to a PR you already reviewed, when the author says "addressed your feedback" or pushes a commit like "address review comments", when asked to follow up on or re-check a review, or before converting a CHANGES_REQUESTED review into an approval.
author: sarthib7
---

# Following up on your own review

The author changed code because you asked them to. That code has had no review.
On the last one of these, all four original findings were closed and three of
the six bugs that remained were created by the fix.

So the job is not "check my findings are closed." It is that plus reviewing a
fresh commit that nobody has looked at, written under pressure to satisfy you.

## Before reading the diff

Find the boundary. Your prior review has a submission timestamp; commits after
it are code you have never seen. `gh api .../reviews` gives the timestamp,
`git log` gives the commits.

Then classify every bug you find, using `git log -S'<construct>' <base>..HEAD`
rather than reading the diff and guessing:

| Introduced by the fix commit | The cost of the fix. Say so; it is not an oversight. |
| Present when you reviewed, not flagged | You missed it. Say that plainly. |
| Flagged last time, not addressed | Restate briefly. Do not re-argue it. |
| Partly fixed | Name the half that landed and the half that did not. |

Getting this wrong reads as either blaming the author for your miss or taking
credit for catching your own mess. Both cost you the next review.

## Checking a finding is actually closed

- [ ] **Trace the value, do not read the patch.** The author fixes where you
      pointed. Follow the same value to every consumer and check each one.
      A guard added at the write path does nothing for the three read paths.
- [ ] **Check for over-correction.** A fix that suppresses the case the feature
      exists for is worse than the bug. If the fix added a gate, find the input
      that should pass through it and confirm it still does.
- [ ] **Check the fix did not relocate the failure.** Replacing raw text with a
      canned message can erase the one accurate sentence a user needed.
- [ ] **Mutation-test it.** Revert the fix, run the suite, confirm something
      goes red. See `prove-it`. If nothing goes red, the fix is unguarded and
      the next refactor removes it silently.
- [ ] **Check the runner selects the new tests.** Existing and passing is not
      the same as running. See `prove-it`.

## Grounding severity

Read the running system before you claim consequences. A deploy dashboard or
live config settles blast radius, model, pricing, which store is actually
wired up, and whether a staging environment exists between this merge and
production. Severity asserted from the repo alone is a guess wearing a number.

State whether the branch is even deployed. "None of this is live yet" changes
how the author should read the whole review.

## Before you publish

Anything you did not personally run, do not state as fact. This applies hardest
to subagent output: agents are dependable on file paths, line numbers and exit
codes, and undependable on quoted prose attributed to a third party. Re-run
their probes. Never publish a vendor error string you have not seen yourself;
fetch the vendor's live docs instead of trusting either the agent or your own
memory. Re-derive your own arithmetic by reading the mechanism under it, not by
checking the sum.

Then post once and edit that review in place as things change. A second review
for corrections fragments the thread and spams every watcher.
