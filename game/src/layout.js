// Ember Wok Kitchen — one source of truth for every hit zone and draw position.
// input.js and render.js both read these, so a click always lands where it looks.

export const W = 1280;
export const H = 720;

export const TOP_BAR = { x: 0, y: 0, w: 1280, h: 64 };
export const MUTE_BTN = { x: 1216, y: 12, w: 52, h: 40 };
export const PAUSE_BTN = { x: 1152, y: 12, w: 52, h: 40 };

// Order tickets: a wooden rail at the top left, tickets stacked below it.
export const BOARD = { x: 24, y: 80, w: 340, h: 248 };
export function ticketZone(i) {
  return { x: 36, y: 118 + i * 56, w: 316, h: 50 };
}

// Ingredient bins on the counter, eight across.
export const BIN_ROW = { y: 356, h: 104 };
export function binZone(i) {
  return { x: 24 + i * 104, y: BIN_ROW.y, w: 96, h: BIN_ROW.h };
}

// Workstations along the bottom.
export const CHOP_BOARD = { x: 60, y: 500, w: 250, h: 160 };
export const WOK = { cx: 640, cy: 588, r: 92 };
export const WOK_ZONE = { x: 548, y: 496, w: 184, h: 164 };
export const PLATE = { cx: 990, cy: 588, r: 78 };
export const PLATE_ZONE = { x: 912, y: 510, w: 156, h: 156 };
export const TRASH = { x: 1120, y: 516, w: 116, h: 144 };

// Title and results screens.
export const START_BTN = { x: 490, y: 520, w: 300, h: 64 };
export const RESTART_BTN = { x: 490, y: 560, w: 300, h: 64 };

export function inside(zone, x, y) {
  return x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h;
}

export function insideCircle(cx, cy, r, x, y) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}
