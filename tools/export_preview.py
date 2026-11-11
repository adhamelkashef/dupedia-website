"""Make a shareable offline preview of the built site: a ZIP that opens by double-clicking index.html.

    python3 src/build.py            # build first
    python3 tools/export_preview.py # writes share/Dupedia-website-preview.zip

The live site uses root paths (/img/…, /about/) that only work on a web server. This copy rewrites them to
relative paths (about/index.html, ../img/…) so every page, image and script works straight from a folder.
public/ itself is not changed. Fonts still load from Google Fonts, so the viewer needs an internet connection
for the exact typefaces (the site still works without it, in fallback fonts).
"""
import pathlib, re, shutil, sys, tempfile, zipfile, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB, OUT_DIR = ROOT / "public", ROOT / "share"
NAME = "Dupedia-website-preview"
if not (PUB / "index.html").exists(): sys.exit("Build the site first: python3 src/build.py")

def rel_url(url, prefix):
    """'/about/?x=1#y' -> prefix + 'about/index.html?x=1#y'. Leaves external, data and hash-only URLs alone."""
    if not url.startswith("/") or url.startswith("//"): return url
    m = re.match(r"([^?#]*)(.*)", url); path, rest = m.group(1), m.group(2)
    path = path.lstrip("/")
    if path == "" or path.endswith("/"): path += "index.html"
    return prefix + path + rest

ATTR = re.compile(r'\b(href|src|action|data-img|poster)="(/[^"]*)"')
SRCSET = re.compile(r'\bsrcset="([^"]*)"')

def fix_html(text, prefix):
    text = ATTR.sub(lambda m: f'{m.group(1)}="{rel_url(m.group(2), prefix)}"', text)
    text = SRCSET.sub(lambda m: 'srcset="' + ", ".join(
        " ".join([rel_url(part.split()[0], prefix)] + part.split()[1:]) for part in m.group(1).split(",") if part.strip()) + '"', text)
    text = re.sub(r"url\((['\"]?)/(?!/)", lambda m: f"url({m.group(1)}{prefix}", text)
    # page-level root prefix for the scripts, and a visible-in-source note
    text = text.replace("<head>", f'<head>\n<script>window.DP_ROOT="{prefix}";</script>', 1)
    # links to the site root keep working when opened from disk
    return text

def fix_catalog(text):
    text = re.sub(r'"thumb":"/', '"thumb":"', text)
    return re.sub(r'"url":"/([^"]*?)/"', r'"url":"\1/index.html"', text)

def fix_sitejs(text):
    text = text.replace('"use strict";', '"use strict";\n  const R = u => (u ? (window.DP_ROOT || "") + String(u).replace(/^\\//, "") : u);', 1)
    reps = [
        ('<a href="/contact/">Request a quote</a>', '<a href="${R("contact/index.html")}">Request a quote</a>'),
        ('${p.thumb || "/brand/dupedia-logo-white-700.png"}', '${R(p.thumb || "brand/dupedia-logo-white-700.png")}'),
        ('<a href="${p.url}"><img src="${p.thumb}"', '<a href="${R(p.url)}"><img src="${R(p.thumb)}"'),
        ('more.href = `/playgrounds/?l=', 'more.href = `${R("playgrounds/index.html")}?l='),
    ]
    for a, b in reps:
        if a not in text: print("  note: pattern not found in site.js:", a[:50])
        text = text.replace(a, b)
    return text

with tempfile.TemporaryDirectory() as td:
    dst = pathlib.Path(td) / NAME
    shutil.copytree(PUB, dst, ignore=shutil.ignore_patterns("_headers", "robots.txt", "sitemap.xml", ".DS_Store"))
    pages = list(dst.rglob("*.html"))
    for f in pages:
        depth = len(f.relative_to(dst).parent.parts)
        f.write_text(fix_html(f.read_text(), "../" * depth))
    cat = dst / "assets" / "catalog.js"
    if cat.exists(): cat.write_text(fix_catalog(cat.read_text()))
    sj = dst / "assets" / "site.js"
    sj.write_text(fix_sitejs(sj.read_text()))
    (dst / "OPEN ME - how to view.txt").write_text(
        "Dupedia website preview\n"
        f"Exported {datetime.date.today():%d %B %Y}\n\n"
        "1. Unzip this folder.\n"
        "2. Double-click index.html. It opens in your web browser (Chrome, Safari, Edge or Firefox).\n"
        "3. Click around: every page, the product range, the fit tool and the Arabic version are included.\n\n"
        "Notes\n"
        "- Connect to the internet for the exact brand fonts.\n"
        "- This is a review copy. The quote form does not send yet; it shows the request as text instead.\n"
        "- Contact details marked [TBC] are placeholders until Dupedia confirms them.\n")
    OUT_DIR.mkdir(exist_ok=True)
    zp = OUT_DIR / f"{NAME}.zip"
    if zp.exists(): zp.unlink()
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in sorted(dst.rglob("*")):
            if f.is_file(): z.write(f, f.relative_to(dst.parent))
    left = [str(p.relative_to(dst)) for p in pages if re.search(r'(?:href|src)="/(?!/)', p.read_text())]
    print(f"Wrote {zp.relative_to(ROOT)}  {zp.stat().st_size / 1e6:.1f} MB  ({len(pages)} pages)")
    if left: print("  pages still containing root paths:", left[:5])
