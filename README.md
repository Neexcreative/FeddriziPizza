# Fedrizzi Pizza

A premium, immersive artisan pizza ordering prototype built with semantic HTML, CSS, vanilla JavaScript and GSAP.

It includes an interactive pizza wheel with GSAP-powered rotation and inertia, a responsive mobile experience, a cart, delivery/collection flow, a demo checkout, delivery information, an FAQ, and accessibility features.

This is a **prototype**, not a production-ready restaurant platform. See [Prototype / production limitations](#prototype--production-limitations).

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- GSAP 3 (loaded via CDN)
- GSAP InertiaPlugin (loaded via CDN)
- Node.js 18+
- A local static Node server (`tools/serve.mjs`)

There is no React, no Next.js, no other framework, and no bundler. Modules are loaded natively by the browser via `<script type="module">`.

## Project structure

```
index.html

css/
  main.css
  responsive.css

js/
  app.js            entry point, wiring and ember system (disabled)
  pizza-wheel.js     pizza wheel state, rotation, drag/inertia, flavour swap
  cart.js            cart state, localStorage persistence, animated totals
  modal.js           modal/sheet manager, focus trap, keyboard handling
  checkout.js        delivery/collection mode, checkout form, validation
  information.js     delivery info panel + FAQ accordion content
  site-config.js     centralized business configuration

assets/
  images/
    pizzas/
      FULL_PIZZA.webp       master pizza wheel visual
      pepperoni.webp
      veggie-supreme.webp
      mushroom-ham.webp
      mediterranean.webp
      hawaiian.webp
      greek-supreme.webp
      ham-onion.webp
      italian-supreme.webp
  icons/
    favicon.svg

tools/
  serve.mjs          local static dev server
  validate.mjs        project validation script

site.webmanifest
package.json
```

## Main features

### Pizza wheel

- 8 pizza flavours on a single master image (`FULL_PIZZA.webp`)
- 45-degree rotation steps, tracked as a continuous rotation state
- Previous / next navigation
- Keyboard navigation (arrow keys)
- Pointer drag and touch swipe
- GSAP InertiaPlugin-based momentum and slice snapping on release
- Responsive sizing across breakpoints

### Flavours

- Pepperoni
- Veggie Supreme
- Mushroom & Ham
- Mediterranean
- Hawaiian
- Greek Supreme
- Ham & Onion
- Italian Supreme

### Sizes

- Small — €18
- Medium — €22
- Large — €28

### Ordering

- Add to Order
- Persistent cart via `localStorage`
- Quantity controls and item removal
- Drinks, Dips, Fries add-ons
- Animated (GSAP) cart totals

### Delivery / collection

Configuration lives in `js/site-config.js` (`DELIVERY_CONFIG`):

- Delivery base fee: €3.50
- Standard radius: 10 km
- Extra fee beyond standard radius: €0.75 per additional km (prototype rate)
- Delivery ETA: 30–40 min
- Collection ETA: 15–20 min, no delivery fee

Real geographic distance calculation is not connected yet — the checkout keeps the base fee while distance is unknown; the delivery info panel shows illustrative distance examples only.

### Checkout

- Validated demo checkout (name, phone, email, card fields with input formatting)
- Order confirmation screen with a generated order number
- No real payment is processed

### Information

- Delivery information panel (fee, ETAs, distance examples, conditions, allergy note)
- FAQ accordion, content driven by `DELIVERY_CONFIG`

### Account

- Demo account UI: Profile, Rewards, Cards, History, Help tabs (static placeholder content)

### Accessibility

- Keyboard navigation
- Modal focus trapping and focus restoration
- Escape closes open modals/sheets
- ARIA states (`aria-expanded`, `aria-pressed`, `aria-controls`, etc.)
- `prefers-reduced-motion` support
- Accessible FAQ accordion (single-open, `aria-controls`/`aria-labelledby`)

## Performance

The original ember/fire particle canvas exists in `js/app.js` but is currently disabled (`EMBERS_ENABLED = false`) because it caused excessive CPU/GPU usage. It should not be described as an active feature until re-enabled and re-verified.

The pizza wheel uses a single master image (`FULL_PIZZA.webp`) rather than eight independently assembled hero slices.

## GSAP

GSAP is loaded from CDN (`gsap.min.js`, `InertiaPlugin.min.js`), not via npm/bundler.

Current usage:

- Pizza wheel rotation
- Flavour name/description text transitions
- Inertia-based wheel snapping on drag release (`InertiaPlugin`)
- Animated cart totals

The project does **not** currently use ScrollTrigger, Draggable, or ScrollSmoother.

## Run locally

```bash
npm start
```

This runs `tools/serve.mjs`, an internal Node static file server (no external dependencies).

## Validation

```bash
npm run check
```

This runs `tools/validate.mjs`, a custom script that checks document structure, stylesheets and JavaScript modules.

## SEO / metadata

Current technical SEO foundation in `index.html`:

- Page title
- Meta description
- Open Graph tags
- Twitter/X card metadata
- Favicon
- Web manifest (`site.webmanifest`)
- Robots metadata

The prototype currently sets `noindex, nofollow, noarchive` and is **not** intended for search indexing until production launch.

## Business configuration

Business-related values are centralized in `js/site-config.js`:

- `SOCIAL_LINKS` — Instagram, Facebook, Google, WhatsApp
- `DELIVERY_CONFIG` — base fee, standard radius, extra per-km fee, ETAs
- `calculateDeliveryFee()` — prototype distance-based fee calculation

Social links are currently `null` placeholders until verified real URLs are provided.

## Prototype / production limitations

Before production launch, this project still requires:

- Real business address
- Opening hours
- Phone number
- Verified social links
- Production domain / canonical URL
- Real payment provider
- Backend order API
- Authentication
- Live order management
- Geographic distance calculation for delivery fees
- Analytics / consent
- Legal / privacy content
- Production Restaurant / LocalBusiness structured data
