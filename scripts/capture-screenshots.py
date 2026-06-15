#!/usr/bin/env python3
"""
Capture Liquid Neon v0.2.0 community listing screenshots.
Uses Xvfb + Obsidian AppImage (pre-extracted) + Xlib/PIL for capture.

Outputs: docs/screenshots/hero.png, nav-hover.png, graph-view.png, style-settings.png

Usage:
    python3 scripts/capture-screenshots.py

Pre-conditions:
    - /tmp/squashfs-root/obsidian  (extracted from Obsidian AppImage)
    - /home/skyy/obsidian-test-vaults/v1.6.7  (vault with Liquid Neon theme)
    - PIL (python3-pil) and python3-xlib installed
"""

import os
import sys
import subprocess
import time
import signal
import pathlib

from PIL import Image
import Xlib.display
import Xlib.X
import Xlib.XK
import Xlib.ext.xtest

# ── Config ─────────────────────────────────────────────────────────────────────
OBSIDIAN_BIN = "/tmp/squashfs-root/obsidian"
VAULT_PATH = "/home/skyy/obsidian-test-vaults/v1.6.7"
DISPLAY_NUM = ":99"
SCREEN_W, SCREEN_H = 1440, 900

REPO_ROOT = pathlib.Path(__file__).parent.parent
SHOT_DIR = REPO_ROOT / "docs" / "screenshots"
SHOT_DIR.mkdir(parents=True, exist_ok=True)


def sleep(s):
    time.sleep(s)


def start_xvfb():
    subprocess.run(["pkill", "-f", "Xvfb :99"], capture_output=True)
    sleep(0.5)
    proc = subprocess.Popen(
        ["Xvfb", DISPLAY_NUM, "-screen", "0", f"{SCREEN_W}x{SCREEN_H}x24"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    sleep(2)
    print(f"✓ Xvfb on {DISPLAY_NUM}")
    return proc


def launch_obsidian():
    env = {**os.environ, "DISPLAY": DISPLAY_NUM}
    proc = subprocess.Popen(
        [OBSIDIAN_BIN, VAULT_PATH, "--no-sandbox"],
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print(f"✓ Obsidian PID {proc.pid}")
    return proc


def capture_screen(display) -> Image.Image:
    screen = display.screen()
    root = screen.root
    geom = root.get_geometry()
    raw = root.get_image(0, 0, geom.width, geom.height, Xlib.X.ZPixmap, 0xFFFFFFFF)
    img = Image.frombytes("RGB", (geom.width, geom.height), raw.data, "raw", "BGRX")
    # Crop to 1440x900 if screen is larger
    return img.crop((0, 0, SCREEN_W, SCREEN_H))


def send_key(display, keysym, shift=False, ctrl=False):
    """Send a key event (press + release) using XTest."""
    keycode = display.keysym_to_keycode(keysym)
    root = display.screen().root

    if ctrl:
        ctrl_code = display.keysym_to_keycode(Xlib.XK.XK_Control_L)
        Xlib.ext.xtest.fake_input(display, Xlib.X.KeyPress, ctrl_code)
    if shift:
        shift_code = display.keysym_to_keycode(Xlib.XK.XK_Shift_L)
        Xlib.ext.xtest.fake_input(display, Xlib.X.KeyPress, shift_code)

    Xlib.ext.xtest.fake_input(display, Xlib.X.KeyPress, keycode)
    display.sync()
    sleep(0.05)
    Xlib.ext.xtest.fake_input(display, Xlib.X.KeyRelease, keycode)
    display.sync()

    if shift:
        Xlib.ext.xtest.fake_input(display, Xlib.X.KeyRelease, shift_code)
    if ctrl:
        Xlib.ext.xtest.fake_input(display, Xlib.X.KeyRelease, ctrl_code)

    display.sync()
    sleep(0.08)


def type_string(display, text):
    """Type a string character by character."""
    for ch in text:
        ks = Xlib.XK.string_to_keysym(ch)
        if ks == Xlib.X.NoSymbol:
            continue
        send_key(display, ks)
    sleep(0.1)


def mouse_move(display, x, y):
    Xlib.ext.xtest.fake_input(display, Xlib.X.MotionNotify, False, Xlib.X.CurrentTime, x=x, y=y)
    display.sync()
    sleep(0.15)


def click(display, x, y, button=1):
    mouse_move(display, x, y)
    Xlib.ext.xtest.fake_input(display, Xlib.X.ButtonPress, button)
    display.sync()
    sleep(0.05)
    Xlib.ext.xtest.fake_input(display, Xlib.X.ButtonRelease, button)
    display.sync()
    sleep(0.2)


def ctrl_key(display, key_sym, shift=False):
    send_key(display, key_sym, shift=shift, ctrl=True)


def main():
    xvfb_proc = start_xvfb()
    obs_proc = launch_obsidian()

    print("Waiting for Obsidian to load (12s)…")
    sleep(12)

    display = Xlib.display.Display(DISPLAY_NUM)

    # ── HERO SHOT ────────────────────────────────────────────────────────────
    # Open "Story World" note via quick-switcher
    print("\nCapturing hero.png…")
    ctrl_key(display, Xlib.XK.XK_o)  # Ctrl+O = quick switcher
    sleep(1.0)
    type_string(display, "Story World")
    sleep(0.6)
    send_key(display, Xlib.XK.XK_Return)
    sleep(2.5)

    img = capture_screen(display)
    hero_path = SHOT_DIR / "hero.png"
    img.save(str(hero_path), optimize=True)
    print(f"✓ hero.png  ({hero_path.stat().st_size:,} bytes)")

    # ── NAV-HOVER SHOT ───────────────────────────────────────────────────────
    # Open file explorer then hover over a file entry
    print("\nCapturing nav-hover.png…")
    ctrl_key(display, Xlib.XK.XK_e, shift=True)  # Ctrl+Shift+E
    sleep(1.0)
    # Hover over the left nav area where file tree lives (~x=70, y varies)
    # File tree starts around y=80; files are ~25px apart
    mouse_move(display, 70, 130)
    sleep(0.5)
    img = capture_screen(display)
    nav_path = SHOT_DIR / "nav-hover.png"
    img.save(str(nav_path), optimize=True)
    print(f"✓ nav-hover.png  ({nav_path.stat().st_size:,} bytes)")

    # Move mouse away
    mouse_move(display, 720, 450)
    sleep(0.3)

    # ── GRAPH VIEW ───────────────────────────────────────────────────────────
    print("\nCapturing graph-view.png…")
    ctrl_key(display, Xlib.XK.XK_g, shift=True)  # Ctrl+Shift+G
    sleep(4.5)  # Graph takes a few seconds to render nodes
    img = capture_screen(display)
    graph_path = SHOT_DIR / "graph-view.png"
    img.save(str(graph_path), optimize=True)
    print(f"✓ graph-view.png  ({graph_path.stat().st_size:,} bytes)")

    # Close graph view (Escape)
    send_key(display, Xlib.XK.XK_Escape)
    sleep(0.8)

    # ── STYLE SETTINGS (APPEARANCE SETTINGS) ─────────────────────────────────
    print("\nCapturing style-settings.png (Appearance panel)…")
    ctrl_key(display, Xlib.XK.XK_comma)  # Ctrl+,  = Settings
    sleep(2.2)

    # Click the "Appearance" tab in the left sidebar of settings
    # Appearance tab is typically around y=200 in the settings vertical nav
    # Try clicking at ~x=120, y=200 (rough coordinates for the left tab list)
    click(display, 130, 200)
    sleep(1.5)

    img = capture_screen(display)
    ss_path = SHOT_DIR / "style-settings.png"
    img.save(str(ss_path), optimize=True)
    print(f"✓ style-settings.png  ({ss_path.stat().st_size:,} bytes)")

    display.close()

    # Tear down
    obs_proc.terminate()
    try:
        obs_proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        obs_proc.kill()
    xvfb_proc.terminate()
    try:
        xvfb_proc.wait(timeout=3)
    except subprocess.TimeoutExpired:
        xvfb_proc.kill()

    # ── Verify ───────────────────────────────────────────────────────────────
    print("\n── Results ──")
    all_ok = True
    for name in ["hero.png", "nav-hover.png", "graph-view.png", "style-settings.png"]:
        fpath = SHOT_DIR / name
        ok = fpath.exists() and fpath.stat().st_size > 20_000
        mark = "✓" if ok else "✗"
        size = fpath.stat().st_size if fpath.exists() else 0
        print(f"  {mark} {name} ({size:,} bytes)")
        if not ok:
            all_ok = False

    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
