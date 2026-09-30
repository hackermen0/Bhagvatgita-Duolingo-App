"""Remove white background + grey floor shadow from the Krishna mascot renders,
crop every emotion to one shared frame, and export small WebP files.

    python scripts/process-mascots.py design/mascot-source static/mascot

Sources stay out of static/ (~1 MB each) so they aren't deployed or bundled.
To add an emotion: add it to MOODS below and to MascotMood in Mascot.svelte.
Requires Pillow, numpy, scipy."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
SIZE = 480

MOODS = {
    'default': 'krishna_mascot.PNG',
    'cheerful': 'krishna_cheerful.png',
    'celebrating': 'krishna_celebrating.png',
    'excited': 'krishna_too_exited.png',
    'proud': 'krishna_proud.png',
    'amazed': 'krishna_amazed.png',
    'affectionate': 'krishna_affectionate.png',
    'thinking': 'krishna_thinking.png',
    'determined': 'krishna_determined.png',
    'mischievous': 'krishna_mischievous.png',
    'disappointed': 'krishna_dissapointed.png',
    'shocked': 'krishna_shocked_1.png',
    'worried': 'krishna_worried.png',
    'crying': 'krishna_crying.png',
    'puppy': 'krishna_puppy_eyes.png',
}


def cut_out(path: Path) -> np.ndarray:
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    lo, hi = rgb.min(axis=2), rgb.max(axis=2)
    # White canvas and the soft grey floor shadow are both bright and unsaturated
    candidate = (lo > 190) & (hi - lo < 28)
    labels, _ = ndimage.label(candidate)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    border = border[border != 0]
    bg = np.isin(labels, border)
    # Close pinholes the flood fill left behind in the background
    bg = ndimage.binary_opening(bg, iterations=1)

    alpha = np.where(bg, 0.0, 1.0)
    # Edge band: un-blend the anti-aliased pixels from white (colour-to-alpha),
    # otherwise every outline keeps a pale halo that shows on dark mode
    band = ndimage.binary_dilation(bg, iterations=3) & ~bg
    a = (255.0 - lo) / 255.0
    a = np.clip(a * 1.15, 0, 1)
    alpha = np.where(band, np.minimum(alpha, a), alpha)
    safe = np.maximum(alpha, 1e-3)[..., None]
    unblended = np.clip((rgb - (1 - alpha[..., None]) * 255.0) / safe, 0, 255)
    rgb = np.where(band[..., None], unblended, rgb)
    # Drop isolated specks (corner artifacts); confetti pieces are ~1000px so they survive
    lab, n = ndimage.label(alpha > 0.03)
    sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
    specks = np.isin(lab, np.nonzero(sizes < 50)[0] + 1)
    alpha = np.where(specks, 0.0, alpha)
    rgba = np.dstack([rgb, alpha * 255.0]).astype(np.uint8)
    return rgba


cutouts = {mood: cut_out(SRC / name) for mood, name in MOODS.items()}

# One shared square frame so the character never changes size when the mood swaps
boxes = []
for rgba in cutouts.values():
    ys, xs = np.nonzero(rgba[..., 3] > 8)
    boxes.append((xs.min(), ys.min(), xs.max(), ys.max()))
x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes)
x1 = max(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
side = max(x1 - x0, y1 - y0) + 16
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
box = (int(cx - side / 2), int(cy - side / 2), int(cx + side / 2), int(cy + side / 2))
print('union bbox', (x0, y0, x1, y1), 'crop', box)

total = 0
for mood, rgba in cutouts.items():
    im = Image.fromarray(rgba, 'RGBA').crop(box).resize((SIZE, SIZE), Image.LANCZOS)
    out = OUT / f'{mood}.webp'
    im.save(out, 'WEBP', quality=86, method=6)
    total += out.stat().st_size
    print(f'{mood:13s} {out.stat().st_size // 1024:4d} KB')
print(f'total {total // 1024} KB')
