# Ember Wok — a rush-hour wok kitchen

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/labixiaoge/ember-wok-kitchen/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/labixiaoge/ember-wok-kitchen/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

An original timed cooking game for the [make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137) ($250 prize pool).

## About

You run a street-food wok stall at rush hour. Order tickets fly onto the board,
each with a patience bar that drains while it waits. Grab ingredients from the
counter, chop what needs chopping, toss it all in the wok, stir to keep the
heat even, plate the dish and tap its ticket to serve — before the customer
walks out. Serve fast for tips, chain serves into combos, and don't let the
wok burn. One 3-minute shift, 6 original recipes, 8 ingredients.

Everything is drawn on canvas and every sound is synthesized with WebAudio:
no image, audio or font files, no network requests, no libraries.

## How to play

- **Mouse:** click a bin to grab an ingredient, the board to chop, the wok to
  toss in / stir / plate, the plate to pick a dish up, a ticket to serve it.
- **Keys:** `1–8` grab an ingredient · `SPACE` chop / stir · `ENTER` serve the
  dish in hand to its ticket · `P` pause · `M` mute · `Backspace` trash.
- **Recipes:** Golden Egg Noodles, Fiery Chili Egg, Garden Stir-Fry,
  Chili Chicken Rice, Shrimp Noodle Bowl, Chicken Mushroom Rice.

## Run it

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

Open `game/index.html` in desktop Chrome, or serve `game/` with any static
server. The hand-in program is `main.ts` (Node 22, standard library only):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `game/index.html` — the page; `game/css/kitchen.css` — page chrome
- `game/src/config.js` — recipes, ingredients, tuning
- `game/src/kitchen.js` — state, orders, wok, board, serving rules
- `game/src/render.js` — all canvas drawing (kitchen, board, wok, tickets)
- `game/src/input.js` — mouse and keyboard
- `game/src/orders.js` — ticket value, tip and patience helpers
- `game/src/audio.js` — synthesized WebAudio sounds
- `game/src/shots.js` — deterministic scenes for screenshots (`?shot=`)
- `game/src/layout.js` — every hit zone and draw position
- `game/src/main.js` — game loop and wiring
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — real renders of the game's own code
