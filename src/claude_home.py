"""Dupedia homepage — "Play environments" edition.

Photography-led: the product range is shown where it lives (resorts, compounds, schools),
using the existing lifestyle visuals from the catalogue. Every fact on this page comes from
src/data/products.json, src/content/landing.json, src/config.json or existing approved copy.
"""


def render_home(g, fit):
    e, BY, P, ARROW = g['e'], g['BY'], g['P'], g['ARROW']
    mark = g['mark']
    life = lambda code: f"/img/{BY[code]['imgbase']}.webp"
    life_s = lambda code: f"/img/{BY[code]['imgbase']}-560.webp"

    # ---------------------------------------------------------------- 1. hero
    # Four places Dupedia builds for. Each panel is a real catalogue visual in its setting.
    places = [
        ("resorts", "Resorts &amp; hotels", "A landmark kids’ area on the beach or by the pool.", "SW-E107",
         "/playgrounds-for-hotels-resorts/", "Pirate Ship Fort on a resort beach at sunset"),
        ("compounds", "Compounds &amp; developers", "Play landscapes planned with the masterplan.", "SW-E101",
         "/playgrounds-for-developers-compounds/", "Forest House play landscape in a residential compound garden"),
        ("schools", "Schools", "Equipment sized for each age group and the yard you have.", "SW-T204",
         "/school-playgrounds/", "Storm Flyer play tower in a school yard"),
        ("clubs", "Clubs &amp; leisure", "Play, water and entertainment for members and guests.", "SW-E108",
         "/who-we-work-with/", "Trampoline and play tower system on a club lawn"),
    ]
    panels = ""
    for i, (key, name, line, code, url, alt) in enumerate(places):
        cta = {"resorts": "Plan a resort kids’ area", "compounds": "Plan a compound playground", "schools": "Plan a school playground", "clubs": "See who we work with"}[key]
        first = i == 0
        img = (f'<img src="{life(code)}" srcset="{life_s(code)} 560w, {life(code)} 1100w" '
               f'sizes="(max-width: 760px) 100vw, 60vw" width="1100" height="700" alt="{alt}" '
               f'{"fetchpriority=high" if first else "loading=lazy"} decoding="async">')
        panels += f'''<li class="c-place{" is-open" if first else ""}" data-place>
        <button type="button" class="c-place-tab" aria-expanded="{"true" if first else "false"}" aria-controls="place-{key}" id="place-tab-{key}"><span>{name}</span></button>
        <div class="c-place-body" id="place-{key}" role="region" aria-labelledby="place-tab-{key}">
          {img}
          <div class="c-place-copy"><p class="c-place-name">{name}</p><p>{line}</p><a href="{url}">{cta} {ARROW}</a></div>
        </div>
      </li>'''

    n_products = len(P)
    hero = f'''<section class="c-hero" aria-labelledby="hero-t" data-enter>
  <div class="c-wrap c-hero-head">
    <h1 id="hero-t" class="c-display"><span class="c-l1">Play environments</span> <span class="c-l2">for resorts, compounds and&nbsp;schools.</span></h1>
    <div class="c-hero-side">
      <p class="c-lede">Dupedia designs, manufactures and installs playgrounds, soft play, water parks and outdoor furniture, from the first site plan to handover.</p>
      <div class="c-actions"><a class="c-btn c-btn-primary" href="/contact/">Start a project</a><a class="c-btn c-btn-quiet" href="/playgrounds/">Explore {n_products} play systems</a></div>
    </div>
  </div>
  <ul class="c-wrap c-places" aria-label="Places we build for">{panels}</ul>
  <dl class="c-wrap c-facts">
    <div><dt>Established</dt><dd>1989</dd></div>
    <div><dt>Quality system</dt><dd>ISO&nbsp;9001</dd></div>
    <div><dt>Made in</dt><dd>Our own factory</dd></div>
    <div><dt>Play systems</dt><dd>{n_products}</dd></div>
  </dl>
</section>'''

    # ---------------------------------------------------------------- 2. clients
    groups = g['LANDING']['projects']['groups']
    rows = ""
    for (label, _ar), clients in groups:
        names = "".join(f'<li translate="no">{e(c)}</li>' for c in clients)
        rows += f'<div class="c-client-row"><h3>{e(label)}</h3><ul>{names}</ul></div>'
    clients = f'''<section class="c-sec c-clients" aria-labelledby="clients-t">
  <div class="c-wrap">
    <div class="c-sec-head"><h2 id="clients-t" class="c-h2">Chosen by the people who build Egypt.</h2>
      <a class="c-link" href="/projects/">See projects by sector {ARROW}</a></div>
    <div class="c-client-rows">{rows}</div>
  </div>
</section>'''

    # ---------------------------------------------------------------- 3. worlds (what we create)
    worlds = [
        ("play", "Outdoor playgrounds", "Towers, bridges, slides and swings in five timber collections.", "/playgrounds/",
         life("SW-E104"), "Bridge House play system in a landscaped garden"),
        ("soft", "Soft play &amp; indoor", "Soft play frames and indoor play centres fitted to your unit.", "/soft-play/",
         "/img/indoor-soft-play-area.webp", "Indoor soft play area with ball pool and tube slides"),
        ("water", "Water parks", "Slides, splash pads and aquatic play for resorts and parks.", "/water-parks/",
         "/img/water-park-water-slides.webp", "Water park play structure with slides over a pool"),
        ("amuse", "Amusement rides", "Rides and attractions for parks and destinations.", "/amusement-park-equipment/",
         "/img/amusement-park-ride.webp", "Swing ride lit up at an amusement park"),
        ("arcade", "Arcades &amp; games", "Arcade machines and family entertainment centre fit-outs.", "/arcade-games/",
         "/img/arcade-games-entertainment-centre.webp", "Family entertainment centre with arcade machines"),
        (None, "Outdoor &amp; beach furniture", "Benches and tables in the same design language as the play.", "/outdoor-furniture/",
         life("SW-L502"), "Heritage park bench in a garden"),
        (None, "Custom projects", "A theme, a footprint or a brief nobody has built before.", "/contact/?type=Not%20sure%20yet",
         life("SW-E110"), "Grand Activity Landscape spread across a compound green"),
    ]
    items, pics = "", ""
    for i, (key, name, line, url, src, alt) in enumerate(worlds):
        glyph = mark(key, 22) if key else '<span class="c-glyph" aria-hidden="true"></span>'
        items += f'<li><a href="{url}" data-world="{i}">{glyph}<span class="c-world-name">{name}</span><span class="c-world-line">{line}</span><img class="c-world-thumb" src="{src}" alt="" width="76" height="76" loading="lazy" decoding="async"></a></li>'
        pics += f'<img src="{src}" alt="{alt}" width="1000" height="1250" loading="lazy" decoding="async" data-world-pic="{i}"{" class=is-on" if i == 0 else ""}>'
    worlds_html = f'''<section class="c-sec c-worlds" aria-labelledby="worlds-t">
  <div class="c-wrap c-worlds-grid">
    <div>
      <h2 id="worlds-t" class="c-h2">Everything a place to play needs.</h2>
      <ul class="c-world-list">{items}</ul>
    </div>
    <div class="c-world-pics" aria-hidden="true">{pics}</div>
  </div>
</section>'''

    # ---------------------------------------------------------------- 4. signature product
    fh = BY['SW-E101']
    picks = ['SW-E107', 'SW-T203', 'SW-Y301']
    cards = ""
    for code in picks:
        p = BY[code]
        cards += f'''<li class="c-pcard"><a href="{p['url']}">
          <span class="c-pcard-pic"><img src="{life_s(code)}" srcset="{life_s(code)} 560w, {life(code)} 1100w" sizes="(max-width: 760px) 92vw, 30vw" width="560" height="400" alt="{e(p['name'])} in its setting" loading="lazy" decoding="async"></span>
          <span class="c-pcard-meta"><span class="c-pcard-name">{e(p['name'])}</span><span class="c-pcard-facts"><span>Ages {e(p['age'])}</span><span>{e(p['collection'].title())} collection</span></span></span></a></li>'''
    feature = f'''<section class="c-sec c-feature" aria-labelledby="feature-t">
  <div class="c-wrap">
    <div class="c-feature-grid">
      <a class="c-feature-pic" href="{fh['url']}" tabindex="-1" aria-hidden="true"><img src="{life('SW-E101')}" width="1100" height="618" alt="" loading="lazy" decoding="async"></a>
      <div class="c-feature-copy">
        <h2 id="feature-t" class="c-h2">Forest House turns a shared green into a destination.</h2>
        <p>Four towers, connecting bridges and seven slides, with climbing, swinging and places to sit in one timber landscape.</p>
        <dl class="c-specs">
          <div><dt>Ages</dt><dd>{e(fh['age'])}</dd></div>
          <div><dt>Platform</dt><dd>{e(fh['platform'])}</dd></div>
          <div><dt>Safety zone</dt><dd>{e(fh['safetyZone'])}</dd></div>
        </dl>
        <div class="c-actions"><a class="c-btn c-btn-primary" href="{fh['url']}">Discover Forest House</a>
          <button type="button" class="c-btn c-btn-quiet" data-sl="{fh['code']}" data-name="{e(fh['name'])}" aria-pressed="false"><span class="t">Add to shortlist</span></button></div>
      </div>
    </div>
    <div class="c-sec-head c-sec-head-sm"><h3 class="c-h3">More from the range</h3><a class="c-link" href="/playgrounds/">All {n_products} play systems {ARROW}</a></div>
    <ul class="c-pcards">{cards}</ul>
  </div>
</section>'''

    # ---------------------------------------------------------------- 5. process (a real sequence)
    steps = [
        ("Brief and site", "Send a plan, or photos with rough dimensions. We visit the site when it helps."),
        ("Layout and quotation", "You get a layout with every safety zone drawn, and a quotation to match."),
        ("Manufacture", "Made in our own factory, inspected under our ISO&nbsp;9001 quality system."),
        ("Installation and handover", "Our team installs, checks every element and hands the space over."),
    ]
    st = "".join(f'<li><span class="c-step-n">{i + 1}</span><h3>{t}</h3><p>{d}</p></li>' for i, (t, d) in enumerate(steps))
    process = f'''<section class="c-sec c-process" aria-labelledby="process-t">
  <div class="c-wrap c-process-grid">
    <div class="c-process-copy">
      <h2 id="process-t" class="c-h2">One team from the first plan to the day it opens.</h2>
      <ol class="c-steps">{st}</ol>
      <div class="c-actions"><a class="c-btn c-btn-lime" href="/our-factory/">Inside our factory</a><a class="c-btn c-btn-ghost" href="/planning-guide/">Read the planning guide</a></div>
    </div>
    <figure class="c-process-pic"><img src="/img/factory-worker-embroidered.webp" width="1186" height="1327" alt="A Dupedia factory worker in a hard hat and safety vest, arms crossed, smiling" loading="lazy" decoding="async"></figure>
  </div>
</section>'''

    # ---------------------------------------------------------------- 6. fit tool (existing logic, new frame)
    fit = fit.replace(' data-reveal', '').replace('class="sec sec-white"', 'class="sec sec-white c-fit"')

    # ---------------------------------------------------------------- 7. CEO
    ceo = f'''<section class="c-sec c-ceo" aria-labelledby="ceo-t">
  <div class="c-wrap c-ceo-grid">
    <img src="/img/ceo-portrait-760.jpg" srcset="/img/ceo-portrait-760.jpg 760w, /img/ceo-portrait.jpg 1520w" sizes="(max-width: 760px) 70vw, 28vw" width="760" height="1010" alt="Adham El Kashef, Chief Executive Officer of Dupedia" loading="lazy" decoding="async">
    <div>
      <h2 id="ceo-t" class="c-h3">A note from our Chief Executive Officer</h2>
      <blockquote class="c-quote">“{e(g['CEO_PARAS'][0])}”</blockquote>
      <p class="c-ceo-name"><b>{e(g['CEO']['name'])}</b> Chief Executive Officer</p>
      <a class="c-link" href="/about/#ceo-note">Read the full note {ARROW}</a>
    </div>
  </div>
</section>'''

    # ---------------------------------------------------------------- 8. close: three ways in
    close = f'''<section class="c-close" aria-labelledby="close-t">
  <div class="c-wrap">
    <h2 id="close-t" class="c-display c-close-t">Tell us about your&nbsp;site.</h2>
    <ul class="c-paths">
      <li><a href="/contact/"><b>Request a quotation</b><span>You know what you need. Send the space, the ages and your shortlist.</span><i>{ARROW}</i></a></li>
      <li><a href="/contact/?type=Not%20sure%20yet"><b>Discuss a custom project</b><span>A theme, an unusual footprint or a whole destination. Start with the brief.</span><i>{ARROW}</i></a></li>
      <li><a href="/downloads/dupedia-playground-catalogue.pdf"><b>Download the catalogue</b><span>All five playground collections with sizes and safety zones. PDF, 7&nbsp;MB.</span><i>{ARROW}</i></a></li>
    </ul>
  </div>
</section>'''

    return hero + clients + worlds_html + feature + process + fit + ceo + close
