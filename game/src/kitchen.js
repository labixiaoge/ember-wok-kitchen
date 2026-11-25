// Ember Wok Kitchen — the kitchen itself: state, orders, wok, board and serving.
// All rules live here; rendering only draws what this file decides.

import {
  BIN_ORDER, BURN_SECONDS, CHOPS_NEEDED, MAX_HEARTS, MAX_ORDERS,
  RECIPES, SHIFT_SECONDS, closestRecipe, ingredientById, matchRecipe,
  patienceAt, recipeById, spawnIntervalAt,
} from './config.js';
import * as sfx from './audio.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let nextOrderId = 1;

export function newGame(seed = 20261125) {
  nextOrderId = 1;
  return {
    phase: 'title', // title | playing | paused | over
    seed,
    rand: mulberry32(seed),
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    failed: 0,
    trashed: 0,
    hearts: MAX_HEARTS,
    combo: 0,
    bestCombo: 0,
    hand: null, // { kind: 'ingredient', id, chopped } | { kind: 'dish', recipeId }
    board: null, // { id, chops }
    wok: { items: [], cook: 0, done: false, burnt: false, burnT: 0, stir: 1 },
    plate: null, // { recipeId }
    orders: [],
    spawnIn: 1.2,
    message: '',
    messageT: 0,
    popups: [], // { x, y, text, color, t }
    particles: [], // { x, y, vx, vy, life, color, size }
    shake: 0,
    servedFlash: 0,
    endRank: '',
    endReason: '',
  };
}

export function startShift(state) {
  state.phase = 'playing';
  state.elapsed = 0;
  state.timeLeft = SHIFT_SECONDS;
  state.coins = 0;
  state.served = 0;
  state.failed = 0;
  state.trashed = 0;
  state.hearts = MAX_HEARTS;
  state.combo = 0;
  state.bestCombo = 0;
  state.hand = null;
  state.board = null;
  state.wok = { items: [], cook: 0, done: false, burnt: false, burnT: 0, stir: 1 };
  state.plate = null;
  state.orders = [];
  state.spawnIn = 1.0;
  state.popups = [];
  state.particles = [];
  state.shake = 0;
  say(state, 'Shift started — first orders coming in!');
  spawnOrder(state);
  spawnOrder(state);
  sfx.playOrder();
}

function say(state, text) {
  state.message = text;
  state.messageT = 3;
}

function popup(state, x, y, text, color = '#ffd94d') {
  state.popups.push({ x, y, text, color, t: 0 });
}

export function spawnOrder(state) {
  if (state.orders.length >= MAX_ORDERS) return null;
  const recipe = RECIPES[Math.floor(state.rand() * RECIPES.length)];
  const order = {
    id: nextOrderId++,
    recipeId: recipe.id,
    patience: 1,
    max: patienceAt(state.elapsed),
    born: state.elapsed,
  };
  state.orders.push(order);
  return order;
}

function endShift(state, reason) {
  state.phase = 'over';
  state.endReason = reason;
  const s = state.served;
  const c = state.coins;
  state.endRank = s >= 14 && c >= 180 ? 'S' : s >= 10 && c >= 130 ? 'A' : s >= 7 ? 'B' : s >= 4 ? 'C' : 'D';
  sfx.stopSizzle();
  sfx.playDing();
}

export function update(state, dt) {
  if (state.phase !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
  if (state.messageT > 0) state.messageT -= dt;
  if (state.shake > 0) state.shake -= dt * 3;
  if (state.servedFlash > 0) state.servedFlash -= dt;

  // Spawn orders on a quickening schedule.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    if (spawnOrder(state)) sfx.playOrder();
    state.spawnIn = spawnIntervalAt(state.elapsed) * (0.85 + state.rand() * 0.3);
  }

  // Patience drains; a starved ticket walks out.
  for (const order of [...state.orders]) {
    order.patience -= dt / order.max;
    if (order.patience <= 0) {
      state.orders = state.orders.filter((o) => o.id !== order.id);
      state.failed += 1;
      state.combo = 0;
      state.hearts -= 1;
      popup(state, 250, 150, 'Order walked out!', '#ff6b5e');
      sfx.playError();
      if (state.hearts <= 0) {
        endShift(state, 'The crowd lost patience — all three hearts are gone.');
        return;
      }
    }
  }

  // The wok cooks while it holds food; stirring keeps the heat even.
  const wok = state.wok;
  if (wok.items.length > 0 && !wok.done && !wok.burnt) {
    const recipe = matchRecipe(wok.items.map((i) => i.id));
    const cookTime = recipe ? recipe.cookTime : 6;
    wok.stir = Math.max(0.25, wok.stir - dt * 0.06);
    wok.cook += (dt / cookTime) * (0.6 + 0.4 * wok.stir);
    if (wok.cook >= 1) {
      wok.cook = 1;
      wok.done = true;
      wok.burnT = 0;
      if (recipe) {
        say(state, `${recipe.name} is ready — plate it!`);
        sfx.playDing();
      } else {
        say(state, 'That mix matches no recipe — trash it.');
        sfx.playError();
      }
    }
  }
  if (wok.done && !wok.burnt) {
    wok.burnT += dt;
    if (wok.burnT >= BURN_SECONDS) {
      wok.burnt = true;
      say(state, 'The wok burned! Trash it and start over.');
      sfx.playBurn();
    }
  }

  // Steam and sizzle particles.
  if (wok.items.length > 0 && !wok.burnt && state.rand() < dt * 14) {
    state.particles.push({
      x: 640 + (state.rand() - 0.5) * 90, y: 470,
      vx: (state.rand() - 0.5) * 12, vy: -34 - state.rand() * 22,
      life: 0, max: 1.1, color: 'rgba(255,255,255,0.5)', size: 5 + state.rand() * 6,
    });
  }
  if (wok.burnt && state.rand() < dt * 20) {
    state.particles.push({
      x: 640 + (state.rand() - 0.5) * 100, y: 460,
      vx: (state.rand() - 0.5) * 10, vy: -26 - state.rand() * 18,
      life: 0, max: 1.4, color: 'rgba(60,60,60,0.55)', size: 8 + state.rand() * 8,
    });
  }
  for (const p of state.particles) {
    p.life += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  state.particles = state.particles.filter((p) => p.life < p.max);
  for (const p of state.popups) p.t += dt;
  state.popups = state.popups.filter((p) => p.t < 1.4);

  if (state.timeLeft <= 0) {
    endShift(state, 'The shift bell rang — service is over.');
  }
}

// --- Player actions -------------------------------------------------------

export function takeIngredient(state, id) {
  if (state.phase !== 'playing') return;
  if (state.hand) {
    say(state, 'Your hand is full — put it down first.');
    return;
  }
  const ing = ingredientById(id);
  if (!ing) return;
  state.hand = { kind: 'ingredient', id, chopped: !ing.needsChop };
  sfx.playPick();
}

export function takeFromBoard(state) {
  if (state.phase !== 'playing' || !state.board) return;
  if (state.board.chops >= CHOPS_NEEDED) {
    state.hand = { kind: 'ingredient', id: state.board.id, chopped: true };
    state.board = null;
    sfx.playPick();
  }
}

export function putOnBoard(state) {
  if (state.phase !== 'playing' || !state.hand || state.hand.kind !== 'ingredient') return;
  if (state.board) {
    say(state, 'The board is busy — finish that chop first.');
    return;
  }
  const ing = ingredientById(state.hand.id);
  if (!ing.needsChop) {
    say(state, `${ing.name} needs no chopping — straight in the wok.`);
    sfx.playError();
    return;
  }
  state.board = { id: state.hand.id, chops: 0 };
  state.hand = null;
  sfx.playPick();
}

export function chop(state) {
  if (state.phase !== 'playing' || !state.board) return;
  state.board.chops += 1;
  sfx.playChop();
  if (state.board.chops >= CHOPS_NEEDED) {
    state.hand = { kind: 'ingredient', id: state.board.id, chopped: true };
    state.board = null;
    say(state, 'Chopped! Into the wok it goes.');
  }
}

export function tossInWok(state) {
  if (state.phase !== 'playing' || !state.hand || state.hand.kind !== 'ingredient') return;
  const wok = state.wok;
  if (wok.done || wok.burnt) {
    say(state, 'Clear the wok first — it holds a finished dish.');
    return;
  }
  if (wok.items.length >= 3) {
    say(state, 'The wok is full — three ingredients at most.');
    sfx.playError();
    return;
  }
  if (!state.hand.chopped) {
    say(state, 'Chop it on the board first!');
    sfx.playError();
    return;
  }
  wok.items.push({ id: state.hand.id });
  state.hand = null;
  sfx.playToss();
  sfx.startSizzle();
  const recipe = closestRecipe(wok.items.map((i) => i.id));
  if (recipe) say(state, `Wok: working on ${recipe.name}…`);
}

export function stirWok(state) {
  if (state.phase !== 'playing') return;
  const wok = state.wok;
  if (wok.items.length === 0) return;
  wok.stir = 1;
  sfx.playStir();
}

export function plateDish(state) {
  if (state.phase !== 'playing') return;
  const wok = state.wok;
  if (!wok.done || wok.burnt) return;
  if (state.plate) {
    say(state, 'The plate is taken — serve it first.');
    return;
  }
  const recipe = matchRecipe(wok.items.map((i) => i.id));
  if (!recipe) {
    say(state, 'No recipe matches — trash this mix.');
    sfx.playError();
    return;
  }
  state.plate = { recipeId: recipe.id };
  state.wok = { items: [], cook: 0, done: false, burnt: false, burnT: 0, stir: 1 };
  sfx.stopSizzle();
  sfx.playDing();
  say(state, `${recipe.name} plated — serve it to its ticket!`);
}

export function takePlate(state) {
  if (state.phase !== 'playing' || !state.plate) return;
  if (state.hand) {
    say(state, 'Your hand is full — put it down first.');
    return;
  }
  state.hand = { kind: 'dish', recipeId: state.plate.recipeId };
  state.plate = null;
  sfx.playPick();
}

export function serveOrder(state, orderId) {
  if (state.phase !== 'playing') return false;
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return false;
  if (!state.hand || state.hand.kind !== 'dish') {
    say(state, 'Pick up a plated dish first, then tap its ticket.');
    return false;
  }
  if (state.hand.recipeId !== order.recipeId) {
    state.shake = 0.5;
    say(state, 'Wrong ticket — that order wants something else.');
    sfx.playError();
    return false;
  }
  const recipe = recipeById(order.recipeId);
  const tip = Math.round(recipe.base * 0.5 * Math.max(0, order.patience));
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const mult = 1 + Math.min(1, (state.combo - 1) * 0.1);
  const earned = Math.round((recipe.base + tip) * mult);
  state.coins += earned;
  state.served += 1;
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.hand = null;
  state.servedFlash = 0.6;
  popup(state, 250, 150, `+${earned} coins${state.combo > 1 ? `  x${state.combo} combo!` : ''}`, '#ffd94d');
  sfx.playCoin();
  return true;
}

export function serveFirstMatch(state) {
  if (!state.hand || state.hand.kind !== 'dish') return false;
  const order = state.orders.find((o) => o.recipeId === state.hand.recipeId);
  if (!order) {
    say(state, 'No ticket is waiting for that dish right now.');
    sfx.playError();
    return false;
  }
  return serveOrder(state, order.id);
}

export function trashHand(state) {
  if (state.phase !== 'playing' || !state.hand) return;
  state.hand = null;
  state.trashed += 1;
  sfx.playError();
  say(state, 'Tossed in the bin.');
}

export function trashWok(state) {
  if (state.phase !== 'playing') return;
  const wok = state.wok;
  if (wok.items.length === 0) return;
  state.wok = { items: [], cook: 0, done: false, burnt: false, burnT: 0, stir: 1 };
  state.trashed += 1;
  sfx.stopSizzle();
  say(state, 'Wok cleared.');
}

export function clearHand(state) {
  state.hand = null;
}

export { BIN_ORDER };
