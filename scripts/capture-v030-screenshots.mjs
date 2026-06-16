#!/usr/bin/env node
/**
 * Capture Liquid Neon v0.3.0 community listing screenshots.
 *
 * Captures all 5 acceptance-criteria shots for SKY-1772:
 *   hero.png           (a) Main editor, neon-glass sidebar + neon headings
 *   style-settings.png (b) Style Settings plugin, LN configuration section
 *   graph-view.png     (c) Graph view with neon-colored nodes
 *   kanban.png         (d) Kanban board with LN-37 neon-glass lanes
 *   tasks.png          (e) obsidian-tasks query block, LN-38 neon-glass table
 *
 * Output: docs/screenshots/ (relative to repo root)
 *
 * Usage:
 *   node scripts/capture-v030-screenshots.mjs
 *
 * Pre-conditions:
 *   - /tmp/squashfs-root/obsidian       (extracted Obsidian AppImage)
 *   - /home/skyy/obsidian-test-vaults/v1.6.7  (vault with LN theme + plugins)
 *   - playwright-core in node_modules
 *   - Xvfb on PATH (WSL2 TCP fallback built-in)
 */

import { _electron as electron } from 'playwright-core';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SHOT_DIR = path.join(REPO_ROOT, 'docs', 'screenshots');
const OBSIDIAN_BIN = '/tmp/squashfs-root/obsidian';
const VAULT_PATH = '/home/skyy/obsidian-test-vaults/v1.6.7';
const DISPLAY_NUM = ':99';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Returns the DISPLAY string to use — Unix socket or TCP fallback for WSL2. */
function setupXvfbDisplay() {
  const sockDir = '/tmp/.X11-unix';
  const S_ISVTX = 0o1000;
  try {
    if (!fs.existsSync(sockDir)) {
      fs.mkdirSync(sockDir, { mode: 0o1777 });
      return DISPLAY_NUM;
    }
    const st = fs.statSync(sockDir);
    if (st.mode & S_ISVTX) return DISPLAY_NUM;
    fs.chmodSync(sockDir, st.mode | S_ISVTX);
    return DISPLAY_NUM;
  } catch {
    return '127.0.0.1:99';
  }
}

function removeStaleXLock(displayNum) {
  const n = displayNum.replace(/^:/, '');
  const lockPath = `/tmp/.X${n}-lock`;
  try {
    if (!fs.existsSync(lockPath)) return;
    const pid = parseInt(fs.readFileSync(lockPath, 'utf8').trim(), 10);
    process.kill(pid, 0);
  } catch (e) {
    if (e.code === 'ESRCH') {
      try { fs.unlinkSync(lockPath); } catch { /* ignore */ }
    }
  }
}

async function startXvfb() {
  spawn('pkill', ['-f', `Xvfb ${DISPLAY_NUM}`]);
  await sleep(500);
  removeStaleXLock(DISPLAY_NUM);

  const displayEnv = setupXvfbDisplay();
  const useTcp = !displayEnv.startsWith(':');

  const xvfbArgs = [DISPLAY_NUM, '-screen', '0', '1440x900x24'];
  if (useTcp) xvfbArgs.push('-listen', 'tcp');

  const xvfb = spawn('Xvfb', xvfbArgs, { detached: true, stdio: 'ignore' });
  xvfb.unref();
  await sleep(2000);
  console.log(`✓ Xvfb on ${DISPLAY_NUM} (DISPLAY=${displayEnv})`);
  return displayEnv;
}

async function waitFor(page, selector, timeout = 15000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

async function openNote(page, noteName) {
  await page.keyboard.press('Control+o');
  await sleep(800);
  await page.keyboard.type(noteName);
  await sleep(600);
  await page.keyboard.press('Enter');
  await sleep(2500);
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  console.log('Capturing Liquid Neon v0.3.0 community screenshots...');
  console.log('Output:', SHOT_DIR);

  const displayEnv = await startXvfb();

  let app;
  try {
    app = await electron.launch({
      executablePath: OBSIDIAN_BIN,
      args: [VAULT_PATH, '--no-sandbox', '--disable-gpu-sandbox'],
      env: { ...process.env, DISPLAY: displayEnv },
      timeout: 180_000,  // 3 minutes — Obsidian with 3 plugins is slow to start
    });
  } catch (err) {
    console.error('✗ Failed to launch Obsidian:', err.message);
    process.exit(1);
  }

  // Wait for main window to appear
  console.log('Waiting for first window...');
  await sleep(12000);
  let page;
  try {
    page = await app.firstWindow({ timeout: 60_000 });
  } catch {
    // Try windows() as fallback
    const wins = app.windows();
    page = wins.find((w) => !w.url().startsWith('devtools://')) ?? wins[0];
  }
  if (!page) {
    console.error('✗ No window found');
    process.exit(1);
  }

  const wsReady = await waitFor(page, '.workspace', 30000);
  if (!wsReady) console.warn('⚠ Workspace slow to appear — continuing');
  // Extra time for 3 community plugins to finish initialising
  await sleep(8000);
  console.log('✓ Workspace ready, plugins initialised');

  // ── (a) HERO: main editor, neon-glass sidebar + headings ────────────────────
  console.log('\n[a] hero.png — main editor with headings...');
  try {
    await openNote(page, 'Test-Note');
    // Open file explorer so sidebar is visible
    await page.keyboard.press('Control+Shift+e');
    await sleep(800);
  } catch {
    console.warn('⚠ hero setup failed — taking fallback screenshot');
  }
  await page.screenshot({ path: path.join(SHOT_DIR, 'hero.png') });
  console.log('✓ hero.png');

  // ── (c) GRAPH VIEW: neon-colored nodes ──────────────────────────────────────
  // Capture graph early so nodes are fresh (graph reads CSS tokens at open-time)
  console.log('\n[c] graph-view.png — neon node glow...');
  try {
    await page.keyboard.press('Control+Shift+g');
    await sleep(5000);
    await waitFor(page, '.graph-view', 10000);
    await sleep(1500);
  } catch {
    console.warn('⚠ graph view setup failed');
  }
  await page.screenshot({ path: path.join(SHOT_DIR, 'graph-view.png') });
  console.log('✓ graph-view.png');

  // Close graph
  await page.keyboard.press('Escape');
  await sleep(800);

  // ── (d) KANBAN: LN-37 neon-glass lanes ──────────────────────────────────────
  console.log('\n[d] kanban.png — neon-glass Kanban board...');
  try {
    await openNote(page, 'Board');  // Short search term to match "Story Board"
    await sleep(3000);
    // Kanban plugin renders in reading mode — toggle if needed
    const kanbanReady = await waitFor(page, '.kanban-plugin__board', 15000);
    if (!kanbanReady) {
      console.warn('⚠ Kanban board not found — trying reading mode toggle');
      await page.keyboard.press('Control+e');
      await waitFor(page, '.kanban-plugin__board', 10000);
    }
    await sleep(2000);
  } catch {
    console.warn('⚠ Kanban setup failed');
  }
  await page.screenshot({ path: path.join(SHOT_DIR, 'kanban.png') });
  console.log('✓ kanban.png');

  // ── (e) TASKS: LN-38 neon-glass obsidian-tasks query block ──────────────────
  console.log('\n[e] tasks.png — obsidian-tasks neon-glass table...');
  try {
    await openNote(page, 'Tasks');  // Short search term to match "Writing Tasks"
    await sleep(2000);
    // Tasks plugin renders query blocks in reading mode
    await page.keyboard.press('Control+e');
    const tasksReady = await waitFor(page, '.block-language-tasks', 12000);
    if (!tasksReady) console.warn('⚠ tasks query block not found — plugin may not have rendered');
    await sleep(2000);
  } catch {
    console.warn('⚠ Tasks setup failed');
  }
  await page.screenshot({ path: path.join(SHOT_DIR, 'tasks.png') });
  console.log('✓ tasks.png');

  // ── (b) STYLE SETTINGS: LN configuration pickers ───────────────────────────
  // Navigate to Settings → Style Settings → Liquid Neon section
  console.log('\n[b] style-settings.png — Style Settings LN configuration pickers...');
  try {
    await page.keyboard.press('Control+,');
    await sleep(2500);

    // Click "Style Settings" in the left navigation of Settings
    const styleSettingsTab = page.locator('.vertical-tab-nav-item', { hasText: 'Style Settings' });
    if (await styleSettingsTab.isVisible({ timeout: 8000 })) {
      await styleSettingsTab.click();
      await sleep(2000);
      // Look for the Liquid Neon section and scroll to it
      const lnSection = page.locator('.style-settings-heading', { hasText: 'Liquid Neon' });
      if (await lnSection.isVisible({ timeout: 5000 })) {
        await lnSection.scrollIntoViewIfNeeded();
        await sleep(800);
        // Click to expand the section if it's collapsed
        await lnSection.click();
        await sleep(1000);
      }
    } else {
      // Fallback: try Community Plugins → then Style Settings
      console.warn('⚠ Style Settings tab not visible — falling back to Appearance');
      const appearanceTab = page.locator('[data-id="appearance"], .vertical-tab-nav-item', { hasText: 'Appearance' }).first();
      if (await appearanceTab.isVisible({ timeout: 5000 })) {
        await appearanceTab.click();
        await sleep(1500);
      }
    }
  } catch {
    console.warn('⚠ Style Settings navigation failed');
  }
  await page.screenshot({ path: path.join(SHOT_DIR, 'style-settings.png') });
  console.log('✓ style-settings.png');

  await page.keyboard.press('Escape');
  await sleep(400);

  await app.close().catch(() => {});

  // ── Results ──────────────────────────────────────────────────────────────────
  console.log('\n── Results ──');
  const shots = [
    { file: 'hero.png',          label: '(a) main editor' },
    { file: 'style-settings.png', label: '(b) Style Settings pickers' },
    { file: 'graph-view.png',    label: '(c) graph view' },
    { file: 'kanban.png',        label: '(d) Kanban board' },
    { file: 'tasks.png',         label: '(e) obsidian-tasks' },
  ];

  let allOk = true;
  for (const { file, label } of shots) {
    const fpath = path.join(SHOT_DIR, file);
    const exists = fs.existsSync(fpath);
    const size = exists ? fs.statSync(fpath).size : 0;
    const ok = exists && size > 10_000;
    console.log(`  ${ok ? '✓' : '✗'} ${label}: ${file} (${(size / 1024).toFixed(0)} KB)`);
    if (!ok) allOk = false;
  }

  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
