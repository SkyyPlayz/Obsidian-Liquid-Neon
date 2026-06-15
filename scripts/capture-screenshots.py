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


def _setup_x11_display() -> str:
    """
    Ensure /tmp/.X11-unix has the sticky bit so Xvfb can create its socket,
    and return the DISPLAY string to use for this run.

    In WSL2 without systemd-tmpfiles, /tmp/.X11-unix is a read-only WSLg
    tmpfs mount (mode 0777, no sticky bit) - Xvfb security-checks for the
    sticky bit and silently skips socket creation without it.  When we can
    neither create nor chmod the directory we fall back to TCP so no Unix
    socket is needed.

    Returns ':99'          -- Unix socket path (preferred)
            '127.0.0.1:99' -- TCP fallback when socket dir is not fixable
    """
    sock_dir = pathlib.Path("/tmp/.X11-unix")
    try:
        if not sock_dir.exists():
            sock_dir.mkdir(mode=0o1777, parents=False)
            return DISPLAY_NUM
        current_mode = sock_dir.stat().st_mode
        if current_mode & stat.S_ISVTX:
            return DISPLAY_NUM  # Already has sticky bit -- Unix socket will work
        os.chmod(str(sock_dir), current_mode | stat.S_ISVTX)
        return DISPLAY_NUM
    except OSError:
        # Read-only mount or permission denied -- use TCP to bypass the socket dir.
        return "127.0.0.1:99"


def _remove_stale_lock(display_num: str) -> None:
    """Remove /tmp/.X{N}-lock if the recorded PID is no longer alive."""
    n = display_num.lstrip(":")
    lock = pathlib.Path(f"/tmp/.X{n}-lock")
    if not lock.exists():
        return
    try:
        pid = int(lock.read_text().strip())
        os.kill(pid, 0)  # 0 = probe; raises ProcessLookupError if dead
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
        # Enable TCP listener so Xlib can connect via 127.0.0.1:99.
        # Note: -nolisten unix causes Xvfb to exit when no other transport
        # is configured, so we keep the default unix transport attempt and
        # ADD tcp -- Xvfb tolerates the unix socket creation failing silently.
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
    xvfb_proc, display_env = start_xvfb()
    obs_proc = launch_obsidian(display_env)

    print("Waiting for Obsidian to load (12s)...")
    sleep(12)

    display = Xlib.display.Display(display_env)

    print("\nCapturing hero.png...")
    ctrl_key(display, Xlib.XK.XK_o)
    sleep(1.0)
    type_string(display, "Story World")
    sleep(0.6)
    send_key(display, Xlib.XK.XK_Return)
    sleep(2.5)

    img = capture_screen(display)
    hero_path = SHOT_DIR / "hero.png"
    img.save(str(hero_path), optimize=True)
    print(f"hero.png ({hero_path.stat().st_size:,} bytes)")

    print("\nCapturing nav-hover.png...")
    ctrl_key(display, Xlib.XK.XK_e, shift=True)
    sleep(1.0)
    mouse_move(display, 70, 130)
    sleep(0.5)
    img = capture_screen(display)
    nav_path = SHOT_DIR / "nav-hover.png"
    img.save(str(nav_path), optimize=True)
    print(f"nav-hover.png ({nav_path.stat().st_size:,} bytes)")

    mouse_move(display, 720, 450)
    sleep(0.3)

    print("\nCapturing graph-view.png...")
    ctrl_key(display, Xlib.XK.XK_g, shift=True)
    sleep(4.5)
    img = capture_screen(display)
    graph_path = SHOT_DIR / "graph-view.png"
    img.save(str(graph_path), optimize=True)
    print(f"graph-view.png ({graph_path.stat().st_size:,} bytes)")

    send_key(display, Xlib.XK.XK_Escape)
    sleep(0.8)

    print("\nCapturing style-settings.png...")
    ctrl_key(display, Xlib.XK.XK_comma)
    sleep(2.2)
    click(display, 130, 200)
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
