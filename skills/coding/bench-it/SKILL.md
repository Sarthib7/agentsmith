---
name: bench-it
author: sarthib7
description: Benchmark a product claim against a named baseline or competitor. Asks whether the comparison is inside (our own past) or outside (a rival product, the alternative we skipped, a bar someone set), drills down from the answer, then holds both sides to the same conditions. Use when a claim of faster, cheaper, better, smaller, or more accurate is about to ship; when choosing between two tools, models, libraries, or vendors; before a number goes into a README, PR body, landing page, pitch deck, or grant application; or when asked to "bench it", "benchmark this", "how do we compare", "what is our baseline", "is this actually better".
---

# Bench it

`prove-it` asks whether the thing works. `bench-it` asks whether it beats something.

A number on its own is decoration. "37ms" is not a result. "37ms against the 210ms
the last release took, same corpus, same machine, n=20" is a result. The second
number is the whole job.

## Ask before measuring

Never pick the comparison yourself. Ask these two, in order, and wait for answers.

**1. Inside or outside?**

> Bench against ourselves, or against something outside?

**2. Which number settles it?**

One metric decides, chosen before anything is measured. Product benchmarks are
rarely about speed: cost per task, success rate, coverage of the real workload,
time to first value, setup effort, price to the buyer. Six metrics with no ranking
among them produce six arguments and no verdict. Pick the one that would change
the decision, note the others as secondary.

A metric chosen after seeing results is not a metric, it is a search for a
flattering angle.

## Inside: which past state?

Drill down from the answer. Each one answers a different question:

| Compare against | Answers |
|---|---|
| Last release or tag | Did we get better since users last saw it? |
| Production right now | Is what I am about to merge better than what they have? |
| The state before this change (parent commit, flag off) | Did this change do anything at all? |
| Doing nothing, or the manual process it replaced | Is the feature worth existing? |

The last row is the one people skip, and it is the only one that can return "no".

Re-run the old state. Do not quote its number from memory, a changelog, or an
earlier session. The machine, the data, and the dependencies have all moved.

## Outside: which outside thing?

> Name it, or want me to find candidates?

Three kinds, and they need different handling:

- **A rival product.** If they want candidates found: use the
  `competitive-landscape` skill for crypto products, otherwise search their docs,
  pricing page, changelog, and benchmark posts. Return 3 to 5 with what each one
  would be compared on, and let them pick. Never pick the rival yourself.
- **The alternative we skipped.** Off-the-shelf library, vendor SDK, the naive
  twenty-line version, buy instead of build. Cheapest benchmark available and it
  is usually the honest one.
- **A bar somebody set.** SLA, pricing promise, a vendor's published claim, a
  §V invariant, or a user expectation ("instant" is about 100ms).

A rival's published figure is REPORTED, not VERIFIED. Tag it with the source and
the date it was published, and re-measure anything you can run yourself. Their
number was produced on their hardware, with their input, by people who wanted it
to look good.

## Same conditions on both sides

Every line here is a way a comparison quietly stops meaning anything.

- [ ] **Same input.** Same corpus, same query set, same dataset size. A faster
      number on a smaller input is not a faster system.
- [ ] **Same machine and tier.** Not their cloud against our laptop. Not prod
      against dev.
- [ ] **Same thermal state.** Both cold or both warm. Caches emptied on both
      sides, or primed on both sides.
- [ ] **Same statistic, and more than one run.** p50 against p50, and report p95
      beside it. The mean of three runs is noise wearing a number's clothes.
- [ ] **Same population.** Measure the surface users actually go through, not the
      one that is easiest to instrument.
- [ ] **Same definition.** Their "accuracy" and your "accuracy" usually count
      different things. Read how each side computes the metric before comparing.
- [ ] **Same version, same command.** Record both. A benchmark you cannot re-run
      is an anecdote.

## Report

```
CLAIM       what is being asserted, in one line
BENCHED     against <named thing>, measured <date>
METRIC      the one that decides, plus the statistic
RESULT      ours <n>  |  theirs <n>
CONDITIONS  input, machine, cold/warm, n, versions
PROVENANCE  VERIFIED (I ran it) / REPORTED (they published it, link + date)
BLIND SPOT  what this measurement cannot see
VERDICT     one sentence in the metric's own units
```

Blind spot is not optional. A top-k search cannot enumerate a corpus. A capped
endpoint returns a floor. A synthetic query set says nothing about real queries.
Write that beside the number, not in a footnote.

## Two worked shapes

**The metric measured the wrong thing.** A retrieval system reported recall@5 of
0.95 and it went into a README. The eval matched a hit against the expected
document by comparing the first line, and the first line was the file path, which
the indexer had prepended to every chunk. The system was scoring 0.95 at matching
filenames to filenames. The content was never measured. A metric that goes up
without the product improving is worse than no metric.

**Only one side got re-run.** A change lands, the new number is measured on
today's machine with today's dependencies, and the old number is copied from a
three-month-old note. The improvement was real but a third of it belonged to a
faster runtime that shipped in between. Both sides get re-run, or neither number
gets published.

## What does not count as a benchmark

- "It's fast." Faster than what?
- "40% improvement." Over what, on what input, measured when?
- "Better than the competition." Which one, on which metric, whose measurement?
- "Our benchmarks show." Run by whom, on whose hardware, at which version?
- A vendor's published number used as their side of a head-to-head, unre-measured.
- The mean of three runs.
- A metric picked after the results came in.
- Any number with nothing beside it.
