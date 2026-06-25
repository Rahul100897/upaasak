# Upaasak — Project Handover

> Hand this file to a new chat to continue the work. It captures the full state,
> the architecture, the hard‑won Shopify gotchas, the exact workflow, and the
> remaining TODOs. **Read this top to bottom before touching anything.**

Last updated at commit **`ff705cd`** on `main`.

---

## 1. What this project is

A premium, animated, mobile‑responsive redesign of the **Upaasak** store — an Indian
**Rudraksha / spiritual products** brand (Rudraksha, Karungali, malas, gemstone
bracelets, stones, idols, gifting; prices in ₹). Inspiration/reference:
`https://www.ukmasala.in/` (layout) and `https://upaasak.vercel.app/en` (brand identity).

- **Repo:** `https://github.com/Rahul100897/upaasak` (branch `main`).
- **Shopify theme:** **Horizon** (Online Store 2.0 / "blocks" architecture), Spring '26.
- **Live theme link:** the redesign lives on a **GitHub‑connected DRAFT theme** named
  **`upaasak/main`** in the merchant's Shopify admin (store handle `upaasak`,
  `0w3hw6-im.myshopify.com`). It is **not published** — do not publish without asking.
- All custom work is namespaced `upaasak-*` (files) / `u-*` (CSS classes) so it never
  collides with the stock theme. Original theme sections are preserved (left defined,
  removed from render order).

---

## 2. How delivery works (CRITICAL — read first)

The draft theme is **connected to GitHub**, and the integration is **bidirectional**:

- **You push to `main` → Shopify auto‑syncs it into the draft theme** (seconds–1 min).
- **The merchant edits in the Shopify editor/code‑editor → Shopify commits those changes
  back to `main`** as `"Update from Shopify for theme upaasak/main"` commits.

Therefore the golden rule:

```bash
git pull --no-rebase origin main   # ALWAYS pull first — or your push is rejected
# ...make changes...
git add -A && git commit && git push origin main
```

- Commits are authored as: `git -c user.name="Rahul100897" -c user.email="thakorrahul285@gmail.com" commit ...`
- After pushing, tell the merchant to **reload the editor** (⌘⇧R). If a
  **"Restore last session?"** prompt appears, they must click **✕ (dismiss)** — NOT
  "Restore" (Restore reloads their stale pre‑sync draft).
- **Never clobber the merchant's edits.** They have hand‑edited things in the code
  editor (e.g. the footer **logo image**, several mobile CSS tweaks in `assets/upaasak.css`).
  Make **additive / surgical** edits. After `git pull`, run `git log --oneline` and
  `git diff <last-known-hash> -- <file>` to see what they changed, and preserve it.

---

## 3. Architecture / file map

| File | Purpose |
|------|---------|
| `assets/upaasak.css` | **Single source of truth** for all styling — design tokens, every section's styles, animations, responsive rules. Edit surgically; the merchant also edits this file. |
| `assets/upaasak.js` | Idempotent interactions: scroll‑reveal, count‑up, testimonial carousel, FAQ accordion, **banner slideshow (+ height‑sync)**, filter tabs, announcement rotator, **mobile hamburger drawer**. Safe to load/run multiple times; re‑scans on Shopify editor events. |
| `snippets/upaasak-design-system.liquid` | Loads `upaasak.css` + `upaasak.js`. Rendered at the top of **every** `upaasak-*` section. |
| `snippets/upaasak-icon.liquid` | Inline line‑icon library (`{% render 'upaasak-icon', icon: 'lotus' %}`). |
| `snippets/upaasak-product-card.liquid` | Product card (name, Certified·Tested·Original, green discount %, MRP strikethrough, Add‑to‑cart). Used by Shop‑by‑Purpose & Best‑Seller. |
| `sections/upaasak-*.liquid` | 25 custom sections (list below). |
| `templates/index.json` | Homepage. **JSONC** (has a `/*…*/` header comment — strip it before `json.loads`). |
| `sections/header-group.json` | Global header group. Also JSONC now. |
| `templates/product.json` | Product page. |
| `preview/index.html`, `preview/product.html` | Static preview mirroring the design (uses the same `upaasak.css`/`js`). For local visual checks only. |
| `README.md` | Higher‑level overview of the redesign. |

### Fonts
Fonts are **not** hardcoded. The design tokens map to the theme's Typography settings:
`--u-font-display → var(--font-heading--family)`, `--u-font-label → var(--font-accent--family)`,
`--u-font-body → var(--font-body--family)`. Change fonts in **Settings → Typography**
(currently Inter). No Google Fonts `@import`.

### Section inventory (`sections/upaasak-*.liquid`)
Header group: `announcement-bar`, `brand-bar`, `category-nav`.
Homepage body: `banner-slideshow`, `trust-bar`, `shop-by-purpose`, `why-choose-us`,
`best-seller`, `reviews-scroll`, `sitemap-footer`, `fullwidth-image`.
Product page: `product-highlights`, `product-significance`, `product-care`,
`product-promise`, `product-reviews`, `faq`.
Earlier "luxury boutique" set (defined, reusable, addable via "Add section"):
`hero`, `marquee`, `collections`, `benefits`, `story`, `process`, `testimonials`,
`cta-banner`, `trust-strip`.

### Current render order
- **Header group** (`header-group.json`): `u_announcement → u_brandbar → u_catnav`.
  (Original `header-announcements` + `header` kept defined but not rendered.)
- **Homepage** (`index.json`): `banner-slideshow → trust-bar → shop-by-purpose →
  why-choose-us → (a 2nd why-choose-us the merchant added) → best-seller →
  reviews-scroll → sitemap-footer`. *(Full‑width Image is available to add anywhere.)*
- **Product** (`product.json`): `main → product-highlights → significance → care →
  promise → reviews → faq → product-recommendations`.

---

## 4. Shopify gotchas that already bit us (DO NOT repeat)

`shopify theme check` passes these but **Shopify's importer is stricter** and will
**silently drop** an invalid section/template (→ 404 / blank / "section does not refer
to an existing file"). Always self‑validate:

1. **Section schema `name` ≤ 25 characters.**
2. **`type:"header"` setting `content` ≤ 50 characters.** (An over‑long one rejected the
   whole banner section and blocked the show‑content toggle for several rounds.)
3. **No 4‑byte UTF‑8 (emoji) anywhere in a schema** — e.g. `🇮🇳` broke `sitemap-footer`
   import, which cascaded to drop `index.json` (homepage 404). 3‑byte chars are fine
   (`ॐ ₹ — ·`). Scan: code points `> 0xFFFF`.
4. **Header‑group sections must declare** `"enabled_on": {"groups": ["header"]}` or
   Shopify won't place them → empty header. Keep the header group to only the 3 custom
   sections (we removed the native header refs to stop it being rejected on sync).
5. **Keep templates lean.** A JSON template bloated with many leftover section
   instances, or referencing a section that fails to compile, gets dropped on import.
   `index.json`/`product.json` contain only the sections they render.
6. **Don't store the virtual `collection: "all"`** in a template setting — the importer
   rejects it. Leave collection settings empty; `shop-by-purpose`/`best-seller` fall
   back to `collections['all']` in Liquid at render time.
7. Templates are **JSONC** once Shopify touches them (leading `/* auto-generated */`
   comment). Strip it before `json.loads`: `re.sub(r'^\s*/\*.*?\*/','',s,count=1,flags=re.S)`.

### Self‑validation snippet (run before every push)
```bash
shopify theme check --output json 2>/dev/null > /tmp/tc.json
python3 - <<'PY'
import re,json,glob
for p in glob.glob('sections/upaasak-*.liquid'):
    s=open(p,encoding='utf-8').read()
    m=re.search(r'\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}',s,re.S)
    if not m: continue
    sc=json.loads(m.group(1))
    if len(sc.get('name',''))>25: print('NAME>25',p)
    if any(ord(c)>0xFFFF for c in s): print('4-BYTE',p)
    def chk(a):
        for st in a or []:
            if st.get('type')=='header' and len(st.get('content',''))>50: print('HEADER>50',p)
    chk(sc.get('settings'))
    for b in sc.get('blocks',[]): chk(b.get('settings'))
print('done')
PY
```

---

## 5. Local preview / verification (this dev environment)

The sandbox blocks the normal `python3 -m http.server` (getcwd / file reads denied).
Workaround used here:
```bash
mkdir -p /tmp/upaasak_pv/preview /tmp/upaasak_pv/assets
cp preview/*.html /tmp/upaasak_pv/preview/; cp assets/upaasak.* /tmp/upaasak_pv/assets/
printf 'import functools,http.server,socketserver\nH=functools.partial(http.server.SimpleHTTPRequestHandler,directory="/tmp/upaasak_pv")\nsocketserver.TCPServer.allow_reuse_address=True\nsocketserver.TCPServer(("127.0.0.1",8731),H).serve_forever()\n' > /tmp/serve_pv.py
# point .claude/launch.json runtimeArgs to ["/tmp/serve_pv.py"], then preview_start
```
- **The screenshot tool only reliably captures the TOP viewport** — scrolled content
  renders blank. To see lower sections: use a **tall viewport** (e.g. 1280×3300) or set
  `document.body.style.marginTop = '-Npx'` then screenshot. For exact facts (sizes,
  computed styles, click hit‑testing) use **`preview_eval`** with `getBoundingClientRect`
  / `getComputedStyle` / `elementFromPoint` — that's how most things here were verified.
- To verify the live theme, ask the merchant for a **fresh** preview link
  (editor → Share/eye icon). Older `*.shopifypreview.com` links serve **cached page
  renders** (assets bust separately), so they can mislead.
- Restore `.claude/launch.json` `runtimeArgs` to `["-m","http.server","8731"]` before committing.

---

## 6. Notable section behaviours

- **`banner-slideshow`**: full‑bleed image banners. Per banner block: `image` (desktop),
  `image_mobile` (swapped via `<picture>` under 749px), `link` (whole‑banner clickable),
  `show_content` (toggle — **default off**, hides eyebrow/heading/sub/CTA so image‑only
  banners look clean), plus overlay fields. JS sizes the slideshow to the **active**
  slide's height (fixes the intermittent bottom blank space). Add‑to‑cart on cards uses
  real variant ids.
- **`shop-by-purpose` / `best-seller`**: filter‑pill tabs; each tab is a block with a
  `collection` picker. Empty collection → falls back to `collections['all']`. JS `data-tabs`
  toggles panels.
- **Header on mobile**: announcement bar centred, "Track your order" hidden; a hamburger
  (`[data-burger]`, in `brand-bar`, right of cart) toggles the **category nav as an
  off‑canvas drawer** (`[data-catnav]` + `[data-catnav-close]`); the inline category bar
  is hidden on mobile; trust bar is 2‑column on mobile.
- **`sitemap-footer`**: 4‑column footer = Brand · Information · Policies · **Get in Touch**
  (a `contact` block type: email/phone/address + WhatsApp/Instagram/Facebook/YouTube
  icons). Brand column also shows section‑level social — leave section WhatsApp/Instagram
  blank if you want social only in the contact column.
- **`fullwidth-image`**: edge‑to‑edge image‑only section, separate desktop + mobile image.

---

## 7. Outstanding TODOs (what's left to complete)

**Editor configuration (merchant or you, in the Shopify editor — no code):**
- [ ] Assign **collections** to each **Shop‑by‑Purpose** pill (All, Bhakti, Protection,
      Prosperity, Healing, Gifting, New Arrivals) and each **Best‑Seller** tab
      (Rudraksha, Bracelets, Mala, Stones, Gifting). They currently fall back to all‑products.
- [ ] Upload per‑slide **mobile banner images**; set each banner's **link**.
- [ ] Set real links: announcement **Track‑order**, **category‑nav** items → collections,
      footer **Get‑in‑Touch** email/phone/social URLs.
- [ ] Add the **Why Choose Us** journey banner image; resolve the duplicate
      `why-choose-us` instance the merchant added (`upaasak_why_choose_us_grxyAX`).
- [ ] Add the **Full‑width Image** section where wanted + its desktop/mobile images.

**Build work (likely next requests):**
- [ ] **Cart page** redesign — was in the original client brief (`Upaasak Home.docx`):
      announcement bar → prominent "Continue Shopping" → top‑selling pitch. Not built yet.
- [ ] **Free PDFs / Blog** wiring (category nav has a "Free PDFs" item meant to point to
      a blog of PDFs).
- [ ] Optionally promote `sitemap-footer` into the **global footer group** so it shows
      site‑wide (currently a homepage section; the stock footer still renders elsewhere).
- [ ] Verify all **spiritual copy** (deity/planet/chakra/mantra in product‑significance,
      benefit claims) for accuracy before launch.
- [ ] Final **mobile QA** pass across all sections on a real device/preview.

**Then:** when the merchant approves, they **Publish** the `upaasak/main` draft.

---

## 8. Quick start for the new chat

```bash
git clone https://github.com/Rahul100897/upaasak.git
cd upaasak
git pull --no-rebase origin main          # always
# read this HANDOVER.md + README.md fully
shopify theme check                        # baseline
```
Then make additive changes, run the §4 validation, push to `main`, and ask the merchant
to reload the editor (dismiss "Restore last session"). Verify via a fresh preview link
or `preview_eval`. Keep every change reversible and never overwrite merchant edits.
