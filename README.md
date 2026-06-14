# Upaasak — Luxury Spiritual Boutique Redesign

A premium, animated, mobile-responsive redesign of the **Upaasak** Rudraksha & spiritual
products store, built on the Shopify **Horizon** theme.

> Palette: **Maroon `#7b0b2c` · Antique Gold `#c9a24b` · Warm Ivory `#fbf6ec`**
> Type: **Cormorant Garamond** (display) · **Marcellus** (labels) · **Jost** (body)

## What's new

All new work is **additive** — brand-new `upaasak-*` sections were created rather than
editing existing ones. The original sections remain defined in the theme (just removed
from the page render order), so nothing was lost.

### Shared design system
| File | Purpose |
|------|---------|
| `assets/upaasak.css` | Single source of truth — design tokens, typography, animations, every section's styles, responsive rules |
| `assets/upaasak.js` | Idempotent interactions — scroll-reveal, count-up stats, testimonial carousel, FAQ accordion, review bars |
| `snippets/upaasak-design-system.liquid` | Loads the CSS/JS + fonts (rendered at the top of each section) |
| `snippets/upaasak-icon.liquid` | Inline line-icon library (currentColor) |

### Home page — client-spec rebuild (`templates/index.json` + `sections/header-group.json`)
Rebuilt to the client's brief (`Upaasak Home.docx`), referencing ukmasala.in structure
and the upaasak.vercel.app brand identity.

**Global header group** (`header-group.json` — originals kept defined, dropped from `order`):
`upaasak-announcement-bar` (rotating messages + "Track your order") →
`upaasak-brand-bar` (smaller logo + UPAASAK wordmark/slogan + inline search + account/cart) →
`upaasak-category-nav` (icon categories: Shop All, Karungali, Rudraksha, Bracelets, Mala, Stones, Idols, Gifting, Free PDFs)

**Homepage body:**
`upaasak-banner-slideshow` (5 full-width banners: tooltip + heading + subheading + Shop Now) →
`upaasak-trust-bar` (USP strip) →
`upaasak-shop-by-purpose` (filter pills → collection per filter → horizontal scroll → View All) →
`upaasak-why-choose-us` (journey banner + USP cards) →
`upaasak-best-seller` (category tabs → top 4 per collection; cards show green discount %, MRP strikethrough, Certified·Tested·Original) →
`upaasak-reviews-scroll` (horizontal customer reviews) →
`upaasak-sitemap-footer` (Information · Policies · Quick Links · All Products + WhatsApp & Instagram)

> **Products are collection-driven:** assign a Shopify collection to each filter/category
> tab in the theme editor — the rows auto-populate with real products and a working
> Add-to-Cart. Tabs switch which collection's row is shown (client-side, no reload).
> `snippets/upaasak-product-card.liquid` renders each card.

> **Footer note:** `upaasak-sitemap-footer` sits at the bottom of the homepage. To use it
> site-wide, add it to the theme's footer group and disable the default footer.

#### Earlier "luxury boutique" home sections (still in the repo, reusable)
`upaasak-hero`, `upaasak-marquee`, `upaasak-collections`, `upaasak-benefits`, `upaasak-story`,
`upaasak-process`, `upaasak-testimonials`, `upaasak-cta-banner` — available under **Add section**.

### Product page sections (`templates/product.json`)
*(native product info)* → `upaasak-product-highlights` → `upaasak-product-significance` →
`upaasak-product-care` → `upaasak-product-promise` → `upaasak-product-reviews` →
`upaasak-faq` → *(you-may-also-like)*

Every section is fully editable in the Shopify theme editor (settings, blocks, presets) and
appears under **Add section** when customizing other pages.

## Preview the design locally

No Shopify CLI needed — a static preview mirrors the exact CSS/JS that ships:

```bash
python3 -m http.server 8731
# then open:
#   http://127.0.0.1:8731/preview/index.html    (home)
#   http://127.0.0.1:8731/preview/product.html  (product)
```

`preview/*.html` use placeholder Rudraksha SVG art; in production the sections use real
product/collection images via Shopify image-pickers.

## Deploy to the store

This is a standard Shopify theme folder. Push with the Shopify CLI:

```bash
shopify theme push          # or: shopify theme dev  (live preview against the store)
```

Then add your imagery in the theme editor (hero image, collection cards, story image).
