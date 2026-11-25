// Ember Wok Kitchen — recipes, ingredients and tuning.
// Every dish is an original recipe invented for this game.

export const SHIFT_SECONDS = 180;
export const MAX_ORDERS = 4;
export const MAX_HEARTS = 3;
export const BURN_SECONDS = 9;

export const INGREDIENTS = {
  noodle:   { id: 'noodle',   name: 'Noodles',  color: '#f2c94c', dark: '#c99a1e', needsChop: false, price: 2 },
  egg:      { id: 'egg',      name: 'Egg',      color: '#fff3d6', dark: '#f0a13a', needsChop: false, price: 2 },
  rice:     { id: 'rice',     name: 'Rice',     color: '#fdf6e3', dark: '#d8c9a3', needsChop: false, price: 2 },
  shrimp:   { id: 'shrimp',   name: 'Shrimp',   color: '#ff9d76', dark: '#e56b45', needsChop: false, price: 4 },
  greens:   { id: 'greens',   name: 'Greens',   color: '#5fbf4d', dark: '#2f7d2c', needsChop: true,  price: 2 },
  chili:    { id: 'chili',    name: 'Chili',    color: '#e33e2b', dark: '#9e1f10', needsChop: true,  price: 2 },
  chicken:  { id: 'chicken',  name: 'Chicken',  color: '#f6c89f', dark: '#c98a4b', needsChop: true,  price: 4 },
  mushroom: { id: 'mushroom', name: 'Mushroom', color: '#e8dcc8', dark: '#a08b62', needsChop: true,  price: 3 },
};

// The order of the bins on the counter, left to right. Keys 1-8 pick them.
export const BIN_ORDER = ['noodle', 'egg', 'rice', 'shrimp', 'greens', 'chili', 'chicken', 'mushroom'];

export const RECIPES = [
  {
    id: 'golden-egg-noodles', name: 'Golden Egg Noodles', short: 'Egg Noodles',
    ingredients: ['noodle', 'egg'], base: 10, cookTime: 6, color: '#f2c94c',
  },
  {
    id: 'fiery-chili-egg', name: 'Fiery Chili Egg', short: 'Chili Egg',
    ingredients: ['egg', 'chili'], base: 9, cookTime: 5, color: '#e33e2b',
  },
  {
    id: 'garden-stir-fry', name: 'Garden Stir-Fry', short: 'Stir-Fry',
    ingredients: ['greens', 'mushroom'], base: 9, cookTime: 5, color: '#5fbf4d',
  },
  {
    id: 'chili-chicken-rice', name: 'Chili Chicken Rice', short: 'Chicken Rice',
    ingredients: ['rice', 'chicken', 'chili'], base: 14, cookTime: 8, color: '#e07b39',
  },
  {
    id: 'shrimp-noodle-bowl', name: 'Shrimp Noodle Bowl', short: 'Shrimp Noodles',
    ingredients: ['noodle', 'shrimp', 'greens'], base: 15, cookTime: 8, color: '#ff9d76',
  },
  {
    id: 'chicken-mushroom-rice', name: 'Chicken Mushroom Rice', short: 'Shroom Rice',
    ingredients: ['rice', 'chicken', 'mushroom'], base: 14, cookTime: 8, color: '#d9a066',
  },
];

export const CHOPS_NEEDED = 3;

// Order spawn timing: starts slow, the kitchen gets busier as the shift goes on.
export function spawnIntervalAt(elapsedSeconds) {
  const t = Math.min(1, elapsedSeconds / SHIFT_SECONDS);
  return 13 - 6 * t; // 13s early, 7s late
}

export function patienceAt(elapsedSeconds) {
  const t = Math.min(1, elapsedSeconds / SHIFT_SECONDS);
  return 48 - 14 * t; // 48s early, 34s late
}

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) ?? null;
}

export function ingredientById(id) {
  return INGREDIENTS[id] ?? null;
}

// The recipe whose ingredient set matches the wok, or null.
export function matchRecipe(ingredientIds) {
  const have = [...ingredientIds].sort().join(',');
  return RECIPES.find((r) => [...r.ingredients].sort().join(',') === have) ?? null;
}

// Closest recipe to what is in the wok, for the hint line under the wok.
export function closestRecipe(ingredientIds) {
  let best = null;
  let bestScore = -1;
  for (const r of RECIPES) {
    const overlap = r.ingredients.filter((i) => ingredientIds.includes(i)).length;
    const extra = ingredientIds.filter((i) => !r.ingredients.includes(i)).length;
    const score = overlap * 2 - extra * 3 - Math.abs(r.ingredients.length - ingredientIds.length);
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  return best;
}
