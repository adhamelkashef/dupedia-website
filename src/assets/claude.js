/* Dupedia homepage interactions: place panels (disclosure) and the worlds index. No dependencies. */
(() => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  // Place panels: one open at a time. Click/Enter opens; on a precise pointer, hovering with intent opens too.
  const places = [...document.querySelectorAll('[data-place]')];
  const open = (li) => places.forEach(p => {
    const on = p === li; p.classList.toggle('is-open', on);
    p.querySelector('.c-place-tab').setAttribute('aria-expanded', String(on));
    const img = p.querySelector('img'); if (on && img) img.loading = 'eager';
  });
  places.forEach(li => {
    li.querySelector('.c-place-tab').addEventListener('click', () => open(li));
    let t; li.addEventListener('pointerenter', () => { if (fine.matches) t = setTimeout(() => open(li), 140); });
    li.addEventListener('pointerleave', () => clearTimeout(t));
  });
  // Worlds index: hovering or focusing a row shows its photograph.
  const links = [...document.querySelectorAll('[data-world]')], pics = [...document.querySelectorAll('[data-world-pic]')];
  const show = (i) => { pics.forEach(p => p.classList.toggle('is-on', p.dataset.worldPic === i)); links.forEach(a => a.classList.toggle('is-on', a.dataset.world === i)); };
  links.forEach(a => { a.addEventListener('pointerenter', () => show(a.dataset.world)); a.addEventListener('focus', () => show(a.dataset.world)); });
  if (links.length) { links[0].classList.add('is-on'); const pre = () => pics.forEach(p => { p.loading = 'eager'; }); const s = document.querySelector('.c-worlds');
    if (s && 'IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { pre(); io.disconnect(); } }, { rootMargin: '400px' }); io.observe(s); } }
})();
