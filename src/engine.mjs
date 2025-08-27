// src/engine.mjs
import fs from "fs/promises";
import path from "path";
import url from "url";

import { effects } from "./effects/index.mjs";
import { sliceSection } from "./effects/modifiers.mjs";
import { renderScene, SCENE_W, SCENE_H } from "./render-scene.mjs";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONFIG_DIR = path.join(ROOT, "config");

export { SCENE_W, SCENE_H };

// ------- params (shared to UI) -------
export const params = {
  fpsCap: 60,
  effect: "gradient",        // "gradient" | "solid" | "fire"
  renderMode: "duplicate",   // "duplicate" | "extended" | "mirror"
  effects: {},
  post: {
    brightness: 0.8,
    tint: [1.0, 1.0, 1.0],
    gamma: 1.0,
    strobeHz: 0.0,
    strobeDuty: 0.5,
    strobeLow: 0.0,
    pitchSpeed: 0,
    yawSpeed: 0,
  }
};

for (const eff of Object.values(effects)) {
  params.effects[eff.id] = { ...(eff.defaultParams || {}) };
}

// ------- load layouts -------
export async function loadLayout(name){
  const raw = await fs.readFile(path.join(CONFIG_DIR, `${name}.json`), "utf8");
  const j = JSON.parse(raw);
  if (!j?.sampling?.width || !j?.sampling?.height) throw new Error(`${name}.json missing sampling.width/height`);
  return j;
}
export const layoutLeft  = await loadLayout("left");
export const layoutRight = await loadLayout("right");

const postKeys = new Set(Object.keys(params.post));
const effectParamMap = {};
for (const eff of Object.values(effects)) {
  for (const key of Object.keys(eff.defaultParams || {})) {
    effectParamMap[key] = eff.id;
  }
}

export function updateParams(patch){
  for (const [key, value] of Object.entries(patch)) {
    if (key === "fpsCap" || key === "effect") {
      params[key] = value;
    } else if (postKeys.has(key)) {
      params.post[key] = value;
    } else if (effectParamMap[key]) {
      const id = effectParamMap[key];
      params.effects[id] = params.effects[id] || {};
      params.effects[id][key] = value;
    } else {
      params[key] = value;
    }
  }
}

// ------- engine buffers -------
// leftFrame and rightFrame hold RGB float data for each wall
const leftFrame  = new Float32Array(SCENE_W * SCENE_H * 3);
const rightFrame = new Float32Array(SCENE_W * SCENE_H * 3);
let extendedFrame = new Float32Array(SCENE_W * 2 * SCENE_H * 3);


// ------- build slices frame -------
// Convert the raw float frames into NDJSON ready pixel data
function buildSlicesFrame(frame, fps){
  function sideSlices(sceneF32, layout){
    const out = {};
    layout.runs.forEach(run => {
      run.sections.forEach(sec => {
        const bytes = sliceSection(sceneF32, SCENE_W, SCENE_H, sec, layout.sampling);
        out[sec.id] = { length: sec.led_count, rgb_b64: Buffer.from(bytes).toString("base64") };
      });
    });
    return out;
  }
  return {
    ts: Math.floor(Date.now()/1000),
    frame, fps,
    format: "rgb8",
    sides: {
      [layoutLeft.side]:  sideSlices(leftFrame,  layoutLeft),
      [layoutRight.side]: sideSlices(rightFrame, layoutRight)
    }
  };
}

// ------- main loop -------
let last, acc, frame;

// tick: regulate frame rate, render, and emit LED data
function tick(){
  const now = process.hrtime.bigint();
  const dt  = Number(now - last)/1e9;
  last = now;

  const cap = Math.max(1, params.fpsCap);
  const step = 1.0 / cap;
  acc += dt;

  // throttle to fpsCap
  if (acc >= step) {
    const t = Number(now)/1e9;
    acc = 0;

    // Render scene based on renderMode
    if (params.renderMode === "extended") {
      renderScene(extendedFrame, t, params, SCENE_W * 2, SCENE_H);
      const rowStride = SCENE_W * 6; // 2 * SCENE_W * 3
      for (let y = 0; y < SCENE_H; y++) {
        const row = y * rowStride;
        leftFrame.set(extendedFrame.subarray(row, row + SCENE_W * 3), y * SCENE_W * 3);
        rightFrame.set(extendedFrame.subarray(row + SCENE_W * 3, row + SCENE_W * 6), y * SCENE_W * 3);
      }
    } else {
      renderScene(leftFrame, t, params);
      if (params.renderMode === "mirror") {
        const rowStride = SCENE_W * 3;
        for (let y = 0; y < SCENE_H; y++) {
          for (let x = 0; x < SCENE_W; x++) {
            const src = y * rowStride + x * 3;
            const dst = y * rowStride + (SCENE_W - 1 - x) * 3;
            rightFrame[dst] = leftFrame[src];
            rightFrame[dst + 1] = leftFrame[src + 1];
            rightFrame[dst + 2] = leftFrame[src + 2];
          }
        }
      } else {
        rightFrame.set(leftFrame);
      }
    }

    // Emit SLICES_NDJSON to stdout
    const out = buildSlicesFrame(frame++, cap);
    process.stdout.write(JSON.stringify(out) + "\n");
  }

  setImmediate(tick);
}

// start: initialize counters and kick off the main loop
export function start(){
  last = process.hrtime.bigint();
  acc = 0;
  frame = 0;
  tick();
}
