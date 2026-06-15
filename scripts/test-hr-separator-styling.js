#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const themeCss = fs.readFileSync(path.join(root, 'theme/Liquid-Neon/theme.css'), 'utf8');
const rootCss = fs.readFileSync(path.join(root, 'theme.css'), 'utf8');

function requireIncludes(css, needle, fileLabel) {
  assert(css.includes(needle), `${fileLabel} must include ${needle}`);
}

function requireMatches(css, pattern, fileLabel) {
  assert(pattern.test(css), `${fileLabel} must match ${pattern}`);
}

for (const [css, fileLabel] of [
  [themeCss, 'theme/Liquid-Neon/theme.css'],
  [rootCss, 'theme.css'],
]) {
  for (const selector of [
    '.markdown-rendered hr',
    '.markdown-preview-view hr',
    '.cm-line hr',
    '.cm-hr',
  ]) {
    requireIncludes(css, selector, fileLabel);
  }

  for (const token of ['--ln-cyan', '--ln-magenta']) {
    requireIncludes(css, token, fileLabel);
  }

  requireIncludes(css, 'linear-gradient(90deg', fileLabel);
  requireMatches(css, /box-shadow\s*:/, fileLabel);
  requireIncludes(css, 'hr::after', fileLabel);
  requireMatches(css, /display\s*:\s*none/, fileLabel);
}

console.log('hr-separator-styling: OK');
