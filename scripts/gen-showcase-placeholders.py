#!/usr/bin/env python3
"""
Generate placeholder animated GIFs for the Liquid Neon showcase.
These are placeholder files — replace with actual Obsidian screen recordings.
Spec: 960px wide, <=6s, <=4MB each.
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUTDIR = os.path.join(os.path.dirname(__file__), "..", "assets", "showcase")
os.makedirs(OUTDIR, exist_ok=True)

W, H = 960, 540
BG       = (10, 10, 15)        # --ln-bg-0
BG1      = (15, 15, 24)        # --ln-bg-1
BG2      = (22, 22, 38)        # --ln-bg-2
CYAN     = (0, 240, 255)       # --ln-cyan
VIOLET   = (155, 95, 255)      # --ln-violet
MAGENTA  = (255, 77, 255)      # --ln-magenta
TEXT     = (224, 224, 255)     # --ln-text
MUTED    = (96, 96, 170)       # --ln-muted


def _base(label: str, subtitle: str) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # title bar
    d.rectangle([0, 0, W, 36], fill=BG2)
    d.text((16, 10), "Obsidian — Liquid Neon", fill=TEXT)
    # label
    d.text((W // 2 - len(label) * 5, H // 2 - 20), label, fill=CYAN)
    d.text((W // 2 - len(subtitle) * 4, H // 2 + 12), subtitle, fill=MUTED)
    return img


def make_hover_glow():
    """Placeholder: hover neon-frame glow on a file row."""
    frames = []
    glow_sizes = [0, 1, 2, 3, 4, 3, 2, 1, 0]
    for gs in glow_sizes:
        img = _base("hover-glow.gif", "Neon-frame hover on file/tab item — replace with screen recording")
        d = ImageDraw.Draw(img)
        # sidebar panel
        d.rectangle([0, 36, 220, H], fill=BG1)
        # file rows
        for i, name in enumerate(["📄 World-Building.md", "📄 Characters.md", "📄 Plot-Arcs.md", "📄 Lore.md"]):
            y = 60 + i * 32
            bg = BG2 if i == 1 else BG1
            d.rectangle([2, y, 218, y + 28], fill=bg)
            d.text((12, y + 6), name, fill=TEXT if i != 1 else CYAN)
            if i == 1 and gs > 0:
                # glow border
                for g in range(gs):
                    d.rectangle([2 - g, y - g, 218 + g, y + 28 + g], outline=(*CYAN, max(0, 180 - g * 40)))
        frames.append(img)
    out = os.path.join(OUTDIR, "hover-glow.gif")
    frames[0].save(out, save_all=True, append_images=frames[1:], loop=0, duration=80, optimize=True)
    print(f"Written: {out} ({os.path.getsize(out) // 1024}KB)")


def make_focus_ring():
    """Placeholder: focus ring on search input."""
    frames = []
    ring_widths = [0, 1, 2, 3, 2, 1, 0, 0, 1, 2, 3, 2, 1]
    for rw in ring_widths:
        img = _base("focus-ring.gif", "Keyboard focus ring on search input — replace with screen recording")
        d = ImageDraw.Draw(img)
        # search bar in center
        bx, by = W // 2 - 200, H // 2 - 20
        bw, bh = 400, 40
        d.rectangle([bx, by, bx + bw, by + bh], fill=BG2, outline=MUTED)
        d.text((bx + 12, by + 10), "Search or create note…", fill=MUTED)
        if rw > 0:
            for r in range(rw):
                d.rectangle(
                    [bx - r - 1, by - r - 1, bx + bw + r + 1, by + bh + r + 1],
                    outline=CYAN,
                )
        frames.append(img)
    out = os.path.join(OUTDIR, "focus-ring.gif")
    frames[0].save(out, save_all=True, append_images=frames[1:], loop=0, duration=100, optimize=True)
    print(f"Written: {out} ({os.path.getsize(out) // 1024}KB)")


def make_graph_view():
    """Placeholder: graph view neon stars + arcs."""
    import math
    import random

    random.seed(42)
    nodes = [(random.randint(100, 860), random.randint(80, 460)) for _ in range(12)]
    edges = [(0, 1), (0, 2), (1, 3), (2, 4), (3, 5), (4, 5), (5, 6), (6, 7), (7, 8), (8, 9), (9, 10), (10, 11)]
    node_colors = [CYAN, VIOLET, MAGENTA, CYAN, VIOLET, MAGENTA, CYAN, VIOLET, MAGENTA, CYAN, VIOLET, MAGENTA]

    frames = []
    n_frames = 16
    for f in range(n_frames):
        img = _base("graph-view.gif", "Graph view — neon stars + arcs — replace with screen recording")
        d = ImageDraw.Draw(img)
        # edges
        for a, b in edges:
            x1, y1 = nodes[a]
            x2, y2 = nodes[b]
            d.line([x1, y1, x2, y2], fill=(*VIOLET, 120), width=1)
        # nodes with pulse
        pulse = 0.5 + 0.5 * math.sin(f * math.pi * 2 / n_frames)
        for i, (nx, ny) in enumerate(nodes):
            r = int(6 + pulse * 4)
            c = node_colors[i]
            # glow
            for g in range(4, 0, -1):
                d.ellipse([nx - r - g, ny - r - g, nx + r + g, ny + r + g], outline=(*c, 30 * g))
            d.ellipse([nx - r, ny - r, nx + r, ny + r], fill=c)
        frames.append(img)
    out = os.path.join(OUTDIR, "graph-view.gif")
    frames[0].save(out, save_all=True, append_images=frames[1:], loop=0, duration=80, optimize=True)
    print(f"Written: {out} ({os.path.getsize(out) // 1024}KB)")


if __name__ == "__main__":
    make_hover_glow()
    make_focus_ring()
    make_graph_view()
    print("Done.")
