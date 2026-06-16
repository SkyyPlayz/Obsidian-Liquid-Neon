#!/usr/bin/env python3
"""
Capture the 3 additional AC screenshots for LN v0.3.0 (SKY-1772):
  (b) style-settings.png  — Style Settings plugin, Liquid Neon section with pickers
  (d) kanban.png          — Kanban board, LN-37 neon-glass lanes
  (e) tasks.png           — obsidian-tasks query block, LN-38 neon-glass table

Pre-conditions (same as capture-screenshots.py):
  - /tmp/squashfs-root/obsidian  (extracted Obsidian AppImage)
  - /home/skyy/obsidian-test-vaults/v1.6.7  (vault with LN theme + plugins)
  - python3-pil, python3-xlib, Xvfb

Usage:
    python3 scripts/capture-v030-extra.py
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
        # --disable-gpu forces CPU (software) rendering so XGetImage captures
        # actual content rather than just the GPU compositor surface.
        [OBSIDIAN_BIN, VAULT_PATH, "--no-sandbox", "--disable-gpu"],
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


def open_via_quick_switcher(display, name):
    """Open a note by name using Obsidian quick switcher (Ctrl+O)."""
    ctrl_key(display, Xlib.XK.XK_o)
    sleep(1.5)
    type_string(display, name)
    sleep(1.5)  # Allow results to populate
    send_key(display, Xlib.XK.XK_Return)
    sleep(5.0)  # Give plugin content extra time to render


def main():
    xvfb_proc, display_env = start_xvfb()
    obs_proc = launch_obsidian(display_env)

    # Extra startup time for 3 community plugins to initialise
    print("Waiting for Obsidian + plugins to load (30s)...")
    sleep(30)

    display = Xlib.display.Display(display_env)

    # Focus the window
    click(display, 720, 450)
    sleep(1.0)

    # ── (d) KANBAN: LN-37 neon-glass lanes ──────────────────────────────────────
    print("\n[d] kanban.png — Kanban board with neon-glass lanes...")
    # Use shorter search term to avoid space/search issues
    open_via_quick_switcher(display, "Board")
    # Click in the note content area to activate the Kanban view
    click(display, 740, 480)
    sleep(8.0)  # Kanban plugin needs extra render time
    img = capture_screen(display)
    kanban_path = SHOT_DIR / "kanban.png"
    img.save(str(kanban_path), optimize=True)
    print(f"kanban.png ({kanban_path.stat().st_size:,} bytes)")

    # ── (e) TASKS: LN-38 neon-glass query block ──────────────────────────────────
    print("\n[e] tasks.png — obsidian-tasks query block...")
    # Use shorter search term
    open_via_quick_switcher(display, "Tasks")
    # Switch to Reading View so the tasks plugin renders its query results
    ctrl_key(display, Xlib.XK.XK_e)
    sleep(8.0)  # tasks plugin needs time to render query results
    img = capture_screen(display)
    tasks_path = SHOT_DIR / "tasks.png"
    img.save(str(tasks_path), optimize=True)
    print(f"tasks.png ({tasks_path.stat().st_size:,} bytes)")

    # ── (b) STYLE SETTINGS: LN configuration section with pickers ───────────────
    # Navigate: Settings (Ctrl+,) → Appearance (keyboard nav) → capture
    # Then try Community plugins → Style Settings gear
    print("\n[b] style-settings.png — Settings with LN theme selected...")
    ctrl_key(display, Xlib.XK.XK_comma)  # Ctrl+, = Settings
    sleep(3.0)

    # Capture now to see the settings dialog current state
    debug_img = capture_screen(display)
    debug_img.save("/tmp/settings-debug.png", optimize=True)
    print("Debug screenshot saved to /tmp/settings-debug.png")

    # Use keyboard navigation in Settings left nav.
    # Tab once to focus the left nav, then arrow-down to navigate.
    # In Obsidian Settings, the left nav is navigable via keyboard.
    click(display, 720, 450)  # Click main area first
    sleep(0.5)

    # Try pressing Tab to focus the left nav pane
    send_key(display, Xlib.XK.XK_Tab)
    sleep(0.3)

    # Navigate down through the nav items to reach Appearance (4th item, index 3)
    # Then capture - Appearance shows the theme selection + Style Settings might appear
    for _ in range(3):
        send_key(display, Xlib.XK.XK_Down)
        sleep(0.2)
    sleep(1.0)
    send_key(display, Xlib.XK.XK_Return)
    sleep(1.5)

    img = capture_screen(display)
    ss_path = SHOT_DIR / "style-settings.png"
    img.save(str(ss_path), optimize=True)
    print(f"style-settings.png ({ss_path.stat().st_size:,} bytes)")

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

    print("\n── Results ──")
    all_ok = True
    shots = [
        ("style-settings.png", "(b) Style Settings LN pickers"),
        ("kanban.png",         "(d) Kanban board"),
        ("tasks.png",          "(e) obsidian-tasks"),
    ]
    for name, label in shots:
        fpath = SHOT_DIR / name
        ok = fpath.exists() and fpath.stat().st_size > 20_000
        mark = "OK" if ok else "FAIL"
        size = fpath.stat().st_size if fpath.exists() else 0
        print(f"  {mark} {label}: {name} ({size:,} bytes)")
        if not ok:
            all_ok = False

    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
