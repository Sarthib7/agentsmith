import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  fitView,
  panFromPointer,
  pointerPoint,
  pinchFromPointers,
  visibleWorldRect,
  zoomAt,
} from "./architecture-viewer.mjs";

const near = (actual, expected, epsilon = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${actual} to be within ${epsilon} of ${expected}`);
};

function worldPointAt(view, point) {
  return {
    x: (point.x - view.x) / view.scale,
    y: (point.y - view.y) / view.scale,
  };
}

test("fit contains and centers the full world in wide, tall, and non-square viewports", () => {
  const cases = [
    { viewport: { width: 1200, height: 480 }, world: { width: 3000, height: 1800 } },
    { viewport: { width: 420, height: 900 }, world: { width: 1600, height: 900 } },
    { viewport: { width: 1000, height: 700 }, world: { width: 1100, height: 1800 } },
  ];

  for (const { viewport, world } of cases) {
    const view = fitView(viewport, world);
    assert.ok(view);
    assert.ok(world.width * view.scale <= viewport.width + 1e-9);
    assert.ok(world.height * view.scale <= viewport.height + 1e-9);
    near(view.x, (viewport.width - world.width * view.scale) / 2);
    near(view.y, (viewport.height - world.height * view.scale) / 2);
  }
});

test("zoom clamps at both bounds while preserving the world point under its anchor", () => {
  const view = { x: -140, y: -70, scale: 0.4 };
  const anchor = { x: 320, y: 210 };
  const before = worldPointAt(view, anchor);

  const enlarged = zoomAt(view, 2.4, anchor);
  near(worldPointAt(enlarged, anchor).x, before.x);
  near(worldPointAt(enlarged, anchor).y, before.y);

  const maximum = zoomAt(view, 1e9, anchor);
  assert.equal(maximum.scale, MAX_ZOOM);
  near(worldPointAt(maximum, anchor).x, before.x);
  near(worldPointAt(maximum, anchor).y, before.y);

  const minimum = zoomAt(view, 1e-9, anchor);
  assert.equal(minimum.scale, MIN_ZOOM);
  near(worldPointAt(minimum, anchor).x, before.x);
  near(worldPointAt(minimum, anchor).y, before.y);
});

test("pointer panning uses viewport-local pointer coordinates and preserves scale", () => {
  const bounds = { left: 100, top: 60 };
  const start = pointerPoint(250, 160, bounds);
  const current = pointerPoint(280, 178, bounds);
  const view = { x: -40, y: 20, scale: 0.5 };
  const moved = panFromPointer(view, start, current);

  assert.deepEqual(start, { x: 150, y: 100 });
  assert.deepEqual(current, { x: 180, y: 118 });
  assert.deepEqual(moved, { x: -10, y: 38, scale: 0.5 });
});

test("visible-world rectangle clips to the graph boundary when the viewport overhangs it", () => {
  const visible = visibleWorldRect(
    { x: 40, y: -20, scale: 0.5 },
    { width: 250, height: 100 },
    { width: 300, height: 120 },
  );

  assert.deepEqual(visible, { x: 0, y: 40, width: 300, height: 80 });
  assert.ok(visible.x >= 0 && visible.y >= 0);
  assert.ok(visible.x + visible.width <= 300);
  assert.ok(visible.y + visible.height <= 120);
});

test("pinch zoom keeps the original center point under the moving midpoint", () => {
  const view = { x: -40, y: 10, scale: 0.5 };
  const startCenter = { x: 200, y: 120 };
  const currentCenter = { x: 230, y: 150 };
  const before = worldPointAt(view, startCenter);
  const pinched = pinchFromPointers(view, startCenter, 100, currentCenter, 200);
  const after = worldPointAt(pinched, currentCenter);

  assert.equal(pinched.scale, 1);
  near(after.x, before.x);
  near(after.y, before.y);
});
