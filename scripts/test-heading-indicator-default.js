#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'theme/Liquid-Neon/theme.css'), 'utf8');
const built = fs.readFileSync(path.join(root, 'theme.css'), 'utf8');

const setting = source.match(/id:\s*mini-header-hide[\s\S]*?default:\s*(true|false)/);
assert(setting, 'Style Settings must define mini-header-hide');
assert.strictEqual(
  setting[1],
  'false',
  'Header indication must default off so headings render without H1/H2-style prefixes',
);

assert(
  !/content:\s*['"]HH['"]/.test(source),
  'Readable theme must not emit a fallback HH heading prefix',
);
assert(
  !/content:\s*['"]HH['"]/.test(built),
  'Built theme must not emit a fallback HH heading prefix',
);

for (const level of [1, 2, 3, 4, 5, 6]) {
  const indicator = new RegExp(`\\.mini-header-hide[^{]+::before\\s*\\{[^}]*content:\\s*['"]H${level}['"]`, 's');
  assert(
    indicator.test(source),
    `Optional H${level} indicator should remain gated behind .mini-header-hide`,
  );
}

console.log('heading-indicator-default: OK');
