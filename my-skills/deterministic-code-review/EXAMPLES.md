# Deterministic Code Review Examples

## Accepted finding

Diff:

```ts
+ const account = accounts.find((item) => item.id === requestedId);
+ return account.balance;
```

Repository context shows `find` returns `undefined` when no account matches, and callers accept arbitrary request IDs.

```md
### [P1] Handle an unknown account before reading its balance

`src/accounts.ts:42`

When `requestedId` has no matching account, `find` returns `undefined` and the new property access throws. The request path accepts IDs that are not prevalidated, so an unknown ID produces a server error.

Optional fix direction: return the existing not-found result before accessing `balance`.
```

Why accepted: concrete trigger, confirmed context, observable failure, exact changed-line anchor.

## Rejected finding: context disproves it

Draft: "The map access can return undefined."

Context: the map is constructed from the same validated enum used by the caller, and the type prevents other keys.

Decision: reject. Documented invariant makes trigger impossible.

## Rejected finding: preference

Draft: "Rename `result` to `processedPaymentResult` for clarity."

Decision: reject unless repository naming rules require it. No behavioral defect.

## Rejected finding: wrong scope

During review of `src/new-handler.ts`, context search finds an old defect in `src/legacy-handler.ts` that the diff does not affect.

Decision: reject. Context gathering does not widen review scope.

## Accepted cross-file finding

The current unit changes an event producer from `user_id` to `userId`. A changed consumer still reads `user_id`. Both files appear in the frozen diff.

Anchor the finding to the changed producer or consumer line where the contract diverges. Cite the other changed file as evidence. Emit one finding for the shared root cause, not two duplicates.
