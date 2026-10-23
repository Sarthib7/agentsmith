export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 4;

const ROOT_SELECTOR = "[data-architecture-viewer]";
const mountedRoots = new WeakMap();

function isSize(value) {
  return value && Number.isFinite(value.width) && value.width > 0 && Number.isFinite(value.height) && value.height > 0;
}

function isView(value) {
  return value && Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.scale) && value.scale > 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function fitView(viewport, world) {
  if (!isSize(viewport) || !isSize(world)) return null;
  const scale = Math.min(Math.min(viewport.width / world.width, viewport.height / world.height), MAX_ZOOM);
  return {
    scale,
    x: (viewport.width - world.width * scale) / 2,
    y: (viewport.height - world.height * scale) / 2,
  };
}

export function zoomAt(view, factor, anchor, minZoom = MIN_ZOOM, maxZoom = MAX_ZOOM) {
  if (!isView(view) || !Number.isFinite(factor) || factor <= 0 || !anchor || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) return view;
  const scale = clamp(view.scale * factor, minZoom, maxZoom);
  const worldX = (anchor.x - view.x) / view.scale;
  const worldY = (anchor.y - view.y) / view.scale;
  return {
    scale,
    x: anchor.x - worldX * scale,
    y: anchor.y - worldY * scale,
  };
}

export function zoomTo(view, scale, anchor, minZoom = MIN_ZOOM, maxZoom = MAX_ZOOM) {
  if (!isView(view) || !Number.isFinite(scale) || scale <= 0) return view;
  return zoomAt(view, scale / view.scale, anchor, minZoom, maxZoom);
}

export function pointerPoint(clientX, clientY, bounds) {
  return { x: clientX - bounds.left, y: clientY - bounds.top };
}

export function panFromPointer(view, start, current) {
  if (!isView(view) || !start || !current) return view;
  return {
    scale: view.scale,
    x: view.x + current.x - start.x,
    y: view.y + current.y - start.y,
  };
}

export function pinchFromPointers(view, startCenter, startDistance, currentCenter, currentDistance, minZoom = MIN_ZOOM, maxZoom = MAX_ZOOM) {
  if (!isView(view) || !startCenter || !currentCenter || !Number.isFinite(startDistance) || startDistance <= 0 || !Number.isFinite(currentDistance) || currentDistance <= 0) return view;
  const anchored = zoomAt(view, currentDistance / startDistance, startCenter, minZoom, maxZoom);
  return {
    ...anchored,
    x: anchored.x + currentCenter.x - startCenter.x,
    y: anchored.y + currentCenter.y - startCenter.y,
  };
}

export function visibleWorldRect(view, viewport, world) {
  if (!isView(view) || !isSize(viewport) || !isSize(world)) return null;
  const left = (0 - view.x) / view.scale;
  const top = (0 - view.y) / view.scale;
  const right = (viewport.width - view.x) / view.scale;
  const bottom = (viewport.height - view.y) / view.scale;
  const x = clamp(left, 0, world.width);
  const y = clamp(top, 0, world.height);
  const maxX = clamp(right, 0, world.width);
  const maxY = clamp(bottom, 0, world.height);
  return {
    x,
    y,
    width: Math.max(0, maxX - x),
    height: Math.max(0, maxY - y),
  };
}

export function resizeView(view, previousViewport, nextViewport, world) {
  if (!isView(view) || !isSize(previousViewport) || !isSize(nextViewport) || !isSize(world)) return null;
  const oldFit = fitView(previousViewport, world);
  const nextFit = fitView(nextViewport, world);
  const zoomRatio = view.scale / oldFit.scale;
  const scale = clamp(nextFit.scale * zoomRatio, Math.min(MIN_ZOOM, nextFit.scale), MAX_ZOOM);
  const centerWorldX = (previousViewport.width / 2 - view.x) / view.scale;
  const centerWorldY = (previousViewport.height / 2 - view.y) / view.scale;
  return {
    scale,
    x: nextViewport.width / 2 - centerWorldX * scale,
    y: nextViewport.height / 2 - centerWorldY * scale,
  };
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function mountArchitectureViewer(root) {
  if (!root || typeof root.querySelector !== "function") return () => {};
  const existingCleanup = mountedRoots.get(root);
  if (existingCleanup) return existingCleanup;

  const viewport = root.querySelector("[data-graph-viewport]");
  const world = root.querySelector("[data-graph-world]");
  const image = root.querySelector("[data-graph-image]");
  if (!viewport || !world || !image) return () => {};

  const doc = root.ownerDocument || globalThis.document;
  const win = doc?.defaultView || globalThis.window;
  if (!doc || !win) return () => {};

  const zoomOutput = root.querySelector("[data-graph-zoom]");
  const status = root.querySelector("[data-graph-status]");
  const minimap = root.querySelector("svg[data-graph-minimap]");
  const minimapImage = minimap?.querySelector("[data-graph-minimap-image]");
  const minimapWindow = minimap?.querySelector("rect[data-graph-minimap-window]");
  const pointerPositions = new Map();
  const listeners = [];
  let worldSize = null;
  let viewportSize = null;
  let view = null;
  let gesture = null;
  let resizeObserver = null;
  let resizeFrame = 0;
  let disposed = false;

  function listen(target, name, handler, options) {
    target.addEventListener(name, handler, options);
    listeners.push([target, name, handler, options]);
  }

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function getViewportSize() {
    return { width: viewport.clientWidth, height: viewport.clientHeight };
  }

  function pointFromEvent(event) {
    const bounds = viewport.getBoundingClientRect();
    return pointerPoint(event.clientX, event.clientY, {
      left: bounds.left + viewport.clientLeft,
      top: bounds.top + viewport.clientTop,
    });
  }

  function updateMinimap() {
    if (!minimap || !worldSize || !view || !viewportSize || !minimapWindow) return;
    const visible = visibleWorldRect(view, viewportSize, worldSize);
    if (!visible) return;
    minimap.setAttribute("viewBox", `0 0 ${worldSize.width} ${worldSize.height}`);
    minimap.setAttribute("preserveAspectRatio", "xMidYMid meet");
    minimapWindow.setAttribute("x", String(visible.x));
    minimapWindow.setAttribute("y", String(visible.y));
    minimapWindow.setAttribute("width", String(visible.width));
    minimapWindow.setAttribute("height", String(visible.height));
  }

  function render() {
    if (!view) return;
    world.style.transformOrigin = "0 0";
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    if (zoomOutput) zoomOutput.textContent = `${Math.round(view.scale * 100)}%`;
    updateMinimap();
  }

  function fitToViewport(announce = true) {
    if (!worldSize) return;
    const size = getViewportSize();
    const fitted = fitView(size, worldSize);
    if (!fitted) return;
    viewportSize = size;
    view = fitted;
    render();
    if (announce) setStatus(`Full graph fitted at ${Math.round(view.scale * 100)}%. Drag or pinch to pan and zoom.`);
  }

  function resizeToViewport() {
    if (disposed || !worldSize) return;
    const nextSize = getViewportSize();
    if (!isSize(nextSize)) return;
    if (view && viewportSize) {
      view = resizeView(view, viewportSize, nextSize, worldSize) || fitView(nextSize, worldSize);
    } else {
      view = fitView(nextSize, worldSize);
    }
    if (!view) return;
    viewportSize = nextSize;
    render();
  }

  function scheduleResize() {
    if (resizeFrame) win.cancelAnimationFrame(resizeFrame);
    if (typeof win.requestAnimationFrame === "function") {
      resizeFrame = win.requestAnimationFrame(() => {
        resizeFrame = 0;
        resizeToViewport();
      });
    } else {
      resizeToViewport();
    }
  }

  function onImageReady() {
    if (disposed || !image.naturalWidth || !image.naturalHeight) return;
    worldSize = { width: image.naturalWidth, height: image.naturalHeight };
    world.style.position = world.style.position || "absolute";
    world.style.left = "0";
    world.style.top = "0";
    world.style.width = `${worldSize.width}px`;
    world.style.height = `${worldSize.height}px`;
    world.style.transformOrigin = "0 0";
    world.style.transition = "none";
    image.draggable = false;
    image.style.display = "block";
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.maxWidth = "none";
    viewport.style.touchAction = "none";
    if (minimap) {
      minimap.style.pointerEvents = "none";
      minimap.setAttribute("tabindex", "-1");
      minimap.setAttribute("focusable", "false");
      if (minimapImage) {
        minimapImage.setAttribute("href", image.currentSrc || image.src || image.getAttribute("src") || "");
        minimapImage.setAttribute("x", "0");
        minimapImage.setAttribute("y", "0");
        minimapImage.setAttribute("width", String(worldSize.width));
        minimapImage.setAttribute("height", String(worldSize.height));
        minimapImage.setAttribute("preserveAspectRatio", "xMidYMid meet");
        minimapImage.setAttribute("aria-hidden", "true");
      }
    }
    view = null;
    viewportSize = null;
    resizeToViewport();
    setStatus(`Full graph fitted at ${Math.round(view?.scale * 100 || 0)}%. Drag or pinch to pan and zoom.`);
  }

  function pointerPair() {
    const iterator = pointerPositions.values();
    const first = iterator.next().value;
    const second = iterator.next().value;
    return first && second ? [first, second] : null;
  }

  function beginGesture() {
    if (pointerPositions.size === 1) {
      const [point] = pointerPositions.values();
      gesture = { type: "pan", view: { ...view }, start: { ...point } };
    } else if (pointerPositions.size >= 2) {
      const pair = pointerPair();
      if (!pair) return;
      gesture = {
        type: "pinch",
        view: { ...view },
        center: midpoint(pair[0], pair[1]),
        distance: distance(pair[0], pair[1]),
      };
    }
  }

  function updateGesture() {
    if (!gesture || !view) return;
    if (gesture.type === "pan" && pointerPositions.size === 1) {
      const [point] = pointerPositions.values();
      view = panFromPointer(gesture.view, gesture.start, point);
    } else if (pointerPositions.size >= 2) {
      const pair = pointerPair();
      if (!pair) return;
      view = pinchFromPointers(
        gesture.view,
        gesture.center,
        gesture.distance,
        midpoint(pair[0], pair[1]),
        distance(pair[0], pair[1]),
      );
    }
    render();
  }

  function onPointerDown(event) {
    if (!view || event.button !== 0) return;
    event.preventDefault();
    pointerPositions.set(event.pointerId, pointFromEvent(event));
    try {
      viewport.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture may be unavailable during teardown; the active gesture still uses delivered events.
    }
    beginGesture();
  }

  function endPointer(event, cancelled = false) {
    if (!pointerPositions.has(event.pointerId)) return;
    if (!cancelled) {
      pointerPositions.set(event.pointerId, pointFromEvent(event));
      updateGesture();
    }
    pointerPositions.delete(event.pointerId);
    if (pointerPositions.size) beginGesture();
    else gesture = null;
    if (!cancelled) setStatus(`View updated at ${Math.round(view.scale * 100)}%.`);
  }

  function onWheel(event) {
    if (!view || (!event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    view = zoomAt(view, Math.exp(-event.deltaY * 0.002), pointFromEvent(event));
    render();
  }

  function centerPoint() {
    return { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      if (doc.fullscreenElement === root && typeof doc.exitFullscreen === "function") {
        event.preventDefault();
        try {
          Promise.resolve(doc.exitFullscreen()).catch(() => setStatus("Could not exit fullscreen."));
        } catch {
          setStatus("Could not exit fullscreen.");
        }
      }
      return;
    }
    if (!viewport.contains(event.target) || !view) return;
    if (event.key === "+" || event.key === "=" || event.code === "NumpadAdd") {
      event.preventDefault();
      view = zoomAt(view, 1.2, centerPoint());
      render();
      setStatus(`Zoom ${Math.round(view.scale * 100)}%.`);
    } else if (event.key === "-" || event.key === "_" || event.code === "NumpadSubtract") {
      event.preventDefault();
      view = zoomAt(view, 1 / 1.2, centerPoint());
      render();
      setStatus(`Zoom ${Math.round(view.scale * 100)}%.`);
    } else if (event.key === "0") {
      event.preventDefault();
      fitToViewport();
    } else if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      const step = event.shiftKey ? 120 : 60;
      const dx = event.key === "ArrowLeft" ? step : event.key === "ArrowRight" ? -step : 0;
      const dy = event.key === "ArrowUp" ? step : event.key === "ArrowDown" ? -step : 0;
      view = { ...view, x: view.x + dx, y: view.y + dy };
      render();
      setStatus("Graph panned. Use the minimap for whole-graph context.");
    }
  }

  function updateFullscreenButton() {
    const button = root.querySelector('[data-graph-action="fullscreen"]');
    if (!button) return;
    const active = doc.fullscreenElement === root;
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? "Exit fullscreen" : "Fullscreen";
  }

  function onFullscreenChange() {
    updateFullscreenButton();
    scheduleResize();
  }

  function onFullscreenClick() {
    try {
      if (doc.fullscreenElement === root) {
        if (typeof doc.exitFullscreen !== "function") {
          setStatus("Fullscreen is not available in this browser.");
          return;
        }
        Promise.resolve(doc.exitFullscreen()).catch(() => setStatus("Could not exit fullscreen."));
        return;
      }
      if (typeof root.requestFullscreen !== "function") {
        setStatus("Fullscreen is not available in this browser.");
        return;
      }
      Promise.resolve(root.requestFullscreen()).catch(() => setStatus("Fullscreen request was not allowed."));
    } catch {
      setStatus("Fullscreen is not available in this browser.");
    }
  }

  listen(viewport, "pointerdown", onPointerDown);
  listen(viewport, "pointermove", (event) => {
    if (!pointerPositions.has(event.pointerId)) return;
    pointerPositions.set(event.pointerId, pointFromEvent(event));
    updateGesture();
  });
  listen(viewport, "pointerup", (event) => endPointer(event));
  listen(viewport, "pointercancel", (event) => endPointer(event, true));
  listen(viewport, "lostpointercapture", (event) => endPointer(event, true));
  listen(viewport, "wheel", onWheel, { passive: false });
  listen(root, "keydown", onKeyDown);

  const actions = {
    "zoom-in": () => {
      if (!view) return;
      view = zoomAt(view, 1.2, centerPoint());
      render();
      setStatus(`Zoom ${Math.round(view.scale * 100)}%.`);
    },
    "zoom-out": () => {
      if (!view) return;
      view = zoomAt(view, 1 / 1.2, centerPoint());
      render();
      setStatus(`Zoom ${Math.round(view.scale * 100)}%.`);
    },
    fit: () => fitToViewport(),
    actual: () => {
      if (!view) return;
      view = zoomTo(view, 1, centerPoint());
      render();
      setStatus("Zoom 100% (natural SVG size).");
    },
    fullscreen: onFullscreenClick,
  };
  for (const [action, handler] of Object.entries(actions)) {
    const button = root.querySelector(`[data-graph-action="${action}"]`);
    if (button) listen(button, "click", handler);
  }

  listen(image, "load", onImageReady);
  listen(image, "error", () => setStatus("The architecture diagram could not be loaded."));
  listen(doc, "fullscreenchange", onFullscreenChange);
  listen(win, "resize", scheduleResize);

  const ResizeObserverType = win.ResizeObserver || globalThis.ResizeObserver;
  if (typeof ResizeObserverType === "function") {
    resizeObserver = new ResizeObserverType(scheduleResize);
    resizeObserver.observe(viewport);
  }

  if (image.complete && image.naturalWidth && image.naturalHeight) {
    onImageReady();
  } else if (image.complete) {
    setStatus("The architecture diagram could not be loaded.");
  } else {
    setStatus("Loading the full architecture graph…");
  }
  updateFullscreenButton();

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    if (resizeFrame) win.cancelAnimationFrame(resizeFrame);
    resizeObserver?.disconnect();
    for (const [target, name, handler, options] of listeners) target.removeEventListener(name, handler, options);
    pointerPositions.clear();
    mountedRoots.delete(root);
  };
  mountedRoots.set(root, cleanup);
  return cleanup;
}

if (typeof document !== "undefined") {
  const mountAll = () => {
    for (const root of document.querySelectorAll(ROOT_SELECTOR)) mountArchitectureViewer(root);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll, { once: true });
  else mountAll();
}
