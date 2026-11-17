"""Export responsive WebP delivery copies from ImageGen's transparent PNG masters.
No background removal or visual generation is performed here.
"""
from pathlib import Path
from PIL import Image
import json
ROOT=Path(__file__).resolve().parents[1]
folder=ROOT/'static/img/cutouts'
report=[]
for source in sorted(folder.glob('*.png')):
    im=Image.open(source).convert('RGBA')
    alpha=im.getchannel('A')
    amin,amax=alpha.getextrema()
    if amin!=0 or amax<250:raise RuntimeError(f'{source.name}: missing full transparency or opacity')
    for width,suffix in [(1440,''),(560,'-560')]:
        target=source.with_name(source.stem+suffix+'.webp')
        if not target.exists() or target.stat().st_mtime<source.stat().st_mtime:
            out=im.copy();out.thumbnail((width,width),Image.Resampling.LANCZOS)
            out.save(target,'WEBP',quality=88 if width>560 else 84,method=4)
    report.append({'code':source.stem.upper(),'width':im.width,'height':im.height,'alpha':True,'masterBytes':source.stat().st_size,'webBytes':source.with_suffix('.webp').stat().st_size})
(ROOT/'qa/cutout-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'{len(report)} transparent masters exported; {sum(x["masterBytes"] for x in report):,} master bytes -> {sum(x["webBytes"] for x in report):,} full-size delivery bytes')
