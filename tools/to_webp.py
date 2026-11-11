"""PNG with transparency -> WebP with transparency, trimmed to the visible subject (headless Chrome, local).
    python3 tools/to_webp.py in.png out.webp [max_width=1400] [pad=8]
The bottom edge is kept as is so a cut-out can stand on the bottom of its frame.
"""
import base64, pathlib, re, subprocess, sys, tempfile
src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
maxw = int(sys.argv[3]) if len(sys.argv) > 3 else 1400
pad = int(sys.argv[4]) if len(sys.argv) > 4 else 8
html = f"""<!doctype html><meta charset=utf-8><body><script>
(async () => {{
  const i = new Image(); i.src = "data:image/png;base64,{base64.b64encode(src.read_bytes()).decode()}"; await i.decode();
  const W = i.naturalWidth, H = i.naturalHeight, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"); x.drawImage(i, 0, 0); const d = x.getImageData(0, 0, W, H).data;
  let l = W, r = 0, t = H, b = 0;
  for (let y = 0; y < H; y++) for (let k = 0; k < W; k++) if (d[(y * W + k) * 4 + 3] > 12) {{ if (k < l) l = k; if (k > r) r = k; if (y < t) t = y; if (y > b) b = y; }}
  l = Math.max(0, l - {pad}); r = Math.min(W - 1, r + {pad}); t = Math.max(0, t - {pad}); b = H - 1;
  const cw = r - l + 1, ch = b - t + 1, s = Math.min(1, {maxw} / cw), ow = Math.round(cw * s), oh = Math.round(ch * s);
  const o = document.createElement("canvas"); o.width = ow; o.height = oh; const ox = o.getContext("2d"); ox.imageSmoothingQuality = "high";
  ox.drawImage(c, l, t, cw, ch, 0, 0, ow, oh);
  const e = document.createElement("pre"); e.id = "out"; e.dataset.size = ow + "x" + oh; e.textContent = o.toDataURL("image/webp", .88); document.body.append(e);
}})();
</script>"""
with tempfile.TemporaryDirectory() as td:
    f = pathlib.Path(td) / "t.html"; f.write_text(html)
    res = subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--virtual-time-budget=30000", "--dump-dom", f.as_uri()], capture_output=True, text=True, timeout=180).stdout
m = re.search(r'id="out" data-size="(\d+)x(\d+)">data:image/webp;base64,([A-Za-z0-9+/=]+)<', res)
if not m: sys.exit("conversion failed")
out.write_bytes(base64.b64decode(m.group(3)))
print(f"wrote {out} {m.group(1)}x{m.group(2)} {out.stat().st_size // 1024} KB")
