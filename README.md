> **Live edition:** Codex — Serious about play intro, pirate ship assembly, white-background products and 3D viewers. Employee access is beside the language switch. Production: https://www.dupediaeg.com.

# Dupedia — Product-led redesign

A standalone redesign based on `../dupedia-site`, preserving the earlier editions. White and graphite, the original lime accent, system sans-serif typography, large product visuals, and restrained GSAP motion.

## Preview

```sh
python3 src/build.py
python3 qa/check_site.py
python3 -m http.server 8093 --bind 127.0.0.1 --directory public
```

Open http://127.0.0.1:8093/ (English), or http://127.0.0.1:8093/ar/ (Arabic).

## Editing

- `src/premium_home.py`: redesigned homepage and product storytelling.
- `src/assets/premium.css`: visual system, shared page updates and responsive rules.
- `src/assets/premium.js`: product story tabs, product rail controls, GSAP animations.
- `src/build.py`: shared templates, catalogue, all 59 product detail pages, solutions, guides and enquiries.
- `src/i18n/ar.json`: Arabic content, including the redesigned homepage.
- `src/config.json`: business facts and enquiry integration.
- `src/data/products.json`: original manufacturer product specifications, unchanged.

GSAP 3.14.2 and ScrollTrigger are served locally from `src/assets/vendor`; existing vendor headers are preserved. Content and navigation render without JavaScript. Shortlists, filters and fit tools require JavaScript. Motion respects reduced-motion preferences and reacts when the preference changes.

## Verification

The existing site checker validates 170 HTML files and 168 sitemap routes: titles, descriptions, headings, image alt attributes, internal links and assets, form labels, structured data, and sitemap targets. Browser checks covered desktop and phone layouts, story tabs, catalogue code search, adding a shortlist item and retaining it on the enquiry page, removing that test item, and changing planning dimensions. English and Arabic homepages were visually inspected. No browser console errors were observed in those checks. Safari, Firefox and physical devices have not been tested.

## Launch configuration

The existing business configuration is incomplete: phone, email, address, hours, social links and form delivery are not configured. The enquiry form retains the original honest copy/export fallback and does not claim requests are sent. The site remains `noindex` until a domain is configured. Product images are existing manufacturer visuals, not completed Dupedia project photography.

The website is published on Cloudflare Pages (Free plan). See `DEPLOYMENT.md`.

## Playful homepage update

- Replayable three-second brand intro with Skip, Escape, focus protection, a hard timeout and one automatic play per session.
- A locally served Three.js scene builds a procedural play-tower concept from separate timber posts, deck, railings, roof, ladder and curved slide. Scroll assembles the parts and transitions to the realistic studio concept visual. Rendering is scheduled only while visible and changing.
- The studio visual is an AI-enhanced reinterpretation of the existing Marvel Play Tower image, clearly captioned as a concept. It is not an engineering model or completed-project photograph. The original product pages/specifications remain the source of truth.
- Scroll-driven brand shapes, a moving play ribbon, word-by-word statement, product image motion, solution entrances and a founder portrait/quote section. The CEO photograph and quotation come from the existing approved source.
- Reduced-motion preferences skip the intro and 3D assembly; unsupported WebGL also displays the finished image. No external API or runtime image/model requests are needed for the new experience.
- New assets: `static/img/play-tower-studio-v2.png`; generation method and full prompt: `docs/hero-image-prompt.txt`.
- To restart the local preview later, double-click `preview.command` in Finder. If another preview is already running on port 8093, use that browser window.
- Browser review verified desktop and phone assembly stages, the realistic-image transition, intro replay/skip, the founder section, and Arabic text/runtime. Reduced-motion/WebGL fallback logic was reviewed in source; OS motion preferences were not changed. No browser console errors were observed.

The previous homepage source is retained in `backup/before-playful-home/`.

## Product studio update (latest)

The homepage assembly now features **Pirate Ship Fort**, replacing the earlier tower. The ship's hull, observation decks, railings, mast, sail, wheel, slide and swing extension assemble before transitioning into the isolated product visual.

**58 product cutouts** were created with the built-in ImageGen tool, using the existing product imagery as references. Backgrounds, people and loose props were removed. Original source images remain untouched. Transparent PNG masters are in `static/img/cutouts/`; optimized full-size and 560px WebP delivery images serve the website. Run `python3 tools/export_cutouts.py` with Pillow installed to regenerate delivery exports after editing masters. The ordinary site build uses the already-exported files and remains standard-library-only.

The full asset inventory, source references, generation prompts and refinement prompts are in `docs/product-cutout-manifest.json`. `qa/cutout-validation.json` records alpha-channel and delivery-size checks. **SW-A411 Corn Climbing Pavilion has no verified source image**; its photo placeholder remains rather than inventing a manufacturer image.

**All 59 products have individual illustrative 3D presentations**, defined in `src/assets/product-models.js`. Product pages offer Product visual / Explore in 3D, pointer/touch orbit, keyboard rotation, zoom, reset, exploded parts and a stoppable turntable. Three.js and the model factory load only when a visitor requests the product-page 3D view. The existing reduced-motion and WebGL fallbacks remain available.

The models are visual interpretations of the available images and component lists, not manufacturer CAD or fabrication geometry. The source imagery and some furniture descriptions differ in frame details; published product data was preserved. Confirm the final product variant and construction with the manufacturer before procurement. This distinction is also stated alongside the viewer.

Verification: every model was instantiated and rendered in a browser, with finite geometry/nonempty bounds checks (`qa/model-validation.json`). Product-view switching, exploded parts, furniture rendering and Arabic controls were reviewed. The site checker continues to cover links/assets, headings, labels, structured data and the bilingual sitemap. Safari, Firefox and physical devices remain untested.

The source before this update is retained in `backup/before-product-studio/`.


### Interactive headline and creative process

The homepage now includes tactile play letters (hover or the keyboard-accessible “Give play a spin” button) and a three-stage creative studio. Scrolling draws the pirate ship’s blueprint edges, fills the same geometry with flat colour, then expands its depth and turns the camera into a three-dimensional view. Stage buttons also seek the sequence. The copy describes ideation, character and spatial exploration in English and Arabic. The procedural scene is illustrative, not a construction drawing.

The extra scene renders only while near the viewport and on scroll/resize updates; its renderer is disposed when the motion media query stops matching. Reduced motion and WebGL failure show the isolated product visual and a static closing explanation. CEO titles on the homepage, About page, portrait descriptions and organization metadata now use Chief Executive Officer.


### Product presentation edition

All 59 product pages now have a coordinated collection palette, a responsive animated opening, pointer-responsive product imagery, and four selectable scene backdrops. Scene choices change the presentation background only; they do not represent a material finish. Each product has a scroll-driven presentation of its idea, catalogue components and published space information, with buttons to jump between chapters. The first descriptive sentence is excerpted for the presentation; the full catalogue description remains in the overview. All 3D, shortlist and space-fit controls remain available. No additional WebGL scene is loaded for the scroll story.

English and Arabic pages share the implementation. Reduced-motion and no-JavaScript layouts show the content as a static presentation, and the product with no source photo retains its missing-photo notice and 3D option. The header logo uses native proportions with a 156 px desktop and 134 px mobile width and a 44 px link target. Validation of all 118 localized product pages is recorded in `qa/product-presentation-validation.json`.


### Brand stories and material exploration

About, Our Factory and Projects now have distinct scroll journeys: playful shapes assembling around Dupedia’s purpose, a six-stage making sequence, and a sector-by-sector presentation of the existing client list. Client names are unchanged; project photographs/case studies are still explicitly pending. The supplied CEO note is preserved. The old About-page requests for company-story copy have been replaced by the narrative based on existing approved content.

Product overviews are now static. Introductory image/copy tweens, pointer tilt and finish reveals were removed; animation and the on-demand 3D viewer live in the Idea / Details / Your Space story. The viewer supports raycast hover/tap on parts and keyboard-accessible material buttons with highlighting. Material names describe the illustrative procedural model (wood, metal, rope, fabric); coloured components without a confirmed material are marked “Surface material to confirm.” Actual construction/material specifications require manufacturer confirmation. No grades, species or plastic types are inferred.

Responsive Arabic layouts and reduced-motion static layouts are included. Local browser checks covered all three brand journeys, component picking on the ship (“Wood · Ship safety rails”), and Arabic mobile factory/material controls. Source product data remains unchanged.
