"""Enhance a photo locally with headless Chrome (no uploads): 2x high-quality resample, unsharp mask, gentle contrast.
    python3 tools/enhance_photo.py in.jpg out.jpg [scale=2] [amount=0.9] [radius=1.4] [threshold=6]
"""
import base64, pathlib, subprocess, sys, re, tempfile
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
scale, amount, radius, thr = (float(x) for x in (sys.argv[3:7] + ["2", "0.9", "1.4", "6"][len(sys.argv[3:7]):]))
data = base64.b64encode(src.read_bytes()).decode()
html = f"""<!doctype html><meta charset=utf-8><body><script>
(async () => {{
  const img = new Image(); img.src = "data:image/jpeg;base64,{data}"; await img.decode();
  const W = Math.round(img.naturalWidth * {scale}), H = Math.round(img.naturalHeight * {scale});
  // stepwise upscale (1.41x steps) with high-quality smoothing reads cleaner than one big jump
  let cur = img, cw = img.naturalWidth, ch = img.naturalHeight;
  while (cw < W) {{
    const nw = Math.min(W, Math.round(cw * 1.414)), nh = Math.min(H, Math.round(ch * 1.414));
    const c = new OffscreenCanvas(nw, nh), x = c.getContext("2d"); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
    x.drawImage(cur, 0, 0, nw, nh); cur = c; cw = nw; ch = nh;
  }}
  const base = new OffscreenCanvas(W, H).getContext("2d"); base.drawImage(cur, 0, 0, W, H);
  const blurC = new OffscreenCanvas(W, H).getContext("2d"); blurC.filter = "blur({radius}px)"; blurC.drawImage(cur, 0, 0, W, H);
  const o = base.getImageData(0, 0, W, H), b = blurC.getImageData(0, 0, W, H), d = o.data, bd = b.data;
  // luminance histogram for a gentle levels stretch (0.4% clip each end)
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) hist[(d[i] * .299 + d[i+1] * .587 + d[i+2] * .114) | 0]++;
  const n = W * H, clip = n * .004; let lo = 0, hi = 255, acc = 0;
  for (; lo < 255 && (acc += hist[lo]) < clip; lo++); acc = 0;
  for (; hi > 0 && (acc += hist[hi]) < clip; hi--);
  const span = Math.max(1, hi - lo);
  for (let i = 0; i < d.length; i += 4) {{
    const y = d[i] * .299 + d[i+1] * .587 + d[i+2] * .114, yb = bd[i] * .299 + bd[i+1] * .587 + bd[i+2] * .114;
    const diff = y - yb;
    let v = Math.abs(diff) > {thr} ? y + {amount} * diff : y;     // unsharp mask on luminance, threshold keeps grain calm
    v = (v - lo) / span * 255;                                     // levels
    v = 255 / (1 + Math.exp(-(v / 255 - .5) * 5.2)) ;              // soft S-curve
    v = v * 0.86 + ((v - lo) / span * 255) * 0;                    // (kept simple)
    const g = Math.max(0, Math.min(255, v));
    d[i] = d[i+1] = d[i+2] = g;                                    // true black and white
  }}
  // normalise the S-curve output back to full range
  let mn = 255, mx = 0; for (let i = 0; i < d.length; i += 4) {{ if (d[i] < mn) mn = d[i]; if (d[i] > mx) mx = d[i]; }}
  for (let i = 0; i < d.length; i += 4) {{ const g = (d[i] - mn) / Math.max(1, mx - mn) * 250 + 3; d[i] = d[i+1] = d[i+2] = g; }}
  base.putImageData(o, 0, 0);
  const blob = await base.canvas.convertToBlob({{ type: "image/jpeg", quality: 0.9 }});
  const r = new FileReader(); r.onload = () => {{ const p = document.createElement("pre"); p.id = "out"; p.textContent = r.result; document.body.append(p); }}; r.readAsDataURL(blob);
}})();
</script>"""
with tempfile.TemporaryDirectory() as td:
    f = pathlib.Path(td) / "e.html"; f.write_text(html)
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    out = subprocess.run([chrome, "--headless=new", "--disable-gpu", "--virtual-time-budget=20000", "--dump-dom", f.as_uri()], capture_output=True, text=True, timeout=120).stdout
m = re.search(r'id="out">data:image/jpeg;base64,([A-Za-z0-9+/=]+)<', out)
if not m: sys.exit("enhancement failed: no output from Chrome")
dst.write_bytes(base64.b64decode(m.group(1)))
print("wrote", dst, dst.stat().st_size // 1024, "KB")
