"""Product-led Dupedia homepage. Facts and images come from the existing catalogue."""
def render_home(g, fit):
    e, BY, P = g['e'], g['BY'], g['P']
    arrow = '<span aria-hidden="true">›</span>'
    forest, ship, bridge = [BY[c] for c in ('SW-E101','SW-E107','SW-E104')]
    def image(p, eager=False):
        return f'<img src="{p["img"]}" srcset="{p["thumb"]} 560w, {p["img"]} 1100w" sizes="(max-width: 700px) 100vw, 90vw" width="1100" height="700" alt="{e(p["name"])} — manufacturer product visual" {"fetchpriority=high" if eager else "loading=lazy"} decoding="async">'
    tower = BY['SW-E107']
    hero = f'''<div class="dp-intro" role="dialog" aria-modal="true" aria-labelledby="intro-title" hidden>
      <div class="dp-intro-top"><img src="/brand/dupedia-logo-black.png" alt="Dupedia" width="1570" height="346"><button type="button" data-skip-intro>Skip intro</button></div>
      <div class="dp-intro-center"><div class="dp-intro-blocks" aria-hidden="true"><i></i><i></i><i></i><i></i></div><h2 id="intro-title">Play begins here.</h2><p>Let’s make room for possibility.</p></div>
      <p class="dp-intro-bottom" lang="en" dir="ltr" translate="no">Serious about play.</p>
    </div>
    <section class="p-hero p-hero--playful" aria-labelledby="hero-t">
      <div class="p-hero-copy"><p class="p-intro">A little imagination changes everything.</p>
      <h1 id="hero-t" lang="en" dir="ltr" translate="no"><span>Serious about</span> <span class="play-word" aria-label="play."><span class="play-letters" aria-hidden="true"><i>p</i><i>l</i><i>a</i><i>y</i><i class="play-period">.</i></span></span></h1>
      <p class="p-hero-lede">Big ideas. Little adventures.<br>Extraordinary places to play.</p>
      <div class="p-actions"><a class="p-button" href="/playgrounds/">Explore our products</a><a class="p-text-link" href="#play-assembly">Scroll to assemble {arrow}</a></div>
      <button type="button" class="hero-play-button" data-play-letters hidden><span aria-hidden="true">↻</span> Give play a spin</button><div class="hero-shapes" aria-hidden="true"><i class="hero-shape hs-one"></i><i class="hero-shape hs-two"></i><i class="hero-shape hs-three"></i><i class="hero-shape hs-four"></i></div></div>
      <div class="play-scroll" id="play-assembly"><div class="play-pin">
        <div class="play-grid" aria-hidden="true"></div><div class="play-orbit" aria-hidden="true"></div>
        <div class="play-scene-copy"><p class="p-intro">From possibility to play.</p><h2>Big imagination.<br>All aboard.</h2>
          <p class="play-stage-lede">A hull. A mast.<br>A thousand adventures.</p></div>
        <div class="play-model" aria-hidden="true"></div>
        <figure class="play-real"><img src="/img/cutouts/sw-e107.webp" width="1536" height="1024" alt="Isolated studio visual of Pirate Ship Fort with timber hull, mast, slide and swings" fetchpriority="high" decoding="async"></figure>
        <div class="play-finish-copy"><p>Meet Pirate Ship Fort.</p><a class="p-text-link" href="{tower['url']}">Discover the product {arrow}</a></div>
        <div class="play-stage-bottom"><ol class="play-phases" aria-label="From design to play"><li class="is-active">Imagine.</li><li>Assemble.</li><li>Play.</li></ol><div class="play-stage-controls"><button type="button" data-replay-assembly hidden>Build it again <span aria-hidden="true">↻</span></button><button type="button" data-replay-intro>Replay intro <span aria-hidden="true">↻</span></button></div></div>
        <div class="play-progress" aria-hidden="true"><i></i></div>
      </div></div><p class="p-caption">Illustrative 3D assembly and AI-isolated product visual. Explore the product for manufacturer specifications.</p>
    </section>'''
    solutions = [
        ('Outdoor playgrounds','Room to explore.','/playgrounds/','div-playgrounds.webp'),
        ('Soft play','Little steps. Big discoveries.','/soft-play/','div-soft-play.webp'),
        ('Water parks','Make a splash.','/water-parks/','div-water-parks.webp'),
        ('Arcades & games','Let the good times roll.','/arcade-games/','div-arcades.webp'),
        ('Amusement','Bring everyone together.','/amusement-park-equipment/','div-amusement.webp')]
    # Division photographs retain their original captions and contextual role.
    nav = '<nav class="p-category-nav" aria-label="Explore our solutions">'+''.join(f'<a href="{u}">{n}{arrow}</a>' for n,_,u,_ in solutions)+'</nav>'
    intro = '''<div class="play-ribbon" aria-hidden="true"><div><span>Imagine more.</span><i></i><span>Climb higher.</span><i></i><span>Play together.</span><i></i><span>Dream bigger.</span><i></i><span>Imagine more.</span><i></i><span>Climb higher.</span><i></i></div></div><section class="p-statement p-section"><div class="p-container"><h2><span>Great spaces bring</span><br><span>people together.</span></h2><p>We design, supply and install playgrounds and leisure experiences for schools, hotels, developers and communities. From the first idea to the finishing details, we help you make room for play.</p><a class="p-text-link" href="/about/">Get to know Dupedia <span aria-hidden="true">›</span></a></div><div class="statement-shape" aria-hidden="true"></div></section>'''
    panels='';tabs=''
    for i,(title,body) in enumerate([
        ('A world to explore.','Four towers. Connecting bridges. Seven slides. Forest House brings climbing, swinging and shared adventures into one timber play landscape.'),
        ('Every detail has a purpose.','From the climbing ramp to the picnic tables, each element adds another way to move, discover or spend time together.'),
        ('Planned around your space.','A 14.00 × 13.50 m published safety zone helps you understand the space Forest House needs before planning your layout.')]):
        tabs+=f'<button id="story-tab-{i}" type="button" role="tab" aria-selected="{"true" if i==0 else "false"}" aria-controls="story-panel-{i}" tabindex="{0 if i==0 else -1}" data-story-tab="{i}">{title}</button>'
        panels+=f'<div role="tabpanel" id="story-panel-{i}" aria-labelledby="story-tab-{i}" {"hidden" if i else ""}><p>{body}</p></div>'
    story=f'''<section class="p-story p-section" aria-labelledby="story-t"><div class="p-container"><div class="p-section-heading"><h2 id="story-t">Small moments.<br>Endless possibilities.</h2><a class="p-text-link" href="{forest['url']}">Discover Forest House {arrow}</a></div>
      <div class="p-story-stage"><figure class="p-story-image">{image(forest)}</figure><div class="p-story-label"><span>Forest House</span><span>Estate collection</span></div></div>
      <div class="p-story-details"><div class="p-tabs" role="tablist" aria-label="Discover Forest House">{tabs}</div><div class="p-story-description">{panels}</div></div>
      <dl class="p-specs"><div><dt>Play for</dt><dd>5–12<span>years</span></dd></div><div><dt>Platform height</dt><dd>1.50<span>m</span></dd></div><div><dt>Safety zone</dt><dd>14 × 13.5<span>m</span></dd></div></dl>
      <p class="p-caption">AI-isolated product visual. Dimensions and age range as published by Soliwood.</p>
    </div></section>'''
    featured=['SW-E107','SW-T203','SW-Y301','SW-E104','SW-L509']
    descriptions=['Imagination sets sail.','A new perspective on play.','Big discoveries start small.','Connect every adventure.','A place to pause.']
    cards=''
    for code,desc in zip(featured,descriptions):
        p=BY[code]
        cards+=f'''<li class="p-product-card"><a href="{p['url']}"><div class="p-product-picture">{image(p)}</div><div class="p-product-copy"><p>{e(g['CBY'][p['collection']]['short'])}</p><h3>{e(p['name'])}</h3><p class="p-card-desc">{desc}</p><span class="p-text-link">Take a closer look {arrow}</span></div></a><button type="button" class="sl-btn" data-sl="{p['code']}" data-name="{e(p['name'])}" aria-pressed="false" aria-label="Add {e(p['name'])} to shortlist">{g['ic']('plus')}</button></li>'''
    products=f'''<section class="p-products p-section" aria-labelledby="products-t"><div class="p-container p-section-heading"><h2 id="products-t">Find your kind of play.</h2><a href="/playgrounds/" class="p-text-link">Explore all {len(P)} products {arrow}</a></div><ul class="p-product-rail" id="product-rail">{cards}</ul><div class="p-container p-rail-controls"><p>Product visuals · Outdoor collection by Soliwood</p><div><button type="button" data-rail-step="-1" aria-controls="product-rail" aria-label="Previous products">‹</button><button type="button" data-rail-step="1" aria-controls="product-rail" aria-label="Next products">›</button></div></div></section>'''
    # Use existing, verified assets and existing service routes.
    paths={'Outdoor playgrounds':'div-playgrounds.webp','Soft play':'div-soft-play.webp','Water parks':'div-water-parks.webp','Arcades & games':'div-arcades.webp','Amusement':'div-amusement.webp'}
    tiles=''
    for n,tag,u,_ in solutions:
        path=paths[n]
        # Actual photo names are selected from the source directory, not invented.
        candidates={'Outdoor playgrounds':'div-play','Soft play':'div-soft','Water parks':'div-water','Arcades & games':'div-arc','Amusement':'div-amuse'}
        files=sorted(g['STATIC'].joinpath('img').glob(candidates[n]+'*.webp'))
        files=[f for f in files if '-700' not in f.stem and '-560' not in f.stem]
        if files:path=files[0].name
        else:
            fallbacks={'Outdoor playgrounds':forest['img'].removeprefix('/img/'),'Soft play':'indoor-soft-play-area.webp','Water parks':'water-park-water-slides.webp','Arcades & games':'arcade-games-entertainment-centre.webp','Amusement':'amusement-park-ride.webp'}
            path=fallbacks[n]
        concepts={'Soft play':'soft-play','Water parks':'water-parks','Arcades & games':'arcade-games','Amusement':'amusement-park-equipment'}
        if n in concepts:path='division-concepts/'+concepts[n]+'.webp'
        tiles+=f'<a class="p-solution" href="{u}"><div><h3>{n}</h3><p>{tag}</p><span class="p-text-link">Explore {arrow}</span></div><img src="/img/{path}" alt="{n} inspiration" loading="lazy" width="800" height="600"></a>'
    worlds=f'''<section class="p-worlds p-section" aria-labelledby="worlds-t"><div class="p-container"><div class="p-section-heading"><h2 id="worlds-t">Different worlds.<br>One Dupedia.</h2><p>A complete leisure experience,<br>thoughtfully connected.</p></div><div class="p-solutions-grid">{tiles}</div></div></section>'''
    planning=f'''<section class="p-planning-intro p-section"><div class="p-container"><p class="p-intro">Planning makes the difference.</p><h2>The right play.<br>In the right space.</h2><p>A beautiful playground begins with a considered plan. Explore the space your products need, then let’s work out the details together.</p></div></section>{fit}'''
    behind='''<section class="p-behind p-section" aria-labelledby="behind-t"><div class="p-container p-behind-grid"><div><p class="p-intro">Behind every great space.</p><h2 id="behind-t">Thought through.<br>Brought to life.</h2><p>Planning, engineering, manufacturing and installation. Discover the people and processes that turn an idea into a place to play.</p><div class="p-actions"><a class="p-button" href="/our-factory/">Inside our factory</a><a class="p-text-link" href="/about/">Our story <span aria-hidden="true">›</span></a></div></div><figure><img src="/img/factory-worker-embroidered.webp" alt="A member of the factory team wearing a Dupedia work uniform" width="700" height="800" loading="lazy"></figure></div></section>'''
    ceo = f'''<section class="p-ceo p-section" aria-labelledby="home-ceo-t"><div class="p-container p-ceo-grid"><figure class="p-ceo-portrait"><div class="ceo-colour" aria-hidden="true"></div><img src="/img/ceo-portrait.jpg" srcset="/img/ceo-portrait-760.jpg 760w, /img/ceo-portrait.jpg 1520w" sizes="(max-width:760px) 90vw, 40vw" width="1520" height="2020" alt="Adham El Kashef, Chief Executive Officer of Dupedia" loading="lazy"><span class="ceo-play-mark" aria-hidden="true">✳</span></figure>
      <div class="p-ceo-copy"><p class="p-intro">A note from our CEO.</p><h2 id="home-ceo-t">The reason<br>behind the play.</h2><blockquote>“{e(g['CEO_PARAS'][0])}”</blockquote><div class="p-ceo-author"><b>{e(g['CEO']['name'])}</b><span>Chief Executive Officer</span></div><a class="p-text-link" href="/about/#ceo-note">Read the full note {arrow}</a></div></div></section>'''
    finish='''<section class="p-finish p-section" aria-labelledby="finish-t"><div class="p-container"><span class="p-brand-symbol" aria-hidden="true"><i></i><i></i><i></i><i></i></span><h2 id="finish-t">Your space.<br>The next great place.</h2><p>A school yard. A resort. A new community.<br>Tell us what you have in mind.</p><div class="p-actions"><a class="p-button" href="/contact/">Let’s plan it together</a><a class="p-text-link" href="/downloads/dupedia-playground-catalogue.pdf">Download the catalogue <span aria-hidden="true">›</span></a></div></div></section>'''
    creative = '''<section class="creative-process" id="design-process" aria-labelledby="creative-title">
      <div class="creative-pin">
        <div class="creative-header"><p>Inside the Dupedia imagination.</p><h2 id="creative-title">A little “what if”.<br>A whole new world.</h2><p class="creative-description">We sketch the unexpected. Play with shapes, colour and movement. Then bring every detail into a world children can explore.</p></div>
        <div class="creative-visual" role="img" aria-label="Pirate playground design evolving from blueprint lines to flat colour, then a three-dimensional concept">
          <div class="creative-grid" aria-hidden="true"></div><div class="creative-canvas" aria-hidden="true"></div>
          <img class="creative-fallback" src="/img/cutouts/sw-e107.webp" alt="Wooden pirate ship playground concept" width="1536" height="1024" loading="lazy">
          <span class="creative-annotation ca-one" aria-hidden="true">Room for imagination</span><span class="creative-annotation ca-two" aria-hidden="true">Every detail invites play</span>
        </div>
      <div class="creative-chapters"><article><h3>Start with possibility.</h3><p>A blank page. An open mind. We imagine new ways to climb, connect and discover, shaped around your space.</p></article><article><h3>Give the idea character.</h3><p>Shapes become stories. We explore colour, materials and playful details that make a place feel unmistakably its own.</p></article><article><h3>Make room for adventure.</h3><p>We explore the idea in three dimensions, bringing scale, space and the experience of play into the conversation.</p></article></div>
        <div class="creative-footer"><nav class="creative-steps" aria-label="Explore our design process">
          <button type="button" data-design-step="0"><span>01</span> Blueprint</button><button type="button" data-design-step="1"><span>02</span> Shape &amp; colour</button><button type="button" data-design-step="2"><span>03</span> A new dimension</button>
        </nav><p class="creative-scroll-hint">Scroll to bring the idea to life</p></div>
        <div class="creative-progress" aria-hidden="true"><i></i></div>
      </div>

      <p class="creative-disclaimer">An illustrative journey through our creative process. Concept visuals are not construction drawings.</p>
    </section>'''
    from xforce_story import render_xforce
    return hero+render_xforce(g)+nav+intro+creative+story+products+worlds+planning+ceo+behind+finish
