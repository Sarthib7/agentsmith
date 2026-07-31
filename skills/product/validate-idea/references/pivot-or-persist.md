# Pivot or Persist

Decision framework for go/no-go after validation.

## Go Criteria (need at least 3 of 5)

1. **Demand score >= 2** — At least moderate evidence that people want this
2. **Technical feasibility is "straightforward" or "hard but solvable"** — No unsolved research problems
3. **Time to MVP <= 2 weeks** — You can ship something testable fast
4. **You have an unfair advantage** — domain expertise, existing users, unique data, or relationships
5. **Crypto is necessary** — The product is worse or impossible without a blockchain

## No-Go Criteria (any 1 is enough)

1. **Demand score = 0** — No one is asking for this
2. **A well-funded team already shipped a good version** — You're late and worse
3. **The technical problem is unsolved** — You'd be doing research, not building a product
4. **Crypto is ornamental** — The blockchain adds friction, not value

## Pivot Rules

When the answer is "no-go", always offer a pivot:
- **Adjacent pivot**: Same problem, different user segment
- **Wedge pivot**: Same users, smaller initial problem
- **Stack pivot**: Same concept, different layer (infra vs app vs protocol)
- **Chain pivot**: Same idea, different ecosystem where timing is better

## Confidence Levels

- **0.8 - 1.0**: High confidence — clear signals in one direction
- **0.5 - 0.7**: Medium — mixed signals, worth one more week of validation
- **0.0 - 0.4**: Low — insufficient data, need more research before deciding
