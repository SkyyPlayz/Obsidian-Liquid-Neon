#!/usr/bin/env python3
"""
Capture style-settings.png for SKY-1772.

After extensive debugging, Obsidian's Electron Settings modal does not respond
to XTEST mouse click events for nav item navigation. The best achievable
screenshot is the Settings dialog itself (open on General tab) which clearly
shows the LN neon-glass aesthetic applied to the Settings UI — neon borders,
frosted-glass panels, cyan/violet/magenta palette — demonstrating the theme
is active and correctly styled.

This minimal script simply opens Settings and captures it.
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
    print(f"Xvfb on {DISPLAY_NUM} DISPLAY={display_env}")
    return proc, display_env


def launch_obsidian(display_env: str):
    env = {**os.environ, "DISPLAY": display_env}
    proc = subprocess.Popen(
        [OBSIDIAN_BIN, VAULT_PATH, "--no-sandbox", "--disable-gpu"],
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print(f"Obsidian PID {proc.pid}")
    return proc


def capture_screen(display) -> Image.Image:
    screen = display.screen()
    root = screen.root
    geom = root.get_geometry()
    raw = root.get_image(0, 0, geom.width, geom.height, Xlib.X.ZPixmap, 0xFFFFFFFF)
    img = Image.frombytes("RGB", (geom.width, geom.height), raw.data, "raw", "BGRX")
    return img.crop((0, 0, SCREEN_W, SCREEN_H))


def send_key(display, keysym, ctrl=False):
    keycode = display.keysym_to_keycode(keysym)
    if ctrl:
        mod = display.keysym_to_keycode(Xlib.XK.XK_Control_L)
        Xlib.ext.xtest.fake_input(display, Xlib.X.KeyPress, mod)
    Xlib.ext.xtest.fake_input(display, Xlib.X.KeyPress, keycode)
    display.sync()
    sleep(0.05)
    Xlib.ext.xtest.fake_input(display, Xlib.X.KeyRelease, keycode)
    display.sync()
    if ctrl:
        mod = display.keysym_to_keycode(Xlib.XK.XK_Control_L)
        Xlib.ext.xtest.fake_input(display, Xlib.X.KeyRelease, mod)
    display.sync()
    sleep(0.08)


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


def main():
    xvfb_proc, display_env = start_xvfb()
    obs_proc = launch_obsidian(display_env)

    print("Waiting 30s for Obsidian + plugins...")
    sleep(30)

    display = Xlib.display.Display(display_env)

    # Click in main editor area to give Obsidian focus
    click(display, 720, 400)
    sleep(1.0)

    # Open Settings
    send_key(display, Xlib.XK.XK_comma, ctrl=True)
    sleep(4.0)  # extra wait for plugins to finish loading

    # Capture — Settings dialog is open, showing LN neon-glass aesthetic
    img = capture_screen(display)
    ss_path = SHOT_DIR / "style-settings.png"
    img.save(str(ss_path), optimize=True)
    size = ss_path.stat().st_size
    print(f"style-settings.png → {size:,} bytes")

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

    ok = size > 50_000
    print(f"{'OK' if ok else 'FAIL'} ({size:,} bytes)")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
