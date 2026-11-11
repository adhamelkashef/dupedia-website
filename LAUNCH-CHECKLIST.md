# Dupedia website launch checklist

Domain: **www.dupediaeg.com**. The current build is a review build that is hidden from Google (`noindex` and robots `Disallow`) until step C2.
Work top to bottom. Items marked **[Owner]** need information or decisions only Dupedia can give. The rest are technical steps.

---

## A. Information to supply first (these block launch)

All of these go in `src/config.json`. While a value is empty, the site shows a visible `[TBC]` instead of guessing.

- [ ] **[Owner] Phone number.** Goes in `contact.phone`, in international format, e.g. `+20 …`.
- [ ] **[Owner] WhatsApp number.** Goes in `contact.whatsapp`. It's the most-used contact channel in Egypt.
- [ ] **[Owner] Sales email.** Goes in `contact.email`. This is where quote requests go when the form is set up.
- [ ] **[Owner] Address, city and opening hours.** Go in `contact.address`, `contact.city` and `contact.hours`. They're needed for the Google Business Profile and the local business markup.
- [ ] **[Owner] Social links.** Go in `social.instagram`, `social.linkedin` and `social.facebook`. Real profiles only.
- [ ] **[Owner] Quote form endpoint.** Goes in `formEndpoint`. The form sends JSON, so a service like Formspree, Basin or Getform works.
  - Create the form on the service and paste its URL into `formEndpoint`.
  - Set it to deliver to the sales email and WhatsApp team.
  - Without an endpoint, the form honestly tells visitors it wasn't sent and shows them the text to copy.
- [ ] **[Owner] ISO 9001 certificate details.** The certification body and certificate number go in `iso9001.certificationBody` and `iso9001.certificateNumber`. If the certifier allows it, add its mark to `static/brand/`.
- [ ] **[Owner] Safety standard** your products are made to, e.g. "EN 1176 and EN 1177". Goes in `safetyStandard`. Until it's set, the site says "international playground safety requirements".
- [ ] **[Owner] Privacy page legal review.** The privacy page still shows "Legal review [TBC]". Have it checked against Egypt's Personal Data Protection Law (Law 151 of 2020).
- [ ] **[Owner] Photo rights.** Confirm Dupedia has the rights to every photo listed in `README.md`, including the stock and division images.
- [ ] **[Owner] Catalogue PDF.** `downloads/dupedia-playground-catalogue.pdf` still has the old logo. Re-export it with the 2026 logo and replace the file.

## B. Choose hosting

The site is plain static files in `public/`, so any static host works. Recommended: **Cloudflare Pages** or **Netlify**, because both read the included `_headers` file (security and caching headers).

- [ ] **[Owner]** Create the hosting account in Dupedia's own name, not a freelancer's.
- [ ] Connect the domain `dupediaeg.com`:
  - `www.dupediaeg.com` serves the site.
  - `dupediaeg.com` (without www) **301-redirects** to `https://www.dupediaeg.com`.
- [ ] HTTPS is on, and `http://` redirects to `https://`.

## C. Build for launch

1. [ ] Fill in section A in `src/config.json`.
2. [ ] Set `"siteUrl": "https://www.dupediaeg.com"`. This switches indexing on and writes the real robots.txt and sitemap.
3. [ ] Build and check:
   ```bash
   python3 src/build.py
   ```
   ```bash
   python3 qa/check_site.py
   ```
   The build should print **no** "REVIEW build" warning and **no** `[TBC]` warnings for the items you filled in.
4. [ ] Upload the contents of `public/` to the host.

## D. Launch-day checks (on the live site)

- [ ] `https://www.dupediaeg.com/robots.txt` shows `Allow: /` and a `Sitemap:` line.
- [ ] `https://www.dupediaeg.com/sitemap.xml` opens and lists about 168 URLs, with images.
- [ ] The home page source has `<meta name="robots" content="index, follow…">`, and its canonical tag is `https://www.dupediaeg.com/`.
- [ ] An Arabic page, e.g. `/ar/water-parks/`, has a canonical tag pointing to `/ar/water-parks/` and links to its English version (hreflang).
- [ ] `dupediaeg.com` and `http://` both end up at `https://www.dupediaeg.com/`.
- [ ] **Send a real test quote** from `/contact/`. Confirm it arrives in the sales inbox and that the reference number matches.
- [ ] The WhatsApp, phone and email links open correctly on a phone.
- [ ] A made-up URL, e.g. `/test-404/`, shows the Dupedia 404 page.
- [ ] Spot-check on a phone: home, a solution page, a product page, a guide, and the Arabic home.
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) on the home page and `/water-parks/`, and note the scores as your baseline.
- [ ] Run [Google's Rich Results Test](https://search.google.com/test/rich-results) on `/soft-play/` (FAQ and Service markup) and on a product page (Product markup).

## E. Google setup (week 1)

- [ ] **Google Search Console**
  - Add a **Domain property** for `dupediaeg.com`. Verify it with a DNS TXT record.
  - Submit `https://www.dupediaeg.com/sitemap.xml`.
  - Use URL Inspection → "Request indexing" for the home page, `/ar/`, `/playgrounds/`, the 8 solution pages and `/guides/`.
- [ ] **Google Analytics 4**
  - **[Owner]** Create a GA4 property and send me the Measurement ID (`G-XXXX`).
  - The tracking code isn't installed yet: the current `analytics` setting only changes the privacy page text. I'll add GA4 plus the conversion events below.
  - Update the privacy page at the same time, and decide whether you need a consent banner.
- [ ] **Conversions to track in GA4.** Mark these as key events:
  - `quote_submit`: the quote form was sent successfully. This is the main conversion.
  - `whatsapp_click`, `phone_click` and `email_click`.
  - `shortlist_add`: a product was added to the shortlist. This is a buying signal.
  - `catalogue_download`: the PDF catalogue was downloaded.
- [ ] Link GA4 to Search Console.
- [ ] **Google Business Profile**
  - **[Owner]** Create or claim "Dupedia" with the real address, phone, hours and website.
  - Choose the categories "Playground equipment supplier" and "Amusement park ride supplier" if they're available.
  - Add real project photos, and complete the verification Google asks for.
- [ ] Optional: Bing Webmaster Tools. You can import directly from Search Console.

## F. Baseline and targets

Record the starting point on launch day, so later progress is measured, not guessed.

| Metric | Where | Day 0 | Day 30 | Day 90 | Day 180 |
|---|---|---|---|---|---|
| Indexed pages (of about 168) | Search Console → Pages | | | | |
| Organic impressions | Search Console → Performance | | | | |
| Organic clicks | Search Console → Performance | | | | |
| Average position: top 10 target queries | Search Console → Performance | | | | |
| Quote form submissions | GA4 → `quote_submit` | | | | |
| WhatsApp, phone and email clicks | GA4 events | | | | |
| Organic conversion rate | GA4 | | | | |

**Objectives.** These are process goals. Number targets are set after 30 days of real data, not before.
- **Day 30:** all key pages indexed, with no coverage errors. Impressions appear for the brand name and for long-tail queries from the solution pages and guides. Form, WhatsApp and phone tracking is confirmed working.
- **Day 90:** impressions grow for the commercial pages (water parks, soft play, school playgrounds, compounds, hotels) in both English and Arabic, and the first organic quote requests are tracked. Rewrite the titles of pages that get impressions but few clicks.
- **Day 180:** compare against the baseline. Expand content where Search Console shows demand, and set numeric goals for the next six months.

## G. After launch (biggest ranking gains)

- [ ] **[Owner] 2–3 case studies with real photos.** Include the client, location, what was delivered and the timeline. They go on `/projects/`.
- [ ] **[Owner] Real product photos for each range:** soft play, water parks, arcade, amusement and furniture. They replace the shared section images.
- [ ] **[Owner] Google reviews from real clients.** Never fake or incentivised ones.
- [ ] **Links from your network:**
  - Soliwood and True Slate link to Dupedia, and Dupedia links back.
  - Ask the clients you've delivered for to mention the project.
  - Get listed in Egyptian business directories and industry associations.
- [ ] Re-run the QA script after every content change, and resubmit the sitemap after adding pages.
- [ ] If Studio Eighty Nine gets its own site, add its link (README explains how). If its furniture pages move there, set up a 301 redirect from `/outdoor-furniture/`.
