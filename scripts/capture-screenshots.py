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
import stat
import sys
import subprocess
import time
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


def _setup_x11_display() -> str:
    sock_dir = pathlib.Path("/tmp/.X11-unix")
    try:
        if not sock_dir.exists():
            sock_dir.mkdir(mode=0o1777, parents=False)
            return DISPLAY_NUM
        current_mode = sock_dir.stat().st_mode
        if current_mode & stat.S_ISVTX:
            return DISPLAY_NUM
        os.chmod(str(sock_dir), current_mode | stat.S_ISVTX)
        return DISPLAY_NUM
    except OSError:
        return "127.0.0.1:99"


def _remove_stale_lock(display_num: str) -> None:
    n = display_num.lstrip(":")
    lock = pathlib.Path(f"/tmp/.X{n}-lock")
    if not lock.exists():
        return
    try:
        pid = int(lock.read_text().strip())
        os.kill(pid, 0)
    except ProcessLookupError:
        lock.unlink(missing_ok=True)
    except (ValueError, OSError):
        pass


def start_xvfb():
    subprocess.run(["pkill", "-f", f"Xvfb {DISPLAY_NUM}"], capture_output=True)
    sleep(0.5)
    _remove_stale_lock(DISPLAY_NUM)

    display_env = _setup_x11_display()
    use_tcp = not display_env.startswith(":")

    xvfb_cmd = ["Xvfb", DISPLAY_NUM, "-screen", "0", f"{SCREEN_W}x{SCREEN_H}x24"]
    if use_tcp:
        xvfb_cmd += ["-listen", "tcp"]

    proc = subprocess.Popen(xvfb_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    sleep(2)
    print(f"XVFB_OK {DISPLAY_NUM} DISPLAY={display_env}")
    return proc, display_env


def launch_obsidian(display_env: str):
    env = {**os.environ, "DISPLAY": display_env}
    proc = subprocess.Popen(
        [OBSIDIAN_BIN, VAULT_PATH, "--no-sandbox"],
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print(f"OBSIDIAN_OK PID {proc.pid}")
    return proc


def capture_screen(display) -> Image.Image:
    screen = display.screen()
    root = screen.root
    geom = root.get_geometry()
    raw = root.get_image(0, 0, geom.width, geom.height, Xlib.X.ZPixmap, 0xFFFFFFFF)
    img = Image.frombytes("RGB", (geom.width, geom.height), raw.data, "raw", "BGRX")
    return img.crop((0, 0, SCREEN_W, SCREEN_H))


def send_key(display, keysym, shift=False, ctrl=False):
    keycode = display.keysym_to_keycode(keysym)
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
    sleep(0.3)


def ctrl_key(display, key_sym, shift=False):
    send_key(display, key_sym, shift=shift, ctrl=True)


def main():
    xvfb_proc, display_env = start_xvfb()
    obs_proc = launch_obsidian(display_env)

    print("Waiting for Obsidian to load (14s)...")
    sleep(14)

    display = Xlib.display.Display(display_env)

    # ── Focus the Obsidian window by clicking in the main area ────────────────
    click(display, 720, 450)
    sleep(0.5)

    # ── HERO SHOT: open Test-Note.md via quick switcher ───────────────────────
    # Test-Note.md has rich markdown content (headings, code, table, list, quote)
    print("\nCapturing hero.png...")
    ctrl_key(display, Xlib.XK.XK_o)  # Ctrl+O = quick open
    sleep(1.2)
    # Type "Test" to find Test-Note.md
    type_string(display, "Test")
    sleep(0.8)
    send_key(display, Xlib.XK.XK_Return)
    sleep(3.0)  # Wait for note to fully render

    img = capture_screen(display)
    hero_path = SHOT_DIR / "hero.png"
    img.save(str(hero_path), optimize=True)
    print(f"hero.png ({hero_path.stat().st_size:,} bytes)")

    # ── NAV-HOVER: open file explorer then hover over a nav item ─────────────
    # From hero shot analysis: ribbon is at x≈225, file tree panel at x≈250-535
    # The Tags pane was open — click the Files ribbon icon (y≈140 in ribbon)
    print("\nCapturing nav-hover.png...")

    # Click the second ribbon icon (Files) - at x≈225, y≈140
    click(display, 225, 140)
    sleep(1.2)

    # Also try Ctrl+Shift+E to open/focus file explorer
    ctrl_key(display, Xlib.XK.XK_e, shift=True)
    sleep(1.2)

    # The file list items should be at x≈390 (middle of left panel), y starts ≈130
    # Hover over a file item near the top of the file list
    mouse_move(display, 390, 155)
    sleep(0.6)

    img = capture_screen(display)
    nav_path = SHOT_DIR / "nav-hover.png"
    img.save(str(nav_path), optimize=True)
    print(f"nav-hover.png ({nav_path.stat().st_size:,} bytes)")

    # Move mouse away
    mouse_move(display, 720, 450)
    sleep(0.3)

    # ── GRAPH VIEW: use command palette to open it ────────────────────────────
    print("\nCapturing graph-view.png...")
    # Use command palette (Ctrl+P) to search for graph
    ctrl_key(display, Xlib.XK.XK_p)
    sleep(1.2)
    type_string(display, "graph")
    sleep(0.8)
    send_key(display, Xlib.XK.XK_Return)
    sleep(5.0)  # Graph needs time to render nodes and edges

    img = capture_screen(display)
    graph_path = SHOT_DIR / "graph-view.png"
    img.save(str(graph_path), optimize=True)
    print(f"graph-view.png ({graph_path.stat().st_size:,} bytes)")

    # Close graph with Escape
    send_key(display, Xlib.XK.XK_Escape)
    sleep(0.8)

    # ── APPEARANCE SETTINGS ───────────────────────────────────────────────────
    # From the style-settings screenshot: Settings panel starts at x≈130,y≈55
    # Left nav items start at x≈175, y≈68; items are ~28px apart
    # General(0), Editor(1), Files and links(2), Appearance(3)
    # Appearance y ≈ 68 + 3*28 = 152
    print("\nCapturing style-settings.png (Appearance panel)...")
    ctrl_key(display, Xlib.XK.XK_comma)  # Ctrl+, = Settings
    sleep(2.5)

    # Click "Appearance" tab in settings left nav
    # From analysis: Appearance is the 4th item, at approximately x=175, y=118
    click(display, 175, 118)
    sleep(1.8)

    img = capture_screen(display)
    ss_path = SHOT_DIR / "style-settings.png"
    img.save(str(ss_path), optimize=True)
    print(f"style-settings.png ({ss_path.stat().st_size:,} bytes)")

    # Close settings
    send_key(display, Xlib.XK.XK_Escape)
    sleep(0.5)

    display.close()

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

    print("\n-- Results --")
    all_ok = True
    for name in ["hero.png", "nav-hover.png", "graph-view.png", "style-settings.png"]:
        fpath = SHOT_DIR / name
        ok = fpath.exists() and fpath.stat().st_size > 20_000
        mark = "OK" if ok else "FAIL"
        size = fpath.stat().st_size if fpath.exists() else 0
        print(f"  {mark} {name} ({size:,} bytes)")
        if not ok:
            all_ok = False

    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
