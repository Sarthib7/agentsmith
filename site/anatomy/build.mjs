import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as A from "./vendor/audit.mjs";
import { ISO_CSS } from "./vendor/iso-kit.mjs";
import { advance, createInitialState, reduce, tick, workflowStatus } from "./model.mjs";
import { PROJECTION, figureRuntimeConfig, recordScene, renderSvg } from "./geometry.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const light = process.argv.includes("--light");
const shouldAudit = process.argv.includes("--audit");
const theme = light ? "light" : "dark";
const outputName = light ? "workbench-light.html" : "workbench.html";
const initial = createInitialState();
const initialStatus = workflowStatus(initial);
const modelSource = readFileSync(join(HERE, "model.mjs"), "utf8");
const runtimeSource = readFileSync(join(HERE, "runtime.mjs"), "utf8");
const licenseSource = readFileSync(join(HERE, "vendor", "LICENSE"), "utf8");
const machine = renderSvg(initial).replace("<svg ", '<svg id="machine-svg" ');
const scriptSource = [
  `const FIGURE_CONFIG = ${JSON.stringify(figureRuntimeConfig())};`,
  modelSource,
  runtimeSource,
].join("\n").replace(/<\/script/gi, "<\\/script");

const PAGE_CSS = `
*{box-sizing:border-box}
html{color-scheme:${theme}}
body{margin:0;background:var(--anatomy-page);color:var(--anatomy-text);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
body[data-theme="light"]{color-scheme:light}
.workbench-shell{width:min(100%,1200px);margin:0 auto;padding:14px 18px 20px}
.workbench{overflow:hidden;border:1px solid color-mix(in srgb,var(--anatomy-mid) 38%,transparent);border-radius:18px;background:var(--anatomy-card);box-shadow:var(--anatomy-lift)}
.workbench-head{display:flex;justify-content:flex-end;padding:14px 22px 4px}
.eyebrow{margin:0;color:var(--anatomy-muted);font:600 10px/1.3 var(--anatomy-mono);letter-spacing:.12em;text-transform:uppercase}
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.machine-stage{margin:0 10px;outline:none;cursor:pointer;touch-action:pan-y}
.machine-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:-4px;border-radius:10px}
.machine-stage .iso-svg{width:100%;height:auto}
.machine-item[data-advisor-part]:not([data-enabled="true"]){opacity:.72}
.machine-item[data-active="true"] .iso-edge{stroke:var(--anatomy-hi)}
body.iso[data-theme="light"]{
  --anatomy-page:#f0eee7;--anatomy-card:#faf8f2;--anatomy-text:#46443e;--anatomy-strong:#211f1a;--anatomy-muted:#5f5c54;
  --anatomy-paper:#d3d0c6;--anatomy-face:#e3dfd5;--anatomy-top:#efebe1;
  --anatomy-shade-0:#77746c;--anatomy-shade-1:#928f86;--anatomy-shade-2:#aaa79d;--anatomy-shade-3:#c4c1b7;
  --anatomy-lit-top:#efbb4d;--anatomy-lit-shade:#c88b27;--anatomy-lit:#704713;
  --anatomy-hi:#35332d;--anatomy-mid:#605d55;--anatomy-lo:#4c4942;--anatomy-faint:#a8a499;--anatomy-dot:#302d26;
  --anatomy-halo:#6c695f;--anatomy-halo-opacity:.25;--anatomy-weight:.8px;
}
#machine-svg .machine-item[data-part="work-cartridge"] > .iso-solid[data-lit] > .iso-fill{fill:#d29a38}
#machine-svg .machine-item[data-part="work-cartridge"] > .iso-solid[data-lit] > .iso-top{fill:#efbb4d}
#machine-svg .machine-item[data-part="work-cartridge"] > .iso-solid[data-lit] > .iso-shade[data-shade="0"]{fill:#89550f}
#machine-svg .machine-item[data-part="work-cartridge"] > .iso-solid[data-lit] > .iso-shade[data-shade="1"]{fill:#a96c18}
#machine-svg .machine-item[data-part="work-cartridge"] > .iso-solid[data-lit] > .iso-shade[data-shade="2"]{fill:#c08120}
#machine-svg .machine-item[data-part="work-cartridge"] > .iso-solid[data-lit] > .iso-shade[data-shade="3"]{fill:#d9972d}
#machine-svg .machine-item[data-part="work-cartridge"] > .iso-solid[data-lit] > .iso-edge{stroke:#704713}
.machine-panel{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px 20px;padding:0 22px 14px}
.readout{display:flex;flex-wrap:wrap;align-items:baseline;gap:5px 14px;min-height:28px}
.readout strong{color:var(--anatomy-strong);font-size:13px;font-weight:600}
.readout span{color:var(--anatomy-muted);font:11px/1.4 var(--anatomy-mono)}
.controls{display:flex;flex-wrap:wrap;gap:7px}
button{min-height:34px;padding:7px 12px;border:1px solid color-mix(in srgb,var(--anatomy-mid) 58%,transparent);border-radius:9px;background:var(--anatomy-paper);color:var(--anatomy-strong);font:600 12px/1.2 ui-sans-serif,system-ui,sans-serif;cursor:pointer}
button:hover:not(:disabled){border-color:var(--anatomy-hi);background:var(--anatomy-face)}
button:disabled{opacity:.46;cursor:not-allowed}
button:focus-visible,input:focus-visible{outline:1px solid var(--anatomy-hi);outline-offset:3px}
#advance{background:var(--anatomy-top)}
#feedback{grid-column:1/-1;min-height:0;margin:0;color:var(--anatomy-muted);font-size:12px}
.advisors{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;margin:0 22px;padding:10px 0 12px;border:0;border-top:1px solid color-mix(in srgb,var(--anatomy-mid) 28%,transparent)}
.advisors legend{padding:0 10px 0 0;color:var(--anatomy-muted);font:600 10px/1.4 var(--anatomy-mono);letter-spacing:.04em}
.advisor-toggle{display:inline-flex;align-items:center;gap:7px;color:var(--anatomy-text);font-size:12px;cursor:pointer}
.advisor-toggle input{accent-color:var(--anatomy-hi)}
.explanation{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:10px 22px 12px;background:color-mix(in srgb,var(--anatomy-page) 55%,var(--anatomy-card))}
.legend-item{min-width:0;color:var(--anatomy-text);font-size:11px;line-height:1.4}
.legend-item strong{display:block;margin-bottom:2px;color:var(--anatomy-strong);font:600 9px/1.3 var(--anatomy-mono);letter-spacing:.09em;text-transform:uppercase}
.caption{margin:0;padding:10px 22px 14px;color:var(--anatomy-muted);font-size:11px;line-height:1.45}
@media(max-width:640px){
  .workbench-shell{padding:8px}
  .workbench{border-radius:13px}
  .workbench-head{display:block;padding:14px 14px 5px}
  .machine-stage{margin:0 2px}
  .machine-panel{grid-template-columns:1fr;padding:0 14px 10px}
  .controls{justify-content:flex-start}
  .advisors{margin:0 14px;gap:6px 14px}
  .advisors legend{width:100%;margin-bottom:2px}
  .explanation{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 12px;padding:10px 14px}
  .caption{padding:9px 14px 12px}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="An interactive mechanical illustration of optional advisors, an orchestrator carriage, illustrative worker bays, and parent verification.">
<title>AgentSmith workbench illustration</title>
<style>${ISO_CSS}${PAGE_CSS}</style>
<!-- Anatomy upstream license: ${licenseSource.replace(/\n(?=\S)/g, "\n   ")} -->
</head>
<body class="iso" data-theme="${theme}">
<main id="workbench" class="workbench-shell">
  <article class="workbench" aria-describedby="figure-caption">
    <header class="workbench-head">
      <h1 class="visually-hidden">Optional workbench visual demo</h1>
      <p class="eyebrow">Not live system state</p>
    </header>
    <div id="machine-stage" class="machine-stage" tabindex="0" role="group" aria-label="Workbench machine. Space or Arrow Right advances one step when settled; Home resets. Click the drawing to advance. Controls and advisor toggles follow the figure.">
      ${machine}
    </div>
    <section class="machine-panel" aria-label="Illustration controls and status">
      <div id="readout" class="readout" role="status" aria-live="polite" aria-atomic="true" aria-label="${initialStatus.text}">
        <strong id="phase">${initialStatus.label}</strong>
        <span id="count">${initialStatus.returned}/${initialStatus.total} task results returned</span>
      </div>
      <div class="controls" role="group" aria-label="Workflow illustration controls">
        <button id="advance" type="button">Advance</button>
        <button id="verify" type="button">Verify returned work</button>
        <button id="reset" type="button">Reset</button>
      </div>
      <p id="feedback" aria-live="polite"></p>
    </section>
    <fieldset class="advisors">
      <legend>Optional advisor roles · drawing only</legend>
      <label class="advisor-toggle"><input id="advisor-astra" type="checkbox"> Astra</label>
      <label class="advisor-toggle"><input id="advisor-fable" type="checkbox"> Fable</label>
      <label class="advisor-toggle"><input id="advisor-grok" type="checkbox"> Grok</label>
    </fieldset>
    <section class="explanation" aria-label="Machine legend">
      <div class="legend-item"><strong>Top</strong>Three optional advisor instruments</div>
      <div class="legend-item"><strong>Middle</strong>One lead/orchestrator carriage and cartridge</div>
      <div class="legend-item"><strong>Lower</strong>Three grouped bays with illustrative fixtures</div>
      <div class="legend-item"><strong>Gate</strong>Parent verification after all task returns</div>
    </section>
    <p id="figure-caption" class="caption">The nine lower fixtures are an illustrative pool, not a concurrency limit. This drawing does not show running sessions, live telemetry, or actual advisor output; toggles change only the illustration.</p>
  </article>
</main>
<script type="module">${scriptSource}</script>
</body>
</html>
`;

writeFileSync(join(HERE, outputName), html, "utf8");
console.log(`wrote site/anatomy/${outputName}`);

if (shouldAudit) {
  const poses = [];
  let state = createInitialState();
  poses.push(["rest · staged", state]);
  for (let route = 0; route < 4; route += 1) {
    const action = advance(state);
    if (!action.accepted) throw new Error(`audit pose transition rejected: ${action.reason}`);
    state = action.state;
    for (let frame = 0; frame < 90 && state.phase.startsWith("routing-"); frame += 1) {
      state = tick(state, 1 / 30);
      if (frame === 4 || frame === 12) poses.push([`moving · ${state.phase} · frame ${frame + 1}`, state]);
    }
    poses.push([`rest · ${state.phase}`, state]);
  }

  const verification = reduce(state, { type: "verify" });
  if (!verification.accepted) throw new Error(`audit verification transition rejected: ${verification.reason}`);
  state = verification.state;
  for (let frame = 0; frame < 90 && !workflowStatus(state).settled; frame += 1) {
    state = tick(state, 1 / 30);
    if (frame === 4 || frame === 12) poses.push([`moving · verified gate · frame ${frame + 1}`, state]);
  }
  poses.push(["rest · verified", state]);

  for (const [label, pose] of poses) {
    console.log(`\nshape audit · ${label}`);
    const recorder = recordScene(pose);
    A.auditOrExit(recorder, PROJECTION, {
      flag: "--audit",
      argv: ["--audit"],
      frames: [],
      apart: false,
    });
  }
}
