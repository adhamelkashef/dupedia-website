/* Dupedia website · interactions. No dependencies.
   Everything here enhances server-rendered HTML: with JavaScript off, every page, product and link still works. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.DP_CONFIG || {};
  const CAT = window.DP_CATALOG || null;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable: shortlist lasts for this page only */ } },
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const f2 = n => (Math.round(n * 100) / 100).toFixed(2);
  const ARROW = '<svg class="ic ic-s" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>';

  /* ---------------------------------------------------------------- header + menu */
  const hdr = $(".hdr");
  if (hdr) {
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      hdr.classList.toggle("is-solid", y > 8);
      // hide on scroll down, show on scroll up (never while the menu is open)
      hdr.classList.remove("is-away");
      lastY = y;
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  const burger = $(".burger"), sheet = $("#sheet");
  if (burger && sheet) {
    const setOpen = open => {
      sheet.hidden = !open; sheet.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", open);
    };
    burger.addEventListener("click", () => setOpen(sheet.hidden));
    sheet.addEventListener("click", e => { if (e.target.closest("a")) setOpen(false); });
    addEventListener("keydown", e => {
      if (sheet.hidden) return;
      if (e.key === "Escape") { setOpen(false); burger.focus(); }
      if (e.key === "Tab") { // keep focus inside the open menu (burger + sheet links)
        const f = [burger, ...$$("a, button", sheet)];
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    matchMedia("(min-width: 1081px)").addEventListener("change", e => { if (e.matches) setOpen(false); });
  }

  /* ---------------------------------------------------------------- reveal + count-up */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in"); io.unobserve(en.target);
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
    const steps = $$(".steps li");
    const so = new IntersectionObserver(es => es.forEach(en => en.isIntersecting && en.target.classList.add("is-in")), { rootMargin: "0px 0px -40% 0px" });
    steps.forEach(s => so.observe(s));
    const counters = $$("[data-count]");
    const co = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return; co.unobserve(en.target);
      const el = en.target, to = +el.dataset.count;
      if (reduce) { el.textContent = to; return; }
      const t0 = performance.now(), dur = 1100;
      const tick = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    counters.forEach(c => co.observe(c));
  } else revealEls.forEach(el => el.classList.add("is-in"));

  // Process line fallback where CSS scroll timelines are not supported
  const stepsEl = $(".steps");
  if (stepsEl && !CSS.supports("animation-timeline: view()")) {
    const upd = () => {
      const r = stepsEl.getBoundingClientRect(), vh = innerHeight;
      stepsEl.style.setProperty("--prog", Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height)).toFixed(3));
    };
    if (reduce) stepsEl.style.setProperty("--prog", "1");
    else { addEventListener("scroll", upd, { passive: true }); upd(); }
  }

  /* ---------------------------------------------------------------- hero product visuals (user-driven, no autoplay) */
  const thumbs = $$(".hero-thumbs button");
  if (thumbs.length) {
    const imgs = $$(".hero-frame img"), cap = $(".hero-cap .cap");
    thumbs.forEach((b, i) => b.addEventListener("click", () => {
      imgs.forEach((im, k) => im.classList.toggle("is-on", k === i));
      thumbs.forEach((t, k) => t.setAttribute("aria-pressed", String(k === i)));
      cap.innerHTML = `<b>Product visual · ${esc(imgs[i].dataset.code)}</b>${esc(imgs[i].dataset.name)}`;
    }));
  }

  /* ---------------------------------------------------------------- rails */
  $$("[data-rail]").forEach(wrap => {
    const rail = $(".rail", wrap);
    $$(".rail-ctl button", wrap).forEach(b => b.addEventListener("click", () => {
      const card = rail.firstElementChild; const step = card ? card.getBoundingClientRect().width + 16 : 320;
      rail.scrollBy({ left: +b.dataset.dir * step, behavior: reduce ? "auto" : "smooth" });
    }));
  });

  /* ---------------------------------------------------------------- toast */
  let toastT;
  const toast = html => {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.innerHTML = `<span class="ball" aria-hidden="true"></span><span>${html}</span>`;
    requestAnimationFrame(() => t.classList.add("is-on"));
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 3600);
  };

  /* ---------------------------------------------------------------- catalogue geometry (from the published data only) */
  const BY = CAT ? Object.fromEntries(CAT.products.map(p => [p.code, p])) : {};
  const nums = s => (String(s || "").match(/\d+(?:\.\d+)?/g) || []).map(Number);
  const zoneOf = p => {
    const s = p.zone || "";
    if (/plan|config/i.test(s) || !s) return { kind: "plan" };
    const n = nums(s);
    if (/m²/.test(s)) return { kind: "area", a: n[0] };
    if (/segment/i.test(s)) return { kind: "plan" };
    if (n.length >= 2) return { kind: "rect", l: n[0], w: n[1] };
    return { kind: "plan" };
  };
  const dimsOf = p => {
    const n = nums(p.dims); if (n.length < 2) return null;
    const k = /\bcm\b/.test(p.dims) ? 0.01 : 1;
    return { l: n[0] * k, w: n[1] * k };
  };
  const within = (a, b, L, W) => (a <= L && b <= W) || (a <= W && b <= L);
  const ageOk = (p, age) => !age || (p.amin <= age && age <= p.amax);
  /** status: yes = footprint and full published zone fit · plan = footprint fits, zone set in the layout · area = zone published as an area only · no */
  const fitOf = (p, L, W) => {
    const z = zoneOf(p), d = dimsOf(p);
    if (z.kind === "rect") return within(z.l, z.w, L, W) && (!d || within(d.l, d.w, L, W)) ? "yes" : "no";
    if (d && !within(d.l, d.w, L, W)) return "no";
    if (z.kind === "area") return z.a <= L * W ? "area" : "no";
    return d ? "plan" : "plan";
  };
  const FIT_LABEL = { yes: "Fits with its safety zone", no: "Too large for this space", plan: "Footprint fits · zone set in your layout", area: "Footprint fits · zone published as an area" };

  /** Draw site, safety zone and footprint to scale into an <svg>. */
  const drawPlan = (svg, p, site) => {
    if (!svg || (!p && !site)) return;
    const z = p ? zoneOf(p) : { kind: "none" }, d = p ? dimsOf(p) : null;
    let zl = z.kind === "rect" ? z.l : null, zw = z.kind === "rect" ? z.w : null;
    let dl = d ? d.l : null, dw = d ? d.w : null;
    const L = site ? site.l : null, W = site ? site.w : null;
    // orient the product to fit the site where possible
    if (site && zl && !(zl <= L && zw <= W) && (zw <= L && zl <= W)) { [zl, zw] = [zw, zl]; if (dl) [dl, dw] = [dw, dl]; }
    else if (site && !zl && dl && !(dl <= L && dw <= W) && (dw <= L && dl <= W)) { [dl, dw] = [dw, dl]; }
    const spanL = Math.max(L || 0, zl || 0, dl || 0, 1), spanW = Math.max(W || 0, zw || 0, dw || 0, 1);
    const VW = 400, VH = 300, padX = 64, padY = 40, s = Math.min((VW - padX * 2) / spanL, (VH - padY * 2) / spanW);
    const cx = VW / 2, cy = VH / 2;
    const r = (l, w, cls, extra = "") => `<rect class="${cls}" x="${(cx - l * s / 2).toFixed(1)}" y="${(cy - w * s / 2).toFixed(1)}" width="${(l * s).toFixed(1)}" height="${(w * s).toFixed(1)}" ${extra}/>`;
    let g = "";
    if (zl) g += r(zl, zw, "p-zone");
    if (dl) g += r(dl, dw, "p-prod");
    if (site) g += r(L, W, "p-site");
    const lab = (x, y, t, anchor = "middle") => `<text class="p-lab" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}">${esc(t)}</text>`;
    if (site) { g += lab(cx, cy - spanW * s / 2 - 10, `${f2(L)} m`); g += lab(cx - spanL * s / 2 - 8, cy + 4, `${f2(W)} m`, "end"); }
    else if (zl) { g += lab(cx, cy - zw * s / 2 - 10, `Zone ${f2(zl)} × ${f2(zw)} m`); }
    else if (dl) { g += lab(cx, cy - dw * s / 2 - 10, `${f2(dl)} × ${f2(dw)} m`); }
    const sb = 1, sbx = 16, sby = VH - 14; // 1 m scale bar
    if (s * sb > 6) g += `<path class="p-bar" d="M${sbx} ${sby}h${(s * sb).toFixed(1)}"/>` + lab(sbx + s * sb + 6, sby + 4, "1 m", "start");
    svg.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
    svg.innerHTML = g;
  };
  window.DP_drawPlan = drawPlan;

  /* ---------------------------------------------------------------- shortlist */
  const SL_KEY = "dp-shortlist";
  let shortlist = store.get(SL_KEY, []).filter(c => !CAT || BY[c]);
  const syncSL = (popCode) => {
    $$("[data-sl]").forEach(b => {
      const on = shortlist.includes(b.dataset.sl);
      b.setAttribute("aria-pressed", String(on));
      const nm = b.dataset.name || b.dataset.sl;
      if (b.classList.contains("sl-btn")) b.setAttribute("aria-label", on ? `Remove ${nm} from shortlist` : `Add ${nm} to shortlist`);
      else { const t = $(".t", b); if (t) t.textContent = on ? "On your shortlist" : "Add to shortlist"; }
    });
    $$("[data-sl-count]").forEach(p => {
      p.hidden = shortlist.length === 0;
      $(".n", p).textContent = shortlist.length;
      if (popCode) { p.classList.remove("pop"); void p.offsetWidth; p.classList.add("pop"); }
    });
    renderSLBox();
  };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-sl]"); if (!b) return;
    e.preventDefault();
    const c = b.dataset.sl, on = shortlist.includes(c);
    shortlist = on ? shortlist.filter(x => x !== c) : [...shortlist, c];
    store.set(SL_KEY, shortlist); syncSL(c);
    toast(on ? `Removed ${esc(b.dataset.name || c)}.` : `Added ${esc(b.dataset.name || c)} to your shortlist. <a href="/contact/">Request a quote</a>`);
  });
  function renderSLBox() {
    const box = $("#sl-box"); if (!box || !CAT) return;
    const list = $("#sl-list", box), empty = $("#sl-empty", box);
    list.innerHTML = shortlist.map(c => {
      const p = BY[c];
      return `<li><img src="${p.thumb || "/brand/dupedia-logo-white-700.png"}" alt="" width="64" height="44" loading="lazy"><span><span class="code">${esc(p.code)}</span><br><span class="nm">${esc(p.name)}</span></span><button type="button" data-sl="${esc(p.code)}" data-name="${esc(p.name)}" aria-label="Remove ${esc(p.name)} from shortlist"><svg class="ic ic-s" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>`;
    }).join("");
    empty.hidden = shortlist.length > 0;
    const hidden = $("#f-shortlist"); if (hidden) hidden.value = shortlist.join(", ");
  }
  syncSL();

  /* ---------------------------------------------------------------- home: "Will it fit?" */
  const tool = $("[data-fit-tool]");
  if (tool && CAT) {
    const lIn = $("#fit-l", tool), wIn = $("#fit-w", tool), lR = $("#fit-lr", tool), wR = $("#fit-wr", tool);
    const svg = $("#fit-svg", tool), countEl = $("#fit-n", tool), sub = $("#fit-sub", tool), list = $("#fit-list", tool), more = $("#fit-more", tool);
    let age = 0;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const paint = r => r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%");
    const update = () => {
      const L = clamp(+lIn.value || 0, 1, 200), W = clamp(+wIn.value || 0, 1, 200);
      const pool = CAT.products.filter(p => p.coll !== "landscape" && ageOk(p, age));
      const st = pool.map(p => [p, fitOf(p, L, W)]);
      const yes = st.filter(x => x[1] === "yes").map(x => x[0]);
      const plan = st.filter(x => x[1] === "plan" || x[1] === "area").length;
      const za = p => { const z = zoneOf(p); return z.kind === "rect" ? z.l * z.w : 0; };
      yes.sort((a, b) => za(b) - za(a));
      countEl.textContent = String(yes.length);
      sub.textContent = yes.length
        ? `of ${pool.length} play structures fit a ${f2(L)} × ${f2(W)} m space with their full published safety zone${age ? `, for age ${age}` : ""}.${plan ? ` ${plan} more fit by footprint; their zone is set in your layout.` : ""}`
        : `play structures fit ${f2(L)} × ${f2(W)} m with their full safety zone${age ? ` for age ${age}` : ""}. Try a larger space, or send us your plan and we will look at it with you.`;
      drawPlan(svg, yes[0] || null, { l: L, w: W });
      $("#fit-cap", tool).textContent = yes[0] ? `Shown: ${yes[0].name} (${yes[0].code}), the largest that fits, with its safety zone.` : "";
      list.innerHTML = yes.slice(0, 3).map(p => `<a href="${p.url}"><img src="${p.thumb}" alt="" width="280" height="175" loading="lazy"><span class="code">${esc(p.code)}</span><span class="nm">${esc(p.name)}</span></a>`).join("");
      more.href = `/playgrounds/?l=${L}&w=${W}${age ? `&age=${age}` : ""}&fit=1`;
    };
    const link = (num, rng) => {
      num.addEventListener("input", () => { if (num.value !== "") { rng.value = clamp(+num.value, +rng.min, +rng.max); paint(rng); update(); } });
      num.addEventListener("blur", () => { num.value = clamp(+num.value || +rng.min, 1, 200); update(); });
      rng.addEventListener("input", () => { num.value = rng.value; paint(rng); update(); });
      paint(rng);
    };
    link(lIn, lR); link(wIn, wR);
    $$("[data-age]", tool).forEach(b => b.addEventListener("click", () => {
      age = +b.dataset.age;
      $$("[data-age]", tool).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      update();
    }));
    update();
  }

  /* ---------------------------------------------------------------- playgrounds range: filter, fit, search */
  const range = $("[data-range]");
  if (range && CAT) {
    const cards = $$(".card", range), grid = $("#grid", range);
    const q = new URLSearchParams(location.search);
    const st = {
      coll: q.get("c") || "", age: +q.get("age") || 0, l: +q.get("l") || 0, w: +q.get("w") || 0,
      fit: q.get("fit") === "1", q: q.get("q") || "", sort: q.get("sort") || "coll",
    };
    const el = { l: $("#r-l"), w: $("#r-w"), age: $("#r-age"), fit: $("#r-fit"), q: $("#r-q"), sort: $("#r-sort"), count: $("#r-count"), empty: $("#r-empty"), note: $("#r-note") };
    if (st.l) el.l.value = st.l; if (st.w) el.w.value = st.w;
    el.age.value = st.age || ""; el.fit.checked = st.fit; el.q.value = st.q; el.sort.value = st.sort;
    const collName = Object.fromEntries(CAT.collections.map(c => [c.key, c]));
    const order = new Map(cards.map((c, i) => [c, i]));
    const render = (animate = true) => {
      const hasSite = st.l > 0 && st.w > 0;
      const term = st.q.trim().toLowerCase();
      let visible = [];
      cards.forEach(c => {
        const p = BY[c.dataset.code];
        const fs = hasSite ? fitOf(p, st.l, st.w) : null;
        const flag = $(".fitflag", c);
        if (hasSite) { flag.hidden = false; flag.dataset.s = fs; flag.textContent = FIT_LABEL[fs]; } else flag.hidden = true;
        let show = (!st.coll || p.coll === st.coll) && ageOk(p, st.age)
          && (!term || p.name.toLowerCase().includes(term) || (window.DP_TRANSLATE ? window.DP_TRANSLATE(p.name).includes(term) : false) || p.code.toLowerCase().includes(term))
          && (!st.fit || !hasSite || fs === "yes");
        c.classList.toggle("is-hidden", !show);
        if (show) visible.push(c);
      });
      const za = c => { const z = zoneOf(BY[c.dataset.code]); return z.kind === "rect" ? z.l * z.w : z.kind === "area" ? z.a : Infinity; };
      const sorted = [...cards].sort((a, b) => st.sort === "small" ? za(a) - za(b) : st.sort === "large" ? (za(b) === Infinity ? -1 : za(a) === Infinity ? 1 : za(b) - za(a)) : order.get(a) - order.get(b));
      sorted.forEach(c => grid.append(c));
      if (animate && !reduce) visible.forEach((c, k) => { c.classList.remove("enter"); void c.offsetWidth; c.style.setProperty("--k", Math.min(k, 12)); c.classList.add("enter"); });
      const fitsN = hasSite ? cards.filter(c => fitOf(BY[c.dataset.code], st.l, st.w) === "yes" && !c.classList.contains("is-hidden")).length : 0;
      el.count.textContent = `${visible.length} of ${cards.length} products` + (hasSite ? ` · ${fitsN} fit ${f2(st.l)} × ${f2(st.w)} m with their full safety zone` : "");
      el.empty.hidden = visible.length > 0;
      $$(".chip", range).forEach(ch => ch.setAttribute("aria-pressed", String(ch.dataset.coll === st.coll)));
      el.note.hidden = !st.coll;
      if (st.coll) el.note.innerHTML = `<span class="num">${esc(collName[st.coll].numeral)}</span><p>${esc(collName[st.coll].description)}</p>`;
      const u = new URLSearchParams();
      if (st.coll) u.set("c", st.coll); if (st.age) u.set("age", st.age); if (st.l) u.set("l", st.l); if (st.w) u.set("w", st.w);
      if (st.fit) u.set("fit", "1"); if (st.q) u.set("q", st.q); if (st.sort !== "coll") u.set("sort", st.sort);
      history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "") + location.hash);
    };
    $$(".chip", range).forEach(ch => ch.addEventListener("click", () => { st.coll = ch.dataset.coll; render(); }));
    const num = (v) => { const n = parseFloat(v); return n > 0 && n <= 200 ? n : 0; };
    el.l.addEventListener("input", () => { st.l = num(el.l.value); render(false); });
    el.w.addEventListener("input", () => { st.w = num(el.w.value); render(false); });
    el.age.addEventListener("change", () => { st.age = +el.age.value || 0; render(); });
    el.fit.addEventListener("change", () => { st.fit = el.fit.checked; render(); });
    el.sort.addEventListener("change", () => { st.sort = el.sort.value; render(); });
    let qt; el.q.addEventListener("input", () => { clearTimeout(qt); qt = setTimeout(() => { st.q = el.q.value; render(false); }, 120); });
    $("#r-reset").addEventListener("click", () => {
      Object.assign(st, { coll: "", age: 0, l: 0, w: 0, fit: false, q: "", sort: "coll" });
      el.l.value = el.w.value = el.q.value = ""; el.age.value = ""; el.fit.checked = false; el.sort.value = "coll"; render();
    });
    render(false);
  }

  /* ---------------------------------------------------------------- product page: footprint + fit check */
  const fp = $("[data-fp]");
  if (fp && CAT) {
    const p = BY[fp.dataset.fp], svg = $("svg", fp), res = $(".fp-res", fp), L = $("#fp-l", fp), W = $("#fp-w", fp);
    drawPlan(svg, p, null);
    const check = () => {
      const l = parseFloat(L.value), w = parseFloat(W.value);
      if (!(l > 0 && w > 0)) { res.textContent = ""; res.removeAttribute("data-s"); drawPlan(svg, p, null); return; }
      const s = fitOf(p, l, w);
      res.dataset.s = s === "yes" ? "yes" : s === "no" ? "no" : "";
      res.textContent = s === "yes" ? `Fits ${f2(l)} × ${f2(w)} m with its full safety zone.`
        : s === "no" ? `Does not fit ${f2(l)} × ${f2(w)} m with its safety zone.`
        : s === "area" ? "The footprint fits. The zone is published as an area only, so we confirm it on your layout."
        : "The footprint fits. Its safety zone is set in your layout; we check it with you.";
      drawPlan(svg, p, { l, w });
    };
    [L, W].forEach(i => i.addEventListener("input", check));
  }

  /* ---------------------------------------------------------------- contact form */
  const form = $("#enq-form");
  if (form) {
    const params = new URLSearchParams(location.search);
    const type = params.get("type"); if (type) { const sel = $("#f-type"); if ([...sel.options].some(o => o.value === type)) sel.value = type; }
    const sector = params.get("sector"); if (sector) { const sel = $("#f-role"); if ([...sel.options].some(o => o.value === sector)) sel.value = sector; }
    const site = params.get("site"); if (site) $("#f-site").value = site;
    const err = $("#form-err"), btn = $("#f-submit");
    const fields = [["#f-name", v => v.trim().length >= 2, "Please enter your name."],
                    ["#f-email", v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), "Please enter an email address we can reply to, like name@company.com."],
                    ["#f-loc", v => v.trim().length >= 2, "Please tell us the city or area of the project."]];
    const setErr = (inp, msg) => {
      const id = inp.id + "-err"; let m = document.getElementById(id);
      if (msg) {
        inp.setAttribute("aria-invalid", "true");
        if (!m) { m = document.createElement("span"); m.id = id; m.className = "err"; inp.after(m); }
        m.textContent = msg; inp.setAttribute("aria-describedby", id);
      } else { inp.removeAttribute("aria-invalid"); m?.remove(); inp.removeAttribute("aria-describedby"); }
    };
    fields.forEach(([s, ok, msg]) => { const i = $(s); i.addEventListener("blur", () => { if (i.value) setErr(i, ok(i.value) ? "" : msg); }); i.addEventListener("input", () => { if (i.getAttribute("aria-invalid") && ok(i.value)) setErr(i, ""); }); });
    const ref = () => { const d = new Date(); return `DP-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; };
    const asText = r => [
      `Quote request ${r.reference}`, `Name: ${r.name}`, r.company && `Company: ${r.company}`, `Email: ${r.email}`, r.phone && `Phone / WhatsApp: ${r.phone}`,
      r.role && `I am: ${r.role}`, `Project type: ${r.projectType}`, `Location: ${r.location}`, r.site && `Available space: ${r.site}`, `Timing: ${r.timing}`,
      r.shortlist.length && `Shortlist: ${r.shortlist.map(c => `${c} ${BY[c] ? BY[c].name : ""}`.trim()).join("; ")}`, r.message && `\n${r.message}`,
    ].filter(Boolean).join("\n");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      err.hidden = true;
      let first = null;
      fields.forEach(([s, ok, msg]) => { const i = $(s); const good = ok(i.value); setErr(i, good ? "" : msg); if (!good && !first) first = i; });
      if (first) { err.textContent = "Please check the highlighted fields."; err.hidden = false; first.focus(); return; }
      if ($("#f-website").value) return; // honeypot
      const fd = new FormData(form);
      const r = Object.fromEntries(["name", "company", "email", "phone", "role", "projectType", "location", "site", "timing", "message"].map(k => [k, String(fd.get(k) || "").trim()]));
      r.shortlist = shortlist.slice(); r.reference = ref(); r.page = location.pathname; r.sentAt = new Date().toISOString();
      if (CFG.formEndpoint) {
        btn.disabled = true; const label = btn.innerHTML; btn.innerHTML = '<span class="spin" aria-hidden="true"></span> Sending…';
        try {
          const res = await fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(r) });
          if (!res.ok) throw new Error(String(res.status));
          form.hidden = true; const done = $("#form-done"); done.hidden = false; $("#done-ref").textContent = r.reference; done.focus();
          shortlist = []; store.set(SL_KEY, shortlist); syncSL();
        } catch {
          err.textContent = "Your request could not be sent. Please try again in a moment" + (CFG.email ? `, or email ${CFG.email}.` : ".");
          err.hidden = false;
        } finally { btn.disabled = false; btn.innerHTML = label; }
        return;
      }
      // No endpoint configured: never pretend it was sent.
      form.hidden = true;
      const off = $("#form-off"); off.hidden = false;
      const txt = asText(r); $("#off-text").value = txt;
      const mail = $("#off-mail"); if (mail && CFG.email) { mail.hidden = false; mail.href = `mailto:${CFG.email}?subject=${encodeURIComponent("Quote request " + r.reference)}&body=${encodeURIComponent(txt)}`; }
      const wa = $("#off-wa"); if (wa && CFG.whatsapp) { wa.hidden = false; wa.href = `https://wa.me/${CFG.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(txt)}`; }
      off.focus();
    });
    $("#off-copy")?.addEventListener("click", async () => {
      const t = $("#off-text"), s = $("#off-status");
      try { await navigator.clipboard.writeText(t.value); s.textContent = "Copied."; }
      catch { t.select(); s.textContent = "Select all and copy (Ctrl/⌘ C)."; }
    });
    $("#off-back")?.addEventListener("click", () => { $("#form-off").hidden = true; form.hidden = false; btn.focus(); });
    $("#done-new")?.addEventListener("click", () => { form.reset(); $("#form-done").hidden = true; form.hidden = false; $("#f-name").focus(); });
  }
})();
