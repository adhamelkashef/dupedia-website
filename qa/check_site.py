"""Static checks for the built site (public/). Standard library only.

    python3 qa/check_site.py

Checks every page for: one <h1>, title and description (present, unique, sensible length), canonical,
lang, alt text on every <img>, unique ids, valid JSON-LD, broken internal links/assets, label/aria on form
controls, and that every sitemap URL exists. Exits non-zero on errors.
"""
import json, pathlib, re, sys
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

PUB = pathlib.Path(__file__).resolve().parent.parent / "public"
errors, warns = [], []

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.h1 = 0; self.title = ""; self._t = False; self.meta = {}; self.links = []; self.imgs = []
        self.ids = []; self.ld = []; self._ld = False; self.canon = None; self.lang = None; self.controls = []; self.labels_for = set(); self._lab = 0
    def handle_starttag(self, tag, a):
        a = dict(a)
        if "id" in a: self.ids.append(a["id"])
        if tag == "html": self.lang = a.get("lang")
        if tag == "h1": self.h1 += 1
        if tag == "title": self._t = True
        if tag == "meta" and a.get("name"): self.meta[a["name"]] = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical": self.canon = a.get("href")
        if tag in ("a", "link") and a.get("href"): self.links.append(a["href"])
        if tag in ("img", "script", "source") and a.get("src"): self.links.append(a["src"])
        if tag == "img":
            self.imgs.append(a)
            for part in (a.get("srcset") or "").split(","):
                if part.strip(): self.links.append(part.strip().split(" ")[0])
        if tag == "script" and a.get("type") == "application/ld+json": self._ld = True; self.ld.append("")
        if tag == "label": self._lab += 1; a.get("for") and self.labels_for.add(a["for"])
        if tag in ("input", "select", "textarea") and a.get("type") not in ("hidden",):
            self.controls.append((a.get("id"), bool(a.get("aria-label") or a.get("aria-labelledby")), self._lab > 0))
    def handle_endtag(self, tag):
        if tag == "title": self._t = False
        if tag == "script": self._ld = False
        if tag == "label": self._lab -= 1
    def handle_data(self, d):
        if self._t: self.title += d
        if self._ld: self.ld[-1] += d

def resolve(href, page_path):
    u = urlparse(href)
    if u.scheme or href.startswith(("mailto:", "tel:", "#", "//", "data:")): return None
    path = unquote(u.path)
    if not path: return None
    if not path.startswith("/"): path = "/" + str((page_path.parent.relative_to(PUB) / path).as_posix()).lstrip("./")
    f = PUB / path.lstrip("/")
    if path.endswith("/"): f = f / "index.html"
    return f

titles, descs = {}, {}
pages = sorted(PUB.rglob("*.html"))
skip_layout = {"planner.html"}
for f in pages:
    rel = "/" + f.relative_to(PUB).as_posix()
    p = Page(); p.feed(f.read_text())
    is_site = f.name not in skip_layout
    if is_site:
        if p.h1 != 1: errors.append(f"{rel}: {p.h1} <h1> elements")
        t, d = p.title.strip(), p.meta.get("description", "")
        if not t: errors.append(f"{rel}: no <title>")
        if len(t) > 70: warns.append(f"{rel}: title {len(t)} chars")
        if not (50 <= len(d) <= 320): warns.append(f"{rel}: description {len(d)} chars")
        titles.setdefault(t, []).append(rel); descs.setdefault(d, []).append(rel)
        if not p.canon: errors.append(f"{rel}: no canonical")
        if not p.lang: errors.append(f"{rel}: no lang")
        for c_id, aria, wrapped in p.controls:
            if not (aria or wrapped or (c_id and c_id in p.labels_for)): errors.append(f"{rel}: unlabelled control #{c_id}")
    for img in p.imgs:
        if "alt" not in img: errors.append(f"{rel}: <img> without alt: {img.get('src')}")
    dup = {i for i in p.ids if p.ids.count(i) > 1}
    if dup: errors.append(f"{rel}: duplicate ids {sorted(dup)[:5]}")
    for blob in p.ld:
        try: json.loads(blob)
        except Exception as ex: errors.append(f"{rel}: JSON-LD invalid ({ex})")
    for h in p.links:
        tgt = resolve(h, f)
        if tgt is not None and not tgt.exists(): errors.append(f"{rel}: broken link {h}")
    if "%%" in f.read_text(): errors.append(f"{rel}: unreplaced template marker")
for t, ps in titles.items():
    if len(ps) > 1: errors.append(f"duplicate title '{t}': {ps[:3]}")
for d, ps in descs.items():
    if len(ps) > 1: errors.append(f"duplicate description: {ps[:3]}")
sm = (PUB / "sitemap.xml").read_text()
for loc in re.findall(r"<loc>([^<]+)</loc>", sm):
    tgt = resolve(urlparse(loc).path, PUB / "index.html")
    if not tgt.exists(): errors.append(f"sitemap URL missing: {loc}")
print(f"Checked {len(pages)} HTML files, {len(re.findall('<loc>', sm))} sitemap URLs.")
for w in warns: print("  warn:", w)
for e in errors: print("  ERROR:", e)
print("OK" if not errors else f"{len(errors)} error(s)")
sys.exit(1 if errors else 0)
