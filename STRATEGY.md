# Dupedia website: strategy and content plan

**Date:** 7 Nov 2026 · **Source of truth:** `Brand System - Playful Classic/Dupedia-Brand-Identity-Playful-Classic.pdf` (v1, 23 Oct 2026), `Web/dupedia-brand-tokens.css`, the verified product data (`src/data/products.json`), and the approved Instagram launch copy. Nothing on the site goes beyond these sources. Missing facts are marked `[TBC]` on the page, as the brand book asks ("Real sizes, real codes, real standards, or a clear placeholder").

## 1. Who Dupedia serves and what they need

Dupedia designs, supplies and installs places to play: outdoor playgrounds, indoor and soft play, arcades, water parks and amusement attractions, in Egypt, since 1989 (brand book p.2; launch caption).

| Buyer | What they need before they call | What the site gives them |
|---|---|---|
| Real estate developers (compounds, master plans) | A partner who can deliver amenity play at scale, with drawings that pass consultant review | Estate collection, full specs and safety zones, the fit tool, layouts drawn by the team |
| Hotels and resorts | Signature kids' areas that look good and last in sun and salt | Collections, finishes, "Discuss a project" by division |
| Schools and nurseries | Age-appropriate equipment that fits a real yard | Age filter, Early Years collection, "Will it fit?" tool |
| Malls and entertainment operators | Soft play, arcade and FEC fit-outs | Division overview and a scoped enquiry |
| Landscape architects and consultants (influencers on all of the above) | Codes, dimensions, platform heights, safety zones, CAD | Spec pages for all 59 products, catalogue PDF, layouts from their DXF or PDF plans |
| Municipalities | Robust park equipment and site furniture | Tower, Adventure and Landscape collections |

## 2. Differentiators (only what the material supports)

1. **One partner from first sketch to installation**, across five kinds of play space.
2. **Since 1989.**
3. **Precision you can plan with:** every product has a code, dimensions, platform height, age range and safety zone, and the fit tool checks it against a real space before anyone visits the site.
4. **We measure first:** layouts start from the site's real numbers (launch content, Day 3).

Not claimed, because nothing supports it yet: certifications (EN 1176 etc.), warranties, lead times, project counts, client names, service area outside Egypt.

## 3. The one action

**Request a quote** (contact form with project type, location, space, timing and shortlist). Secondary: **check what fits** (the fit tool) and **download the catalogue**. There is no Site Planner on the public site (owner decision, 7 Nov 2026). Every page ends on the quote CTA; product pages add "Add to shortlist", which carries into the form.

## 4. Sitemap

| URL | Purpose | Primary search intent |
|---|---|---|
| `/` | Value proposition in seconds, divisions, fit tool, process, sectors, CTA | Dupedia; playground company Egypt |
| `/playgrounds/` | Outdoor playground range: filter by collection, age and site size | playground equipment Egypt; outdoor playground supplier Cairo; wooden playground |
| `/playgrounds/<code-name>/` ×59 | Product spec page, footprint vs safety zone, shortlist | product names and codes; "wooden play tower with slide" etc. |
| `/what-we-build/` | All five divisions on one page (no thin per-division pages until each has real content) | soft play Egypt; water park equipment Egypt; arcade / FEC fit-out |
| `/who-we-work-with/` | Sector starting points | school playground Egypt; compound playground; hotel kids' area |
| `/planning-guide/` | Safety zones and space planning, from the real product data | playground safety zone; how much space does a playground need |
| `/about/` | Who Dupedia is, how it works, what it will and won't claim | about Dupedia |
| `/contact/` | Quote request, shortlist, contact details | request a playground quote |
| `/privacy/` | What the form collects and why | — |
| `/404.html` | Not-found state with useful routes | — |

Deliberately left out: **Projects** (no real project photos exist; brand rule: never fill with renders or stock), **per-city landing pages** (would be doorway pages), **Arabic pages** (see §7).

## 5. Keyword themes

- **Core (EN):** playground equipment Egypt · playground design and installation · outdoor playground supplier Cairo · wooden playground equipment · kids play area for compounds · school playground equipment · playground safety zone · soft play Egypt · water park equipment Egypt · family entertainment centre fit-out.
- **Core (AR, for the Arabic phase):** ملاعب اطفال · العاب حدائق · تنسيق حدائق · ألعاب أطفال للكمبوند · ملاعب مدارس.
- **Places:** Egypt and Cairo appear where they are true (company location, manufacturer). New Cairo, Sheikh Zayed, North Coast and wider MENA only once real projects or a confirmed service area exist.

## 6. Experience direction: "Snap" on a dark ground

Update 7 Nov 2026: the owner asked for a non-white site and a far more interactive home page. The site now runs on charcoal with a reversed logo, an intro loader, and draggable brand blocks in the hero.


Taken from the approved X FORCE 2.0 direction and the brand book: things move the way play parts click together. Blocks snap onto the grid with a small overshoot; they never float, tilt or spin. Cream workspace, charcoal bands, lime for what you can do, one division colour per surface. One corner mark per page. One italic accent word per headline. At least 40% air.

Motion with a job: page-to-page view transitions (header stays put, product image carries into its spec page), section reveals that never hide content without JavaScript, a block band that assembles in the hero, live footprint drawing in the fit tool, a scroll-linked process line. All of it is disabled or reduced with `prefers-reduced-motion`.

## 7. Arabic

The brand specifies Readex Pro and the launch kit has some Arabic captions, but there is no approved Arabic website copy. Per the brief, Arabic pages are **not** machine-translated or published as placeholders. The build supports `lang`/`dir` per page and loads Readex Pro, so an `/ar/` tree can be added once a native copywriter supplies approved text; `hreflang` pairs are added at that point. The approved brand line نأخذ اللعب بجدية is used as a tagline.
