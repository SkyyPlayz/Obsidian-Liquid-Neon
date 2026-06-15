#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const files = [
  'theme/Liquid-Neon/tokens.css',
  'theme/Liquid-Neon/theme.css',
  'theme.css',
];

const requiredBindings = new Map([
  ['--ln-cyan', '--LN-color-cyan'],
  ['--ln-violet', '--LN-color-violet'],
  ['--ln-magenta', '--LN-color-magenta'],
  ['--ln-graph-node', '--LN-graph-node'],
  ['--ln-graph-node-focused', '--LN-graph-node-focused'],
  ['--ln-graph-node-tag', '--LN-graph-node-tag'],
  ['--ln-graph-node-attachment', '--LN-graph-node-attachment'],
  ['--ln-graph-node-unresolved', '--LN-graph-node-unresolved'],
  ['--ln-graph-line', '--LN-graph-line'],
]);

function declarationValue(css, property) {
  const pattern = new RegExp(`${property.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*:\\s*([^;]+);`);
  const match = css.match(pattern);
  return match && match[1].trim();
}

for (const relativePath of files) {
  const css = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const [token, styleSettingsVar] of requiredBindings) {
    const value = declarationValue(css, token);
    assert(value, `${relativePath} must define ${token}`);
    assert(
      value.includes(`var(${styleSettingsVar},`),
      `${relativePath} ${token} must read ${styleSettingsVar}; got ${value}`,
    );
  }
}

const readableTheme = fs.readFileSync(path.join(root, 'theme/Liquid-Neon/theme.css'), 'utf8');
for (const graphToken of [
  '--ln-graph-node',
  '--ln-graph-node-focused',
  '--ln-graph-node-tag',
  '--ln-graph-node-attachment',
  '--ln-graph-node-unresolved',
  '--ln-graph-line',
]) {
  const obsidianVar = graphToken.replace('--ln-', '--');
  assert(
    readableTheme.includes(`${obsidianVar}:`) && readableTheme.includes(`var(${graphToken})`),
    `theme/Liquid-Neon/theme.css must feed ${graphToken} into ${obsidianVar}`,
  );
}

console.log('style-settings-bindings: OK');
