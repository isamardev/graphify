"""Remove near-uniform dark background from logo PNG (one-off utility)."""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image


def sample_region(px, w: int, h: int, x0: int, y0: int, rw: int, rh: int) -> tuple[float, float, float]:
    r_sum = g_sum = b_sum = n = 0
    for y in range(max(0, y0), min(h, y0 + rh)):
        for x in range(max(0, x0), min(w, x0 + rw)):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            r_sum += r
            g_sum += g
            b_sum += b
            n += 1
    if n == 0:
        return 5.0, 10.0, 20.0
    return r_sum / n, g_sum / n, b_sum / n


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    src = root / "logo.png"
    if len(sys.argv) > 1:
        src = Path(sys.argv[1])
    if not src.is_file():
        print(f"Missing source: {src}", file=sys.stderr)
        return 1

    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    patch = max(4, min(w, h) // 24)
    corners = [
        sample_region(px, w, h, 0, 0, patch, patch),
        sample_region(px, w, h, w - patch, 0, patch, patch),
        sample_region(px, w, h, 0, h - patch, patch, patch),
        sample_region(px, w, h, w - patch, h - patch, patch, patch),
    ]
    br = sum(c[0] for c in corners) / 4
    bg = sum(c[1] for c in corners) / 4
    bb = sum(c[2] for c in corners) / 4

    # Distance in RGB; dark navy is tight; allow similar blues to clear
    thresh = 42.0
    soft = 18.0

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            d = math.sqrt((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2)
            if d <= thresh - soft:
                px[x, y] = (r, g, b, 0)
            elif d >= thresh + soft:
                continue
            else:
                t = (d - (thresh - soft)) / (2 * soft)
                na = int(round(a * max(0.0, min(1.0, t))))
                px[x, y] = (r, g, b, na)

    out_public = root / "public" / "logo.png"
    out_root = root / "logo.png"
    im.save(out_public, "PNG")
    im.save(out_root, "PNG")
    print(f"Wrote {out_public} and {out_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
