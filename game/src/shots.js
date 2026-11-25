// Ember Wok Kitchen — deterministic scenes for screenshots.
// ?shot=start shows the title, ?shot=play a busy mid-shift kitchen,
// ?shot=serve a plate ready to serve, ?shot=end the results screen.
// These only stage state; they never change how the game plays.

import { RECIPES } from './config.js';
import * as kitchen from './kitchen.js';

function makeOrder(state, recipeId, patience) {
  const order = kitchen.spawnOrder(state);
  if (!order) return null;
  order.recipeId = recipeId;
  order.patience = patience;
  order.max = 48;
  return order;
}

export function stageShot(state, name) {
  if (name === 'start') {
    state.phase = 'title';
    return true;
  }
  if (name === 'play') {
    kitchen.startShift(state);
    state.elapsed = 28;
    state.timeLeft = 152;
    state.coins = 46;
    state.combo = 2;
    state.orders = [];
    makeOrder(state, 'shrimp-noodle-bowl', 0.72);
    makeOrder(state, 'chili-chicken-rice', 0.45);
    makeOrder(state, 'golden-egg-noodles', 0.86);
    // One dish mid-assembly: noodles and shrimp in the wok, greens on the board.
    state.wok.items = [{ id: 'noodle' }, { id: 'shrimp' }];
    state.wok.cook = 0.55;
    state.wok.stir = 0.8;
    state.board = { id: 'greens', chops: 2 };
    state.hand = null;
    state.message = 'Wok: working on Shrimp Noodle Bowl…';
    state.messageT = 3;
    return true;
  }
  if (name === 'serve') {
    kitchen.startShift(state);
    state.elapsed = 74;
    state.timeLeft = 106;
    state.coins = 88;
    state.combo = 3;
    state.orders = [];
    makeOrder(state, 'golden-egg-noodles', 0.58);
    makeOrder(state, 'garden-stir-fry', 0.8);
    // A finished dish sits on the plate, ready to serve.
    state.plate = { recipeId: 'golden-egg-noodles' };
    state.wok.items = [{ id: 'rice' }, { id: 'chicken' }];
    state.wok.cook = 0.35;
    state.wok.stir = 0.9;
    state.hand = null;
    state.message = 'Golden Egg Noodles plated — serve it to its ticket!';
    state.messageT = 3;
    state.popups = [{ x: 640, y: 190, text: '+15 coins  x3 combo!', color: '#ffd94d', t: 0.3 }];
    return true;
  }
  if (name === 'end') {
    kitchen.startShift(state);
    state.phase = 'over';
    state.elapsed = 180;
    state.timeLeft = 0;
    state.coins = 214;
    state.served = 15;
    state.failed = 2;
    state.hearts = 1; // two walk-outs cost two hearts
    state.bestCombo = 5;
    state.trashed = 1;
    state.endRank = 'S';
    state.endReason = 'The shift bell rang — service is over.';
    state.orders = [];
    state.message = '';
    state.messageT = 0;
    state.popups = [];
    return true;
  }
  return false;
}

export { RECIPES };
