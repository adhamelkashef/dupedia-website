"""Extract a logo from a flat image on a white background into transparent PNGs (headless Chrome, local).

    python3 tools/extract_logo.py SRC OUT.png --ink "#000000" [--keep-colour] [--width 1600] [--pad 0.02] [--lo 60 --hi 232]

- Transparency comes from the ink itself: white -> transparent, ink -> opaque, anti-aliased edges kept.
- --ink sets the colour of the dark (neutral) ink, e.g. "#FFFFFF" for a reversed version. Shapes are untouched.
- --keep-colour keeps saturated parts (e.g. a lime shape) in their original colour.
- The result is trimmed to the logo with a small padding and scaled to --width (never upscaled past the source).
"""
import argparse, base64, pathlib, re, subprocess, tempfile, mimetypes
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--ink", default="#000000"); ap.add_argument("--keep-colour", action="store_true")
ap.add_argument("--width", type=int, default=1600); ap.add_argument("--pad", type=float, default=0.02)
ap.add_argument("--lo", type=int, default=60); ap.add_argument("--hi", type=int, default=232); ap.add_argument("--sat", type=int, default=45)
a = ap.parse_args()
src = pathlib.Path(a.src); mime = mimetypes.guess_type(src.name)[0] or "image/jpeg"
ink = a.ink.lstrip("#"); ir, ig, ib = (int(ink[i:i + 2], 16) for i in (0, 2, 4))
html = f"""<!doctype html><meta charset=utf-8><body><script>
(async () => {{
  const im = new Image(); im.src = "data:{mime};base64,{base64.b64encode(src.read_bytes()).decode()}"; await im.decode();
  const W = im.naturalWidth, H = im.naturalHeight, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"); x.drawImage(im, 0, 0); const id = x.getImageData(0, 0, W, H), d = id.data;
  const LO = {a.lo}, HI = {a.hi}, KEEP = {str(a.keep_colour).lower()};
  let l = W, r = 0, t = H, b = 0;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {{
    const R = d[i], G = d[i + 1], B = d[i + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B), sat = mx - mn;
    const L = .299 * R + .587 * G + .114 * B;
    let A;
    if (KEEP && sat > {a.sat}) {{
      // coloured shape: opacity from its distance to white, colour restored to full strength
      A = Math.min(1, (255 - mn) / 150);
      d[i] = Math.min(255, Math.round(255 - (255 - R) / Math.max(A, .01)));
      d[i + 1] = Math.min(255, Math.round(255 - (255 - G) / Math.max(A, .01)));
      d[i + 2] = Math.min(255, Math.round(255 - (255 - B) / Math.max(A, .01)));
    }} else {{
      A = Math.max(0, Math.min(1, (HI - L) / (HI - LO)));
      d[i] = {ir}; d[i + 1] = {ig}; d[i + 2] = {ib};
    }}
    A *= d[i + 3] / 255;  // respect any transparency already in the source
    d[i + 3] = Math.round(A * 255);
    if (A > .04) {{ const px = p % W, py = (p / W) | 0; if (px < l) l = px; if (px > r) r = px; if (py < t) t = py; if (py > b) b = py; }}
  }}
  x.putImageData(id, 0, 0);
  const pad = Math.round((r - l) * {a.pad}); l = Math.max(0, l - pad); t = Math.max(0, t - pad); r = Math.min(W - 1, r + pad); b = Math.min(H - 1, b + pad);
  const cw = r - l + 1, ch = b - t + 1, ow = Math.min({a.width}, cw), oh = Math.round(ch * ow / cw);
  const o = document.createElement("canvas"); o.width = ow; o.height = oh; const ox = o.getContext("2d"); ox.imageSmoothingQuality = "high";
  ox.drawImage(c, l, t, cw, ch, 0, 0, ow, oh);
  const e = document.createElement("pre"); e.id = "out"; e.dataset.size = ow + "x" + oh; e.textContent = o.toDataURL("image/png"); document.body.append(e);
}})();
</script>"""
with tempfile.TemporaryDirectory() as td:
    f = pathlib.Path(td) / "l.html"; f.write_text(html)
    res = subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--virtual-time-budget=30000", "--dump-dom", f.as_uri()], capture_output=True, text=True, timeout=180).stdout
m = re.search(r'id="out" data-size="(\d+)x(\d+)">data:image/png;base64,([A-Za-z0-9+/=]+)<', res)
if not m: raise SystemExit("extraction failed")
out = pathlib.Path(a.out); out.write_bytes(base64.b64decode(m.group(3)))
print(f"wrote {out} {m.group(1)}x{m.group(2)} {out.stat().st_size // 1024} KB")
