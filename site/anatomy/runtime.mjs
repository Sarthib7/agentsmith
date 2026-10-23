const workbench = document.getElementById("workbench");
const stage = document.getElementById("machine-stage");
const svg = document.getElementById("machine-svg");
const partsRoot = svg.querySelector("#machine-parts");
const partNodes = Array.from(partsRoot.querySelectorAll(".machine-item"));
const phaseReadout = document.getElementById("phase");
const countReadout = document.getElementById("count");
const feedback = document.getElementById("feedback");
const advanceButton = document.getElementById("advance");
const verifyButton = document.getElementById("verify");
const resetButton = document.getElementById("reset");
const still = window.matchMedia("(prefers-reduced-motion: reduce)");

let state = createInitialState();
let frameId = 0;
let lastFrame = 0;
let visible = false;
let touring = false;
let pausedByUser = false;
let tourTimer = 0;
let tourRestartTimer = 0;
let lastPaintOrder = partNodes.map((node) => node.dataset.part).join("|");

function active() {
  return visible && document.visibilityState === "visible";
}

function motionMatrix(angle, pivot) {
  const { sinA, cosA, sinE } = FIGURE_CONFIG.projection;
  const c11 = sinA;
  const c12 = -cosA;
  const c21 = cosA * sinE;
  const c22 = sinA * sinE;
  const determinant = sinE;
  const i11 = c22 / determinant;
  const i12 = -c12 / determinant;
  const i21 = -c21 / determinant;
  const i22 = c11 / determinant;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const r11 = c11 * cosine + c12 * sine;
  const r12 = -c11 * sine + c12 * cosine;
  const r21 = c21 * cosine + c22 * sine;
  const r22 = -c21 * sine + c22 * cosine;
  const a = r11 * i11 + r12 * i21;
  const c = r11 * i12 + r12 * i22;
  const b = r21 * i11 + r22 * i21;
  const d = r21 * i12 + r22 * i22;
  const e = pivot[0] - a * pivot[0] - c * pivot[1];
  const f = pivot[1] - b * pivot[0] - d * pivot[1];
  return `matrix(${a.toFixed(5)} ${b.toFixed(5)} ${c.toFixed(5)} ${d.toFixed(5)} ${e.toFixed(3)} ${f.toFixed(3)})`;
}

function updateOrder() {
  const moveX = state.pose.carriageX - FIGURE_CONFIG.carriageHomeX;
  const ordered = partNodes.slice().sort((left, right) => {
    const leftLift = left.dataset.motion === "carriage" ? moveX * FIGURE_CONFIG.worldXDepth : 0;
    const rightLift = right.dataset.motion === "carriage" ? moveX * FIGURE_CONFIG.worldXDepth : 0;
    return Number(left.dataset.orderKey) + leftLift - Number(right.dataset.orderKey) - rightLift;
  });
  const nextOrder = ordered.map((node) => node.dataset.part).join("|");
  if (nextOrder !== lastPaintOrder) {
    const fragment = document.createDocumentFragment();
    ordered.forEach((node) => fragment.append(node));
    partsRoot.append(fragment);
    lastPaintOrder = nextOrder;
  }
}

function updateAdvisors() {
  for (const [advisor, enabled] of Object.entries(state.advisors)) {
    const checkbox = document.getElementById(`advisor-${advisor}`);
    if (checkbox) checkbox.checked = enabled;
    svg.querySelectorAll(`[data-advisor-part="${advisor}"]`).forEach((part) => {
      part.dataset.enabled = String(enabled);
    });
  }
}

function updateBayHighlight() {
  const active = activeBay(state);
  partNodes.forEach((part) => {
    if (part.dataset.bayIndex !== undefined) part.dataset.active = String(Number(part.dataset.bayIndex) === active);
  });
}

function paint() {
  const moveX = state.pose.carriageX - FIGURE_CONFIG.carriageHomeX;
  const tx = moveX * FIGURE_CONFIG.worldXScreen[0];
  const ty = moveX * FIGURE_CONFIG.worldXScreen[1];
  const carriageTransform = `translate(${tx.toFixed(3)} ${ty.toFixed(3)})`;
  const gateTransform = motionMatrix(state.pose.gateAngle, FIGURE_CONFIG.gatePivot);
  partNodes.forEach((part) => {
    if (part.dataset.motion === "carriage") part.setAttribute("transform", carriageTransform);
    else if (part.dataset.motion === "gate") part.setAttribute("transform", gateTransform);
  });
  updateOrder();
  updateBayHighlight();
  updateAdvisors();
}

function updateReadout() {
  const current = workflowStatus(state);
  phaseReadout.textContent = current.label;
  countReadout.textContent = `${current.returned}/${current.total} task results returned`;
  document.getElementById("readout").setAttribute("aria-label", current.text);
  advanceButton.disabled = !current.settled || state.phase === "inspection" || state.phase === "verified";
  verifyButton.disabled = state.verified;
}

function cancelFrame() {
  if (frameId) cancelAnimationFrame(frameId);
  frameId = 0;
  lastFrame = 0;
}

function clearTourTimers() {
  clearTimeout(tourTimer);
  clearTimeout(tourRestartTimer);
  tourTimer = 0;
  tourRestartTimer = 0;
}

function stopTour() {
  touring = false;
  clearTourTimers();
}

function render() {
  paint();
  updateReadout();
}

function requestMotion() {
  if (!active()) return;
  if (still.matches) {
    state = tick(state, 0, true);
    render();
    return;
  }
  if (!frameId && !isSettled(state)) {
    lastFrame = 0;
    frameId = requestAnimationFrame(animate);
  }
}

function dispatch(action) {
  const result = reduce(state, action);
  if (!result.accepted) {
    const message = result.reason === "results-not-returned"
      ? "Verification held: return all three illustrated task results first."
      : result.reason === "inspection-not-ready"
        ? "The carriage must reach inspection before verification."
        : result.reason === "motion-in-progress"
          ? "The carriage is still settling."
          : result.reason === "workflow-complete"
            ? "This illustrated route is complete; reset it to begin again."
            : "That action is not available in this phase.";
    feedback.textContent = message;
    updateReadout();
    return false;
  }
  state = result.state;
  feedback.textContent = "";
  if (still.matches) state = tick(state, 0, true);
  render();
  requestMotion();
  return true;
}

function animate(now) {
  frameId = 0;
  if (!active()) return;
  const elapsed = lastFrame ? (now - lastFrame) / 1000 : 1 / 60;
  lastFrame = now;
  const before = state.phase;
  state = tick(state, elapsed, still.matches);
  render();
  if (!isSettled(state) && active() && !still.matches) {
    frameId = requestAnimationFrame(animate);
  } else {
    lastFrame = 0;
    if (touring && before !== state.phase) tourRestartTimer = setTimeout(tourStep, 900);
  }
}

function scheduleTour(delay = 1400) {
  clearTimeout(tourTimer);
  if (still.matches || pausedByUser || !active()) return;
  tourTimer = setTimeout(startTour, delay);
}

function startTour() {
  tourTimer = 0;
  if (still.matches || pausedByUser || !active()) return;
  touring = true;
  if (state.phase !== "staged") {
    state = reduce(state, { type: "reset" }).state;
    render();
  }
  tourStep();
}

function tourStep() {
  tourRestartTimer = 0;
  if (!touring || pausedByUser || !active() || still.matches) return;
  if (state.phase === "inspection" || state.phase === "verified") {
    state = reduce(state, { type: "reset" }).state;
    render();
    tourRestartTimer = setTimeout(tourStep, 700);
    return;
  }
  const result = advance(state);
  if (!result.accepted) {
    stopTour();
    return;
  }
  state = result.state;
  render();
  requestMotion();
  if (isSettled(state)) tourRestartTimer = setTimeout(tourStep, 900);
}

function engage() {
  pausedByUser = true;
  stopTour();
}

function release() {
  pausedByUser = false;
  scheduleTour(3600);
}

advanceButton.addEventListener("click", () => dispatch({ type: "advance" }));
verifyButton.addEventListener("click", () => dispatch({ type: "verify" }));
resetButton.addEventListener("click", () => dispatch({ type: "reset" }));
for (const advisor of ["astra", "fable", "grok"]) {
  document.getElementById(`advisor-${advisor}`).addEventListener("change", (event) => {
    dispatch({ type: "toggle-advisor", advisor, enabled: event.currentTarget.checked });
  });
}

stage.addEventListener("click", () => dispatch({ type: "advance" }));
stage.addEventListener("keydown", (event) => {
  if (event.target !== stage) return;
  if (event.key === " " || event.key === "ArrowRight") {
    event.preventDefault();
    dispatch({ type: "advance" });
  } else if (event.key === "Home") {
    event.preventDefault();
    dispatch({ type: "reset" });
  }
});
workbench.addEventListener("pointerenter", engage);
workbench.addEventListener("pointerleave", release);
workbench.addEventListener("focusin", engage);
workbench.addEventListener("focusout", (event) => {
  if (!workbench.contains(event.relatedTarget)) release();
});
workbench.addEventListener("pointerdown", engage);

const visibility = new IntersectionObserver((entries) => {
  const newest = entries[entries.length - 1];
  visible = Boolean(newest?.isIntersecting);
  if (active()) {
    requestMotion();
    scheduleTour();
  } else {
    cancelFrame();
    stopTour();
  }
}, { rootMargin: "120px 0px" });
visibility.observe(workbench);

document.addEventListener("visibilitychange", () => {
  if (active()) {
    requestMotion();
    scheduleTour();
  } else {
    cancelFrame();
    stopTour();
  }
});

still.addEventListener("change", () => {
  if (still.matches) {
    stopTour();
    cancelFrame();
    state = tick(state, 0, true);
    render();
  } else if (active()) {
    requestMotion();
    scheduleTour();
  }
});

render();

const hostFrame = window.frameElement;
if (hostFrame && typeof ResizeObserver === "function") {
  const fitHostFrame = () => {
    const style = hostFrame.ownerDocument.defaultView.getComputedStyle(hostFrame);
    const border = style.boxSizing === "border-box" ? hostFrame.offsetHeight - hostFrame.clientHeight : 0;
    const height = Math.ceil(workbench.getBoundingClientRect().height + border);
    if (Number.isFinite(height) && height > 0 && hostFrame.style.height !== `${height}px`) {
      hostFrame.style.height = `${height}px`;
    }
  };
  const frameSizeObserver = new ResizeObserver(fitHostFrame);
  frameSizeObserver.observe(workbench);
  fitHostFrame();
}
