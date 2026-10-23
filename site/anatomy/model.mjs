export const ADVISORS = Object.freeze(["astra", "fable", "grok"]);
export const TASK_COUNT = 3;

const INITIAL_X = 0;
const X_BY_ROUTE = Object.freeze({
  "routing-left": -120,
  "routing-center": 0,
  "routing-right": 120,
  "routing-inspection": 158,
});
const ARRIVAL_PHASE = Object.freeze({
  "routing-left": "at-left",
  "routing-center": "at-center",
  "routing-right": "at-right",
  "routing-inspection": "inspection",
});
const RETURNED_BY_DEPARTURE = Object.freeze({
  "at-left": "left",
  "at-center": "center",
  "at-right": "right",
});
const PHASE_LABEL = Object.freeze({
  staged: "Ready to route",
  "routing-left": "Routing to worker bay 1",
  "at-left": "At worker bay 1",
  "routing-center": "Routing to worker bay 2",
  "at-center": "At worker bay 2",
  "routing-right": "Routing to worker bay 3",
  "at-right": "At worker bay 3",
  "routing-inspection": "Routing to inspection",
  inspection: "Inspection ready",
  verified: "Illustrated work verified",
});
const BAY_BY_PHASE = Object.freeze({
  "routing-left": 0,
  "at-left": 0,
  "routing-center": 1,
  "at-center": 1,
  "routing-right": 2,
  "at-right": 2,
});
const reject = (state, reason) => ({ state, accepted: false, reason });
const accept = (state) => ({ state, accepted: true, reason: null });
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const closeTo = (value, target, epsilon = 0.04) => Math.abs(value - target) <= epsilon;

export function createInitialState() {
  return {
    phase: "staged",
    returned: [],
    verified: false,
    advisors: { astra: false, fable: false, grok: false },
    pose: { carriageX: INITIAL_X, gateAngle: 0 },
    target: { carriageX: INITIAL_X, gateAngle: 0 },
  };
}

export function isSettled(state) {
  return closeTo(state.pose.carriageX, state.target.carriageX)
    && closeTo(state.pose.gateAngle, state.target.gateAngle);
}

export function workflowStatus(state) {
  const returned = state.returned.length;
  return {
    phase: state.phase,
    label: PHASE_LABEL[state.phase] ?? "Workflow",
    returned,
    total: TASK_COUNT,
    text: `${PHASE_LABEL[state.phase] ?? "Workflow"} · ${returned}/${TASK_COUNT} task results returned`,
    settled: isSettled(state),
  };
}

export function activeBay(state) {
  return BAY_BY_PHASE[state.phase] ?? null;
}

export function advance(state) {
  return reduce(state, { type: "advance" });
}

export function reduce(state, action) {
  if (!action || typeof action.type !== "string") return reject(state, "unknown-action");

  if (action.type === "reset") return accept(createInitialState());

  if (action.type === "toggle-advisor") {
    const advisor = action.advisor;
    if (!ADVISORS.includes(advisor)) return reject(state, "unknown-advisor");
    const enabled = typeof action.enabled === "boolean" ? action.enabled : !state.advisors[advisor];
    return accept({ ...state, advisors: { ...state.advisors, [advisor]: enabled } });
  }

  if (action.type === "verify") {
    if (state.phase !== "inspection" || state.returned.length !== TASK_COUNT) {
      return reject(state, state.returned.length !== TASK_COUNT ? "results-not-returned" : "inspection-not-ready");
    }
    return accept({
      ...state,
      phase: "verified",
      verified: true,
      target: { ...state.target, gateAngle: Math.PI / 2 },
    });
  }

  if (action.type !== "advance") return reject(state, "unknown-action");
  if (!isSettled(state)) return reject(state, "motion-in-progress");

  if (state.phase === "staged") {
    return accept({ ...state, phase: "routing-left", target: { ...state.target, carriageX: X_BY_ROUTE["routing-left"] } });
  }
  if (state.phase === "at-left" || state.phase === "at-center" || state.phase === "at-right") {
    const returned = [...state.returned, RETURNED_BY_DEPARTURE[state.phase]];
    const phase = state.phase === "at-left" ? "routing-center" : state.phase === "at-center" ? "routing-right" : "routing-inspection";
    return accept({
      ...state,
      phase,
      returned,
      target: { ...state.target, carriageX: X_BY_ROUTE[phase] },
    });
  }
  if (state.phase === "inspection" || state.phase === "verified") return reject(state, "workflow-complete");
  return reject(state, "advance-not-available");
}

export function tick(state, elapsedSeconds, reduceMotion = false) {
  const dt = clamp(Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0, 0, 1 / 30);
  const move = (current, target, epsilon = 0.04) => {
    if (reduceMotion || closeTo(current, target, epsilon)) return target;
    const next = current + (target - current) * (1 - Math.exp(-dt / 0.22));
    return closeTo(next, target, epsilon) ? target : next;
  };
  const pose = {
    carriageX: move(state.pose.carriageX, state.target.carriageX),
    gateAngle: move(state.pose.gateAngle, state.target.gateAngle),
  };
  let phase = state.phase;
  if (phase in ARRIVAL_PHASE && closeTo(pose.carriageX, state.target.carriageX) && closeTo(pose.gateAngle, state.target.gateAngle, 0.001)) {
    phase = ARRIVAL_PHASE[phase];
  }
  return { ...state, phase, pose };
}
