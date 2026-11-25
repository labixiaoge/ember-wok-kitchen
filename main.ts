// Ember Wok Kitchen — the entry program (Node 22, standard library only).
// It hands the game in: copy game/ and screenshots/ beside this file into
// /output (or $MAKEFUN_OUTPUT_DIR outside the grader) and write the dossier
// the judge reads, with the vendored make.fun library.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//   Serve game/ locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps (see the kit's RULES.txt): the dossier text is capped at
// 160 KiB, at most 4 screenshots of 256 KiB each, game/ at most 993 files and
// 48 MiB in all. game/, screenshots/ and dossier.json share /output's own
// cap of 1,000 entries and 64 MiB, so the entry stays well inside them.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// One line on stdout so a local run shows what was handed in; the grader
// reads /output, never this line.
console.log(`Ember Wok Kitchen handed in to ${out}`);
