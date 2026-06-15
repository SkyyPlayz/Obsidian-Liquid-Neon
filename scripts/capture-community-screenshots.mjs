#!/usr/bin/env node
/**
 * Capture v0.2.0 community listing screenshots for Liquid Neon.
 * Targets: hero.png, nav-hover.png, graph-view.png, style-settings.png
 * Output:  docs/screenshots/ (relative to repo root)
 *
 * Usage: node scripts/capture-community-screenshots.mjs
 * Requires: playwright-core in node_modules, Xvfb, Obsidian 1.6.7 AppImage
 */

import { _electron as electron } from 'playwright-core';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SHOT_DIR = path.join(REPO_ROOT, 'docs', 'screenshots');
// Use the pre-extracted AppImage binary to avoid FUSE mount latency in WSL2.
// Extract with: cd /tmp && Obsidian-1.6.7.AppImage --appimage-extract
const OBSIDIAN_BIN = '/tmp/squashfs-root/obsidian';
const VAULT_PATH = '/home/skyy/obsidian-test-vaults/v1.6.7';
const DISPLAY = ':99';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startXvfb() {
  const xvfb = spawn('Xvfb', [DISPLAY, '-screen', '0', '1440x900x24'], {
    detached: true,
    stdio: 'ignore',
  });
  xvfb.unref();
  await sleep(2000);
  console.log('✓ Xvfb started on', DISPLAY);
  return xvfb;
}

async function waitForSelector(page, selector, timeout = 15000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  console.log('Launching Obsidian to capture v0.2.0 community screenshots…');
  console.log('Output directory:', SHOT_DIR);

  await startXvfb();

  let app;
  try {
    app = await electron.launch({
      executablePath: OBSIDIAN_BIN,
      args: [VAULT_PATH, '--no-sandbox'],
      env: { ...process.env, DISPLAY },
      timeout: 45_000,
    });
  } catch (err) {
    console.error('✗ Failed to launch Obsidian:', err.message);
    process.exit(1);
  }

  // Wait for the main window
  await sleep(6000);
  const page = app.windows().find((w) => !w.url().startsWith('devtools://'))
    ?? await app.firstWindow();

  console.log('✓ Obsidian launched');

  // Wait for workspace to be ready
  const wsReady = await waitForSelector(page, '.workspace', 20000);
  if (!wsReady) console.warn('⚠ Workspace did not fully appear — continuing anyway');
  await sleep(2000);

  // ── HERO SHOT ──────────────────────────────────────────────────────────────
  // Open Story World.md to show a linked document in the editor
  console.log('\nCapturing hero.png…');
  try {
    // Use command palette to open a note
    await page.keyboard.press('Control+o');
    await sleep(800);
    await page.keyboard.type('Story World');
    await sleep(600);
    await page.keyboard.press('Enter');
    await sleep(2500);
  } catch {
    console.warn('⚠ Could not open note via quick-switcher');
  }
  await page.screenshot({ path: path.join(SHOT_DIR, 'hero.png') });
  console.log('✓ hero.png saved');

  // ── NAV-HOVER SHOT ─────────────────────────────────────────────────────────
  // Hover over a file in the nav pane to trigger the neon-frame
  console.log('\nCapturing nav-hover.png…');
  try {
    // Make sure file explorer is visible
    await page.keyboard.press('Control+Shift+e');
    await sleep(800);

    // Hover over a nav-file-title item to trigger :hover state
    const navFile = page.locator('.nav-file-title').first();
    if (await navFile.isVisible({ timeout: 5000 })) {
      await navFile.hover({ force: true });
      await sleep(400);
    }
  } catch {
    console.warn('⚠ Could not hover nav file item');
  }
  await page.screenshot({ path: path.join(SHOT_DIR, 'nav-hover.png') });
  console.log('✓ nav-hover.png saved');

  // Un-hover
  await page.mouse.move(720, 450);
  await sleep(300);

  // ── GRAPH VIEW ─────────────────────────────────────────────────────────────
  console.log('\nCapturing graph-view.png…');
  try {
    await page.keyboard.press('Control+Shift+g');
    await sleep(4000); // Graph needs time to render nodes
    const graphReady = await waitForSelector(page, '.graph-view', 10000);
    if (!graphReady) console.warn('⚠ Graph canvas selector not found');
    await sleep(1500);
  } catch {
    console.warn('⚠ Could not open graph view');
  }
  await page.screenshot({ path: path.join(SHOT_DIR, 'graph-view.png') });
  console.log('✓ graph-view.png saved');

  // Close graph view
  await page.keyboard.press('Escape');
  await sleep(600);

  // ── STYLE SETTINGS (APPEARANCE SETTINGS) ──────────────────────────────────
  console.log('\nCapturing style-settings.png (Obsidian Appearance panel)…');
  try {
    await page.keyboard.press('Control+,');
    await sleep(2000);

    // Navigate to Appearance tab
    const appearanceTab = page.locator('[data-id="appearance"]');
    if (await appearanceTab.isVisible({ timeout: 5000 })) {
      await appearanceTab.click();
      await sleep(1500);
    } else {
      // Fallback: look for tab by text
      const tabByText = page.locator('.vertical-tab-nav-item', { hasText: 'Appearance' });
      if (await tabByText.isVisible({ timeout: 3000 })) {
        await tabByText.click();
        await sleep(1500);
      }
    }
  } catch {
    console.warn('⚠ Could not open Appearance settings');
  }
  await page.screenshot({ path: path.join(SHOT_DIR, 'style-settings.png') });
  console.log('✓ style-settings.png saved');

  await app.close().catch(() => {});

  // Verify outputs
  console.log('\n── Results ──');
  const expected = ['hero.png', 'nav-hover.png', 'graph-view.png', 'style-settings.png'];
  let allOk = true;
  for (const name of expected) {
    const fpath = path.join(SHOT_DIR, name);
    const exists = fs.existsSync(fpath);
    const size = exists ? fs.statSync(fpath).size : 0;
    const ok = exists && size > 10000;
    console.log(`  ${ok ? '✓' : '✗'} ${name} (${size} bytes)`);
    if (!ok) allOk = false;
  }

  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
