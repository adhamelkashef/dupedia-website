"""Trace the original logo silhouettes into a resolution-independent SVG."""
from pathlib import Path
import png
w,h,p=png.read('static/brand/logo_compact.png')
def simplify(points, eps=1.6):
    if len(points)<3:return points
    a,b=points[0],points[-1];dx,dy=b[0]-a[0],b[1]-a[1];den=(dx*dx+dy*dy)**.5
    ds=[abs(dy*(x-a[0])-dx*(y-a[1]))/den if den else ((x-a[0])**2+(y-a[1])**2)**.5 for x,y in points]
    d=max(ds);i=ds.index(d)
    if d<=eps:return [a,b]
    return simplify(points[:i+1],eps)[:-1]+simplify(points[i:],eps)
def trace(lime):
    cells=set()
    for y in range(h):
        for x in range(w):
            i=(y*w+x)*4;r,g,b,a=p[i:i+4]
            if a>=128 and ((g>80 and g>b*1.4)==lime):cells.add((x,y))
    edges={}
    for x,y in cells:
        for other,a,b in [((x,y-1),(x,y),(x+1,y)),((x+1,y),(x+1,y),(x+1,y+1)),((x,y+1),(x+1,y+1),(x,y+1)),((x-1,y),(x,y+1),(x,y))]:
            if other not in cells:edges.setdefault(a,[]).append(b)
    paths=[]
    while edges:
        start=next(iter(edges));cur=start;pts=[cur]
        while True:
            nxt=edges[cur].pop()
            if not edges[cur]:del edges[cur]
            cur=nxt;pts.append(cur)
            if cur==start:break
        if len(pts)<12:continue
        mid=len(pts)//2
        pts=simplify(pts[:mid+1])[:-1]+simplify(pts[mid:])
        paths.append('M'+' L'.join(f'{x} {y}' for x,y in pts)+' Z')
    return ' '.join(paths)
lime=trace(True);letters=trace(False)
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="1980" viewBox="-12 -12 {w+24} {h+24}"><title>Dupedia original logo — vector master</title><path fill="#B8D241" fill-rule="evenodd" d="{lime}"/><path fill="#FBFAF6" stroke="#1B1B19" stroke-width="4" stroke-linejoin="round" paint-order="stroke fill" fill-rule="evenodd" d="{letters}"/></svg>'''
Path('static/brand/logo-original-vector.svg').write_text(svg)
print('Vector master created',w,h)
