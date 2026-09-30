#!/usr/bin/env python3
"""
Regenerate src/*.html (editable page bodies + META) from the built root pages.
Use once after cloning if src/ is missing, then edit src/ and run build.py.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
PARTIALS = {p.stem: p.read_text(encoding="utf-8") for p in (SRC / "partials").glob("*.html")}
sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8") if (ROOT / "sitemap.xml").exists() else ""

def meta_of(name, page):
    title = re.search(r"<title>(.*?)</title>", page, re.S).group(1)
    desc = re.search(r'<meta name="description" content="(.*?)">', page, re.S).group(1)
    ld = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', page, re.S).group(1))
    m = {"title": title, "description": desc}
    if "assets/js/tools.js" in page:
        m["tools"] = True
    crumb = re.search(r'<div class="container breadcrumbs"><a href="index.html">Home</a> › (.*?)</div>', page)
    if crumb:
        m["short"] = crumb.group(1)
    elif name != "index.html":
        m["crumb"] = False
    pr = re.search(r"<loc>https://999920.com/%s</loc><lastmod>[^<]*</lastmod><priority>([^<]*)</priority>" % ("" if name == "index.html" else re.escape(name)), sitemap)
    if pr and pr.group(1) != "0.7":
        m["priority"] = pr.group(1)
    if ld and ld[0].get("@type") != "WebPage":
        m["schema"] = ld[0]["@type"]
    if name == "index.html":
        m["crumb"] = False
    return m

for f in sorted(ROOT.glob("*.html")):
    page = f.read_text(encoding="utf-8")
    body = page.split('<main id="main">\n', 1)[1].rsplit("\n</main>", 1)[0]
    for k in sorted(PARTIALS, key=lambda k: -len(PARTIALS[k])):
        body = body.replace(PARTIALS[k], "{{" + k + "}}")
    meta = meta_of(f.name, page)
    (SRC / f.name).write_text("<!--META\n" + json.dumps(meta, ensure_ascii=False) + "\nMETA-->" + body, encoding="utf-8")
    print("extracted", f.name)
