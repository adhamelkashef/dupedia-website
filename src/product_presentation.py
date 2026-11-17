"""Product-specific presentation built exclusively from catalogue content."""
def presentation(p, c, e, controls=""):
    import re
    themes={'estate':('lime','#edf2df','#bfd35d'),'tower':('sky','#e8f1f3','#93c8cf'),'early':('sun','#fff3d8','#eac066'),'adventure':('clay','#f8e9e1','#e1a18a'),'landscape':('sage','#e8eee5','#a9bea0')}
    theme,bg,accent=themes[c['key']]
    title={'estate':'Room for a bigger imagination.','tower':'A new perspective on play.','early':'Little worlds. Big discoveries.','adventure':'Follow your sense of adventure.','landscape':'A place to pause. A reason to stay.'}[c['key']]
    if 'ship' in p['name'].lower(): title='Imagination sets sail.'
    if 'bridge' in p['name'].lower(): title='Connect the adventure.'
    first=re.split(r'(?<=[.!?])\s+(?=[A-Z])',p['description'])[0]
    if len(first)>180: first=first[:177].rsplit(' ',1)[0]+'…'
    items=p.get('contents') or []
    included='<ul>'+''.join('<li>'+e(x)+'</li>' for x in items[:3])+'</ul>' if items else '<p>Component list on request.</p>'
    image=f'<img class="product-story-image" src="{p["img"]}" width="1100" height="700" alt="{e(p["name"])} — isolated product visual" loading="lazy" decoding="async">' if p['img'] else '<div class="product-story-missing"><span>Photograph to follow</span><button type="button" class="p-button" data-open-product-model>Explore in 3D</button></div>'
    studio = '<div class="product-material-studio" data-product-studio>' + controls + '<div class="studio-image material-photo" data-studio-image>' + image + '</div></div>'
    return theme,bg,accent,f''' <section class="product-story" id="discover-product" aria-labelledby="product-story-title" style="--product-bg:{bg};--product-accent:{accent}">
    <div class="product-story-pin"><div class="product-story-heading"><p>{e(p['name'])}</p><h2 id="product-story-title">{title}</h2></div>
    <div class="product-story-visual"><div class="product-story-orbit" aria-hidden="true"></div><span class="product-story-code" aria-hidden="true">{p['code']}</span>{studio}<span class="product-story-caption">{"AI-isolated product visual" if p["img"] else "Illustrative 3D concept"}</span></div>
    <div class="product-story-copy">
      <article data-product-chapter="0"><p class="product-chapter-label">The idea</p><h3>Made for possibility.</h3><p>{e(first)}</p></article>
      <article data-product-chapter="1"><p class="product-chapter-label">The details</p><h3>A closer look.</h3>{included}<a class="p-text-link" href="#product-details">See everything included <span aria-hidden="true">›</span></a></article>
      <article data-product-chapter="2"><p class="product-chapter-label">Your space</p><h3>Picture it in your world.</h3><dl><div><dt>Dimensions</dt><dd>{e(p['dimensions'])}</dd></div><div><dt>Age range</dt><dd>{e(p['age'])}</dd></div></dl><a class="p-text-link" href="#product-fit">Will it fit your space? <span aria-hidden="true">›</span></a></article>
    </div><nav class="product-story-steps" aria-label="Explore this product"><button type="button" data-product-step="0" aria-current="step">The idea</button><button type="button" data-product-step="1">The details</button><button type="button" data-product-step="2">Your space</button></nav><div class="product-story-progress" aria-hidden="true"><i></i></div></div></section>'''
