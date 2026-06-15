#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'theme/Liquid-Neon/theme.css'), 'utf8');
const built = fs.readFileSync(path.join(root, 'theme.css'), 'utf8');

function requireIncludes(css, needle, fileLabel) {
  assert(css.includes(needle), `${fileLabel} must include ${needle}`);
}

function requireMatches(css, pattern, fileLabel) {
  assert(pattern.test(css), `${fileLabel} must match ${pattern}`);
}

for (const [css, fileLabel] of [
  [source, 'theme/Liquid-Neon/theme.css'],
  [built, 'theme.css'],
]) {
  for (const selector of [
    '.titlebar',
    '.titlebar-inner',
    '.workspace-tabs.mod-top .workspace-tab-header-container',
    '.workspace-tabs.mod-top.mod-top-left-space .workspace-tab-header-container',
    '.workspace-tabs.mod-top.mod-top-right-space .workspace-tab-header-container',
    '.mod-root .workspace-tabs.mod-top .workspace-tab-header-container-inner',
    '.tab-bar',
  ]) {
    requireIncludes(css, selector, fileLabel);
  }

  requireIncludes(css, '--ln-topbar-glass-bg', fileLabel);
  requireIncludes(css, '--ln-topbar-glass-bg-focused', fileLabel);
  requireMatches(css, /background(?:-color)?\s*:\s*var\(--ln-topbar-glass-bg\)/, fileLabel);
  requireMatches(css, /backdrop-filter\s*:\s*blur\(var\(--ln-blur-sm\)\)\s*saturate\(var\(--ln-saturate-reduced\)\)/, fileLabel);
  requireMatches(css, /body\.is-focused\s+\.titlebar/, fileLabel);
}

console.log('topbar-glass-styling: OK');
