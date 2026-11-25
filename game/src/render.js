// Ember Wok Kitchen — everything the player sees, drawn on one canvas.
// No images: every ingredient, flame and ticket is drawn from shapes.

import {
  BIN_ORDER, BURN_SECONDS, CHOPS_NEEDED, INGREDIENTS, RECIPES, SHIFT_SECONDS,
  closestRecipe, matchRecipe, recipeById,
} from './config.js';
import { H, W, binZone, ticketZone } from './layout.js';
import * as layout from './layout.js';
import { dishShort, patienceColor, tipFor, valueFor } from './orders.js';

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 700, align = 'center') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// --- Ingredient icons, drawn from shapes so the game needs no image files. ---

export function drawIngredientIcon(ctx, id, x, y, s) {
  const ing = INGREDIENTS[id];
  if (!ing) return;
  ctx.save();
  ctx.translate(x, y);
  const u = s / 48;
  ctx.lineCap = 'round';
  if (id === 'noodle') {
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = 5 * u;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-16 * u, i * 9 * u);
      ctx.bezierCurveTo(-8 * u, (i * 9 - 7) * u, 8 * u, (i * 9 + 7) * u, 16 * u, i * 9 * u);
      ctx.stroke();
    }
  } else if (id === 'egg') {
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.ellipse(0, 0, 17 * u, 13 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f0a13a';
    ctx.beginPath();
    ctx.arc(2 * u, 1 * u, 7.5 * u, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'rice') {
    ctx.fillStyle = '#c94f2e';
    ctx.beginPath();
    ctx.moveTo(-18 * u, 2 * u);
    ctx.quadraticCurveTo(0, 20 * u, 18 * u, 2 * u);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath();
    ctx.arc(0, 0, 14 * u, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fdf6e3';
    for (const [dx, dy] of [[-8, -4], [0, -8], [8, -4]]) {
      ctx.beginPath();
      ctx.arc(dx * u, dy * u, 3.5 * u, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'shrimp') {
    ctx.strokeStyle = '#ff9d76';
    ctx.lineWidth = 8 * u;
    ctx.beginPath();
    ctx.arc(0, 2 * u, 13 * u, Math.PI * 0.15, Math.PI * 1.15);
    ctx.stroke();
    ctx.strokeStyle = '#e56b45';
    ctx.lineWidth = 4 * u;
    ctx.beginPath();
    ctx.arc(0, 2 * u, 13 * u, Math.PI * 0.9, Math.PI * 1.15);
    ctx.stroke();
    ctx.fillStyle = '#e56b45';
    ctx.beginPath();
    ctx.moveTo(-14 * u, -8 * u);
    ctx.lineTo(-20 * u, -14 * u);
    ctx.lineTo(-10 * u, -13 * u);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'greens') {
    ctx.fillStyle = '#5fbf4d';
    for (const [dx, dy, rot] of [[-9, 4, -0.6], [0, -6, 0], [9, 4, 0.6]]) {
      ctx.save();
      ctx.translate(dx * u, dy * u);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6 * u, 11 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#2f7d2c';
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.moveTo(0, 14 * u);
    ctx.lineTo(0, 4 * u);
    ctx.stroke();
  } else if (id === 'chili') {
    ctx.strokeStyle = '#e33e2b';
    ctx.lineWidth = 9 * u;
    ctx.beginPath();
    ctx.moveTo(-14 * u, -10 * u);
    ctx.quadraticCurveTo(2 * u, 4 * u, 14 * u, 10 * u);
    ctx.stroke();
    ctx.strokeStyle = '#2f7d2c';
    ctx.lineWidth = 4 * u;
    ctx.beginPath();
    ctx.moveTo(-14 * u, -10 * u);
    ctx.quadraticCurveTo(-18 * u, -16 * u, -12 * u, -18 * u);
    ctx.stroke();
  } else if (id === 'chicken') {
    ctx.fillStyle = '#f6c89f';
    ctx.beginPath();
    ctx.arc(-3 * u, -3 * u, 12 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f6c89f';
    ctx.lineWidth = 6 * u;
    ctx.beginPath();
    ctx.moveTo(6 * u, 6 * u);
    ctx.lineTo(15 * u, 15 * u);
    ctx.stroke();
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath();
    ctx.arc(16 * u, 16 * u, 3.5 * u, 0, Math.PI * 2);
    ctx.arc(11 * u, 18 * u, 3.5 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c98a4b';
    ctx.beginPath();
    ctx.arc(-3 * u, -3 * u, 12 * u, Math.PI * 0.6, Math.PI * 1.4);
    ctx.lineWidth = 2 * u;
    ctx.stroke();
  } else if (id === 'mushroom') {
    ctx.fillStyle = '#d9c8a9';
    ctx.beginPath();
    ctx.arc(0, -2 * u, 15 * u, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f4ead6';
    ctx.fillRect(-5 * u, -2 * u, 10 * u, 14 * u);
    ctx.fillStyle = '#a08b62';
    ctx.beginPath();
    ctx.arc(-6 * u, -9 * u, 2.5 * u, 0, Math.PI * 2);
    ctx.arc(6 * u, -9 * u, 2.5 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawDishIcon(ctx, recipeId, x, y, s) {
  const recipe = recipeById(recipeId);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f4f1e8';
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.52, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8cdb8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = recipe ? recipe.color : '#c9a06a';
  ctx.beginPath();
  ctx.ellipse(0, -1, s * 0.36, s * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  if (recipe) {
    recipe.ingredients.forEach((ingId, i) => {
      const dx = (i - (recipe.ingredients.length - 1) / 2) * s * 0.22;
      drawIngredientIcon(ctx, ingId, dx, -2, s * 0.42);
    });
  }
  ctx.restore();
}

// --- Scene pieces ----------------------------------------------------------

function drawBackground(ctx) {
  const wall = ctx.createLinearGradient(0, 0, 0, 340);
  wall.addColorStop(0, '#3a2a22');
  wall.addColorStop(1, '#5a3a28');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, 340);
  // Brick lines.
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  for (let y = 36; y < 340; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  // Warm window glow.
  ctx.fillStyle = 'rgba(255,190,90,0.16)';
  rr(ctx, 1060, 84, 180, 150, 10);
  ctx.fill();
  ctx.strokeStyle = '#2a1a12';
  ctx.lineWidth = 6;
  rr(ctx, 1060, 84, 180, 150, 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1150, 84);
  ctx.lineTo(1150, 234);
  ctx.moveTo(1060, 159);
  ctx.lineTo(1240, 159);
  ctx.stroke();
  // Paper lanterns, hung below the top bar so they never cover the timer or coins.
  for (const [lx, hue] of [[470, '#ff5a45'], [880, '#ff8c42']]) {
    ctx.strokeStyle = '#1d120b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 64);
    ctx.lineTo(lx, 90);
    ctx.stroke();
    ctx.fillStyle = hue;
    ctx.beginPath();
    ctx.ellipse(lx, 116, 26, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(lx - 8, 106, 8, 10, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.fillRect(lx - 12, 146, 24, 5);
  }
  // Floor.
  ctx.fillStyle = '#241811';
  ctx.fillRect(0, 340, W, H - 340);
  // Counter band.
  const counter = ctx.createLinearGradient(0, 340, 0, 480);
  counter.addColorStop(0, '#7a4a26');
  counter.addColorStop(1, '#5d3418');
  ctx.fillStyle = counter;
  ctx.fillRect(0, 340, W, 140);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, 340, W, 6);
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = 'rgba(20,10,6,0.85)';
  ctx.fillRect(0, 0, W, 64);
  text(ctx, 'EMBER WOK', 24, 34, 26, '#ffb347', 800, 'left');
  text(ctx, 'rush-hour wok kitchen', 24, 54, 12, '#d8c9b8', 500, 'left');
  // Shift timer, big in the middle.
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const urgent = state.timeLeft <= 30 && state.phase === 'playing';
  ctx.fillStyle = urgent ? '#ff5a45' : '#2a1a12';
  rr(ctx, 560, 8, 160, 48, 10);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#ffb347' : '#7a5a3a';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'SHIFT', 640, 20, 11, '#d8c9b8', 700);
  text(ctx, `${mins}:${String(secs).padStart(2, '0')}`, 640, 42, 24, urgent ? '#ffd94d' : '#fff3d6', 800);
  // Coins.
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(780, 32, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6d1f';
  text(ctx, '¢', 780, 33, 18, '#8a6d1f', 800);
  text(ctx, `${state.coins}`, 802, 33, 24, '#fff3d6', 800, 'left');
  // Combo.
  if (state.combo > 1) {
    text(ctx, `COMBO x${state.combo}`, 920, 33, 18, '#ff9d5c', 800, 'left');
  }
  // Hearts.
  for (let i = 0; i < 3; i++) {
    const hx = 1064 + i * 30;
    ctx.fillStyle = i < state.hearts ? '#ff5a6e' : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(hx, 40);
    ctx.bezierCurveTo(hx - 12, 26, hx - 22, 34, hx, 48);
    ctx.bezierCurveTo(hx + 22, 34, hx + 12, 26, hx, 40);
    ctx.fill();
  }
  // Pause and mute buttons.
  for (const [zone, label] of [[layout.PAUSE_BTN, 'II'], [layout.MUTE_BTN, '♪']]) {
    ctx.fillStyle = '#3a2418';
    rr(ctx, zone.x, zone.y, zone.w, zone.h, 8);
    ctx.fill();
    ctx.strokeStyle = '#7a5a3a';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, label, zone.x + zone.w / 2, zone.y + zone.h / 2 + 1, 18, '#fff3d6', 800);
  }
}

function drawOrderBoard(ctx, state, input) {
  ctx.fillStyle = '#4a2c14';
  rr(ctx, layout.BOARD.x, layout.BOARD.y, layout.BOARD.w, layout.BOARD.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#2a1a0c';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, '— ORDER BOARD —', layout.BOARD.x + layout.BOARD.w / 2, 100, 15, '#ffb347', 800);
  if (state.orders.length === 0) {
    text(ctx, 'No orders — take a breath!', 194, 200, 15, '#d8c9b8', 600);
    return;
  }
  state.orders.forEach((order, i) => {
    const z = ticketZone(i);
    const hover = input.hoverTicket === i;
    const held = state.hand?.kind === 'dish' && state.hand.recipeId === order.recipeId;
    ctx.save();
    if (state.shake > 0) ctx.translate((Math.random() - 0.5) * 6 * state.shake, 0);
    ctx.fillStyle = held ? '#fff3d6' : hover ? '#f7ead0' : '#fdf6e3';
    rr(ctx, z.x, z.y, z.w, z.h, 8);
    ctx.fill();
    ctx.strokeStyle = held ? '#e33e2b' : '#c9b18a';
    ctx.lineWidth = held ? 3 : 1.5;
    ctx.stroke();
    drawDishIcon(ctx, order.recipeId, z.x + 30, z.y + 25, 40);
    text(ctx, dishShort(order), z.x + 56, z.y + 16, 15, '#2a1a12', 800, 'left');
    const recipe = recipeById(order.recipeId);
    recipe.ingredients.forEach((ingId, j) => {
      drawIngredientIcon(ctx, ingId, z.x + 66 + j * 26, z.y + 36, 26);
    });
    text(ctx, `¢${valueFor(order)}`, z.x + z.w - 14, z.y + 16, 15, '#8a6d1f', 800, 'right');
    // Patience bar.
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    rr(ctx, z.x + 200, z.y + 34, 102, 8, 4);
    ctx.fill();
    ctx.fillStyle = patienceColor(order.patience);
    rr(ctx, z.x + 200, z.y + 34, Math.max(8, 102 * order.patience), 8, 4);
    ctx.fill();
    ctx.restore();
  });
}

function drawBins(ctx, state, input) {
  text(ctx, 'INGREDIENTS — click a bin, or press 1–8', 24, 344, 13, '#ffd9a0', 700, 'left');
  BIN_ORDER.forEach((id, i) => {
    const z = binZone(i);
    const ing = INGREDIENTS[id];
    const hover = input.hoverBin === i;
    const held = state.hand?.kind === 'ingredient' && state.hand.id === id;
    ctx.fillStyle = hover ? '#8a5a30' : '#6b3f1e';
    rr(ctx, z.x, z.y, z.w, z.h, 10);
    ctx.fill();
    ctx.strokeStyle = held ? '#ffd94d' : '#3a2412';
    ctx.lineWidth = held ? 3 : 2;
    ctx.stroke();
    drawIngredientIcon(ctx, id, z.x + z.w / 2, z.y + 38, 52);
    text(ctx, ing.name, z.x + z.w / 2, z.y + 76, 13, '#fff3d6', 700);
    text(ctx, `${i + 1}`, z.x + 10, z.y + 14, 11, '#d8c9b8', 700, 'left');
    if (ing.needsChop) {
      ctx.fillStyle = '#ffb347';
      rr(ctx, z.x + z.w - 34, z.y + 6, 28, 16, 5);
      ctx.fill();
      text(ctx, 'CHOP', z.x + z.w - 20, z.y + 14, 9, '#2a1a12', 800);
    }
  });
}

function drawWorkstations(ctx, state) {
  // Chopping board.
  const b = layout.CHOP_BOARD;
  ctx.fillStyle = '#c9a06a';
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#8a6d3f';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'CHOPPING BOARD', b.x + b.w / 2, b.y + 18, 13, '#5d3a1a', 800);
  if (state.board) {
    drawIngredientIcon(ctx, state.board.id, b.x + b.w / 2, b.y + 78, 64);
    const w = 160;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    rr(ctx, b.x + (b.w - w) / 2, b.y + 118, w, 10, 5);
    ctx.fill();
    ctx.fillStyle = '#2f7d2c';
    rr(ctx, b.x + (b.w - w) / 2, b.y + 118, (w * state.board.chops) / CHOPS_NEEDED, 10, 5);
    ctx.fill();
    text(ctx, `${state.board.chops}/${CHOPS_NEEDED} chops — click or SPACE`, b.x + b.w / 2, b.y + 142, 11, '#5d3a1a', 700);
  } else {
    text(ctx, '— empty —', b.x + b.w / 2, b.y + 78, 15, '#8a6d3f', 600);
    text(ctx, 'click / SPACE to chop', b.x + b.w / 2, b.y + b.h - 14, 11, '#7a5a3a', 600);
  }

  // Wok with flame.
  const wok = layout.WOK;
  const flameH = state.wok.items.length > 0 && !state.wok.burnt ? 26 + Math.sin(Date.now() / 90) * 6 : 10;
  ctx.fillStyle = state.wok.burnt ? '#3a3a3a' : '#ff7a2e';
  ctx.beginPath();
  ctx.moveTo(wok.cx - 62, wok.cy + wok.r - 8);
  ctx.quadraticCurveTo(wok.cx - 30, wok.cy + wok.r - 8 - flameH, wok.cx, wok.cy + wok.r - 4);
  ctx.quadraticCurveTo(wok.cx + 30, wok.cy + wok.r - 8 - flameH, wok.cx + 62, wok.cy + wok.r - 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.arc(wok.cx, wok.cy, wok.r, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = state.wok.burnt ? '#1a1a1a' : '#3d3d3d';
  ctx.beginPath();
  ctx.ellipse(wok.cx, wok.cy, wok.r, wok.r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(wok.cx, wok.cy, wok.r, wok.r * 0.42, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Food in the wok.
  state.wok.items.forEach((item, i) => {
    const dx = (i - (state.wok.items.length - 1) / 2) * 34;
    drawIngredientIcon(ctx, item.id, wok.cx + dx, wok.cy - 4, 44);
  });
  // Cook progress ring.
  if (state.wok.items.length > 0 && !state.wok.done) {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(wok.cx, wok.cy, wok.r + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(wok.cx, wok.cy, wok.r + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * state.wok.cook);
    ctx.stroke();
  }
  // Wok label and hint.
  if (state.wok.burnt) {
    text(ctx, 'BURNT! Click the bin to trash it', wok.cx, wok.cy + wok.r + 26, 14, '#ff6b5e', 800);
  } else if (state.wok.done) {
    const recipe = matchRecipe(state.wok.items.map((i) => i.id));
    text(ctx, recipe ? `${recipe.name} — READY! Click to plate` : 'No recipe — trash it', wok.cx, wok.cy + wok.r + 26, 14, recipe ? '#7ddb8a' : '#ff9d5c', 800);
  } else if (state.wok.items.length > 0) {
    const recipe = closestRecipe(state.wok.items.map((i) => i.id));
    const missing = recipe ? recipe.ingredients.filter((id) => !state.wok.items.some((i) => i.id === id)) : [];
    text(ctx, `WOK — ${recipe ? recipe.name : ''}${missing.length ? ` · needs: ${missing.map((m) => INGREDIENTS[m].name).join(', ')}` : ''}`, wok.cx, wok.cy + wok.r + 26, 13, '#ffd9a0', 700);
  } else {
    text(ctx, 'WOK — click to stir', wok.cx, wok.cy + wok.r + 26, 13, '#d8c9b8', 600);
  }

  // Plate.
  const p = layout.PLATE;
  ctx.fillStyle = '#f4f1e8';
  ctx.beginPath();
  ctx.ellipse(p.cx, p.cy, p.r, p.r * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9bfa8';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (state.plate) {
    drawDishIcon(ctx, state.plate.recipeId, p.cx, p.cy - 6, 96);
    text(ctx, 'READY TO SERVE', p.cx, p.cy + p.r + 22, 14, '#7ddb8a', 800);
    const recipe = recipeById(state.plate.recipeId);
    text(ctx, recipe.name, p.cx, p.cy + p.r + 42, 12, '#d8c9b8', 600);
  } else {
    text(ctx, 'PLATE', p.cx, p.cy, 14, '#b8a88e', 800);
    text(ctx, 'click the wok when a dish is done', p.cx, p.cy + p.r + 22, 12, '#d8c9b8', 600);
  }

  // Trash bin.
  const t = layout.TRASH;
  ctx.fillStyle = '#4a4a52';
  rr(ctx, t.x, t.y, t.w, t.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#2a2a30';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#6a6a72';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(t.x + 28 + i * 30, t.y + 18);
    ctx.lineTo(t.x + 28 + i * 30, t.y + t.h - 34);
    ctx.stroke();
  }
  text(ctx, 'TRASH', t.x + t.w / 2, t.y + t.h - 16, 12, '#d8c9b8', 800);
}

function drawHand(ctx, state, input) {
  if (!state.hand) return;
  const { x, y } = input.mouse;
  if (x < 0) return;
  ctx.save();
  ctx.globalAlpha = 0.95;
  if (state.hand.kind === 'ingredient') {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    drawIngredientIcon(ctx, state.hand.id, x, y, 44);
  } else {
    drawDishIcon(ctx, state.hand.recipeId, x, y, 64);
  }
  ctx.restore();
  const label = state.hand.kind === 'ingredient'
    ? `${INGREDIENTS[state.hand.id].name}${state.hand.chopped ? '' : ' (raw)'}`
    : recipeById(state.hand.recipeId)?.name ?? 'Dish';
  text(ctx, label, x, y + 36, 12, '#fff3d6', 700);
}

function drawPopups(ctx, state) {
  for (const p of state.popups) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - p.t / 1.4);
    text(ctx, p.text, p.x, p.y - p.t * 34, 20, p.color, 800);
    ctx.restore();
  }
  if (state.message && state.messageT > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.messageT);
    ctx.font = `700 14px ${FONT}`;
    const boxW = ctx.measureText(state.message).width + 40;
    ctx.fillStyle = 'rgba(20,10,6,0.85)';
    rr(ctx, 640 - boxW / 2, 296, boxW, 32, 8);
    ctx.fill();
    text(ctx, state.message, 640, 313, 14, '#ffd94d', 700);
    ctx.restore();
  }
}

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, (1 - p.life / p.max) * 0.6);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.6 + p.life / p.max), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(16,8,4,0.72)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'EMBER WOK', 640, 150, 84, '#ffb347', 800);
  text(ctx, 'A RUSH-HOUR WOK KITCHEN', 640, 205, 22, '#ffd94d', 700);
  text(ctx, 'Orders fly in. Chop, toss, stir, plate — and serve before the ticket walks out.', 640, 245, 17, '#fff3d6', 600);
  // How to play card.
  ctx.fillStyle = 'rgba(255,243,214,0.08)';
  rr(ctx, 330, 280, 620, 200, 14);
  ctx.fill();
  ctx.strokeStyle = '#7a5a3a';
  ctx.lineWidth = 2;
  ctx.stroke();
  const steps = [
    ['1', 'Click a bin (or press 1–8) to grab an ingredient'],
    ['2', 'Chop it on the board — 3 chops, SPACE works too'],
    ['3', 'Toss it in the wok, stir to keep the heat even'],
    ['4', 'Plate the dish, then tap its order ticket to serve'],
  ];
  steps.forEach(([n, s], i) => {
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.arc(370, 308 + i * 42, 15, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, n, 370, 309 + i * 42, 16, '#2a1a12', 800);
    text(ctx, s, 396, 308 + i * 42, 16, '#fff3d6', 600, 'left');
  });
  text(ctx, '6 recipes · 3-minute shift · serve fast for tips and combos', 640, 500, 15, '#d8c9b8', 600);
  // Start button.
  const b = layout.START_BTN;
  ctx.fillStyle = '#e33e2b';
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'START SHIFT  ▶', b.x + b.w / 2, b.y + b.h / 2 + 1, 24, '#fff3d6', 800);
  text(ctx, 'or press ENTER', 640, b.y + b.h + 26, 13, '#d8c9b8', 600);
  // Recipe strip.
  RECIPES.forEach((r, i) => {
    const x = 300 + i * 116;
    drawDishIcon(ctx, r.id, x + 48, 648, 56);
    text(ctx, r.short, x + 48, 682, 11, '#d8c9b8', 700);
  });
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(16,8,4,0.7)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'PAUSED', 640, 330, 56, '#fff3d6', 800);
  text(ctx, 'Press P or click II to get back to the wok', 640, 380, 17, '#d8c9b8', 600);
}

function drawOver(ctx, state) {
  ctx.fillStyle = 'rgba(16,8,4,0.78)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'SHIFT OVER', 640, 130, 56, '#ffb347', 800);
  text(ctx, state.endReason, 640, 168, 16, '#fff3d6', 600);
  // Rank badge.
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(640, 250, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a6d1f';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, state.endRank, 640, 252, 56, '#2a1a12', 800);
  const rows = [
    ['Coins earned', `¢${state.coins}`],
    ['Dishes served', `${state.served}`],
    ['Orders lost', `${state.failed}`],
    ['Best combo', `x${state.bestCombo}`],
    ['Thrown away', `${state.trashed}`],
  ];
  rows.forEach(([label, value], i) => {
    const y = 340 + i * 36;
    text(ctx, label, 520, y, 18, '#d8c9b8', 600, 'left');
    text(ctx, value, 760, y, 18, '#fff3d6', 800, 'right');
  });
  const b = layout.RESTART_BTN;
  ctx.fillStyle = '#e33e2b';
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'COOK AGAIN  ▶', b.x + b.w / 2, b.y + b.h / 2 + 1, 22, '#fff3d6', 800);
  text(ctx, 'or press ENTER', 640, b.y + b.h + 26, 13, '#d8c9b8', 600);
}

export function drawScene(ctx, state, input) {
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * 8 * state.shake, (Math.random() - 0.5) * 8 * state.shake);
  }
  drawBackground(ctx);
  drawTopBar(ctx, state);
  if (state.phase === 'title') {
    drawTitle(ctx, state);
  } else {
    drawOrderBoard(ctx, state, input);
    drawBins(ctx, state, input);
    drawWorkstations(ctx, state);
    drawParticles(ctx, state);
    drawHand(ctx, state, input);
    drawPopups(ctx, state);
    if (state.servedFlash > 0) {
      ctx.fillStyle = `rgba(255,217,77,${state.servedFlash * 0.25})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (state.phase === 'paused') drawPaused(ctx);
    if (state.phase === 'over') drawOver(ctx, state);
  }
  ctx.restore();
}
