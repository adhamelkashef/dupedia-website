"""Replace the embroidered logo on the factory worker's vest (static/img/factory-worker-embroidered.png).
1) the old emblem is covered with vest fabric cloned from just below it (same panel, feathered, tone-matched);
2) the new Dupedia logo is stitched on as thread: satin rows, sheen, raised edge shadow, fabric shading carried through.
    python3 tools/rethread_vest.py SRC.png static/brand/dupedia-logo-black.png OUT.png
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
src, logo_p, out = sys.argv[1:4]
im = np.asarray(Image.open(src).convert("RGBA")).astype(np.float32)
H, W = im.shape[:2]
# --- 1) cover the old emblem (source pixels, 1186x1327 image)
x0, y0, x1, y1, dy = 709, 744, 866, 864, 118
tgt = im[y0:y1, x0:x1, :3]; cl = im[y0 + dy:y1 + dy, x0:x1, :3].copy()
ring = lambda a: np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
# tone match: per-row linear ramp between the target's top and bottom edges
t_top, t_bot = tgt[:5].mean((0, 1)), tgt[-5:].mean((0, 1)); s_top, s_bot = cl[:5].mean((0, 1)), cl[-5:].mean((0, 1))
r = np.linspace(0, 1, y1 - y0)[:, None, None]
cl += (t_top - s_top) * (1 - r) + (t_bot - s_bot) * r
m = np.zeros((H, W), np.float32); m[y0 + 7:y1 - 7, x0 + 7:x1 - 7] = 1
m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(np.float32)[y0:y1, x0:x1, None] / 255
im[y0:y1, x0:x1, :3] = tgt * (1 - m) + cl * m
# --- 2) stitch the new logo
cx, cy, lw, rot = 784, 802, 150, -3
lg = Image.open(logo_p).convert("RGBA"); S4 = 4
big = lg.resize((lw * S4, round(lg.height * lw * S4 / lg.width)), Image.LANCZOS)
a = np.asarray(big)[..., 3].astype(np.float32) / 255
hh, ww = a.shape; yy, xx = np.mgrid[0:hh, 0:ww].astype(np.float32)
ang = np.deg2rad(-55); u = xx * np.cos(ang) + yy * np.sin(ang)
s = np.sin(u * 0.55)                                      # satin rows at 4x
sheen = 0.72 + 0.55 * s * s
thread = np.clip(22 * sheen + np.random.default_rng(7).normal(0, 6, a.shape), 0, 255)   # near-black thread with sheen
rgba = np.dstack([thread, thread, thread, a * 255]).astype(np.uint8)
lay = Image.fromarray(rgba).rotate(rot, resample=Image.BICUBIC, expand=True)
lay = lay.resize((lay.width // S4, lay.height // S4), Image.LANCZOS)
L = np.asarray(lay).astype(np.float32); lh, lw2 = L.shape[:2]
px, py = cx - lw2 // 2, cy - lh // 2
# raised edge: soft shadow below-right, faint highlight above-left
al = L[..., 3] / 255
sh = np.asarray(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
reg = im[py:py + lh, px:px + lw2, :3]
shade = reg.mean(-1, keepdims=True) / np.median(reg.mean(-1))    # fabric folds and light carry across the thread
sh_off = np.zeros_like(sh); sh_off[1:, 1:] = sh[:-1, :-1]
reg = reg * (1 - 0.35 * sh_off[..., None])
th = L[..., :3] * np.clip(shade, 0.6, 1.4)
reg = reg * (1 - al[..., None]) + th * al[..., None]
im[py:py + lh, px:px + lw2, :3] = reg
Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(out, optimize=True)
print("wrote", out)
