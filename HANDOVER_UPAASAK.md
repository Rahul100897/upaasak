# UPAASAK — Project Handover

A living handover for the **Upaasak** Rudraksha / spiritual-products Shopify store
(Horizon / OS 2.0 theme, GitHub-connected **draft** theme `upaasak/main`).
This file lets a fresh chat pick up and continue without re-discovering context.

> **Repo:** https://github.com/Rahul100897/upaasak · branch `main`
> **Live store:** https://upaasak.com · **Draft theme:** `upaasak/main` (never publish unless told)

---

## 0. How to resume (paste this into a new chat)

> You are an expert Shopify (Horizon / OS 2.0) front-end dev + UX designer continuing
> the **Upaasak** store. Read `HANDOVER_UPAASAK.md`, `README.md`, and `HANDOVER.md` in
> the repo root FIRST — they define the design system, workflow, and everything already
> built. Then wait for my task. Respect every rule in §2 (Workflow) and §3 (Gotchas).
> Do not publish the theme. Match the existing `upaasak-*` / `u-*` design system exactly.

---

## 1. What this project is

A premium, animated, mobile-responsive redesign of the Upaasak store. **All work is
additive** — brand-new `upaasak-*` sections + `u-*` CSS classes, driven by a single
shared design system. Original theme sections are left defined but dropped from render
order.

- **Palette:** Maroon `#7b0b2c` · Deep maroon `#570720` · Antique gold `#c9a24b` · Warm ivory `#fbf6ec` · charcoal text.
- **Type:** from theme Typography settings (Cormorant/Marcellus/Jost) — never hardcode font families; use the `--u-font-*` vars.

### Shared design system (the backbone — read these files)
| File | Purpose |
|---|---|
| `assets/upaasak.css` | **Single source of truth** — tokens (`:root --u-*`), components, every `upaasak-*` section's styles, responsive rules. ~1500 lines, versioned in comment banners (`v2`…`v12`). |
| `assets/upaasak.js` | Idempotent interactions: scroll-reveal, count-up, FAQ accordion, carousels, tabs, mobile drawer, **PDP gallery/variants**, **cart drawer**, **predictive search**, **scroller arrows**, **shuffle**, **contact prefill**. Re-scans on Shopify editor events. |
| `snippets/upaasak-design-system.liquid` | Loads the CSS + JS once. **Render at top of EVERY `upaasak-*` section:** `{% render 'upaasak-design-system' %}`. ⚠️ Only loads on pages that render an `upaasak-*` section (see Gotcha G7). |
| `snippets/upaasak-icon.liquid` | Inline line-icon library (`currentColor`). Add new icons here + expose in the consuming section's `icon` select. |
| `snippets/upaasak-product-card.liquid` | The product card used in ALL grids/rows (home, collection, search, recs, 404). Green % badge, Certified·Tested·Original, MRP strikethrough, AJAX add-to-cart, **Enquiry** handling. |
| `snippets/upaasak-payments.liquid` | Payment trust badges (visa/mastercard/upi/rupay/paypal/gpay/amazon/applepay/cod). |
| `snippets/upaasak-mlt.liquid` | Renders a **multi-line-text metafield** value → clean `<ul>`/`<p>` HTML. |

---

## 2. Workflow (NON-NEGOTIABLE)

1. **Always `git pull --no-rebase origin main` before committing.** The draft theme
   auto-syncs edits from the Shopify editor back into the repo as
   `Update from Shopify for theme upaasak/main` commits. Expect frequent merges.
2. **Push to `main`; the draft theme auto-syncs.** Never publish.
3. **Never overwrite the merchant's manual editor edits.** They routinely change section
   settings, disable blocks, add app blocks (Judge.me), rename block ids, etc. When
   editing `templates/*.json`, load → modify only what's needed → write back, preserving
   the JSONC header comment (`/* auto-generated */`) and all other keys.
4. **Commit author trailer** on every commit:
   ```
   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
   ```
5. **Validate before pushing** (importer is stricter than theme-check):
   - Section schema `name` ≤ 25 chars; `header` content ≤ 50 chars; **no 4-byte emoji anywhere in schema/JSON** (3-byte glyphs like ॐ ₹ — ✓ are fine, and only in Liquid/CSS bodies, not schema).
   - Run `shopify theme check`. Baseline is ~24 offenses / 12 errors that are **NOT ours**
     (pre-existing `lesure-*`, `footer-section.liquid`, `upaasak-brand-bar.liquid` logo
     `ImgWidthAndHeight`, and Judge.me app-block `JSONMissingBlock` in product templates).
     Only care about NEW offenses in files you touched.
6. **Skip browser previews** unless asked — the user validates in the Shopify editor and
   provides screenshots. Cart/search/collection features need the live store anyway.
7. **Deliverable data files** (CSV/xlsx/legal-html) live in the repo dir but are **NOT
   committed** (they're not theme files). Theme code IS committed.

### Handy commands
```bash
git pull --no-rebase origin main
shopify theme check 2>&1 | grep -E "total offenses"
# schema self-validate (name<=25, header<=50, no 4-byte):
python3 - <<'PY'
import re,json,glob
for p in sorted(glob.glob('sections/upaasak-*.liquid')):
    s=open(p,encoding='utf-8').read(); m=re.search(r'\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}',s,re.S)
    if not m: continue
    sc=json.loads(m.group(1))
    if len(sc.get('name',''))>25: print('NAME>25',p)
    if any(ord(c)>0xFFFF for c in s): print('4-BYTE',p)
print('ok')
PY
```

---

## 3. Gotchas learned the hard way

- **G1 — `collections.all` array filters break on storefront.** `collections.all.products | sort/where/map` returns EMPTY on the live storefront (works in a plain `{% for %}` loop and in the editor). Never pipe `collections.all.products` through array filters. Iterate directly. Ordering: rely on the source collection's sort order; randomise client-side in JS.
- **G2 — `collections.all` may be empty in this store.** Sections that need "all products" expose a **collection picker** fallback (e.g. Shop by Purpose "Default products collection", Best Seller "Collection"). Merchant should point these at a populated collection (e.g. **Shop All**, made Automated → *Product tag = `Certified`*, which every imported product carries).
- **G3 — Product CSV can't populate manual collections.** Shopify's product CSV has no collection column. Products land in collections only via **Automated (Smart) collections** by type/tag. Our CSV sets `Type` = collection name and tags = collection name + handle, so automate each collection on those.
- **G4 — Merchant edits + Shopify auto-sync cause merge conflicts** in `templates/*.json`. When editing templates via Python, always `git pull` first, and after writing, if a conflict appears (e.g. accordion block re-keyed to `accordion_CRMx4f`, Judge.me section id), reconcile by keeping our block AND the merchant's key. Order arrays may contain app/section ids we don't own — leave them.
- **G5 — Liquid `escape` filter applies to the whole accumulated string.** When building HTML in a loop, escape each piece into a temp var BEFORE `append` (see `upaasak-mlt.liquid`).
- **G6 — `{% style %}`/scrollbars:** hide native scrollbars on scroll rows with `scrollbar-width:none` + `::-webkit-scrollbar{display:none}` (done for `.u-prow`, `.u-revx__scroll`).
- **G7 — `upaasak.css` is NOT global.** It loads only where an `upaasak-*` section renders. **Policy pages** (Settings → Policies) use Shopify's native `.shopify-policy__container` and do NOT load it → global tweaks for those go in `layout/theme.liquid <head>` (already added: policy container max-width + spacing). Policy/Page **body content** we deliver is therefore **inline-styled HTML** (see §6).
- **G8 — Metafield lists.** FAQ collection metafields must be **`list.single_line_text_field`** (questions list ‖ answers list, paired by index).
- **G9 — Cart AJAX** uses the Section Rendering API. The cart drawer is a **section** rendered globally via `{% section 'upaasak-cart-drawer' %}` in `theme.liquid`; JS swaps `#u-cart-contents`. Add-to-cart interception skips native `product-form-component` to avoid double-adds.

---

## 4. Pages / templates — current state

| Route | Template | Section(s) | Notes |
|---|---|---|---|
| Home | `templates/index.json` + `sections/header-group.json` | announcement-bar, brand-bar, category-nav → banner-slideshow, trust-bar, shop-by-purpose, why-choose-us, best-seller, reviews-scroll, sitemap-footer | Header group = announcement + brand bar + category nav. |
| Product (PDP) | **`templates/product.json` (Default)** = new PDP | `upaasak-product-info` (hero: sticky gallery + modular right-column blocks incl **Details Accordion** from metafields), highlights, significance, **why** (Why Choose UPAASAK), care, recommendations, guarantee, reviews, faq(+Judge.me) | `product.upaasak-pdp.json` kept as a backup/alt template. |
| Collection | `templates/collection.json` | `upaasak-collection` | Sidebar filters (Search & Discovery), sort, pagination, empty-state handling. |
| All collections | `templates/list-collections.json` | ⚠️ **still stock `main-collection-list`** — a themed `upaasak-collection-list` was built then reverted; NOT currently applied. (There's a separate homepage `upaasak-collection-slider` section.) |
| Search | `templates/search.json` | `upaasak-search` | Product grid + predictive results + pagination. Predictive results section = `upaasak-predictive` (title + SKU). |
| Cart | `templates/cart.json` | (drawer is primary; `/cart` still native) | Drawer = `upaasak-cart-drawer` (global). |
| 404 | `templates/404.json` | `upaasak-404` | Spiritual 4-ॐ-4, search, quick links, featured row. |
| Contact | `templates/page.contact.json` | hero-banner + `upaasak-contact` | Themed contact form + info cards. Alt template `page.upaasak-contact.json` also exists. |
| FAQ | `templates/page.faq.json` | `upaasak-faq-page` | **Editor-managed** categories + Q/A accordion, pre-filled from the doc. |

**Enquiry behaviour:** any product tagged **`Enquiry`** shows "Price on Enquiry" + a
"Contact to Order" button → `/pages/contact?enquiry=<title>` (everywhere: cards + PDP).
Contact page JS prefills the message from `?enquiry=`.

---

## 5. Product data (CSV / Excel)

- **Source:** `UPAASAK_Products_Master_v1_FINAL.xlsx` (client). Sheets used: **Products Master v5**, **Size Variation** (variants). A **Shopify Import** sheet was added.
- **Deliverable:** `UPAASAK_Shopify_Import.csv` — Shopify product import (91 products; 10 variant parents → Size / Ratti; 17 enquiry-only products active @ ₹0 + `Enquiry` tag; same 3 placeholder images on all).
- **Metafields carried in CSV** (product): `custom.product_tag_line`, `custom.key_highlights`, `custom.specifications`, `custom.box_contents`, `custom.key_benefits`, `custom.product_disclaimer` (all multi-line text). Body (HTML) = only the 150–200-word description.
- **Collection FAQ metafields** (`custom.product_faqs_title` / `product_faqs_description`, **list.single_line_text_field**) can't be set via product CSV → provided as split text to paste per collection.
- **Rebuild script:** `scratchpad/build_shopify_csv.py` (regenerates CSV + xlsx sheet + `COLLECTION_FAQS.txt`). Legal→HTML: `scratchpad/legal2html.py`.

---

## 6. Legal / policy content (`legal-html/`)

Inline-styled HTML (self-contained; **no theme CSS dependency** — see G7). Paste via the
`<>` HTML view.
- **Policies** (Settings → Policies): `terms-and-conditions.html`, `privacy-policy.html`, `shipping-policy.html`, `refunds-and-returns-policy.html`, `contact-information.html`.
- **Pages** (Online Store → Pages, `<>` editor): `free-5-mukhi-rudraksha-terms.html`. (`faq.html` is superseded by the `page.faq` template/section — prefer the section.)
- Wrapper: `<div class="upaasak-legal" style="max-width:860px;margin:0 auto;padding:32px 0 60px;…">`. Global policy width/spacing also set in `theme.liquid`.

---

## 7. Merchant TODO (must be done in the Shopify admin — not code)

1. **Import** `UPAASAK_Shopify_Import.csv` (Products → Import → overwrite).
2. **Automate collections** by type/tag so they populate (esp. **Shop All** → tag `Certified`). Then set **Shop by Purpose → Default products collection** and **Best Seller → Collection** to populated collections.
3. **Category-nav links** (Header → Category Nav) — point each item to `/collections/<handle>`; new **Yatra** & **Pooja Kits** items use the new icons.
4. **Collection FAQ metafields** — create as **list.single_line_text_field** and paste from `COLLECTION_FAQS.txt`; enable **Show Collection FAQ** on the PDP FAQ section.
5. **Per-product content** — set the `custom.*` metafields (or rely on CSV), real product images (replace the 3 placeholders), and per-product `custom.product_tag_line` (PDP eyebrow).
6. **Search & Discovery app** — configure filters for the collection page sidebar.
7. **Set page templates:** Contact page → `contact` (or `upaasak-contact`); FAQ page → `faq`; create the "Free 5 Mukhi Rudraksha — T&C" page and paste its HTML.
8. Paste the 5 policy HTML blocks + Contact information HTML.

---

## 8. Open / candidate next tasks

- [ ] Theme the **all-collections `/collections`** page (still stock `main-collection-list`). A `upaasak-collection-list` section was built & reverted — can be re-added if wanted.
- [ ] Optionally convert the **Free 5 Mukhi Rudraksha** page to an editor section (like FAQ) instead of pasted HTML.
- [ ] Wire category-nav default links in code (currently editor-managed).
- [ ] Decide whether **Enquiry** ₹0 products should also be hidden from Add-to-cart on native theme surfaces (already handled on our surfaces).
- [ ] Consider giving the FAQ / Free-Rudraksha **pages** a matching max-width to the policies.
- [ ] Optional: real payment logos (currently wordmark badges) in `upaasak-payments`.

---

## 9. File map (what to touch for what)

- **Any visual style** → `assets/upaasak.css` (append a new `vN — …` banner block; don't rewrite earlier blocks).
- **Any interaction** → `assets/upaasak.js` (`initX(root)` pattern, idempotent with a `data-*-bound` guard, add to `initAll`).
- **New icon** → `snippets/upaasak-icon.liquid` + expose in the section's `icon` select options.
- **New section** → `sections/upaasak-<name>.liquid` (render design-system at top, full schema + preset, name ≤25).
- **Card anywhere** → reuse `snippets/upaasak-product-card.liquid`.
- **PDP metafield content** → `snippets/upaasak-mlt.liquid` + `upaasak-product-info` accordion block.

_Last updated: handover written after commit `c5ca558` (policy spacing). Pull latest before starting._
