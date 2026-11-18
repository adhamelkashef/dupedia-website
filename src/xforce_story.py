"""X FORCE story: customer benefits, based on the existing operations workflow."""
STEPS = [
 ('Your brief', 'Your requirements, together from the start.', 'A clearer beginning.', 'Share the space, the ages and your ideas. Our team keeps the project requirements together.'),
 ('Engineering', 'Drawings and handover packs in one shared workflow.', 'Details that stay connected.', 'Engineering queues and shared handover packs help the team move from the agreed brief into production.'),
 ('Production', 'Clear stages, accountable teams and progress updates.', 'A smoother path to making.', 'Connected production stages give our teams a shared view of what is ready, what is next and who is responsible.'),
 ('Quality checks', 'Inspections and rework tracked before handover.', 'Care in every handover.', 'Quality inspections and any required rework stay part of the project workflow, with people responsible at every stage.'),
 ('Handover', 'Project information ready for the next step.', 'One team, all the way through.', 'Connected project information helps our team coordinate the final steps and hand over with clarity.')
]
ICONS = [
 '<path d="M8 4h9l5 5v19H8zM17 4v7h5M12 16h6M12 21h6"/>',
 '<path d="m5 23 18-18 6 6-18 18zM17 11l4 4M12 16l3 3M7 21l4 4"/>',
 '<path d="M5 28V14l8 5v-5l8 5V8h6v20zM10 24h2M16 24h2M23 24h2"/>',
 '<path d="m7 16 6 6L26 9"/><circle cx="16" cy="16" r="13"/>',
 '<path d="M6 28V5h20v23M11 10h10M11 15h10M11 20h5m5 4 3 3 5-6"/>'
]
def render_xforce(g):
 e=g['e']
 steps=''.join(f'''<li class="xos-step{' is-current' if i==0 else ''}" data-xos-step="{i}">
 <button type="button" data-xos-select="{i}" aria-controls="xos-detail-{i}"{' aria-current="step"' if i==0 else ''}><span class="xos-node"><svg viewBox="0 0 34 34" aria-hidden="true">{ICONS[i]}</svg></span><span class="xos-step-name">{e(title)}</span></button>
 <p>{e(summary)}</p></li>''' for i,(title,summary,_,__) in enumerate(STEPS))
 details=''.join(f'<div class="xos-detail" id="xos-detail-{i}"{ " hidden" if i else ""}><h3>{e(title)}</h3><p>{e(body)}</p></div>' for i,(_,__,title,body) in enumerate(STEPS))
 logo='/brand/xforce-endorsed-black.png'
 pieces=''.join(f'<span class="xos-piece" style="--slice:{i}"><img src="{logo}" width="1000" height="264" alt="" loading="lazy"></span>' for i in range(5))
 return f'''<section class="xos-section" id="xforce" aria-labelledby="xos-title"><div class="xos-pin"><div class="p-container">
 <div class="xos-heading"><div><p class="xos-kicker">Powered by X FORCE.</p><h2 id="xos-title">Our own system.<br>A smarter way to deliver.</h2></div>
 <div class="xos-introduction"><p>Our own AI-powered operating system.</p><p>Dupedia uses X FORCE to connect planning, engineering, production and handover—bringing AI assistance and our team’s expertise into one workflow, designed to make your experience clearer, easier and faster.</p></div></div>
 <div class="xos-system"><div class="xos-logo-wrap"><div class="xos-orbit" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="xos-logo"><img class="xos-logo-original" src="{logo}" width="1000" height="264" alt="X FORCE, powered by Dupedia" loading="lazy"><div class="xos-logo-pieces" aria-hidden="true">{pieces}</div></div></div>
 <div class="xos-workflow"><div class="xos-line" aria-hidden="true"><i></i></div><ol class="xos-steps" aria-label="Connected project workflow">{steps}</ol></div></div>
 <div class="xos-bottom"><div class="xos-detail-group">{details}</div><p class="xos-assistance">AI-assisted research.<br>Human expertise throughout.</p></div>
 <p class="xos-closing">One connected team. From first idea to final installation.</p>
 </div></div></section>'''
