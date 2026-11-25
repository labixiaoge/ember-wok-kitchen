// Ember Wok Kitchen — entry point: the loop, the wiring, the ?shot= staging.
// Run it by opening game/index.html in a desktop browser; no build, no network.

import { H, W } from './layout.js';
import * as kitchen from './kitchen.js';
import { createInput } from './input.js';
import { drawScene } from './render.js';
import { stageShot } from './shots.js';
import { stopSizzle } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') ?? 20261125) || 20261125;
const state = kitchen.newGame(seed);

const hooks = {
  start() {
    kitchen.startShift(state);
  },
  pause() {
    if (state.phase === 'playing') {
      state.phase = 'paused';
      stopSizzle();
    }
  },
  resume() {
    if (state.phase === 'paused') state.phase = 'playing';
  },
};

const { input } = createInput(canvas, state, hooks);

const shot = params.get('shot');
if (shot) {
  stageShot(state, shot);
  // Freeze a staged mid-shift scene so screenshots never depend on wall-clock timing.
  if (state.phase === 'playing') state.frozen = true;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!state.frozen) kitchen.update(state, dt);
  drawScene(ctx, state, input);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Test handle: the playthrough driver reads state and drives actions through this.
window.__game = {
  state,
  kitchen,
  start: () => kitchen.startShift(state),
  shot: (name) => stageShot(state, name),
};
