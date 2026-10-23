import * as K from "./vendor/iso-kit.mjs";
import * as A from "./vendor/audit.mjs";
import { tubePieces, tubeSvg } from "./vendor/tube.mjs";

export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 700;

const BED = { x: -232, y: -100, w: 464, d: 200, r: 10 };
const BED_BOTTOM = -10;
const FOOT_BOTTOM = -14;
const BED_TOP = 0;
const FRAME_X = [-216, 204];
const RAIL_START = -190;
const RAIL_END = 190;
const RAIL_Y = [-22, 22];
const RAIL_TOP = 82;
const BAY_X = [-120, 0, 120];
const BAY_Y = [-22, 0, 22];
const ADVISOR_X = [-110, 0, 110];
const GATE = { x: 184, y: 0 };

const bounds = K.boxCorners(BED, FOOT_BOTTOM, 205);
export const PROJECTION = K.fitProjection(bounds, VIEW_WIDTH, VIEW_HEIGHT, {
  pad: 42,
  headroom: 10,
  azimuth: 42,
  elevation: 30,
});

const iso = (point) => K.iso(point, PROJECTION);
const line = (path, tone = "faint") => K.lineSvg(path, { tone });
const dots = (points, size = 0.55, tone = "mid") => K.dotsSvg(points, { size, tone });
const depthSorted = (points) => [...points].sort((a, b) => K.depthOf([a[0], a[1], 0], PROJECTION) - K.depthOf([b[0], b[1], 0], PROJECTION));
const floorFrame = (x, y) => ({ o: [x, y, 0], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] });



function addRecorded(R, { name, at, svg, shape, motion = null, advisor = null, bay = null }) {
  const recorded = R.solid(Object.assign(shape, { name }));
  return R.put({
    name,
    piece: name,
    at,
    svg,
    motion,
    advisor,
    bay,
    shapes: [recorded],
  });
}

function addSlab(R, name, plan, z, height, {
  bevel = 0.45,
  tone = "mid",
  crease = "faint",
  inner = "",
  lit = false,
  motion = null,
  advisor = null,
  bay = null,
  at = [plan.x + plan.w / 2, plan.y + plan.d / 2, z + height / 2],
} = {}) {
  const paths = K.slabOf(plan, z, height, PROJECTION, 8, bevel);
  return addRecorded(R, {
    name,
    at,
    motion,
    advisor,
    bay,
    shape: A.slab(plan, z, height, { name }),
    svg: K.solidSvg(paths, { tone, crease, lit, inner }),
  });
}

function addCylinder(R, name, x, y, radius, z, height, {
  tone = "mid",
  crease = "faint",
  inner = "",
  lit = false,
  motion = null,
  advisor = null,
  at = [x, y, z + height / 2],
  ground = false,
} = {}) {
  const paths = K.cylinder(x, y, radius, z, height, PROJECTION, 32);
  const shape = A.lathe(floorFrame(x, y), [[z, 0], [z, radius], [z + height, radius], [z + height, 0]], { name, ground });
  return addRecorded(R, {
    name,
    at,
    motion,
    advisor,
    shape,
    svg: K.solidSvg(paths, { tone, crease, lit, inner }),
  });
}

function addPrism(R, name, polygon, z, height, {
  bevel = 0.25,
  tone = "hi",
  crease = "faint",
  inner = "",
  motion = null,
  advisor = null,
  at = [polygon.reduce((sum, point) => sum + point[0], 0) / polygon.length, polygon.reduce((sum, point) => sum + point[1], 0) / polygon.length, z + height / 2],
} = {}) {
  const paths = K.extrude(polygon, z, height, PROJECTION, { convex: true, bevel });
  return addRecorded(R, {
    name,
    at,
    motion,
    advisor,
    shape: A.extruded(polygon, z, height, { name }),
    svg: K.solidSvg(paths, { tone, crease, inner }),
  });
}

function addTube(R, name, points, radius, { touch, tone = "mid" } = {}) {
  R.route(name, points, radius, {
    owner: name,
    touch,
    piece: name,
    ends: [true, true],
    free: [false, false],
  });
  const pieces = tubePieces(points, radius, PROJECTION, { maxLength: 500, spacing: 1.8 });
  pieces.forEach((piece, index) => {
    const partName = pieces.length === 1 ? name : `${name}.${index + 1}`;
    addRecorded(R, {
      name: partName,
      piece: name,
      at: piece.mid,
      svg: tubeSvg(piece, { tone }),
      shape: A.tube(piece.points, piece.radii, { name: partName, owner: name }),
    });
  });
}



function addBed(R) {
  const groove = line(K.planOutline(K.insetPlan(BED, 7), BED_TOP, PROJECTION, 8), "faint");
  addSlab(R, "bedplate", BED, BED_BOTTOM, BED_TOP - BED_BOTTOM, {
    bevel: 1.7,
    tone: "mid",
    at: [0, 0, -5],
    inner: groove,
  });

  for (const [index, [x, y]] of depthSorted(K.corners(BED, 28)).entries()) {
    const name = `leveling-foot-${index + 1}`;
    const seam = line(K.sideArc(x, y, 7.2, -11.2, PROJECTION, 24), "lo");
    addCylinder(R, name, x, y, 7.2, FOOT_BOTTOM, BED_BOTTOM - FOOT_BOTTOM, {
      ground: true,
      tone: "lo",
      inner: seam,
      at: [x, y, (FOOT_BOTTOM + BED_BOTTOM) / 2],
    });
  }

  const frontLip = { x: -214, y: -100, w: 428, d: 6, r: 2 };
  const rearLip = { x: -214, y: 94, w: 428, d: 6, r: 2 };
  for (const [name, plan] of [["front-retaining-lip", frontLip], ["rear-retaining-lip", rearLip]]) {
    addSlab(R, name, plan, BED_TOP, 4, {
      tone: "lo",
      at: [plan.x + plan.w / 2, plan.y + plan.d / 2, 2],
      inner: line(K.planOutline(K.insetPlan(plan, 1), 4, PROJECTION, 4), "faint"),
    });
  }

  const plate = { x: -48, y: -91, w: 96, d: 14, r: 2 };
  const plateTextAt = iso([0, -84, 1]);
  const engraving = K.faceTextSvg(`translate(${plateTextAt[0]} ${plateTextAt[1]})`, "AGENTSMITH", {
    size: 7,
    tone: "lo",
    anchor: "middle",
  });
  addSlab(R, "engraved-nameplate", plate, BED_TOP, 1, {
    tone: "lo",
    crease: "none",
    at: [0, -84, 0.5],
    inner: engraving,
  });

  const fasteners = K.corners(BED, 22);
  for (const [index, [x, y]] of fasteners.entries()) {
    const slot = line(K.lineOnTop([x - 1.2, y], [x + 1.2, y], 2, PROJECTION), "lo");
    addCylinder(R, `bed-fastener-${index + 1}`, x, y, 2.4, BED_TOP, 2, {
      tone: "lo",
      at: [x, y, 1],
      inner: line(K.ring(x, y, 1.65, 2, PROJECTION, 20), "faint") + slot,
    });
  }
}

function addFrameAndRails(R) {
  const uprightPlans = [
    { x: FRAME_X[0], y: -8, w: 12, d: 16, r: 2 },
    { x: FRAME_X[1], y: -8, w: 12, d: 16, r: 2 },
  ];
  uprightPlans.forEach((plan, index) => {
    const x = plan.x + plan.w / 2;
    const edge = line(K.planOutline(K.insetPlan(plan, 2), 160, PROJECTION, 4), "faint");
    addSlab(R, `gantry-upright-${index === 0 ? "left" : "right"}`, plan, 0, 160, {
      tone: "mid",
      at: [x, 0, 80],
      inner: edge,
    });
  });

  const crosshead = { x: -216, y: -34, w: 432, d: 68, r: 4 };
  addSlab(R, "advisor-crosshead", crosshead, 160, 9, {
    bevel: 1,
    tone: "mid",
    at: [0, 0, 164.5],
    inner: line(K.planOutline(K.insetPlan(crosshead, 4), 169, PROJECTION, 6), "faint"),
  });

  for (const [side, x] of [["left", -204], ["right", 190]]) {
    const mount = { x, y: -34, w: 14, d: 68, r: 2 };
    const inset = K.insetPlan(mount, 2);
    const marks = K.corners(mount, 3).map(([px, py]) => iso([px, py, 82]));
    addSlab(R, `rail-mount-${side}`, mount, 68, 14, {
      tone: "lo",
      at: [x + 7, 0, 75],
      inner: line(K.planOutline(inset, 82, PROJECTION, 4), "faint") + dots(marks, 0.65, "lo"),
    });
  }

  RAIL_Y.forEach((y, index) => {
    const plan = { x: RAIL_START, y: y - 4, w: RAIL_END - RAIL_START, d: 8, r: 1.8 };
    const seam = line(K.planOutline(K.insetPlan(plan, 1.2), RAIL_TOP, PROJECTION, 6), "faint");
    const marks = dots([iso([RAIL_START + 7, y, RAIL_TOP]), iso([RAIL_END - 7, y, RAIL_TOP])], 0.55, "lo");
    addSlab(R, `travel-rail-${index === 0 ? "front" : "rear"}`, plan, RAIL_TOP - 8, 8, {
      bevel: 0.8,
      tone: "mid",
      at: [0, y, RAIL_TOP - 4],
      inner: seam + marks,
    });
  });

  for (const [side, x] of [["left", -195], ["right", 190]]) {
    const plan = { x, y: -8, w: 5, d: 16, r: 1.5 };
    addSlab(R, `rail-end-stop-${side}`, plan, 82, 4, {
      tone: "lo",
      at: [x + 2.5, 0, 84],
      inner: line(K.planOutline(K.insetPlan(plan, 0.8), 86, PROJECTION, 4), "faint"),
    });
  }

  const ruler = { x: -166, y: -70, w: 332, d: 7, r: 1.2 };
  const rulerTicks = K.topTicks(ruler.x + 4, ruler.x + ruler.w - 4, 8, 5, ruler.y + 1, 0.8, [2, 4], PROJECTION);
  addSlab(R, "ruler-strip", ruler, 0, 0.8, {
    tone: "lo",
    crease: "none",
    at: [0, ruler.y + ruler.d / 2, 0.4],
    inner: line(rulerTicks.minor, "lo") + line(rulerTicks.major, "mid"),
  });
}

function addCarriage(R, state) {
  const x = state.pose.carriageX;
  const motion = "carriage";
  const railCentres = RAIL_Y;

  railCentres.forEach((y, index) => {
    const side = index === 0 ? "front" : "rear";
    const housing = { x: x - 10, y: y - 6, w: 20, d: 12, r: 2.5 };
    const housingTop = RAIL_TOP + 4.4;
    const housingSeam = line(K.planOutline(K.insetPlan(housing, 2), housingTop, PROJECTION, 6), "faint");
    addSlab(R, `bearing-housing-${side}`, housing, RAIL_TOP, 4.4, {
      motion,
      tone: "mid",
      at: [x, y, RAIL_TOP + 2.2],
      inner: housingSeam + dots([iso([x - 6, y, housingTop]), iso([x + 6, y, housingTop])], 0.55, "lo"),
    });
    const retainer = { x: x - 7, y: y - 4, w: 14, d: 8, r: 1.8 };
    addSlab(R, `bearing-retainer-${side}`, retainer, housingTop, 2, {
      motion,
      tone: "lo",
      at: [x, y, housingTop + 1],
      inner: line(K.planOutline(K.insetPlan(retainer, 1), housingTop + 2, PROJECTION, 4), "faint"),
    });
  });

  const body = { x: x - 38, y: -36, w: 76, d: 72, r: 5 };
  const bodySeam = line(K.planOutline(K.insetPlan(body, 4), 98, PROJECTION, 6), "faint");
  addSlab(R, "lead-carriage-body", body, 88.4, 9.6, {
    motion,
    bevel: 1,
    tone: "mid",
    at: [x, 0, 93.2],
    inner: bodySeam + line(K.lineOnTop([body.x, -30], [body.x + body.w, -30], 98, PROJECTION), "lo"),
  });

  const screwSlot = line(K.lineOnTop([x + 21, -24], [x + 25, -24], 102, PROJECTION), "lo");
  addCylinder(R, "carriage-thumb-screw", x + 23, -24, 3, 98, 4, {
    motion,
    tone: "lo",
    at: [x + 23, -24, 100],
    inner: screwSlot,
  });

  const wheelKnurl = line(K.knurl(x - 22, 25, 6.8, 98, 102, 24, PROJECTION), "lo");
  const wheelSlot = line(K.lineOnTop([x - 22, 25], [x - 17, 25], 102, PROJECTION), "faint");
  addCylinder(R, "carriage-knurled-handwheel", x - 22, 25, 6.8, 98, 4, {
    motion,
    tone: "mid",
    at: [x - 22, 25, 100],
    inner: wheelKnurl + wheelSlot,
  });

  const cradle = { x: x - 14, y: -12, w: 28, d: 24, r: 2.5 };
  addSlab(R, "cartridge-cradle", cradle, 78, 10.4, {
    motion,
    tone: "lo",
    at: [x, 0, 83.2],
    inner: line(K.planOutline(K.insetPlan(cradle, 2), 88.4, PROJECTION, 4), "faint"),
  });

  const cartridgeRim = line(K.ring(x, 0, 7, 78, PROJECTION, 28), "mid");
  addCylinder(R, "work-cartridge", x, 0, 8, 60, 18, {
    motion,
    tone: "hi",
    lit: true,
    at: [x, 0, 69],
    inner: cartridgeRim,
  });

  const latch = { x: x + 8, y: -2, w: 4, d: 4, r: 0.8 };
  addSlab(R, "cartridge-retaining-latch", latch, 63, 10, {
    motion,
    tone: "lo",
    at: [x + 10, 0, 68],
    inner: line(K.planOutline(K.insetPlan(latch, 0.8), 73, PROJECTION, 4), "faint"),
  });

  const glandGroove = line(K.ring(x, 0, 3.3, 60, PROJECTION, 24), "lo");
  addCylinder(R, "probe-housing", x, 0, 4, 52, 8, {
    motion,
    tone: "mid",
    at: [x, 0, 56],
    inner: glandGroove,
  });

  addCylinder(R, "probe-rod", x, 0, 1.5, 22, 30, {
    motion,
    tone: "hi",
    at: [x, 0, 37],
  });
  addCylinder(R, "probe-tip", x, 0, 2.5, 18, 4, {
    motion,
    tone: "hi",
    at: [x, 0, 20],
  });
}

function addWorkerBays(R) {
  BAY_X.forEach((x, bay) => {
    const deck = { x: x - 34, y: -47, w: 68, d: 94, r: 4 };
    const deckLine = line(K.planOutline(K.insetPlan(deck, 3), 4, PROJECTION, 6), "faint");
    addSlab(R, `worker-bay-${bay + 1}-deck`, deck, 0, 4, {
      bay,
      tone: "mid",
      at: [x, 0, 2],
      inner: deckLine,
    });

    for (const [name, y] of [["front", -43], ["rear", 36]]) {
      const jaw = { x: x - 28, y, w: 56, d: 7, r: 1.8 };
      addSlab(R, `worker-bay-${bay + 1}-${name}-jaw`, jaw, 4, 4, {
        bay,
        tone: "lo",
        at: [x, y + jaw.d / 2, 6],
        inner: line(K.planOutline(K.insetPlan(jaw, 1), 8, PROJECTION, 4), "faint"),
      });
    }

    BAY_Y.forEach((y, fixture) => {
      const ring = line(K.ring(x, y, 3.1, 14, PROJECTION, 24), "faint");
      addCylinder(R, `worker-bay-${bay + 1}-fixture-${fixture + 1}`, x, y, 4.1, 4, 10, {
        bay,
        tone: "mid",
        at: [x, y, 9],
        inner: ring + dots([iso([x, y, 14])], 0.55, "lo"),
      });
    });
  });
}

function addAdvisors(R) {
  const ids = ["astra", "fable", "grok"];
  ADVISOR_X.forEach((x, index) => {
    const advisor = ids[index];
    addCylinder(R, `advisor-${advisor}-housing`, x, 0, 18, 169, 8, {
      advisor,
      tone: "mid",
      at: [x, 0, 173],
      inner: line(K.sideArc(x, 0, 16.3, 173, PROJECTION, 28), "faint"),
    });
    addCylinder(R, `advisor-${advisor}-bezel`, x, 0, 16, 177, 3, {
      advisor,
      tone: "lo",
      at: [x, 0, 178.5],
      inner: line(K.ring(x, 0, 14.6, 180, PROJECTION, 32), "faint"),
    });

    const tickPaths = [];
    for (let tick = 0; tick < 12; tick += 1) {
      const angle = (tick / 12) * Math.PI * 2 - Math.PI / 2;
      const outer = tick % 3 === 0 ? 12 : 11.5;
      const inner = tick % 3 === 0 ? 9.2 : 10.1;
      tickPaths.push(K.segment(
        [x + Math.cos(angle) * inner, Math.sin(angle) * inner, 181],
        [x + Math.cos(angle) * outer, Math.sin(angle) * outer, 181],
        PROJECTION,
      ));
    }
    addCylinder(R, `advisor-${advisor}-dial-face`, x, 0, 14, 180, 1, {
      advisor,
      tone: "hi",
      at: [x, 0, 180.5],
      inner: line(K.ring(x, 0, 13, 181, PROJECTION, 32), "lo") + line(tickPaths.join(""), "mid") + dots([iso([x, 0, 181])], 0.8, "lo"),
    });

    const angle = [-0.62, 0.34, 0.78][index];
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const vx = -uy;
    const vy = ux;
    const needle = [
      [x + ux * 1.6 + vx * 0.85, uy * 1.6 + vy * 0.85],
      [x + ux * 1.6 - vx * 0.85, uy * 1.6 - vy * 0.85],
      [x + ux * 10.8, uy * 10.8],
    ];
    addPrism(R, `advisor-${advisor}-needle`, needle, 181, 0.6, {
      advisor,
      tone: "hi",
      at: [x + ux * 4, uy * 4, 181.3],
    });
  });
}

function springPoints() {
  const x = 184;
  const y0 = -38;
  const y1 = 38;
  const baseZ = 30;
  const bow = 4;
  const steps = 48;
  return Array.from({ length: steps + 1 }, (_, step) => {
    const t = step / steps;
    const lift = bow * Math.sin(Math.PI * t) ** 2;
    return [x, y0 + (y1 - y0) * t, baseZ + lift];
  });
}

function rotatedRectangle(cx, cy, length, width, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [
    [-width / 2, -length / 2],
    [width / 2, -length / 2],
    [width / 2, length / 2],
    [-width / 2, length / 2],
  ].map(([x, y]) => [cx + x * cosine - y * sine, cy + x * sine + y * cosine]);
}

function addInspectionGate(R, state) {
  for (const [side, y] of [["left", -42], ["right", 42]]) {
    const post = { x: 180, y: y - 4, w: 8, d: 8, r: 1.5 };
    addSlab(R, `inspection-gate-post-${side}`, post, 0, 106, {
      tone: "lo",
      at: [184, y, 53],
      inner: line(K.planOutline(K.insetPlan(post, 1.4), 106, PROJECTION, 4), "faint"),
    });
  }

  const crosshead = { x: 164, y: -50, w: 38, d: 100, r: 3 };
  addSlab(R, "inspection-gate-crosshead", crosshead, 106, 6, {
    tone: "mid",
    at: [183, 0, 109],
    inner: line(K.planOutline(K.insetPlan(crosshead, 3), 112, PROJECTION, 6), "faint"),
  });

  const lever = rotatedRectangle(GATE.x, GATE.y, 34, 4.8, state.pose.gateAngle);
  const markerEnd = [GATE.x - Math.sin(state.pose.gateAngle) * 12, GATE.y + Math.cos(state.pose.gateAngle) * 12];
  const marker = line(K.lineOnTop([GATE.x, GATE.y], markerEnd, 115, PROJECTION), "lo");
  addPrism(R, "inspection-gate-moving-stop", lever, 112, 3, {
    motion: "gate",
    tone: "lo",
    at: [GATE.x, GATE.y, 113.5],
    inner: marker,
  });

  const knobEnd = [GATE.x + Math.cos(state.pose.gateAngle) * 3.5, GATE.y + Math.sin(state.pose.gateAngle) * 3.5];
  const indexLine = line(K.lineOnTop([GATE.x, GATE.y], knobEnd, 119, PROJECTION), "faint");
  const knurl = line(K.knurl(GATE.x, GATE.y, 4.8, 115, 119, 24, PROJECTION), "lo");
  addCylinder(R, "inspection-gate-calibration-knob", GATE.x, GATE.y, 4.8, 115, 4, {
    motion: "gate",
    tone: "mid",
    at: [GATE.x, GATE.y, 117],
    inner: indexLine + knurl,
  });

  const points = springPoints();
  addTube(R, "inspection-gate-spring", points, 0.72, {
    touch: ["inspection-gate-post-left", "inspection-gate-post-right"],
    tone: "mid",
  });
}

export function recordScene(state) {
  const R = A.recorder(PROJECTION);
  addBed(R);
  addFrameAndRails(R);
  addWorkerBays(R);
  addCarriage(R, state);
  addInspectionGate(R, state);
  addAdvisors(R);
  A.settle(R, PROJECTION, { states: [0] });
  return R;
}

function wrapItem(item) {
  const motion = item.motion ? ` data-motion="${item.motion}"` : "";
  const advisor = item.advisor ? ` data-advisor-part="${item.advisor}"` : "";
  const bay = Number.isInteger(item.bay) ? ` data-bay-index="${item.bay}"` : "";
  return `<g class="machine-item" data-part="${item.name}" data-order-key="${item.key}"${motion}${advisor}${bay}>${item.svg}</g>`;
}

export function renderSvg(state) {
  const R = recordScene(state);
  const items = R.settled.items.map(wrapItem);
  const halo = `<path class="iso-halo" d="${K.haloOf(BED, BED_BOTTOM, BED_TOP - BED_BOTTOM, PROJECTION)}"/>`;
  const body = `<g class="machine-halo" aria-hidden="true">${halo}</g><g id="machine-parts">${items.join("")}</g>`;
  return K.figureSvg({
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    label: "An interactive mechanical illustration: three optional advisor dials on top, one lead carriage in the middle, and grouped worker fixtures below.",
    body,
  });
}

export function figureRuntimeConfig() {
  const R = A.recorder(PROJECTION);
  const view = R.V;
  const zero = iso([0, 0, 0]);
  const unitX = iso([1, 0, 0]);
  const gatePivot = iso([GATE.x, GATE.y, 113.5]);
  const camera = K.cameraOf(PROJECTION);
  return {
    carriageHomeX: 0,
    worldXScreen: [unitX[0] - zero[0], unitX[1] - zero[1]],
    worldXDepth: view[0],
    gatePivot,
    projection: { sinA: camera.sinA, cosA: camera.cosA, sinE: camera.sinE },
  };
}
