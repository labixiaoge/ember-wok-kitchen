// Ember Wok Kitchen — mouse and keyboard. One click does one job:
// bins give ingredients, the board chops, the wok cooks, the plate serves.

import { BIN_ORDER } from './config.js';
import * as layout from './layout.js';
import * as kitchen from './kitchen.js';
import { isMuted, toggleMute } from './audio.js';

export function createInput(canvas, state, hooks) {
  const input = {
    mouse: { x: -100, y: -100, down: false },
    hoverTicket: -1,
    hoverBin: -1,
  };

  function canvasPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * layout.W,
      y: ((event.clientY - rect.top) / rect.height) * layout.H,
    };
  }

  function playClickAt(x, y) {
    if (state.phase === 'title') {
      if (layout.inside(layout.START_BTN, x, y)) hooks.start();
      return;
    }
    if (state.phase === 'over') {
      if (layout.inside(layout.RESTART_BTN, x, y)) hooks.start();
      return;
    }
    if (state.phase === 'paused') {
      if (layout.inside(layout.PAUSE_BTN, x, y)) hooks.resume();
      return;
    }
    if (layout.inside(layout.MUTE_BTN, x, y)) {
      toggleMute();
      return;
    }
    if (layout.inside(layout.PAUSE_BTN, x, y)) {
      hooks.pause();
      return;
    }
    // Serve first: a ticket tap with a dish in hand.
    for (let i = 0; i < state.orders.length; i++) {
      if (layout.inside(layout.ticketZone(i), x, y)) {
        kitchen.serveOrder(state, state.orders[i].id);
        return;
      }
    }
    if (layout.inside(layout.TRASH, x, y)) {
      if (state.hand) kitchen.trashHand(state);
      else kitchen.trashWok(state);
      return;
    }
    if (layout.inside(layout.CHOP_BOARD, x, y)) {
      if (state.board) kitchen.chop(state);
      else if (state.hand?.kind === 'ingredient') kitchen.putOnBoard(state);
      return;
    }
    if (layout.inside(layout.WOK_ZONE, x, y) || layout.insideCircle(layout.WOK.cx, layout.WOK.cy, layout.WOK.r, x, y)) {
      if (state.hand?.kind === 'ingredient') kitchen.tossInWok(state);
      else if (state.wok.done && !state.wok.burnt) kitchen.plateDish(state);
      else kitchen.stirWok(state);
      return;
    }
    if (layout.inside(layout.PLATE_ZONE, x, y) || layout.insideCircle(layout.PLATE.cx, layout.PLATE.cy, layout.PLATE.r, x, y)) {
      if (state.plate) kitchen.takePlate(state);
      else if (state.wok.done && !state.wok.burnt) kitchen.plateDish(state);
      return;
    }
    for (let i = 0; i < BIN_ORDER.length; i++) {
      if (layout.inside(layout.binZone(i), x, y)) {
        kitchen.takeIngredient(state, BIN_ORDER[i]);
        return;
      }
    }
    // A click on empty space drops nothing, but clears a held item's target.
    if (state.hand && state.hand.kind === 'dish') {
      // Keep the dish in hand; only a ticket takes it.
    }
  }

  canvas.addEventListener('mousemove', (event) => {
    const pos = canvasPos(event);
    input.mouse.x = pos.x;
    input.mouse.y = pos.y;
    input.hoverTicket = -1;
    input.hoverBin = -1;
    for (let i = 0; i < state.orders.length; i++) {
      if (layout.inside(layout.ticketZone(i), pos.x, pos.y)) input.hoverTicket = i;
    }
    for (let i = 0; i < BIN_ORDER.length; i++) {
      if (layout.inside(layout.binZone(i), pos.x, pos.y)) input.hoverBin = i;
    }
  });

  canvas.addEventListener('mousedown', (event) => {
    input.mouse.down = true;
    const pos = canvasPos(event);
    playClickAt(pos.x, pos.y);
  });
  window.addEventListener('mouseup', () => {
    input.mouse.down = false;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'm') {
      toggleMute();
      return;
    }
    if (state.phase === 'title' || state.phase === 'over') {
      if (key === 'enter' || key === ' ') {
        event.preventDefault();
        hooks.start();
      }
      return;
    }
    if (key === 'p' || key === 'escape') {
      if (state.phase === 'playing') hooks.pause();
      else if (state.phase === 'paused') hooks.resume();
      return;
    }
    if (state.phase !== 'playing') return;
    if (key >= '1' && key <= '8') {
      kitchen.takeIngredient(state, BIN_ORDER[Number(key) - 1]);
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      if (state.board) kitchen.chop(state);
      else kitchen.stirWok(state);
      return;
    }
    if (key === 'enter') {
      kitchen.serveFirstMatch(state);
      return;
    }
    if (key === 'backspace' || key === 'delete') {
      kitchen.trashHand(state);
      return;
    }
  });

  return { input, isMuted };
}
