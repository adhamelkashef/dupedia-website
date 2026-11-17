/* Dupedia website · motion and play. No dependencies.
   Intro loader, block playground, marquee, scroll scrubs, pinned divisions, drag rail, cursor, magnetic buttons.
   Every effect is an enhancement: content and links work without it, and prefers-reduced-motion turns the
   moving parts off (the loader is skipped, scrubs show their end state, the cursor stays native). */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, k) => a + (b - a) * k;

  /* ================================================================ intro loader */
  const loader = $(".loader");
  if (loader && html.classList.contains("intro")) {
    const curtain = $(".loader-curtain"), count = $(".loader-count b", loader), bar = $(".loader-bar", loader);
    const blocks = $$(".loader-cluster i", loader), cluster = $(".loader-cluster", loader);
    const imgs = $$("img[data-preload]");
    const total = imgs.length + 2; let done = 0;
    const tick = () => { done = Math.min(total, done + 1); };
    imgs.forEach(im => (im.complete && im.naturalWidth) ? tick() : (im.addEventListener("load", tick, { once: true }), im.addEventListener("error", tick, { once: true })));
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick);
    if (document.readyState === "complete") tick(); else addEventListener("load", tick, { once: true });

    const t0 = performance.now(), MIN = 300, MAX = 1800;
    let shown = 0, finished = false, mx = 0, my = 0, cx = 0, cy = 0;
    const finish = () => {
      if (finished) return; finished = true;
      try { sessionStorage.setItem("dp-intro", "1"); } catch { /* private mode: the intro may show again */ }
      count.textContent = "100"; loader.style.setProperty("--p", 1);
      loader.classList.add("out"); curtain.classList.add("out");
      setTimeout(() => html.classList.add("intro-go"), 520);
      setTimeout(() => { html.classList.remove("intro", "intro-go"); loader.remove(); curtain.remove(); dispatchEvent(new Event("dp:introdone")); }, 1300);
    };
    const frame = now => {
      if (finished) return;
      const el = now - t0;
      const target = Math.min(done / total * 100, el / MIN * 100, 100);
      shown = el > MAX ? 100 : lerp(shown, target, .09);
      if (target >= 100 && shown > 99.4) shown = 100;
      count.textContent = String(Math.floor(shown)).padStart(3, "0");
      loader.style.setProperty("--p", (shown / 100).toFixed(3));
      blocks.forEach((b, i) => b.classList.toggle("on", shown >= [8, 34, 60, 86][i]));
      // pointer play: the cluster leans toward the pointer, each block by a different amount
      cx = lerp(cx, mx, .08); cy = lerp(cy, my, .08);
      cluster.style.transform = `translate(${cx * 40}px, ${cy * 40}px)`;
      blocks.forEach((b, i) => { const k = [10, -14, 16, -8][i]; b.style.setProperty("--px", `${cx * k}px`); b.style.setProperty("--py", `${cy * -k}px`); });
      if (shown >= 100) { setTimeout(finish, 380); return; }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    loader.addEventListener("pointermove", e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; });
    loader.addEventListener("click", e => {
      if (e.target.closest(".loader-skip")) { finish(); return; }
      blocks.forEach((b, i) => { b.classList.remove("bounce"); void b.offsetWidth; b.style.animationDelay = `${i * 50}ms`; b.classList.add("bounce"); });
    });
    addEventListener("keydown", e => { if (!finished && (e.key === "Escape" || e.key === "Enter")) finish(); });
    $(".loader-skip", loader)?.focus({ preventScroll: true });
  }

  /* ================================================================ block playground (hero) */
  const field = $(".play-field");
  if (field) {
    const blocks = $$(".pb", field), hint = $("#play-hint");
    const LAYOUTS = [
      [[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[3,3],[0,4],[5,4],[3,4]],
      [[0,5],[1,4],[2,3],[3,2],[4,1],[5,0],[1,5],[2,4],[3,3],[2,5]],
      [[2,5],[2,3],[3,1],[2,4],[2,2],[3,2],[2,1],[3,4],[3,3],[3,5]],
      [[0,0],[2,0],[4,0],[1,2],[3,2],[5,2],[0,4],[2,4],[4,4],[5,5]],
    ];
    let layout = 0;
    const pos = blocks.map((b, i) => LAYOUTS[0][i].slice());
    const place = (b, i, delay = 0) => { b.style.transitionDelay = `${delay}ms`; b.style.transform = `translate(${pos[i][0] * 100}%, ${pos[i][1] * 100}%)`; b.dataset.cell = pos[i].join(","); };
    const land = b => { b.classList.remove("landed"); void b.offsetWidth; b.classList.add("landed"); };
    blocks.forEach((b, i) => place(b, i));
    const at = (x, y, except) => pos.findIndex((p, j) => j !== except && p[0] === x && p[1] === y);
    const moveTo = (i, x, y) => {
      x = clamp(x, 0, 5); y = clamp(y, 0, 5);
      const other = at(x, y, i);
      if (other > -1) { pos[other] = pos[i].slice(); place(blocks[other], other, 60); land(blocks[other]); }
      pos[i] = [x, y]; place(blocks[i], i); land(blocks[i]);
    };
    const rotate = b => { const r = ((+b.dataset.rot || 0) + 1) % 4; b.dataset.rot = r; b.style.setProperty("--rot", `${r * 90}deg`); land(b); };

    // drag with pointer (mouse, pen and touch)
    blocks.forEach((b, i) => {
      let sx, sy, moved = false, cell;
      b.addEventListener("pointerdown", e => {
        if (e.button !== 0) return;
        b.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; moved = false;
        cell = field.getBoundingClientRect().width / 6;
        b.classList.add("dragging"); b.style.transitionDelay = "0ms";
      });
      b.addEventListener("pointermove", e => {
        if (!b.classList.contains("dragging")) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
        b.style.transform = `translate(calc(${pos[i][0] * 100}% + ${dx}px), calc(${pos[i][1] * 100}% + ${dy}px))`;
      });
      const end = e => {
        if (!b.classList.contains("dragging")) return;
        b.classList.remove("dragging");
        if (!moved) { rotate(b); return; }
        const dx = e.clientX - sx, dy = e.clientY - sy;
        moveTo(i, Math.round(pos[i][0] + dx / cell), Math.round(pos[i][1] + dy / cell));
        if (hint) hint.textContent = "Snapped into place. Click a block to turn it.";
      };
      b.addEventListener("pointerup", end); b.addEventListener("pointercancel", end);
      b.addEventListener("keydown", e => {
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (d) { e.preventDefault(); moveTo(i, pos[i][0] + d[0], pos[i][1] + d[1]); }
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); rotate(b); }
      });
    });

    // blocks lean away from the pointer
    if (fine && !reduce) {
      field.addEventListener("pointermove", e => {
        const r = field.getBoundingClientRect(), u = r.width / 6;
        blocks.forEach((b, i) => {
          if (b.classList.contains("dragging")) return;
          const bx = r.left + (pos[i][0] + .5) * u, by = r.top + (pos[i][1] + .5) * u;
          const dx = bx - e.clientX, dy = by - e.clientY, d = Math.hypot(dx, dy), R = u * 1.5;
          const k = d < R ? (1 - d / R) * 16 : 0;
          b.style.setProperty("--nx", `${d ? dx / d * k : 0}px`); b.style.setProperty("--ny", `${d ? dy / d * k : 0}px`);
        });
      });
      field.addEventListener("pointerleave", () => blocks.forEach(b => { b.style.setProperty("--nx", "0px"); b.style.setProperty("--ny", "0px"); }));
    }
    $("#play-shuffle")?.addEventListener("click", () => {
      layout = (layout + 1) % LAYOUTS.length;
      blocks.forEach((b, i) => { pos[i] = LAYOUTS[layout][i].slice(); place(b, i, reduce ? 0 : i * 45); });
      if (hint) hint.textContent = ["Back to the block band.", "A staircase.", "A tower, two blocks wide.", "Every block on its own square."][layout];
    });
    // the first time, drop the blocks in one by one
    const drop = () => { if (reduce) return; blocks.forEach((b, i) => { b.animate([{ translate: "0 -140%", opacity: 0 }, { translate: "0 0", opacity: 1 }], { duration: 700, delay: 200 + i * 70, easing: "cubic-bezier(.3,1.3,.5,1)", fill: "backwards" }); }); };
    html.classList.contains("intro") ? addEventListener("dp:introdone", drop, { once: true }) : drop();
  }

  /* ================================================================ scroll-driven pieces */
  const scrubs = [];
  const vh = () => innerHeight;

  // word-by-word statement
  $$(".stmt").forEach(el => {
    const words = $$(".w", el);
    scrubs.push(() => {
      const r = el.getBoundingClientRect();
      const p = clamp((vh() * .85 - r.top) / (r.height + vh() * .3));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    });
  });

  // expanding product visual
  const show = $(".showcase");
  if (show) {
    if (reduce) html.classList.add("no-scrub");
    else scrubs.push(() => {
      const r = show.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh())), e = ease(clamp(p / .7));
      show.style.setProperty("--ci", `${(18 * (1 - e)).toFixed(2)}%`);
      show.style.setProperty("--cx", `${(22 * (1 - e)).toFixed(2)}%`);
      show.style.setProperty("--cr", `${(48 * (1 - e)).toFixed(1)}px`);
      show.style.setProperty("--sc", (1.18 - .18 * e).toFixed(3));
      show.style.setProperty("--ov", clamp((p - .5) / .3).toFixed(3));
    });
  }

  // divisions: vertical scroll drives a horizontal track
  const hs = $(".hs");
  if (hs) {
    const track = $(".hs-track", hs), panels = $$(".hs-panel", hs), countEl = $(".hs-count", hs), bar = $(".hs-progress", hs);
    let max = 0, on = false;
    const setup = () => {
      on = !reduce && innerWidth > 760;
      html.classList.toggle("no-hs", !on);
      if (!on) { hs.style.height = ""; track.style.transform = ""; return; }
      track.style.transform = "translateX(0)";
      const last = panels[panels.length - 1];
      max = Math.max(0, last.offsetLeft + last.offsetWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft));
      hs.style.height = `${max + vh()}px`;
    };
    setup(); addEventListener("resize", setup);
    const activate = () => {
      const mid = innerWidth / 2; let best = 0, bd = Infinity;
      panels.forEach((pn, i) => { const r = pn.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
      panels.forEach((pn, i) => pn.classList.toggle("is-active", i === best));
      countEl.textContent = `${String(best + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
      return best;
    };
    scrubs.push(() => {
      if (!on) { const t = track; bar.style.setProperty("--p", t.scrollWidth > t.clientWidth ? (t.scrollLeft / (t.scrollWidth - t.clientWidth)).toFixed(3) : 1); activate(); return; }
      const r = hs.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh()));
      track.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
      bar.style.setProperty("--p", p.toFixed(3));
      activate();
    });
    track.addEventListener("scroll", () => requestScrub(), { passive: true });
  }

  let pending = false;
  // Scroll sets a target; time-based easing keeps the stronger portrait motion fluid.
  if (!reduce) $$(".xf-field, .worker, .process-portrait").forEach(field => {
    let target = .5, current = .5, frame = 0, last = 0;
    const paint = now => {
      const dt = Math.min(64, now - (last || now - 16)); last = now;
      current += (target - current) * (1 - Math.exp(-dt / 95));
      if (Math.abs(target - current) < .0005) current = target;
      const mobile = innerWidth <= 900, process = field.classList.contains("process-portrait");
      const travel = process ? (mobile ? 140 : 230) : (mobile ? 90 : 150);
      const zoom = process ? (mobile ? .16 : .22) : .12;
      field.style.setProperty("--worker-y", `${((.5 - current) * travel).toFixed(2)}px`);
      field.style.setProperty("--worker-scale", (1 + zoom * (1 - current)).toFixed(4));
      field.style.setProperty("--circle-y", `${((current - .5) * travel * .8).toFixed(2)}px`);
      frame = current === target ? 0 : requestAnimationFrame(paint);
    };
    scrubs.push(() => {
      const r = field.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      target = clamp((innerHeight - r.top) / (innerHeight + r.height));
      if (!frame) { last = 0; frame = requestAnimationFrame(paint); }
    });
  });
  // Cards reveal independently on narrow screens and stagger together on desktop.
  if (!reduce) $$(".ecosystem-card").forEach((card, index) => {
    let target = 1, current = 1, frame = 0, last = 0, y = 0;
    const paint = now => {
      const dt = Math.min(64, now - (last || now - 16)); last = now;
      current += (target - current) * (1 - Math.exp(-dt / 100));
      if (Math.abs(target - current) < .001) current = target;
      y = (1 - current) * (innerWidth <= 760 ? 24 : 44);
      card.style.setProperty("--eco-y", `${y.toFixed(2)}px`);
      card.style.setProperty("--eco-opacity", (.4 + .6 * current).toFixed(3));
      card.style.setProperty("--eco-scale", (.94 + .06 * current).toFixed(4));
      frame = current === target ? 0 : requestAnimationFrame(paint);
    };
    scrubs.push(() => {
      const r = card.getBoundingClientRect(), top = r.top - y;
      const delay = innerWidth > 760 ? index * 60 : 0;
      target = clamp((innerHeight * .97 - top - delay) / Math.min(300, innerHeight * .4));
      if (!frame) { last = 0; frame = requestAnimationFrame(paint); }
    });
  });
  const runScrubs = () => { pending = false; scrubs.forEach(f => f()); };
  const requestScrub = () => { if (!pending) { pending = true; requestAnimationFrame(runScrubs); } };
  if (scrubs.length) { addEventListener("scroll", requestScrub, { passive: true }); addEventListener("resize", requestScrub); runScrubs(); }

  /* ================================================================ swinging photo: a damped pendulum pushed by scroll and pointer */
  const rig = $(".swing-rig");
  if (rig && !reduce) {
    const stage = rig.closest(".swing-stage"), ball = $(".swing-ball"), sec = rig.closest(".swing");
    let th = 0, om = 0, lastY = scrollY, lastX = null, running = false, visible = false;
    const MAX = 6;
    const kick = v => { om += v; if (!running && visible) { running = true; requestAnimationFrame(step); } };
    let last = performance.now();
    const step = now => {
      const dt = Math.min(32, now - last) / 16.67; last = now;
      om += -0.018 * th * dt;          // gravity pulls back to rest
      om *= Math.pow(0.975, dt);        // air damping
      th = clamp(th + om * dt, -MAX, MAX);
      rig.style.setProperty("--sw", `${th.toFixed(3)}deg`);
      if (Math.abs(th) < 0.02 && Math.abs(om) < 0.005) { running = false; th = 0; om = 0; rig.style.setProperty("--sw", "0deg"); return; }
      requestAnimationFrame(step);
    };
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { last = performance.now(); kick(0.6); } }).observe(stage);
    addEventListener("scroll", () => {
      const d = scrollY - lastY; lastY = scrollY;
      if (visible) kick(clamp(d * 0.004, -0.18, 0.18));
      if (ball && sec) { const r = sec.getBoundingClientRect(); ball.style.setProperty("--by", `${(r.top * -0.12).toFixed(1)}px`); }
    }, { passive: true });
    stage.addEventListener("pointermove", e => { if (lastX !== null) kick(clamp((e.clientX - lastX) * 0.01, -0.35, 0.35)); lastX = e.clientX; });
    stage.addEventListener("pointerleave", () => { lastX = null; });
    stage.addEventListener("click", () => kick(om >= 0 ? 1 : -1));
  }

  /* ================================================================ CEO portrait: slow zoom out on scroll; signature signs itself */
  const sigs = $$("[data-sign]");
  sigs.forEach(sig => {
    if (reduce) { sig.style.setProperty("--sign-progress", 1); return; }
    const photo = sig.closest(".ceo2-photo"), section = sig.closest(".ceo2");
    let target = 0, current = 0, frame = 0;
    const paintSignature = () => {
      current += (target - current) * .22;
      if (Math.abs(target - current) < .001) current = target;
      sig.style.setProperty("--sign-progress", current.toFixed(4));
      frame = current === target ? 0 : requestAnimationFrame(paintSignature);
    };
    const updateSignature = () => {
      const mobile = innerWidth <= 900;
      const top = mobile ? sig.getBoundingClientRect().top : section.getBoundingClientRect().top + photo.offsetHeight;
      target = clamp((innerHeight * .92 - top) / Math.min(260, innerHeight * .32));
      if (!frame) frame = requestAnimationFrame(paintSignature);
    };
    addEventListener("scroll", updateSignature, { passive: true });
    addEventListener("resize", updateSignature); updateSignature();
  });
  if ("IntersectionObserver" in window) {
    const ao = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-up"); ao.unobserve(en.target); } }), { threshold: .25 });
    $$(".ceo2-media").forEach(f => ao.observe(f));
  } else $$(".ceo2-media").forEach(f => f.classList.add("is-up"));
  if (!reduce) $$(".ceo2").forEach(sec => {
    let target = 0, current = 0, frame = 0, last = 0;
    const paint = now => {
      const dt = Math.min(64, now - (last || now - 16)); last = now;
      current += (target - current) * (1 - Math.exp(-dt / 100));
      if (Math.abs(target - current) < .0005) current = target;
      const mobile = innerWidth <= 900;
      sec.style.setProperty("--ceo-y", `${((.5 - current) * (mobile ? 64 : 120)).toFixed(2)}px`);
      sec.style.setProperty("--cz", (1.04 + (mobile ? .18 : .24) * (1 - current)).toFixed(4));
      sec.style.setProperty("--ceo-circle-y", `${((current - .5) * (mobile ? 64 : 120)).toFixed(2)}px`);
      frame = current === target ? 0 : requestAnimationFrame(paint);
    };
    const update = () => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      // The section is stable even while the desktop portrait is sticky.
      target = clamp((innerHeight * .8 - r.top) / (innerWidth <= 900 ? innerHeight : Math.max(innerHeight, r.height - innerHeight * .2)));
      if (!frame) { last = 0; frame = requestAnimationFrame(paint); }
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update); update();
  });

  /* ================================================================ tabs (planning section): click, arrow keys, Home/End */
  $$("[data-tabs]").forEach(box => {
    const tabs = $$('[role="tab"]', box);
    const select = (tab, focus) => {
      tabs.forEach(t => { const on = t === tab; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
        const p = document.getElementById(t.getAttribute("aria-controls")); p.hidden = !on; if (on && !reduce) { p.classList.remove("enter"); void p.offsetWidth; p.classList.add("enter"); } });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
        if (e.key === "Home") { e.preventDefault(); select(tabs[0], true); }
        if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  });

  /* ================================================================ X FORCE network: nodes cycle through the journey; click to explore */
  $$("[data-xf]").forEach(box => {
    const nodes = $$(".xf-node", box), spokes = $$(".xf-spoke", box), detail = $(".xf-detail", box);
    const data = JSON.parse($("#xf-data", box).textContent);
    const svg = $(".xf-links", box);
    if (reduce && svg && svg.pauseAnimations) svg.pauseAnimations();
    const STEP = 5000; let cur = 0, timer = null, auto = !reduce, visible = false;
    box.style.setProperty("--xf-t", `${STEP}ms`);
    const show = (i, user) => {
      cur = (i + nodes.length) % nodes.length;
      nodes.forEach((n, k) => n.setAttribute("aria-pressed", String(k === cur)));
      spokes.forEach((p, k) => p.classList.toggle("on", k === cur));
      const d = data[cur];
      $("#xf-d-num", box).textContent = String(cur + 1).padStart(2, "0");
      $("#xf-d-name", box).textContent = d.n;
      $("#xf-d-desc", box).textContent = d.d;
      $("#xf-d-list", box).innerHTML = d.f.map(x => `<li>${x.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</li>`).join("");
      if (!reduce) { detail.classList.remove("enter"); void detail.offsetWidth; detail.classList.add("enter"); }
      if (user) { auto = false; box.classList.add("paused"); clearTimeout(timer); }
      else schedule();
    };
    const schedule = () => { clearTimeout(timer); if (auto && visible) timer = setTimeout(() => show(cur + 1), STEP); };
    nodes.forEach((n, i) => {
      n.addEventListener("click", () => show(i, true));
      n.addEventListener("keydown", e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); show(i + k, true); nodes[cur].focus(); }
      });
    });
    if (!auto) box.classList.add("paused");
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) show(cur); else clearTimeout(timer); }, { threshold: .35 }).observe(box);
  });

  /* ================================================================ X FORCE intro: scroll drives Manufacturing -> QC -> Safety -> Installation */
  $$("[data-xfi]").forEach(box => {
    const sec = box.closest(".xfi"), sts = $$(".xfi-st", box), line = $(".xfi-stages", box), leds = $$(".xfi-leds span", box);
    const big = $$(".xfi-big span", box), now = $("#xfi-now", box), img = $(".xfi-photo img", box), names = sts.map(s => $("h3", s).textContent);
    const ball = $(".xfi-ball", box), sign = $(".xfi-sign", box), pile = $$(".xfi-pile b", box);
    const replay = (el, cls) => { if (!el || reduce) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
    let last = -2;
    const set = (idx, p) => {
      line.style.setProperty("--p", p.toFixed(3));
      line.style.setProperty("--rot", `${(p * 900).toFixed(1)}deg`);
      if (idx === last) return;
      if (last > -2 && idx > last) { replay(ball, "bump"); replay(sign, "swing"); }
      last = idx;
      pile.forEach((b, i) => b.classList.toggle("on", i <= idx));
      sts.forEach((s, i) => { s.classList.toggle("on", i <= idx); s.classList.toggle("cur", i === idx); });
      leds.forEach((l, i) => l.classList.toggle("on", i <= idx));
      big.forEach((b, i) => b.classList.toggle("on", i === Math.max(0, idx)));
      if (now) now.textContent = names[Math.max(0, idx)];
    };
    if (reduce) { set(sts.length - 1, 1); return; }
    const pinned = () => innerWidth > 900;
    const upd = () => {
      if (pinned()) {
        const r = box.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight);
        const p = clamp(-r.top / span);
        const idx = Math.min(sts.length - 1, Math.floor(p * (sts.length + .2) - .15));
        set(idx, clamp(p * 1.08));
        if (img) img.style.setProperty("--pz", (1.08 - .08 * p).toFixed(4));
      } else {
        let idx = -1;
        sts.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .72) idx = i; });
        set(idx, idx < 0 ? 0 : (idx + 1) / sts.length);
      }
    };
    const mode = () => { sec.classList.toggle("pin-on", pinned()); last = -2; upd(); };
    mode(); addEventListener("resize", mode);
    addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true });
  });

  /* ================================================================ marquee (speeds up with scroll, follows its direction) */
  $$(".marquee-track").forEach(track => {
    if (reduce) return;
    const rev = track.dataset.rev === "1" ? -1 : 1;  // second client row runs the other way
    let x = 0, dir = -1, boost = 0, lastY = scrollY, last = performance.now(), visible = true;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(track);
    addEventListener("scroll", () => { const d = scrollY - lastY; lastY = scrollY; if (d) dir = d > 0 ? -1 : 1; boost = Math.min(18, boost + Math.abs(d) * .08); }, { passive: true });
    const loop = now => {
      const dt = Math.min(64, now - last); last = now;
      if (visible) {
        const half = track.scrollWidth / 2;
        x += dir * rev * (0.05 + boost * 0.05) * dt; boost *= .94;
        if (x <= -half) x += half; if (x > 0) x -= half;
        track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

  /* ================================================================ drag-to-scroll rails (mouse; touch scrolls natively) */
  $$(".rail").forEach(rail => {
    const prog = rail.parentElement.querySelector(".rail-progress i");
    const upd = () => { if (!prog) return; const w = rail.clientWidth / rail.scrollWidth; prog.style.setProperty("--w", `${(w * 100).toFixed(1)}%`); prog.style.setProperty("--x", `${(rail.scrollLeft / rail.clientWidth * 100).toFixed(1)}%`); };
    rail.addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
    let down = false, sx = 0, sl = 0, v = 0, lx = 0, moved = false;
    rail.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" || e.button !== 0) return; down = true; moved = false; sx = lx = e.clientX; sl = rail.scrollLeft; v = 0; });
    addEventListener("pointermove", e => {
      if (!down) return;
      const dx = e.clientX - sx; if (Math.abs(dx) > 5 && !moved) { moved = true; rail.classList.add("is-drag"); }
      if (moved) { rail.scrollLeft = sl - dx; v = e.clientX - lx; lx = e.clientX; }
    });
    addEventListener("pointerup", () => {
      if (!down) return; down = false;
      if (!moved) return;
      const glide = () => { if (Math.abs(v) < .5 || reduce) { rail.classList.remove("is-drag"); return; } rail.scrollLeft -= v; v *= .93; requestAnimationFrame(glide); };
      requestAnimationFrame(glide);
    });
    rail.addEventListener("click", e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    rail.addEventListener("dragstart", e => e.preventDefault());
  });

  /* ================================================================ sector list: image follows the pointer */
  const inds = $$(".ind[data-img]");
  if (inds.length && fine && !reduce) {
    const pv = document.createElement("div"); pv.className = "ind-preview"; pv.setAttribute("aria-hidden", "true");
    const srcs = [...new Set(inds.map(a => a.dataset.img))];
    pv.innerHTML = srcs.map(s => `<img src="${s}" alt="" loading="lazy" decoding="async">`).join("");
    document.body.append(pv);
    let tx = 0, ty = 0, px = 0, py = 0, active = false;
    const loop = () => { px = lerp(px, tx, .16); py = lerp(py, ty, .16); pv.style.translate = `${(px - 150).toFixed(1)}px ${(py - 112).toFixed(1)}px`; if (active || Math.abs(px - tx) > .5) requestAnimationFrame(loop); };
    inds.forEach(a => {
      a.addEventListener("pointerenter", e => {
        if (!active) { px = tx = e.clientX + 40; py = ty = e.clientY; }
        active = true; pv.classList.add("on");
        $$("img", pv).forEach(im => im.classList.toggle("on", im.getAttribute("src") === a.dataset.img));
        requestAnimationFrame(loop);
      });
      a.addEventListener("pointermove", e => { tx = e.clientX + 200; ty = e.clientY; });
      a.addEventListener("pointerleave", () => { active = false; pv.classList.remove("on"); });
    });
  }

  /* ================================================================ cursor + magnetic */
  if (fine && !reduce && innerWidth > 960) {
    const ring = document.createElement("div"); ring.className = "cursor"; ring.setAttribute("aria-hidden", "true"); ring.innerHTML = "<span></span>";
    const dot = document.createElement("div"); dot.className = "cursor-dot"; dot.setAttribute("aria-hidden", "true");
    document.body.append(ring, dot);
    let x = -100, y = -100, rx = -100, ry = -100;
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY; dot.style.translate = `${x}px ${y}px`;
      ring.classList.add("on"); dot.classList.add("on");
    }, { passive: true });
    document.addEventListener("pointerleave", () => { ring.classList.remove("on"); dot.classList.remove("on"); });
    const loop = () => { rx = lerp(rx, x, .2); ry = lerp(ry, y, .2); ring.style.translate = `${rx.toFixed(1)}px ${ry.toFixed(1)}px`; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    document.addEventListener("pointerover", e => {
      const t = e.target;
      const label = t.closest("[data-cursor]");
      const typing = t.closest("input, textarea, select");
      ring.classList.toggle("big", !!label);
      ring.classList.toggle("link", !label && !!t.closest("a, button, summary, label"));
      ring.classList.toggle("hide", !!typing); dot.classList.toggle("on", !typing);
      $("span", ring).textContent = label ? label.dataset.cursor : "";
    });
    $$("[data-magnetic]").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${((e.clientX - r.left - r.width / 2) * .28).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * .38).toFixed(1)}px`;
      });
      el.addEventListener("pointerleave", () => { el.style.translate = ""; });
      el.style.transition = "translate 420ms cubic-bezier(.3,1.3,.5,1), transform 320ms cubic-bezier(.3,1.3,.5,1), color 200ms";
    });
  }
})();
