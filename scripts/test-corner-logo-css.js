#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'theme/Liquid-Neon/theme.css');
const css = fs.readFileSync(sourcePath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function rulesWith(selectorFragment, bodyPattern) {
  const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
  const matches = [];
  let match;
  while ((match = rulePattern.exec(css)) !== null) {
    const selectors = match[1].trim();
    const body = match[2];
    if (selectors.includes(selectorFragment) && bodyPattern.test(body)) {
      matches.push(selectors);
    }
  }
  return matches;
}

const logoHideSelectors = rulesWith('svg.logo-full', /display\s*:\s*none\s*;?/i);
assert(
  logoHideSelectors.length > 0,
  'Expected native Obsidian logo svg.logo-full to be hidden by the theme.'
);

const hidesInHiddenFrameless = logoHideSelectors.some((selectors) =>
  selectors
    .split(',')
    .map((selector) => selector.trim())
    .some((selector) => {
      if (selector.includes(':not(.is-hidden-frameless)')) return false;
      return (
        selector === 'svg.logo-full' ||
        selector === 'body svg.logo-full' ||
        selector.includes('.is-hidden-frameless')
      );
    })
);

assert(
  hidesInHiddenFrameless,
  `Expected svg.logo-full to be hidden in is-hidden-frameless mode too; found only: ${logoHideSelectors.join(' | ')}`
);

const hiddenFramelessToggleRules = rulesWith(
  '.is-hidden-frameless .sidebar-toggle-button.mod-left>.clickable-icon',
  /background-image\s*:\s*var\(--New-Obsidiantoggle\)/i
);
assert(
  hiddenFramelessToggleRules.length > 0,
  'Expected hidden-frameless sidebar toggle to render the themed Obsidian logo background.'
);

console.log('corner-logo css checks passed');
