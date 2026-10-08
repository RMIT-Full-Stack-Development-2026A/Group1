// Rebuilds src/assets/fonts/material-symbols.woff2: a Material Symbols font that contains ONLY the icons the app
// uses (about 25 KB instead of the full 1.1 MB set).
//
// Run it after adding or renaming an icon:    npm run icons:update
//
// How it works: it takes every word-like string literal in src/ (e.g. 'chat_bubble_outline', "close", icon: "home"),
// keeps the ones that are real Material Symbols names (checked against Google's published icon list), asks Google
// Fonts for a font containing just those, and saves it. Extra words that happen to be icon names (like "circle")
// only add a few hundred bytes. An icon that is missing from the font shows up as its raw name (for example the
// text "chat_bubble_outline"), which is why this exists.
//
// Needs network access and Node 18+.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'src');
const OUT = join(SRC, 'assets', 'fonts', 'material-symbols.woff2');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const candidates = new Set();
for (const file of walk(SRC).filter((f) => /\.(jsx?|tsx?)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/["'`]([a-z][a-z0-9_]*)["'`]/g)) candidates.add(m[1]);
  for (const m of text.matchAll(/>\s*([a-z][a-z0-9_]+)\s*</g)) candidates.add(m[1]);
}

const metaResponse = await fetch('https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true');
if (!metaResponse.ok) throw new Error(`Could not fetch the icon list (HTTP ${metaResponse.status})`);
const meta = JSON.parse((await metaResponse.text()).replace(/^\)\]\}'\s*/, ''));
const valid = new Set(meta.icons.map((icon) => icon.name));

const icons = [...candidates].filter((name) => valid.has(name)).sort();
console.log(`${icons.length} icons found in src/: ${icons.join(', ')}`);

const cssUrl =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1' +
  `&icon_names=${icons.join(',')}&display=block`;
const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
const fontUrl = css.match(/url\((https:[^)]+)\)/)?.[1];
if (!fontUrl) throw new Error('Google Fonts did not return a font file:\n' + css.slice(0, 300));

const font = Buffer.from(await (await fetch(fontUrl)).arrayBuffer());
writeFileSync(OUT, font);
console.log(`Wrote ${OUT} (${(font.length / 1024).toFixed(1)} KB)`);
