"""Compose the factory portrait: B&W cut-out (from tools/cutout.swift), 2x resample + sharpen, and an embroidered
Dupedia patch stitched onto the vest (brand book p.15: white woven patch, black Dupedia logo, chest). Runs in headless Chrome.
    python3 tools/worker_patch.py cutout.png static/brand/dupedia-logo-black.png out.webp
"""
import base64, pathlib, re, subprocess, sys, tempfile
cut, logo, out = (pathlib.Path(p) for p in sys.argv[1:4])
b64 = lambda p: base64.b64encode(p.read_bytes()).decode()
# placement in source pixels (1280x709 photo): wearer's left chest panel
CROP = (360, 60, 580, 649)        # x, y, w, h around the subject
PATCH = dict(cx=746, cy=450, w=68, rot=-3, ar=0.36)   # ar = patch height/width, suits the wide 2026 wordmark
html = f"""<!doctype html><meta charset=utf-8><body><script>
(async () => {{
  const load = s => {{ const i = new Image(); i.src = s; return i.decode().then(() => i); }};
  const src = await load("data:image/png;base64,{b64(cut)}"), lg = await load("data:image/png;base64,{b64(logo)}");
  const K = 2, [cx0, cy0, cw, ch] = {list(CROP)}, W = cw * K, H = ch * K;
  // 1) crop + 2x resample in steps
  let cur = new OffscreenCanvas(cw, ch); cur.getContext("2d").drawImage(src, cx0, cy0, cw, ch, 0, 0, cw, ch);
  let w = cw, h = ch;
  while (w < W) {{ const nw = Math.min(W, Math.round(w * 1.414)), nh = Math.min(H, Math.round(h * 1.414)); const c = new OffscreenCanvas(nw, nh), x = c.getContext("2d");
    x.imageSmoothingQuality = "high"; x.drawImage(cur, 0, 0, nw, nh); cur = c; w = nw; h = nh; }}
  const out = new OffscreenCanvas(W, H), o = out.getContext("2d"); o.drawImage(cur, 0, 0, W, H);
  // 2) unsharp mask on luminance (alpha kept)
  const bl = new OffscreenCanvas(W, H).getContext("2d"); bl.filter = "blur(1.6px)"; bl.drawImage(cur, 0, 0, W, H);
  const id = o.getImageData(0, 0, W, H), bd = bl.getImageData(0, 0, W, H).data, d = id.data;
  for (let i = 0; i < d.length; i += 4) {{ if (!d[i+3]) continue; const y = d[i], df = y - bd[i];
    const v = Math.max(0, Math.min(255, Math.abs(df) > 4 ? y + .8 * df : y)); d[i] = d[i+1] = d[i+2] = v; }}
  o.putImageData(id, 0, 0);
  // 3) embroidered patch, drawn at 4x patch scale then placed
  const P = {PATCH["w"]} * K, ar = {PATCH["ar"]}, PW = P * 4, PH = Math.round(PW * ar);
  const pc = new OffscreenCanvas(PW, PH), p = pc.getContext("2d");
  const r = PW * .08;
  const rr = (x, y, w, h, r) => {{ p.beginPath(); p.roundRect(x, y, w, h, r); }};
  rr(0, 0, PW, PH, r); p.fillStyle = "#F3F2EC"; p.fill();
  p.save(); rr(0, 0, PW, PH, r); p.clip();
  // woven ground: fine crosshatch
  p.globalAlpha = .07; p.strokeStyle = "#000"; p.lineWidth = 1;
  for (let x = -PH; x < PW; x += 4) {{ p.beginPath(); p.moveTo(x, 0); p.lineTo(x + PH, PH); p.stroke(); }}
  for (let x = 0; x < PW + PH; x += 4) {{ p.beginPath(); p.moveTo(x, 0); p.lineTo(x - PH, PH); p.stroke(); }}
  p.globalAlpha = 1;
  // merrowed (satin) border: dense short stitches around the edge
  const bw = PW * .045;
  p.lineWidth = bw; p.strokeStyle = "#E4E2DA"; rr(bw / 2, bw / 2, PW - bw, PH - bw, r * .8); p.stroke();
  p.save(); rr(0, 0, PW, PH, r); p.clip(); p.strokeStyle = "rgba(0,0,0,.16)"; p.lineWidth = 1.4;
  const per = 2 * (PW + PH);
  for (let t = 0; t < per; t += 5) {{
    let x, y, nx, ny;
    if (t < PW) {{ x = t; y = 0; nx = 0; ny = 1; }} else if (t < PW + PH) {{ x = PW; y = t - PW; nx = -1; ny = 0; }}
    else if (t < 2 * PW + PH) {{ x = PW - (t - PW - PH); y = PH; nx = 0; ny = -1; }} else {{ x = 0; y = PH - (t - 2 * PW - PH); nx = 1; ny = 0; }}
    p.beginPath(); p.moveTo(x, y); p.lineTo(x + nx * bw * 1.05 + ny * 3, y + ny * bw * 1.05 + nx * 3); p.stroke();
  }}
  p.restore();
  // running stitch just inside the border
  p.setLineDash([PW * .022, PW * .014]); p.lineWidth = 3.2; p.strokeStyle = "rgba(45,45,40,.62)";
  rr(bw * 1.7, bw * 1.7, PW - bw * 3.4, PH - bw * 3.4, r * .6); p.stroke(); p.setLineDash([]);
  // logo as thread: satin stitches, angle by colour (lime 35deg, charcoal -55deg), raised with shadow and sheen
  const lw = PW * .78, lh = lw * lg.naturalHeight / lg.naturalWidth, lx = (PW - lw) / 2, ly = (PH - lh) / 2;
  const L = new OffscreenCanvas(PW, PH), l = L.getContext("2d"); l.imageSmoothingQuality = "high"; l.drawImage(lg, lx, ly, lw, lh);
  const ld = l.getImageData(0, 0, PW, PH), q = ld.data;
  for (let yy = 0; yy < PH; yy++) for (let xx = 0; xx < PW; xx++) {{
    const i = (yy * PW + xx) * 4; if (!q[i+3]) continue;
    const lime = q[i+1] > 120;                                   // lime vs charcoal thread
    const a = lime ? .61 : -.96, u = xx * Math.cos(a) + yy * Math.sin(a);
    const s = Math.sin(u * 1.35);                                // stitch rows
    const sheen = .82 + .22 * s * s + .08 * Math.sin(u * .21 + yy * .05);
    q[i] = Math.min(255, q[i] * sheen + (lime ? 10 : 18) * (s > .7)); q[i+1] = Math.min(255, q[i+1] * sheen + (lime ? 10 : 18) * (s > .7)); q[i+2] = Math.min(255, q[i+2] * sheen + (lime ? 6 : 18) * (s > .7));
  }}
  l.putImageData(ld, 0, 0);
  p.save(); p.shadowColor = "rgba(0,0,0,.45)"; p.shadowBlur = 3; p.shadowOffsetX = 1.2; p.shadowOffsetY = 2; p.drawImage(L, 0, 0); p.restore();
  // thread fuzz over everything: fine noise so it reads as fabric, not print
  const fz = p.getImageData(0, 0, PW, PH), fd = fz.data;
  for (let i = 0; i < fd.length; i += 4) {{ if (!fd[i+3]) continue; const n = (Math.random() - .5) * 18; fd[i] += n; fd[i+1] += n; fd[i+2] += n; }}
  p.putImageData(fz, 0, 0);
  p.restore();
  // 4) place the patch: rotate, take the vest's shading so it sits in the fabric
  const pw = P, ph = Math.round(P * ar), tx = ({PATCH["cx"]} - cx0) * K, ty = ({PATCH["cy"]} - cy0) * K;
  const S = new OffscreenCanvas(W, H), s2 = S.getContext("2d");
  s2.translate(tx, ty); s2.rotate({PATCH["rot"]} * Math.PI / 180);
  s2.save(); s2.shadowColor = "rgba(0,0,0,.28)"; s2.shadowBlur = 1.2; s2.shadowOffsetY = .8;
  s2.imageSmoothingQuality = "high"; s2.drawImage(pc, -pw / 2, -ph / 2, pw, ph); s2.restore();
  const sd = s2.getImageData(0, 0, W, H), sp = sd.data, base = o.getImageData(0, 0, W, H), bp = base.data;
  // mean vest luminance under the patch
  let sum = 0, n = 0; for (let i = 0; i < sp.length; i += 4) if (sp[i+3] > 200 && bp[i+3]) {{ sum += bp[i]; n++; }}
  const mean = sum / Math.max(1, n);
  for (let i = 0; i < sp.length; i += 4) {{
    const a = sp[i+3] / 255; if (!a || !bp[i+3]) continue;
    const shade = Math.pow(Math.max(.4, bp[i] / mean), .55);   // carry folds and light across the patch
    for (let k = 0; k < 3; k++) bp[i+k] = Math.round(bp[i+k] * (1 - a) + Math.min(255, sp[i+k] * shade) * a);
  }}
  o.putImageData(base, 0, 0);
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; cv.getContext("2d").drawImage(out, 0, 0);
  const e = document.createElement("pre"); e.id = "out"; e.textContent = cv.toDataURL("image/webp", .9); document.body.append(e);
}})().catch(e => {{ const x = document.createElement("pre"); x.id = "err"; x.textContent = String(e); document.body.append(x); }});
</script>"""
with tempfile.TemporaryDirectory() as td:
    f = pathlib.Path(td) / "w.html"; f.write_text(html)
    if len(sys.argv) > 4: pathlib.Path(sys.argv[4]).write_text(html)
    res = subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--virtual-time-budget=60000", "--dump-dom", f.as_uri()], capture_output=True, text=True, timeout=240).stdout
m = re.search(r'id="out">data:image/webp;base64,([A-Za-z0-9+/=]+)<', res)
if not m: sys.exit("failed: " + (re.search(r'id="err">([^<]*)<', res) or [None, "no output"])[1])
out.write_bytes(base64.b64decode(m.group(1))); print("wrote", out, out.stat().st_size // 1024, "KB")
