# Phase-wise Build Prompt: 999920.com

Paste the phases one at a time into an AI coding assistant, or hand them to a developer. Every phase is self-contained, and each builds on the output of the one before it. The site in this repo is the finished result of Phases 1–7. Phases 8–10 are the roadmap for growth.

---

## GLOBAL RULES (include with every phase)
- **Domain/brand:** 999920.com, read as 久久久久爱你 ("love you forever and ever"). Use the number only in its generic cultural sense. Do not use third-party logos, brand assets or trademarked names as branding.
- **Hosting:** static HTML, CSS and vanilla JS only, compatible with the **GitHub Pages free plan**. No server code, no build step required at runtime. Use relative links so the site works both at a github.io subpath and on the custom domain.
- **Owner banner:** at the top of every page, display: *"Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership"* linked to `https://web.works/contact`.
- **Single inbox:** every form and every contact route goes to ONE owner email. **The address must never appear in page text or HTML source.** Store it obfuscated (XOR + reversed char codes) in `assets/js/config.js`, assemble it only at submit or click time, and POST forms via FormSubmit's AJAX endpoint. Any "Email us" link is a `data-mail` link that builds the `mailto:` on click.
- **Design:** modern, premium, crimson (#b3122b) + gold (#c9972f) on warm paper; dark mode; Playfair Display, Inter and Noto Serif SC; rounded cards, soft shadows, sticky header, mobile-first, no horizontal scroll at 360px, WCAG AA contrast, reduced-motion support.
- **SEO:** unique title and meta description, canonical, Open Graph, JSON-LD (WebPage/Article/WebApplication, BreadcrumbList, FAQPage auto-built from `<details>` FAQs), sitemap.xml, robots.txt, quick-answer box + TOC + FAQ on content pages.
- **Legal:** Privacy (including AdSense cookie language), Terms, and Disclaimer & Trademark/Copyright Notice (generic-number clause, third-party marks, copyright, takedown process, affiliate disclosure), plus cookie consent that gates ads.

---

## PHASE 1: Foundation and design system
Create the repo structure (`/assets/css`, `/assets/js`, `/assets/img`, `/src`, `/src/partials`, `/docs`) and write `build.py`. It turns `src/*.html` (a JSON META block plus body) into full pages with a shared head, owner banner, header/nav, breadcrumbs, footer, newsletter, ad slots, cookie banner and JSON-LD, and it generates `sitemap.xml`. Build `style.css` with design tokens, light and dark themes, buttons, cards, grids, forms, multi-step form, tables, FAQ, stats, tiers, video, toast and footer. Add favicon.svg, og-image.svg, manifest, robots.txt, ads.txt placeholder and .nojekyll.
**Acceptance:** every page shares one layout, the owner banner is present on every page, and there is zero horizontal overflow at 390px and 1280px.

## PHASE 2: Config and core behaviour (`config.js`, `main.js`)
Build `config.js` with the obfuscated inbox, optional FormSubmit alias, AdSense client and slots (disabled by default), donation links (Ko-fi, BMC, PayPal.me, Stripe, GitHub Sponsors, Patreon), YouTube channel and featured IDs, Amazon tag and socials. Build `main.js` with: theme toggle, mobile menu, `data-mail` links, copy/share (native, WhatsApp, Facebook, X, Pinterest, Reddit, LinkedIn), universal AJAX form handler (honeypot, validation, subject tagging, page URL, success/error states, GA `generate_lead` event), multi-step forms with progress bar, URL prefill, cookie consent → AdSense loader, donation buttons from config (falling back to a pledge form), YouTube lite-embeds, affiliate tag injection, reveal animations, back-to-top.
**Acceptance:** a form submission POSTs to the endpoint and shows a success message, and grep finds no email in any built file.

## PHASE 3: Data and interactive tools (`data.js`, `tools.js`)
Dataset: 45+ verified codes (code, 汉字, pinyin, English, tag love/lucky/fun/avoid), 0–9 homophones, 12 zodiac animals with lucky numbers and colours, Six Harmonies/Trines/Clashes, and a festival list (fixed and lunar-dated for 2026–2028). Tools:
1. **Number Decoder**: exact match → DP segmentation into known codes → per-digit homophones. Output chips, 汉字, pinyin, English, vibe badge, "Make a card", copy, share, and `?n=` deep links.
2. **Codes table**: filters, search, copy and card buttons.
3. **Lucky Number Finder**: DOB → zodiac (with a Lunar New Year boundary note), personal number, lucky set, link to decode the lucky code.
4. **Zodiac Love Match** plus a deterministic "for fun" name love calculator.
5. **Love Calendar**: live countdown cards and a "next love date" sidebar widget.
6. **Wedding Date Finder**: score every date of a year by number harmony (520/521/9-9/1314/8/9/6/−4/pairs/mirror/weekend/Qixi). Show the top 15 with reasons and a "Get quotes" deep link carrying the date.
7. **Love Card Maker**: 1080×1080 canvas, 5 themes, names and message, PNG download, Web Share of the file.
8. **Gold Value Calculator**: price per g/oz/tael/kg, weight in g/tael/mace/oz/kg, purity 9999/999/916/750/585, making charge.

## PHASE 4: Content and SEO pages
Home (hero with live decoder, tools grid, meaning, stats with sources, next festival, trending codes, quick lead form, contest teaser, videos, FAQ, support band). Pillar page `999920-meaning` (TOC, breakdown, 9 and 20, 9999 culture, economy stats, how to use, code family, FAQ, sources). Pages for Decoder, Lucky Numbers, Zodiac Love, Love Calendar, Wedding Dates, Love Cards, 9999 Gold, Gifts (budget tiers, affiliate disclosure), Videos. Blog index plus posts: 520 Day, Qixi Guide, 1314 & 5201314, Chinese Wedding Traditions. Each gets a quick answer first, sources, share bar, FAQ, in-article ad and sidebar.

## PHASE 5: Lead generation engine
`get-quotes.html` is a 3-step form: service tiles (11) → date, flexibility, city, guests, budget, language → name, email, phone/WhatsApp, best time, notes, consent to share with up to 3 providers, and newsletter opt-in. Include a benefits list, a "How it works" section, a vendor CTA and a FAQ. Add a reusable quick-quote band (service, name, date, email, city, consent) on most pages, a sidebar CTA, prefill links from tools (`?service=`, `?date=`), and tag every lead subject `LEAD —`.

## PHASE 6: Community and monetization pages
- **Support/Donate:** tiers priced as love codes ($5.20, $13.14, $99.99, monthly), buttons for every platform, fund allocation (Operations, Promotion & Marketing, Hiring Talent, Contests & Prizes), monthly goal meter, supporter wall, a pledge form for bank, corporate or sponsorship gifts, and a not-tax-deductible note.
- **Contests:** Forever Love Story Contest (dates, prizes, judging criteria, entry form with a 999-word counter, 18+ and rules consents, official rules summary including no purchase necessary, void where prohibited, licence and substitution clauses).
- **Careers/Talent:** 9 roles with an application form.
- **Advertise/Sponsor/Partner:** 6 packages, seasonal campaign calendar, inquiry form with multi-select interests, and a domain-acquisition route.
- **Contact** (form plus hidden-address email link) and **About**.

## PHASE 7: Legal, QA and deploy
Privacy, Terms, Disclaimer & Trademark/Copyright Notice, 404. QA with Playwright: every page at 390px and 1280px, no console errors, no overflow, owner banner href present, no email in the HTML, form POST intercepted and success shown, decoder output checked. Push to `github.com/webworksa1/999920-com` (branch `main`) and enable GitHub Pages (Settings → Pages → Deploy from branch → `main` / root). Custom domain: add `CNAME` = `999920.com` and DNS A records 185.199.108–111.153 plus CNAME `www` → `webworksa1.github.io`, then enable HTTPS.

## PHASE 8: Go-live monetization checklist
1. Submit one test form so FormSubmit sends the activation email, then click Activate. Optionally paste the alias string into `formAlias`.
2. Apply for AdSense once there are 20–30 quality pages. Set `adsense.enabled=true`, the client ID and slot IDs, and the `ads.txt` line.
3. Add donation links in `config.donate`, the YouTube channel and video IDs, the Amazon tag and social links.
4. Add Google Search Console and a Bing Webmaster sitemap. Add GA4 if you want it, gated by consent.

## PHASE 9: Scale content (programmatic SEO)
- One page per code (`/code-520.html` …) for 100+ codes, generated from `data.js` with unique copy and FAQs.
- Year pages: "Lucky wedding dates 2027/2028", "Qixi 2027", "520 Day 2027".
- Zodiac love pages (12 × 12 = 144 pairings).
- A 中文 mirror (`/zh/`) with hreflang, followed by 繁體, Vietnamese, Malay and Spanish.

## PHASE 10: Productize
Vendor directory with featured tiers, a premium love-card pack (printable/animated), scheduled e-card sending, a Code of the Week email automation, seasonal contests (520 photo, Qixi poetry, Love Code design), a sponsor dashboard with quarterly transparency reports, and a YouTube Shorts pipeline (one code per day).
