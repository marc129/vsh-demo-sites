#!/usr/bin/env python3
"""Sync finished sites from /workspace/realtor-sites into this repo and regenerate the gallery.
A site counts as finished when its folder has index.html AND screenshot-desktop.png.
Source folders are only read, never modified."""
import html, os, re, shutil, sys
from pathlib import Path
from PIL import Image

SRC = Path(os.environ.get("SRC", "/workspace/realtor-sites"))
DST = Path(__file__).resolve().parent
import csv
STATES = dict(AL="Alabama",AK="Alaska",AZ="Arizona",AR="Arkansas",CA="California",CO="Colorado",CT="Connecticut",DE="Delaware",DC="Washington, DC",FL="Florida",GA="Georgia",HI="Hawaiʻi",ID="Idaho",IL="Illinois",IN="Indiana",IA="Iowa",KS="Kansas",KY="Kentucky",LA="Louisiana",ME="Maine",MD="Maryland",MA="Massachusetts",MI="Michigan",MN="Minnesota",MS="Mississippi",MO="Missouri",MT="Montana",NE="Nebraska",NV="Nevada",NH="New Hampshire",NJ="New Jersey",NM="New Mexico",NY="New York",NC="North Carolina",ND="North Dakota",OH="Ohio",OK="Oklahoma",OR="Oregon",PA="Pennsylvania",RI="Rhode Island",SC="South Carolina",SD="South Dakota",TN="Tennessee",TX="Texas",UT="Utah",VT="Vermont",VA="Virginia",WA="Washington",WV="West Virginia",WI="Wisconsin",WY="Wyoming")
CONCEPT_STATE = {}
try:
    for r in csv.DictReader(open(SRC / "concepts.csv")):
        CONCEPT_STATE[int(r["no"])] = r["state"].strip()
except Exception as e:
    print("concepts.csv not read:", e)
sites = []
for d in sorted(SRC.glob("site-[0-9][0-9]-*")):
    idx, shot = d / "index.html", d / "screenshot-desktop.png"
    if not (d.is_dir() and idx.exists() and shot.exists()):
        print(f"skip (not finished): {d.name}"); continue
    out = DST / d.name
    if out.exists(): shutil.rmtree(out)
    out.mkdir()
    shutil.copy2(idx, out / "index.html")
    if (d / "media").is_dir(): shutil.copytree(d / "media", out / "media")
    im = Image.open(shot).convert("RGB")
    w = 1200
    h = int(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    im = im.crop((0, 0, w, min(h, 750)))  # hero area, 16:10
    im.save(out / "thumb.jpg", "JPEG", quality=78, optimize=True, progressive=True)
    t = re.search(r"<title>(.*?)</title>", idx.read_text(errors="ignore"), re.S)
    title = html.unescape(t.group(1)).strip() if t else d.name
    brand, _, rest = title.partition(" | ")
    place = re.sub(r"\s*Luxury Real Estate\s*$", "", rest).strip() or ""
    st = CONCEPT_STATE.get(int(d.name[5:7]), "")
    if place and "," not in place and st:
        place = f"{place}, {STATES.get(st, st)}"
    sites.append(dict(slug=d.name, num=d.name[5:7], brand=brand.strip(), place=place, state=st))
    print(f"synced {d.name}: {brand} — {place}")

# Committed static demos. Not copied from realtor-sites; the folder stays as published.
# Merged into the numbered grid so the next publish does not drop the card.
STATIC = [dict(
    slug="site-69-liora-vale", num="69", brand="Liora Vale",
    place="Chicago & North Shore, Illinois", state="IL"),
# state is only for the gallery tally; the reel is not a market site.
dict(
    slug="site-70-interior-render", num="70", brand="Interior Render",
    place="Widescreen flythrough", state="CA")]
seen = {s["slug"] for s in sites}
for s in STATIC:
    if not (DST / s["slug"] / "index.html").exists():
        print(f"warning: {s['slug']}/index.html missing")
    if s["slug"] not in seen:
        sites.append(s)
sites.sort(key=lambda s: s["num"])

# ---- Featured demos: always pinned first, persist across rebuilds ----
# The Halstead Group is a static React build hosted in this repo at site-00-halstead-group/.
# Source: /workspace/halston-src (built with Vite, base=/vsh-demo-sites/site-00-halstead-group/).
# If a fresh build exists in halston-src/dist it is copied in; otherwise the committed folder is kept as-is.
FEATURED = [dict(
    slug="site-00-halstead-group", num="00", brand="The Halstead Group", place="Naples, Florida", state="FL",
    url="site-00-halstead-group/", thumb="site-00-halstead-group/thumb.jpg",
    thumb_src="/workspace/demo-site/hero.png", build_dir="/workspace/halston-src/dist"),
dict(
    slug="site-68-solenne-headland", num="68", brand="Solenne Headland", place="Big Sur, California", state="CA",
    url="site-68-solenne-headland/", thumb="site-68-solenne-headland/thumb.jpg",
    badge="Pitch")]
for f in FEATURED:
    out = DST / f["slug"]
    bd = Path(f.get("build_dir", ""))
    if f.get("build_dir") and (bd / "index.html").exists():
        if out.exists(): shutil.rmtree(out)
        shutil.copytree(bd, out)
    elif not (out / "index.html").exists():
        print(f"warning: {f['slug']}/index.html missing")
    t = DST / f["thumb"]; t.parent.mkdir(parents=True, exist_ok=True)
    thumb_src = f.get("thumb_src")
    if thumb_src and Path(thumb_src).exists():
        im = Image.open(thumb_src).convert("RGB")
        w = 1200; h = int(im.height * w / im.width)
        im = im.resize((w, h), Image.LANCZOS).crop((0, 0, w, min(h, 750)))
        im.save(t, "JPEG", quality=80, optimize=True, progressive=True)
    elif not t.exists():
        print(f"warning: no thumbnail for {f['brand']}")
featured_cards = "\n".join(f'''      <a class="card featured" href="{f['url']}">
        <div class="ph"><span class="badge">{html.escape(f.get("badge", "Featured"))}</span><img src="{f['thumb']}" alt="{html.escape(f['brand'])} website preview" width="1200" height="750"></div>
        <div class="meta"><span class="no">{f['num']}</span><div><h2>{html.escape(f['brand'])}</h2><p>{html.escape(f['place'])}</p></div><span class="go" aria-hidden="true">&rarr;</span></div>
      </a>''' for f in FEATURED)
cards = featured_cards + "\n" + "\n".join(f'''      <a class="card" href="{s['slug']}/">
        <div class="ph"><img src="{s['slug']}/thumb.jpg" alt="{html.escape(s['brand'])} website preview" loading="lazy" width="1200" height="750"></div>
        <div class="meta"><span class="no">{s['num']}</span><div><h2>{html.escape(s['brand'])}</h2><p>{html.escape(s['place'])}</p></div><span class="go" aria-hidden="true">&rarr;</span></div>
      </a>''' for s in sites)
n = len(sites) + len(FEATURED)
all_states = set(s['state'] or s['place'] for s in sites + FEATURED)
page = f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VSH Media — Demo Agent Websites</title>
<meta name="description" content="A collection of {n} demo luxury real estate agent websites by VSH Media.">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{{--bg:#0c0c0d;--ink:#f4efe6;--mute:#a49d92;--line:rgba(244,239,230,.12);--gold:#c9a96a}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:var(--bg);color:var(--ink);font:400 16px/1.6 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}}
a{{color:inherit;text-decoration:none}}
header{{padding:clamp(56px,10vw,120px) clamp(20px,5vw,64px) clamp(36px,6vw,64px);max-width:1440px;margin:0 auto;border-bottom:1px solid var(--line)}}
.eyebrow{{font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:var(--gold)}}
h1{{font:500 clamp(44px,8vw,104px)/.98 "Cormorant Garamond",Georgia,serif;letter-spacing:-.01em;margin:18px 0 22px}}
h1 em{{color:var(--gold)}}
.lede{{max-width:620px;color:var(--mute);font-size:clamp(15px,1.6vw,18px)}}
.stats{{display:flex;gap:clamp(24px,5vw,56px);margin-top:36px;flex-wrap:wrap}}
.stats b{{display:block;font:500 34px/1 "Cormorant Garamond",serif;color:var(--ink)}}
.stats span{{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--mute)}}
main{{max-width:1440px;margin:0 auto;padding:clamp(28px,5vw,64px) clamp(16px,5vw,64px) 80px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr));gap:clamp(18px,2.5vw,32px)}}
.card{{display:block;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#141415;transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease}}
.card:hover{{transform:translateY(-4px);border-color:rgba(201,169,106,.55);box-shadow:0 24px 60px -24px rgba(0,0,0,.8)}}
.ph{{aspect-ratio:16/10;overflow:hidden;background:#1d1d1f}}
.ph img{{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:transform .8s ease}}
.card:hover .ph img{{transform:scale(1.04)}}
.meta{{display:flex;align-items:center;gap:16px;padding:18px 20px}}
.no{{font:500 13px/1 Inter;color:var(--gold);letter-spacing:.1em;border:1px solid rgba(201,169,106,.4);border-radius:999px;padding:8px 10px}}
.meta div{{flex:1;min-width:0}}
h2{{font:600 24px/1.15 "Cormorant Garamond",serif}}
.meta p{{color:var(--mute);font-size:14px}}
.ph{{position:relative}}
.badge{{position:absolute;bottom:14px;right:14px;z-index:2;background:var(--gold);color:#0c0c0d;font:600 11px/1 Inter;letter-spacing:.2em;text-transform:uppercase;padding:8px 12px;border-radius:999px}}
.card.featured{{border-color:rgba(201,169,106,.6)}}
.go{{font-size:20px;color:var(--gold);transition:transform .3s}}
.card:hover .go{{transform:translateX(4px)}}
footer{{border-top:1px solid var(--line);padding:32px clamp(20px,5vw,64px);color:var(--mute);font-size:13px;text-align:center}}
</style></head>
<body>
<header>
  <p class="eyebrow">VSH Media · Portfolio</p>
  <h1>Demo Agent<br><em>Websites</em></h1>
  <p class="lede">Bespoke, cinematic websites for top-producing real estate agents — each one designed from scratch for its market, with video heroes, AI concierge and instant valuation built in. Tap any site to explore it live.</p>
  <div class="stats"><div><b>{n}</b><span>Live demos</span></div><div><b>{len(all_states)}</b><span>States</span></div><div><b>100%</b><span>Mobile-ready</span></div></div>
</header>
<main><div class="grid">
{cards}
</div></main>
<footer>© VSH Media · Demo site. · <a href="https://studio.vshmedia.com" target="_blank" rel="noopener">Website by VSH Media</a> · <a href="https://www.instagram.com/vshmediacom" target="_blank" rel="noopener">Instagram</a></footer>
</body></html>
'''
(DST / "index.html").write_text(page)
(DST / ".nojekyll").touch()
print(f"gallery: {n} sites")
