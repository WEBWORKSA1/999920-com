#!/usr/bin/env python3
"""
999920.com static site builder.
Each file in src/*.html starts with a JSON meta block inside <!--META ... META-->.
Run:  python3 build.py   → writes finished pages to the repo root (served by GitHub Pages).
"""
import json, re, pathlib, datetime

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
BASE = "https://999920.com"
OWNER_URL = "https://web.works/contact"
TODAY = datetime.date.today().isoformat()

NAV = [
    ("decoder.html", "Decoder"),
    ("999920-meaning.html", "999920"),
    ("lucky-numbers.html", "Lucky Numbers"),
    ("love-calendar.html", "Calendar"),
    ("wedding-dates.html", "Wedding Dates"),
    ("blog.html", "Blog"),
]
MOBILE_EXTRA = [("love-card.html", "Love Card Maker"), ("zodiac-love.html", "Zodiac Love Match"), ("gold-9999.html", "9999 Gold"),
    ("gifts.html", "Gift Ideas"), ("contests.html", "Contests & Prizes"), ("videos.html", "Videos"),
    ("get-quotes.html", "Get Free Quotes"), ("support.html", "Support Us ❤")]

def header(active):
    links = "".join(
        '<li><a href="%s"%s>%s</a></li>' % (h, ' aria-current="page"' if h == active else "", t) for h, t in NAV
    )
    links += "".join(f'<li class="mobile-only"><a href="{h}">{t}</a></li>' for h, t in MOBILE_EXTRA)
    return f"""<div class="owner-bar" role="note">Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership — <a href="{OWNER_URL}" target="_blank" rel="noopener">Contact here →</a></div>
<header class="site-header"><div class="container nav">
<a class="brand" href="index.html" aria-label="999920 home"><span class="brand-mark">久</span><span>999920<small>久久久久爱你 · LOVE FOREVER</small></span></a>
<ul class="nav-links" id="nav-links">{links}</ul>
<div class="nav-cta"><a class="btn btn-primary btn-sm" href="get-quotes.html">Get Free Quotes</a><a class="btn btn-gold btn-sm" href="support.html">Support ❤</a>
<button class="icon-btn" data-theme-toggle aria-label="Toggle dark mode">◐</button>
<button class="icon-btn menu-btn" aria-controls="nav-links" aria-expanded="false" aria-label="Open menu">☰</button></div>
</div></header>"""

FOOTER = f"""<div class="ad-slot"><div class="ad-box" data-slot="footer">Advertisement</div></div>
<section class="alt" style="padding:48px 0"><div class="container center">
<h2>Get the “Code of the Week” 💌</h2><p class="muted">One romantic number code, the next love date, and exclusive contest news. No spam — unsubscribe anytime.</p>
<form class="js-form newsletter" data-subject="Newsletter signup" data-success="You're in! Watch your inbox for the Code of the Week.">
<input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
<label class="sr-only" for="nl-email">Email</label><input id="nl-email" type="email" name="email" placeholder="Your email address" required>
<button class="btn btn-primary" type="submit">Subscribe</button><p class="form-status" aria-live="polite" style="flex-basis:100%"></p></form>
</div></section>
<footer class="site-footer"><div class="container">
<div class="foot-grid">
<div><a class="brand" href="index.html" style="color:#fff"><span class="brand-mark">久</span><span>999920<small style="color:#c9b3b8">久久久久爱你</small></span></a>
<p style="margin-top:14px">The home of Chinese love numbers, lucky codes and forever-love planning. 9999 (久久久久) + 20 (爱你) = “love you forever and ever.”</p>
<p class="pill-list"><a data-social="youtube" href="#">YouTube</a><a data-social="instagram" href="#">Instagram</a><a data-social="tiktok" href="#">TikTok</a><a data-social="pinterest" href="#">Pinterest</a><a data-social="x" href="#">X</a><a data-social="facebook" href="#">Facebook</a></p></div>
<div><h4>Tools</h4><ul><li><a href="decoder.html">Number Code Decoder</a></li><li><a href="lucky-numbers.html">Lucky Number Finder</a></li><li><a href="zodiac-love.html">Zodiac Love Match</a></li><li><a href="wedding-dates.html">Wedding Date Finder</a></li><li><a href="love-card.html">Love Card Maker</a></li><li><a href="gold-9999.html">Gold Value Calculator</a></li><li><a href="love-calendar.html">Love Calendar</a></li></ul></div>
<div><h4>Explore</h4><ul><li><a href="999920-meaning.html">What 999920 Means</a></li><li><a href="blog.html">Blog &amp; Guides</a></li><li><a href="gifts.html">Gift Ideas</a></li><li><a href="videos.html">Videos</a></li><li><a href="contests.html">Contests &amp; Prizes</a></li><li><a href="about.html">About</a></li></ul></div>
<div><h4>Work with us</h4><ul><li><a href="get-quotes.html">Get Free Quotes</a></li><li><a href="advertise.html">Advertise / Sponsor</a></li><li><a href="advertise.html#list">List Your Business</a></li><li><a href="support.html">Donate / Support</a></li><li><a href="careers.html">Careers &amp; Talent</a></li><li><a href="contact.html">Contact</a></li><li><a href="{OWNER_URL}" target="_blank" rel="noopener">Buy / Partner on this domain</a></li></ul></div>
</div>
<div class="foot-bottom"><p>© <span data-year></span> 999920.com. All rights reserved. Original content and design. “999920” is used in its generic, cultural numeric sense; no claim is made to any third-party trademark. Tools are for entertainment and cultural education only. <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · <a href="disclaimer.html">Disclaimer &amp; Trademark/Copyright Notice</a> · <a href="sitemap.xml">Sitemap</a></p></div>
</div></footer>
<div class="float-cta"><a class="btn btn-primary btn-sm to-top" href="#top" aria-label="Back to top">↑</a></div>
<div class="cookie" id="cookie" role="dialog" aria-label="Cookie consent"><b>🍪 Cookies &amp; ads</b><p class="small" style="margin:6px 0 0">We use cookies for essential features and, with your consent, for personalised ads (Google AdSense) and analytics. See our <a href="privacy.html">Privacy Policy</a>.</p>
<div class="row"><button class="btn btn-primary btn-sm" data-consent="all">Accept all</button><button class="btn btn-ghost btn-sm" data-consent="essential">Essential only</button></div></div>"""

def page(meta, body, name):
    title = meta["title"]
    desc = meta["description"]
    url = f"{BASE}/{'' if name == 'index.html' else name}"
    crumbs = ""
    if name != "index.html" and meta.get("crumb", True):
        crumbs = f'<div class="container breadcrumbs"><a href="index.html">Home</a> › {meta.get("short", title.split(" | ")[0])}</div>'
    ld = [{
        "@context": "https://schema.org", "@type": meta.get("schema", "WebPage"),
        "name": title, "description": desc, "url": url,
        "isPartOf": {"@type": "WebSite", "name": "999920", "url": BASE},
        "dateModified": TODAY,
    }]
    if name == "index.html":
        ld.append({"@context": "https://schema.org", "@type": "WebSite", "name": "999920 — Love You Forever", "url": BASE,
                   "potentialAction": {"@type": "SearchAction", "target": BASE + "/decoder.html?n={number}", "query-input": "required name=number"}})
    if name != "index.html":
        ld.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/"},
            {"@type": "ListItem", "position": 2, "name": meta.get("short", title), "item": url}]})
    faqs = re.findall(r'<details[^>]*>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>', body, re.S)
    if faqs:
        ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": re.sub("<.*?>", "", q).strip(),
             "acceptedAnswer": {"@type": "Answer", "text": re.sub("<.*?>", "", a).strip()}} for q, a in faqs]})
    scripts = '<script src="assets/js/config.js"></script><script src="assets/js/main.js" defer></script>'
    if meta.get("tools"):
        scripts = '<script src="assets/js/config.js"></script><script src="assets/js/data.js"></script><script src="assets/js/main.js" defer></script><script src="assets/js/tools.js" defer></script>'
    robots = '<meta name="robots" content="noindex">' if name == "404.html" else '<meta name="robots" content="index,follow,max-image-preview:large">'
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
{robots}
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#b3122b">
<meta property="og:type" content="website"><meta property="og:site_name" content="999920">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}/assets/img/og-image.svg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml"><link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,500&family=Noto+Serif+SC:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head><body id="top">
<a class="skip" href="#main">Skip to content</a>
{header(name)}
{crumbs}
<main id="main">
{body}
</main>
<div id="site-footer"></div>
<script src="assets/js/layout.js"></script>
{scripts}
</body></html>
"""

def main():
    pages = []
    for f in sorted(SRC.glob("*.html")):
        raw = f.read_text(encoding="utf-8")
        m = re.match(r"\s*<!--META(.*?)META-->", raw, re.S)
        meta = json.loads(m.group(1))
        body = raw[m.end():]
        for pf in (SRC / "partials").glob("*.html"):
            body = body.replace("{{" + pf.stem + "}}", pf.read_text(encoding="utf-8"))
        (ROOT / f.name).write_text(page(meta, body, f.name), encoding="utf-8")
        pages.append((f.name, meta))
    (ROOT / "assets/js/layout.js").write_text(
        "/* generated by build.py: shared footer, newsletter, cookie banner */\n"
        "(function(){var el=document.getElementById('site-footer');if(el)el.outerHTML=" + json.dumps(FOOTER, ensure_ascii=False) + ";})();\n",
        encoding="utf-8")
    urls = "".join(
        f"<url><loc>{BASE}/{'' if n == 'index.html' else n}</loc><lastmod>{TODAY}</lastmod><priority>{m.get('priority', '0.7')}</priority></url>\n"
        for n, m in pages if n != "404.html")
    (ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    print("built", len(pages), "pages")

if __name__ == "__main__":
    main()
