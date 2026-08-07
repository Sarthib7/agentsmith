# Customer Signal Rubric

How to evaluate whether demand signals are real or noise.

## Strong Signals (worth building for)

| Signal | Why It Matters |
|--------|---------------|
| People are hacking together a manual version | They want it badly enough to waste time |
| A related open-source project has active forks | Developers are investing effort |
| Protocol teams are building bounties for this | There's budget behind the need |
| On-chain activity shows growing pattern | Users are already paying gas for a workaround |
| Multiple teams tried and failed | The problem is real, the solution is hard |

## Weak Signals (do not build based on these alone)

| Signal | Why It's Weak |
|--------|--------------|
| "I'd definitely use that" in a DM | Talk is cheap — no commitment |
| Upvotes on a tweet or forum post | Engagement ≠ willingness to pay or switch |
| "The market is huge" | TAM arguments mask lack of specific demand |
| VC interest without user pull | Investors follow narratives, users follow utility |
| Hackathon prize for the category | Prize money ≠ product-market fit |

## Live Signal Check with bird.fast

If `bird.fast` is available (`npx bird whoami`), use it to gather real-time X/Twitter signals:

```bash
bird search "solana <your-idea-keyword>"     # are people talking about it?
bird search "<problem> crypto"               # are people complaining?
bird search "<competitor>"                   # how much buzz do alternatives have?
```

Cross-reference results with the rubric above — tweets with complaints, workarounds, or "why doesn't X exist" are strong signals. Hype threads and engagement farming are weak signals.

## Scoring

- **3 — Strong**: Multiple strong signals from independent sources
- **2 — Moderate**: 1 strong signal + several weak signals
- **1 — Weak**: Only weak signals, no concrete evidence
- **0 — None**: No detectable demand, or demand is for a different thing

A score below 2 means: validate harder before writing code.
