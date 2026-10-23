import assert from "node:assert/strict";
import test from "node:test";
import { advance, createInitialState, reduce, tick, workflowStatus } from "./model.mjs";

function arrive(state) {
  let next = state;
  for (let frame = 0; frame < 90; frame += 1) {
    next = tick(next, 1 / 60, true);
    if (!next.phase.startsWith("routing-")) return next;
  }
  assert.fail("workflow pose did not settle into its next phase");
}

function runThroughInspection() {
  let state = createInitialState();
  for (let move = 0; move < 4; move += 1) {
    const result = advance(state);
    assert.equal(result.accepted, true);
    state = arrive(result.state);
  }
  return state;
}

test("verification is rejected until every task result reaches inspection", () => {
  const initial = createInitialState();
  const result = reduce(initial, { type: "verify" });

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "results-not-returned");
  assert.deepEqual(result.state, initial);
  assert.equal(workflowStatus(result.state).returned, 0);
});

test("turning an optional advisor on does not verify any work", () => {
  const initial = createInitialState();
  const result = reduce(initial, { type: "toggle-advisor", advisor: "astra", enabled: true });

  assert.equal(result.accepted, true);
  assert.equal(result.state.advisors.astra, true);
  assert.equal(result.state.verified, false);
  assert.equal(result.state.phase, "staged");
  assert.equal(workflowStatus(result.state).returned, 0);
});

test("phase and returned-result count advance with the three routed tasks", () => {
  let state = createInitialState();
  const observed = [];
  const record = () => observed.push([state.phase, workflowStatus(state).returned]);
  record();

  for (const [kind, expected] of [
    ["advance", ["routing-left", 0]],
    ["settle", ["at-left", 0]],
    ["advance", ["routing-center", 1]],
    ["settle", ["at-center", 1]],
    ["advance", ["routing-right", 2]],
    ["settle", ["at-right", 2]],
    ["advance", ["routing-inspection", 3]],
    ["settle", ["inspection", 3]],
  ]) {
    if (kind === "advance") {
      const result = advance(state);
      assert.equal(result.accepted, true);
      state = result.state;
    } else {
      state = arrive(state);
    }
    record();
    assert.deepEqual(observed.at(-1), expected);
  }

  assert.deepEqual(observed[0], ["staged", 0]);
});

test("reset clears all returns and verification after the full flow", () => {
  const inspection = runThroughInspection();
  const verified = reduce(inspection, { type: "verify" });
  assert.equal(verified.accepted, true);
  assert.equal(verified.state.verified, true);
  assert.equal(workflowStatus(verified.state).returned, 3);

  const reset = reduce(verified.state, { type: "reset" });
  assert.equal(reset.accepted, true);
  assert.equal(reset.state.phase, "staged");
  assert.equal(reset.state.verified, false);
  assert.equal(workflowStatus(reset.state).returned, 0);
  assert.deepEqual(reset.state.advisors, { astra: false, fable: false, grok: false });
});
