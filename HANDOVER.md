# Upaasak — Project Handover

> Hand this file to a new chat to continue the work. It captures the full current
> state, the design system, every hard‑won Shopify gotcha (including two that
> silently broke sync for multiple sessions), the exact workflow, and what's left.
> **Read this top to bottom before touching anything.**

Last updated after commit **`6a86dbb`** on `main`. This file supersedes
`HANDOVER_UPAASAK.md` (now stale/deprecated — its palette, font, and section-list
info is outdated; don't trust it).

---

## 0. How to resume (paste this into a new chat)

> You are continuing a Shopify (Horizon / OS 2.0) theme redesign for **Upaasak**, an
> Indian Rudraksha/spiritual-products store. Read `HANDOVER.md` in the repo root
> FIRST, top to bottom — it has the design system, the git workflow, and a list of
> Shopify schema gotchas that have silently broken sync multiple times before. Then
> wait for the task. Do not publish the theme. Match the existing `upaasak-*` file /
> `u-*` CSS class conventions exactly. Always `git pull --no-rebase origin main`
> before editing anything, and run the validation script in §4 before every push.

---

## 1. What this project is

A premium, mobile‑responsive redesign of the Upaasak store (Rudraksha, Karungali,
malas, gemstone bracelets, gifting; prices in ₹).

- **Repo:** `https://github.com/Rahul100897/upaasak` (branch `main`).
- **Shopify theme:** Horizon (Online Store 2.0), GitHub‑connected.
- **Draft theme:** `upaasak/main` in the merchant's Shopify admin. **Not published** —
  never publish without explicit permission.
- **Live storefront (`upaasak.com`)** runs the currently *published* theme, which is
  a **completely different, older theme** — none of this work is visible there. If
  the client ever shares an `upaasak.com` screenshot as "proof a change isn't
  working," that's almost certainly why. Always point them at a fresh draft-theme
  preview link instead.
- All custom work is namespaced `upaasak-*` (files) / `u-*` (CSS classes). Original
  stock theme sections/files are left in place, untouched, just not rendered.

### Brand tokens (the CORRECT current values — do not use older docs' numbers)
- **Maroon:** `#73252D` (this is `--u-maroon` in `assets/upaasak.css`). It was
  originally `#7b0b2c` in the codebase and got silently corrected mid-project — if
  you see `#7b0b2c` anywhere or in an old doc, it's wrong.
- **Charcoal (near-black):** `#1A1A1A`. **Medium gray (subtext):** `#6B6B6B`.
- **Cream/ivory backgrounds:** `--u-cream`, `--u-ivory`, `#FAF5EC`.
- **Gold (icons/accents):** `#D4AF37` and `--u-gold*` tokens.
- **Font: Poppins, everywhere.** Set via the theme's Typography settings
  (`config/settings_data.json` → `type_body_font`/`type_subheading_font`/
  `type_heading_font`/`type_accent_font`, all `poppins_n*`), which cascade through
  the existing `--u-font-display` / `--u-font-label` / `--u-font-body` CSS variables.
  **Never hardcode a font-family** — use those three variables. The one deliberate
  exception is the PDP "Why Choose Upaasak" section (`.u-whyx .u-title`), which
  keeps an ornate serif (Georgia stack) for a "storytelling" contrast against the
  rest of the Poppins site — this was an explicit client request, don't "fix" it.

### Shared design system (read these first)
| File | Purpose |
|---|---|
| `assets/upaasak.css` | **Single source of truth** for styling — tokens (`:root { --u-* }`), every `upaasak-*` section's CSS, responsive rules. Very large; search by class name rather than reading linearly. |
| `assets/upaasak.js` | One IIFE, idempotent `initX(root)` functions collected in `initAll`, re-scanned on Shopify design-mode events and AJAX cart updates. Handles: scroll-reveal, count-up, FAQ accordion, tabs, mobile hamburger drawer, announcement/banner rotators, **carousel drag-to-scroll**, PDP gallery/variants/Buy Now, **cart drawer AJAX**, predictive search, contact prefill. |
| `snippets/upaasak-design-system.liquid` | Loads the CSS + JS once. Render at the top of **every** `upaasak-*` section: `{% render 'upaasak-design-system' %}`. |
| `snippets/upaasak-icon.liquid` | Inline line-icon library (`currentColor`). Add new icons here, then expose them in the consuming section's `icon` select options. |
| `snippets/upaasak-product-card.liquid` | The product card used in every grid (home, collection, search, recommendations). Handles sale badge, trust tags, "You Save" badge (mobile only), Enquiry vs Add-to-cart, AJAX add. |
| `snippets/upaasak-split-heading.liquid` | Legacy auto-split heading helper (splits a string on its last word). **Mostly superseded** — see §5. Still used by `upaasak-product-recommendations.liquid` ("You May Also Like"). |
| `snippets/upaasak-payments.liquid` | Payment trust badges row. |
| `snippets/upaasak-mlt.liquid` | Renders a multi-line-text metafield value into `<ul>`/`<p>` HTML; a non-bulleted line renders bold via `.u-acc__mlt p` (used for "How to Wear"/"Who Should Wear?" sub-headings inside the PDP details accordion). |

---

## 2. Workflow (NON-NEGOTIABLE)

1. **Always `git pull --no-rebase origin main` before editing or committing.** The
   draft theme is bidirectionally synced: merchant edits in the Shopify editor land
   in the repo as `Update from Shopify for theme upaasak/main` commits, sometimes
   several per session. Check `git log --oneline main..origin/main` first; if
   there are new commits, `git diff` them before pulling so you know what changed
   and don't accidentally revert real content the merchant just added (real product
   videos, reordered banners, filter tag renames, etc. have all happened before).
2. **Push to `main`; the draft theme auto-syncs** within ~1 minute. Never publish.
3. **Commit trailer** on every commit: `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`
   (or whatever model is actually running the session).
4. **Validate before every push** — see §4. This is not optional; two of the
   validation checks exist specifically because their absence silently broke sync
   for multiple sessions in a row (see §3, G1 and G2).
5. **Verify UI changes in an isolated preview** before claiming done. The repo's
   `preview/*.html` static mockups are **stale and disconnected** from the real
   Liquid/CSS — don't trust them. Instead: copy `assets/upaasak.css`/`upaasak.js`
   into a scratch dir, write a tiny standalone HTML file with just the markup
   you're testing, serve it, and check with the preview tool (screenshots +
   `preview_eval`/DOM measurements, not just eyeballing). This caught several real
   bugs (dead-space in carousels, button text clipping, a stale-flag click bug)
   that looked fine on paper.
6. **Reload the Shopify editor after every push** — hard refresh, and if a "Restore
   last session?" prompt appears, click **✕ dismiss**, never "Restore" (that
   reloads the stale pre-sync draft).

---

## 3. Gotchas that have already caused real problems

### G1 — Blank string `"default": ""` on ANY schema setting silently blocks sync (fixed 2026, cost multiple sessions)
Shopify's importer rejects a section file with `FileSaveError: Invalid schema:
setting with id="X" default can't be blank`. When this happens, **the entire file
fails to sync** — the theme editor keeps showing whatever the *last successfully
synced* version of that file was, no matter how many correct commits you push
after that point. This is confusing because *other* files keep syncing fine, so it
looks like an intermittent/random bug rather than one broken file stuck forever.
**Fix:** never write `"default": ""` — either give a real default or omit the
`default` key entirely (a setting with no default key just renders blank until
filled in, which is the same visible behavior).

### G2 — A string `"default"` on a `type: "url"` setting also blocks sync
`FileSaveError: Invalid schema: setting with id="X" default must be a string or
datasource access path` — despite the confusing wording, a `url`-type setting
**cannot** have a plain URL string as its default. Omit `default` entirely for any
`{ "type": "url", ... }` setting; set the real value on the section's live
*instance* in the template JSON instead.

### G3 — Other known schema-import constraints (theme-check does NOT catch these — self-validate)
- Section schema `"name"` ≤ 25 characters.
- A `type: "header"` setting's `"content"` ≤ 50 characters.
- No 4-byte UTF-8 characters (real emoji like 🎁🚚, or 🇮🇳-style flags) anywhere in a
  `{% schema %}` block or template JSON — these can silently break an import. 3-byte
  characters (ॐ ₹ — ✓ ·) are fine. The merchant *has* since manually added real
  emoji (🎁🚚) into announcement-bar content via the editor and it synced fine, so
  the actual risk profile isn't 100% certain — but don't be the one to introduce
  4-byte characters into a schema/settings value, only into rendered body copy if
  truly needed, and even then prefer 3-byte-safe alternatives when you have the choice.

### G4 — Validation script (run before every push)
```bash
python3 - <<'PY'
import re, json, glob
for p in sorted(glob.glob('sections/upaasak-*.liquid')):
    s = open(p, encoding='utf-8').read()
    m = re.search(r'\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}', s, re.S)
    if not m: continue
    try:
        sc = json.loads(m.group(1))
    except Exception as e:
        print("PARSE ERROR", p, e); continue
    if len(sc.get('name', '')) > 25:
        print("NAME>25:", p, sc.get('name'))
    if any(ord(c) > 0xFFFF for c in s):
        print("4-BYTE:", p)
    def check(arr, where):
        for st in arr or []:
            if not isinstance(st, dict): continue
            if 'default' in st and st['default'] == '':
                print(f"BLANK DEFAULT: {p} [{where}] id={st.get('id')}")
            if st.get('type') == 'url' and 'default' in st:
                print(f"URL WITH DEFAULT: {p} [{where}] id={st.get('id')}")
    check(sc.get('settings'), 'settings')
    for b in sc.get('blocks', []):
        check(b.get('settings'), f"block:{b.get('type')}")
print('scan complete')
PY
# Also validate any template JSON you touched:
python3 -c "
import re, json
s = open('templates/index.json', encoding='utf-8').read()
s2 = re.sub(r'^\s*/\*.*?\*/', '', s, count=1, flags=re.S)
json.loads(s2); print('OK')
"
shopify theme check --fail-level=error --output=json 2>/dev/null | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('errors:', sum(1 for e in d for o in e.get('offenses', []) if o.get('severity')=='error'))
"
```
**Baseline is 12 pre-existing errors that are NOT yours** — `img` missing
width/height on the disabled `lesure-*`/`footer-section.liquid`/
`upaasak-brand-bar.liquid` files, plus a Judge.me app-block `JSONMissingBlock` in
both product templates (needs the Judge.me app installed to resolve, unrelated to
theme code). Only worry about the count going *above* 12, or about anything the
scripts above flag directly.

### G5 — `collections.all` array filters can return empty on the live storefront
`collections.all.products | sort/where/map` has misbehaved before (works in editor,
empty on storefront). Iterate with a plain `{% for %}` loop instead of piping
`collections.all.products` through array filters.

### G6 — `upaasak.css`/`.js` only load where an `upaasak-*` section renders
Native Shopify policy pages don't render any `upaasak-*` section, so they never get
the shared stylesheet. Content for those pages (`legal-html/`) is self-contained,
inline-styled HTML with no dependency on `upaasak.css`.

### G7 — Merchant edits routinely reorder/rename block ids and tweak content live
Don't assume the shape of a template JSON matches what you last wrote — always read
the current file before editing it, and only change the specific keys your task
needs. The merchant has: reordered homepage sections, renamed banner block ids,
swapped icons, changed filter tag values to real deity names, uploaded real
Instagram reel videos, and moved section instances to new ids via "Add section" in
the editor (which mints a fresh id like `upaasak_instagram_reels_zXrRnD` — the old
`u_insta` instance I originally created got replaced by this new one; that's
expected, not a bug).

---

## 4. Two-tone section headings — the established pattern

Several homepage/PDP sections (Shop by Collection, Shop by Purpose, Shop by Deity,
Best Seller, New Arrivals, Reviews, Instagram Reels) use a two-color/two-weight
heading: one part regular-weight charcoal, one part bold-italic maroon. This is
implemented with **two explicit schema fields per section** (not a single
auto-split field) so merchants have direct control:

```liquid
<h2 class="u-title">
  {% if section.settings.heading_lead != blank %}<span class="u-title__lead">{{ section.settings.heading_lead }}</span> {% endif %}<em>{{ section.settings.heading_accent }}</em>
</h2>
```
```json
{ "type": "text", "id": "heading_lead", "label": "Heading (regular)", "default": "Shop by" },
{ "type": "text", "id": "heading_accent", "label": "Heading (bold/maroon)", "default": "Collection" }
```
CSS (already in `upaasak.css`, don't duplicate):
- `.u-title__lead` → Poppins **body** font (regular weight — deliberately uses
  `--u-font-body`, not `--u-font-display`, because Shopify only loads the ONE
  weight you pick per font role; using the heading role for "regular" text would
  just render at whatever weight the heading role is set to, not actually lighter).
- `.u-title em` → bold (700) + italic + `var(--u-maroon)`.

**Order varies per section** — most sections render lead-then-accent ("Shop by"
**Collection**), but Instagram Reels reverses it (accent-then-lead: **"4.1 million
+"** "Devotees Already Watched") because that's what the client's copy called for.
Check the specific section file for which order it uses before assuming.

The old `snippets/upaasak-split-heading.liquid` (auto-splits a single heading
string on its last word) is legacy — still wired into
`upaasak-product-recommendations.liquid` ("You May Also Like", 2-word accent) but
every other section has since moved to the explicit two-field pattern above. If
you touch a heading and it's still using the auto-split snippet, consider whether
converting it to two explicit fields is in scope.

---

## 5. Desktop carousel "peek" math — don't reintroduce the dead-space bug

Product carousels (Shop by Collection/Purpose/Deity, Best Seller, New Arrivals,
You May Also Like) and the Reviews row show N full cards + a deliberate **50% peek**
of the next one on desktop, so users get a visual cue there's more to scroll. This
depends on exact arithmetic against the real container width — get it wrong and
you get an ugly half-filled dead-space gap instead of a clean peek (this happened
twice before it was fixed properly).

The formula, given available track width `W` (the **scroller's own** clientWidth,
NOT `.u-wrap`'s outer edge which includes padding), gap `g` = 20px, and wanting
`N` full cards + a 0.5 peek:
```
cardWidth = (W - N*g) / (N + 0.5)
```
`.u-wrap`'s padding is `clamp(18px, 5vw, 64px)` per side — at the 1440px container
width it maxes at 64px/side, so `W = 1440 - 128 = 1312px`. Current values (desktop
only — mobile uses an unrelated static grid override):
- `.u-pcard` / `.u-cslide__card`: `clamp(195px, 18vw, 220px)` → 5 cards + 0.5 peek.
- `.u-revx__card` (reviews): `clamp(290px, 25vw, 358px)` → 3 cards + 0.5 peek.

**Always verify with real DOM measurement**, not a screenshot: measure the
scroller's `getBoundingClientRect().right` (not `.u-wrap`'s) against the target
card's `left`, and check the visible fraction is close to 0.5. A screenshot can
look "about right" while the real fraction is 57% or 80% — this happened during
development and wasn't obvious visually.

---

## 6. Two separate "Trust" components — don't confuse them

There are **two distinct sections**, easy to mix up:

1. **`upaasak-trust-bar.liquid`** ("Upaasak Trust Bar") — the compact row right
   below the hero banner. Styled to **match the PDP product-highlights row**
   (small rounded-square icon badge, horizontal icon+text layout) per explicit
   client feedback — do not restyle this back into a card-grid.
2. **`upaasak-trust-banner.liquid`** ("Trust Banner") — a separate, later section
   (currently positioned after Reviews) using the original card-grid treatment:
   white bordered cards, 60px cream-circle icon, heading+subtext, 4/2/1-column
   responsive grid. Both happen to use the same 4 USPs (Free Shipping / Devotee
   Support / OSOC Certified / Energized) but render completely differently.

If a future request says "the trust section," ask which one, or check the
screenshot carefully — the icon-container shape (rounded square vs. circle) is the
fastest visual tell.

---

## 7. Cart drawer — architecture and what NOT to touch

There are **two parallel, independently-coded cart drawer implementations** in
this theme, and only one is live:

- **Active:** `sections/upaasak-cart-drawer.liquid` (`.u-cart` panel), rendered
  unconditionally via `{% section 'upaasak-cart-drawer' %}` in
  `layout/theme.liquid`. Its settings/blocks live in `config/settings_data.json`
  under `sections.upaasak-cart-drawer` (**not** a template file, since it's a
  global "sections everywhere" render). Opened via `assets/upaasak.js`
  (`openCart()`), triggered by `[data-cart-toggle]` in `upaasak-brand-bar.liquid`.
- **Dormant/unused:** stock Horizon `cart-drawer-component` markup inside
  `snippets/header-actions.liquid`, gated behind `settings.cart_type == 'drawer'`
  but never reached because `header-actions`/`sections/header.liquid` aren't part
  of the active header group (`upaasak-brand-bar` is used instead). Don't waste
  time editing this — it never renders.

Current cart drawer features (all in `upaasak-cart-drawer.liquid`):
- **Moving badge strip** at the top (replaces the old "add ₹X more for free
  shipping" progress bar) — reuses the **exact same rotator mechanism** as the
  announcement bar (`data-announce` + `.u-ann__msg` classes, driven by the
  existing generic `initAnnouncements()` in `upaasak.js` — no new JS was needed).
  Badges are repeatable blocks (`type: "badge"`), so more slides can be added via
  the editor.
- **"Buy Now"** button — see §8, same submitter-aware flow as the PDP one, redirects
  straight to `/checkout` after the AJAX add succeeds (regular "Add to Cart" still
  opens the drawer).
- **"Need Help? WhatsApp us"** trust line (was "30-Day Returns Guarantee"), links
  to the real merchant WhatsApp number.
- **Payment Summary** breakdown (MRP / Item Discount / Sub Total / Shipping
  Charges) — renders as **plain rows directly in the footer**, always visible, no
  toggle/accordion/box (an earlier collapsible `<details>` version was explicitly
  rejected by the client and removed — don't reintroduce it).
- Font: every text class in the drawer has an explicit `font-family:
  var(--u-font-body)` now (was previously relying on inheritance) per an explicit
  "check the font is Poppins" request.

---

## 8. PDP Buy Now + the submitter-aware add-to-cart flow

`sections/upaasak-product-info.liquid`'s buybox renders a **Buy Now** button to the
left of Add to Cart, both `type="submit" name="add"` inside the same product form.
The distinction is made in `assets/upaasak.js`'s global submit listener via the
native `SubmitEvent.submitter` property:

```js
document.addEventListener('submit', function (e) {
  ...
  ajaxAdd(form, e.submitter);
});
function ajaxAdd(form, submitter) {
  var buyNow = !!(submitter && submitter.hasAttribute('data-pdp-buynow'));
  ...
  // on success: if (buyNow) redirect to /checkout; else open the cart drawer
}
```
The Buy Now button carries `data-pdp-buynow`. If you ever add a third submit
button to a product form anywhere, make sure it either carries this attribute (to
redirect) or doesn't (to behave like normal Add to Cart) — don't assume
`form.querySelector('[type="submit"]')` finds the right one; that was the old,
buggy pre-submitter-aware code.

**Mobile layout note:** the quantity stepper does *not* force its own row anymore
(an earlier `width:100%` fix was explicitly reverted per feedback — the client
didn't want the stepper visually stretched). Current behavior: qty + Buy Now share
row 1, Add to Cart wraps to row 2 alone. This is intentional/accepted, not a bug —
if asked to change it again, that's a deliberate re-request, not a regression.

---

## 9. The drag-to-scroll click-suppression bug (fixed — understand before touching `initScrollers`)

`assets/upaasak.js`'s `initScrollers()` adds pointer-based drag-to-scroll to every
`[data-scroller]`/`[data-scroll]` carousel (added because hiding the arrow buttons
left desktop users with no way to scroll). It tracks a `moved` flag to distinguish
"the user dragged" (suppress the resulting click, so a product link doesn't
navigate) from "the user just clicked" (let it through).

**The bug that shipped once:** `moved` only ever got reset inside the click
handler. If a drag ended via `pointerleave`/`pointercancel` (pointer exits the
track bounds, or the browser cancels the gesture) *without* a click landing back
inside the track, `moved` stayed `true` forever and silently ate the **next**,
completely unrelated click on that carousel — this is exactly what "clicking a
product card stopped working, intermittently" looks like from the outside.

**The fix, already in place:** `stopDrag(abandoned)` resets `moved = false` when
called from `pointerleave`/`pointercancel` (an abandoned drag), but *not* from a
normal `pointerup` (where the following click is expected to consume it). If you
ever touch this function again, preserve that distinction — it's the whole fix.
Also: there's no `pointer-events: none` CSS trick on dragging children anymore
(removed as an unnecessary extra risk factor once the flag logic was correct).

---

## 10. Current homepage section order

```
u_slides                          Banner slideshow
u_trustbar                        Upaasak Trust Bar (PDP-row style, below hero)
upaasak_collection_slider_FLwqJJ  Shop by Collection
u_shop_purpose                    Shop by Purpose
u_best                            Best Seller
upaasak_shop_by_purpose_qViYEi    Shop by Deity
upaasak_fullwidth_image_Dwmc3G    "Why Choose Us" full-width image
upaasak_best_seller_aVta9j        New Arrivals
u_reviews_x                       Reviews Scroll
u_trustbanner                     Trust Banner (card-grid style)
u_sitemap                         Footer (homepage-local instance; the REAL global
                                   footer is a separate instance in footer-group.json)
upaasak_instagram_reels_zXrRnD    Instagram Reels — merchant moved this here via
                                   the editor after uploading real video content;
                                   note it currently sits AFTER the footer, which
                                   is unusual — worth confirming with the client
                                   whether that's intentional or should move up
                                   (original brief said "after New Arrivals").
```

---

## 11. Outstanding / open items

**Needs Shopify Admin configuration (not theme code):**
- [ ] **Collection page Purpose/Deity filters.** Native Shopify filters
  (Search & Discovery app) need `Purpose` and `Deity` set up as **product
  metafields** (not just tags) with "storefront filter" enabled, then added and
  reordered (Purpose → Deity → Availability → Price) in
  Apps → Search & Discovery → Filters. The theme already renders
  `collection.filters` in whatever order that config provides —
  `sections/upaasak-collection.liquid` needs no code change for this.
- [ ] Rename the generic "More filters" tag-filter label to something like
  "Categories" — also set in Search & Discovery → Filters, not code.
- [ ] Real "About Us" story/copy + image (`upaasak-about-content.liquid` currently
  ships with honest placeholder copy and no image — safe generic content, but not
  the client's real story).
- [ ] Real banner images per-slide for mobile, and confirm Yatra collection/link
  once it exists.

**Needs real assets (video/image) the client hasn't fully supplied yet:**
- [x] Instagram Reels — merchant has since uploaded 3 real reel videos/posters/
  URLs via the editor. Done.
- [ ] Confirm the floating WhatsApp button's number/pre-filled message text with
  the client (currently defaults to the real number used elsewhere, but the
  message text is a guess: "Hi Upaasak, I have a question about").

**Flagged, not yet actioned:**
- [ ] Custom per-product badge system (own color/text per SKU) — real build effort,
  was flagged Hard tier in the original correction-doc breakdown, not started.
- [ ] Floating "Claim FREE 5 Mukhi Rudraksha" add-to-cart-on-click banner (both
  homepage hero and PDP versions) — Hard tier, not started.
- [ ] Sticky category nav on scroll — Hard tier, not started.
- [ ] Collection page: move filters into a horizontal dropdown-pill bar instead of
  the sidebar drawer — Hard tier, not started.

**Explicitly skipped this round** (per client instruction, not overlooked):
Add to Cart drawer's original scope items not covered above, cart empty-state,
SEO tasks, transactional email styling. Ask before starting any of these.

---

## 12. File map — what to touch for what

- **Any visual style** → `assets/upaasak.css`. Search by class name; the file is
  organized in loose chronological sections, not alphabetically.
- **Any interaction** → `assets/upaasak.js`, `initX(root)` pattern with a
  `data-*-bound` guard, registered in `initAll`.
- **New icon** → `snippets/upaasak-icon.liquid`, then expose it in the consuming
  section's `icon` select options.
- **New section** → `sections/upaasak-<name>.liquid`. Render the design-system
  snippet first line, full schema + at least one preset, name ≤25 chars, run the
  §4 validation script before pushing.
- **Card anywhere** → reuse `snippets/upaasak-product-card.liquid`, don't fork it.
- **Global elements** (cart drawer, WhatsApp float) → rendered directly via
  `{% section '...' %}` in `layout/theme.liquid`; their settings live in
  `config/settings_data.json`, not a template file.
- **Homepage section content** → `templates/index.json`.
- **Header** → `sections/header-group.json` (announcement bar + brand bar +
  category nav — the real live header, not stock `sections/header.liquid`).
- **Footer** → `sections/footer-group.json` (real global footer) — there's also a
  disabled homepage-local instance of the same section type in `templates/index.json`
  (`u_sitemap`), don't confuse the two when editing footer content.

---

_Read this fully before starting. When in doubt about current state, `git pull`
and read the actual file rather than trusting a description here that might have
drifted — but the gotchas in §3, §4, §5, §6, §9 are architectural/historical
lessons that remain true regardless of what's changed since._
