# 999920.com — 久久久久爱你 · Love You Forever & Ever

999920.com is a static website built for the free plan of GitHub Pages. It explains Chinese love and lucky number codes and offers free interactive tools. It earns through lead generation, AdSense, YouTube, sponsorships, affiliates, contests and donations.

- **Docs:** [`docs/RESEARCH.md`](docs/RESEARCH.md) covers the research, the idea, the business case and a 30-site competitor audit. [`docs/BUILD-PROMPT.md`](docs/BUILD-PROMPT.md) is the phase-wise build prompt.
- **Pages (27):** Home, Decoder, 999920 Meaning, Lucky Numbers, Zodiac Love, Love Calendar, Wedding Dates, Love Card Maker, 9999 Gold, Gifts, Videos, Blog (+4 posts), Get Free Quotes, Contests, Support/Donate, Careers, Advertise/Sponsor, Contact, About, Privacy, Terms, Disclaimer & Trademark/Copyright Notice, and 404.

## Edit & rebuild
First run `python3 extract_src.py`. It regenerates the editable `src/*.html` page bodies from the live pages, and the round trip is byte-exact. Page bodies then live in `src/*.html` and shared blocks in `src/partials/`. The layout and header are in `build.py`. The shared footer, newsletter and cookie banner are generated into `assets/js/layout.js`.
```bash
python3 build.py      # regenerates the root *.html files, assets/js/layout.js + sitemap.xml
```
Commit the generated files. GitHub Pages serves the repo root.

## Go-live checklist (edit `assets/js/config.js`)
1. **Forms:** every form posts to one hidden inbox through FormSubmit. The address is stored obfuscated and never appears in the HTML. **Submit any form once**, then open the activation email from FormSubmit and click *Activate*. You can optionally paste the alias string FormSubmit gives you into `formAlias`.
2. **AdSense:** after approval, set `adsense.enabled: true`, `client` and `slots`, and put your line in `ads.txt`. Ads load only after cookie consent.
3. **Donations:** paste your Ko-fi, Buy Me a Coffee, PayPal.me, Stripe Payment Link, GitHub Sponsors or Patreon URLs. Any button left empty falls back to the pledge form.
4. **YouTube:** set `youtube.channelUrl` and the `featured` video IDs.
5. **Affiliates / socials:** `amazonTag`, `social.*`.

## Publish on GitHub Pages
Settings → Pages → *Deploy from a branch* → `main` / `(root)` → Save.
Live URL: `https://webworksa1.github.io/999920-com/`

### Custom domain (999920.com)
1. Add a file named `CNAME` containing `999920.com` (only after DNS is ready).
2. At your registrar, add A records `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153, plus a CNAME `www` → `webworksa1.github.io`.
3. In Settings → Pages, enter the domain and tick *Enforce HTTPS*.

## Legal
Original content and code © 999920.com. "999920" is used in its generic cultural sense. See `disclaimer.html`.
