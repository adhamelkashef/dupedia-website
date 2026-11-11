"""Make the reversed (dark-ground) logo: charcoal parts -> cream, lime stays lime.
Each pixel is projected onto the charcoal-lime line so anti-aliased edges stay clean. Shapes are untouched.
    python3 tools/reverse_logo.py static/brand/logo_compact.png static/brand/logo_compact-rev.png
"""
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parent)); import png
C, L, K = (38, 38, 38), (184, 210, 65), (251, 250, 246)
d = [C[i] - L[i] for i in range(3)]; dd = sum(x*x for x in d)
w, h, px = png.read(sys.argv[1])
for i in range(0, len(px), 4):
    if px[i+3] == 0: continue
    t = sum((px[i+k] - L[k]) * d[k] for k in range(3)) / dd
    t = 0.0 if t < 0 else 1.0 if t > 1 else t
    for k in range(3): px[i+k] = round(L[k] + t * (K[k] - L[k]))
png.write(sys.argv[2], w, h, px)
