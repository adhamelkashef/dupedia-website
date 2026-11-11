"""Tone-only relight: brighter exposure, lifted shadows, protected highlights. No pixel moves, no retouching,
so the subject's face and features are unchanged.  python3 tools/relight_photo.py IN.jpg OUT.jpg [exposure] [shadow_lift]"""
import sys
import numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1:3]
ev = float(sys.argv[3]) if len(sys.argv) > 3 else 0.35       # stops of exposure
lift = float(sys.argv[4]) if len(sys.argv) > 4 else 0.30     # local shadow lift strength
im = Image.open(src).convert("RGB"); a = np.asarray(im).astype(np.float32) / 255
lin = a ** 2.2
lin *= 2 ** ev                                              # exposure in linear light
x = lin
m, k = 2 ** ev, 0.9
y = x / (1 + k * x) * (1 + k * m) / m                       # highlight shoulder: source white stays white, never clips
g = np.clip(y, 0, 1) ** (1 / 2.2)
# local shadow lift: brighten areas that are dark at a broad scale (fill light), not fine detail
L = g.mean(-1)
base = np.asarray(Image.fromarray((L * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(28))).astype(np.float32) / 255
w = np.clip((0.5 - base) / 0.5, 0, 1) ** 1.5                  # 1 in deep shadow, 0 above mid-grey
gain = 1 + lift * w
g = 1 - (1 - g) ** gain[..., None]                            # lift toward light while keeping blacks anchored
g = np.clip(g + 0.012, 0, 1)                                  # tiny black-point lift
Image.fromarray((g * 255 + .5).astype(np.uint8)).save(out, quality=90, optimize=True, progressive=True)
print("wrote", out, im.size)
