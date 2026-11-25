// Ember Wok Kitchen — order tickets: what a ticket is worth and how urgent it looks.
// Pure helpers, so the board renderer and the serving rules always agree.

import { recipeById } from './config.js';

export function tipFor(order) {
  const recipe = recipeById(order.recipeId);
  if (!recipe) return 0;
  return Math.round(recipe.base * 0.5 * Math.max(0, order.patience));
}

export function valueFor(order) {
  const recipe = recipeById(order.recipeId);
  if (!recipe) return 0;
  return recipe.base + tipFor(order);
}

export function dishName(order) {
  const recipe = recipeById(order.recipeId);
  return recipe ? recipe.name : 'Unknown dish';
}

export function dishShort(order) {
  const recipe = recipeById(order.recipeId);
  return recipe ? recipe.short : '?';
}

// Patience bar colour: green while calm, amber while hurried, red when about to walk.
export function patienceColor(patience) {
  if (patience > 0.5) return '#58b368';
  if (patience > 0.25) return '#f2a93b';
  return '#e33e2b';
}

export function isUrgent(order) {
  return order.patience <= 0.25;
}
