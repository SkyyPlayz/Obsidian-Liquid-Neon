#!/usr/bin/env node
/**
 * build-theme.js — Liquid Neon theme builder (SKY-571, SKY-708)
 *
 * Concatenates tokens.css :root{} block at the top of the theme body so the
 * published theme.css is fully self-contained (Obsidian only loads theme.css).
 * Then minifies the root-level theme.css for smaller delivery.
 *
 * Source files:
 *   theme/Liquid-Neon/tokens.css  — source of truth for --ln-* token values
 *   theme/Liquid-Neon/theme.css   — theme rules (may already contain injected block)
 *
 * Output:
 *   theme/Liquid-Neon/theme.css   — readable merged source (maintainable)
 *   theme.css                     — minified, repo-root community-theme install path
 */

const fs   = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

const ROOT      = path.resolve(__dirname, '..');
const TOKENS_SRC = path.join(ROOT, 'theme/Liquid-Neon/tokens.css');
const THEME_SRC  = path.join(ROOT, 'theme/Liquid-Neon/theme.css');
const THEME_ROOT = path.join(ROOT, 'theme.css');

const SENTINEL_BEGIN = '/* === LN TOKENS — GENERATED BEGIN (do not edit; run scripts/build-theme.js) === */';
const SENTINEL_END   = '/* === LN TOKENS — GENERATED END === */';

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function extractTokensBlock(tokensContent) {
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
  const after = themeContent.slice(end + SENTINEL_END.length).replace(/^\n/, '');
  const before = themeContent.slice(0, begin);
  return before + after;
}

// Minify CSS while preserving "/* @settings" blocks required by Obsidian
// Style Settings plugin. clean-css strips all comments by default (level 2),
// so we extract those blocks first and re-inject them at the top.
function minify(source) {
  const settingsBlocks = [];
  const withoutSettings = source.replace(/\/\* @settings\n[\s\S]*?\*\//g, match => {
    settingsBlocks.push(match);
    return '';
  });

  // level: 1 = safe (strip comments + whitespace); level: 2 merges rules which
  // misparses Obsidian-style font-family values with single-quoted names.
  const result = new CleanCSS({ level: 1 }).minify(withoutSettings);
  if (result.errors.length) {
    console.error('clean-css errors:', result.errors);
    process.exit(1);
  }
  if (result.warnings.length) {
    result.warnings.forEach(w => console.warn('  warning:', w));
  }

  return settingsBlocks.join('\n') + (settingsBlocks.length ? '\n' : '') + result.styles;
}

function build() {
  const tokensContent = readFile(TOKENS_SRC);
  const rawTheme      = readFile(THEME_SRC);

  const strippedTheme = stripInjectedBlock(rawTheme);
  const injectedBlock = extractTokensBlock(tokensContent);
  const artifact      = injectedBlock + '\n' + strippedTheme;

  // Write readable merged source to the theme subfolder (for editing/review)
  fs.writeFileSync(THEME_SRC, artifact, 'utf8');

  // Write minified output to repo root (what Obsidian loads)
  const minified = minify(artifact);
  fs.writeFileSync(THEME_ROOT, minified, 'utf8');

  const srcBytes = Buffer.byteLength(artifact, 'utf8');
  const minBytes = Buffer.byteLength(minified, 'utf8');
  const pct      = ((1 - minBytes / srcBytes) * 100).toFixed(1);

  console.log(`build-theme: source ${srcBytes.toLocaleString()} bytes → minified ${minBytes.toLocaleString()} bytes (${pct}% reduction)`);
  console.log(`  → theme/Liquid-Neon/theme.css  (readable source)`);
  console.log(`  → theme.css                    (minified)`);

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
