#!/usr/bin/env node
/**
 * build-theme.js — Liquid Neon theme builder (SKY-571)
 *
 * Concatenates tokens.css :root{} block at the top of the theme body so the
 * published theme.css is fully self-contained (Obsidian only loads theme.css).
 *
 * Source files:
 *   theme/Liquid-Neon/tokens.css  — source of truth for --ln-* token values
 *   theme/Liquid-Neon/theme.css   — theme rules (may already contain injected block)
 *
 * Output (byte-identical):
 *   theme/Liquid-Neon/theme.css   — Obsidian subdirectory install path
 *   theme.css                     — repo-root community-theme install path (SKY-552)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKENS_SRC  = path.join(ROOT, 'theme/Liquid-Neon/tokens.css');
const THEME_SRC   = path.join(ROOT, 'theme/Liquid-Neon/theme.css');
const THEME_ROOT  = path.join(ROOT, 'theme.css');

const SENTINEL_BEGIN = '/* === LN TOKENS — GENERATED BEGIN (do not edit; run scripts/build-theme.js) === */';
const SENTINEL_END   = '/* === LN TOKENS — GENERATED END === */';

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function extractTokensBlock(tokensContent) {
  // Return the full tokens.css content wrapped in sentinels.
  return [SENTINEL_BEGIN, tokensContent.trim(), SENTINEL_END].join('\n');
}

function stripInjectedBlock(themeContent) {
  const begin = themeContent.indexOf(SENTINEL_BEGIN);
  const end   = themeContent.indexOf(SENTINEL_END);
  if (begin === -1) return themeContent;
  if (end === -1) {
    console.error('ERROR: found SENTINEL_BEGIN but not SENTINEL_END — corrupted theme.css');
    process.exit(1);
  }
  // Strip from the sentinel-begin up through sentinel-end (plus trailing newline)
  const after = themeContent.slice(end + SENTINEL_END.length).replace(/^\n/, '');
  const before = themeContent.slice(0, begin);
  return before + after;
}

function build() {
  const tokensContent = readFile(TOKENS_SRC);
  const rawTheme      = readFile(THEME_SRC);

  const strippedTheme = stripInjectedBlock(rawTheme);
  const injectedBlock = extractTokensBlock(tokensContent);

  const artifact = injectedBlock + '\n' + strippedTheme;

  fs.writeFileSync(THEME_SRC, artifact, 'utf8');
  fs.writeFileSync(THEME_ROOT, artifact, 'utf8');

  const bytes = Buffer.byteLength(artifact, 'utf8');
  console.log(`build-theme: wrote ${bytes.toLocaleString()} bytes`);
  console.log(`  → theme/Liquid-Neon/theme.css`);
  console.log(`  → theme.css`);

  // Verify: count used vs defined --ln-* tokens
  const used    = new Set((artifact.match(/var\(--ln-[\w-]+/g) || []).map(m => m.slice(4)));
  const defined = new Set((artifact.match(/^\s+--ln-[\w-]+(?=\s*:)/gm) || []).map(m => m.trim()));

  const missing = [...used].filter(t => !defined.has(t) && t !== '--ln-glow-*');
  if (missing.length > 0) {
    console.error(`\nWARNING: ${missing.length} token(s) used but not defined:`);
    missing.forEach(t => console.error(`  ${t}`));
  } else {
    console.log(`\nToken check: all ${used.size} used --ln-* tokens are defined. ✓`);
  }
}

build();
