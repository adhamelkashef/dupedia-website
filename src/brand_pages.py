"""Distinct brand stories; source facts and client names remain in the existing data."""
import re

def enrich(path, body, g):
    kind={'/about/':'about','/our-factory/':'factory','/projects/':'projects'}[path]
    e=g['e']
    hero_data={
      'about':('About Dupedia','Good people.<br>Great possibilities.','Since 1989, we have been making room for play. We bring design, supply and installation together to create places that bring people together.','Meet the people behind the play','/img/planning-team-cutout.webp','The planning team reviewing an idea'),
      'factory':('Our factory','A little craft.<br>A lot of possibility.','Materials. People. Purpose. Follow the making process, from the first inspection to the final handover.','Follow the making process','/img/factory-worker-embroidered.webp','A member of the Dupedia factory team'),
      'projects':('Projects & clients','Different places.<br>Shared joy.','Developers, hotels, schools and clubs. Explore the clients behind our playground and leisure projects.','Explore our clients',None,None)}
    label,title,lede,cta,img,alt=hero_data[kind]
    visual=f'<img src="{img}" width="700" height="900" alt="{alt}" fetchpriority="high">' if img else '<div class="brand-client-cloud" aria-hidden="true"><span>Palm Hills</span><span>Rixos</span><span>Wadi Degla</span><span>Mövenpick</span></div>'
    hero=f'''<section class="brand-hero"><div class="brand-hero-copy"><p>{label}</p><h1>{title}</h1><p class="brand-hero-lede">{lede}</p><a class="p-button" href="#brand-journey">{cta}</a></div><div class="brand-hero-art"><i class="brand-arch" aria-hidden="true"></i><i class="brand-sun" aria-hidden="true"></i>{visual}<span class="brand-spark" aria-hidden="true">✳</span></div></section>'''
    if kind=='about':
      chapters=[('Imagine together.','We start with the people.','Schools, resorts, communities and entertainment destinations. We plan around the space and the people who will use it.'),('Create with purpose.','Every detail belongs.','Design, supply and installation by one team, across all five kinds of play space.'),('Make room for joy.','The reason behind the play.','We create spaces that bring people together and make life a little more joyful.')]
      headline='One imagination.<br>So many ways to play.'
      art='''<div class="about-assemblage" aria-label="Playful shapes forming a shared place"><i class="ab-roof"></i><i class="ab-tower"></i><i class="ab-bridge"></i><i class="ab-circle"></i><i class="ab-slide"></i><span>1989</span><p>Serious about play.</p></div>'''
    elif kind=='factory':
      chapters=[(name,name,text) for name,text in g['MFG_STEPS']]
      headline='From raw material.<br>To real adventure.'
      art='''<div class="factory-workbench" role="img" aria-label="Illustrative wooden components coming together"><div class="workbench-parts"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="workbench-checks" aria-hidden="true">'''+''.join('<i>✓</i>' for _ in chapters)+'''</div><p>Illustrative making sequence</p></div>'''
    else:
      chapters=[];cards=''
      for i,(names,clients) in enumerate(g['LANDING']['projects']['groups']):
        name=g['en'](names);chapters.append((name,name,'Reference clients from our published portfolio. Detailed case studies with photos are being added.'))
        cards+=f'<article class="project-client-board" data-project-board="{i}"><p>{e(name)}</p><ul>'+''.join(f'<li translate="no">{e(n)}</li>' for n in clients)+'</ul></article>'
      headline='A place for every<br>kind of possibility.'
      art=f'<div class="project-client-window"><div class="project-client-track">{cards}</div></div>'
    panels=''.join(f'<article data-brand-panel="{i}"><p class="brand-chapter-number">{i+1:02d} / {len(chapters):02d}</p><h3>{e(title)}</h3><p>{e(text)}</p></article>' for i,(_,title,text) in enumerate(chapters))
    buttons=''.join(f'<button type="button" data-brand-step="{i}">{e(name)}</button>' for i,(name,_,_) in enumerate(chapters))
    journey=f'''<section class="brand-journey" id="brand-journey" aria-labelledby="brand-story-title"><div class="brand-journey-pin"><div class="brand-journey-heading"><h2 id="brand-story-title">{headline}</h2></div><div class="brand-journey-visual">{art}</div><div class="brand-journey-panels">{panels}</div><nav class="brand-journey-steps" aria-label="Explore this story">{buttons}</nav><div class="brand-journey-progress" aria-hidden="true"><i></i></div></div></section>'''
    # Replace the introductory section; retain the supplied CEO note and source facts.
    body=re.sub(r'^.*?</section>',hero,body,count=1,flags=re.S)
    if kind=='factory':
      body=re.sub(r'<section class="sec band-dark" aria-labelledby="mp-t">.*?</section>',journey,body,count=1,flags=re.S)
      # Bring the making journey immediately after the opening, before supporting detail.
      body=body.replace(journey,'');body=body.replace(hero,hero+journey,1)
    elif kind=='about':
        body=body.replace(hero,hero+journey,1)
        body=re.sub(r'<section class="sec">\s*<div class="wrap split">\s*<div data-reveal><h2 class="h2">Our <em>story</em>.*?</section>', '', body, count=1, flags=re.S)
    else:body=hero+journey+g['cta_band'](title='Planning a similar project?',text='Tell us about your space. Let’s imagine what it could become.')
    return f'<div class="brand-page brand-{kind}" data-brand-page="{kind}">{body}</div>'
