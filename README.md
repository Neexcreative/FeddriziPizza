# Forno — Artisan Pizza

An immersive, responsive pizza-ordering prototype built with semantic HTML, CSS, SVG and vanilla JavaScript.

## Run locally

Open `index.html` directly or run a local static server:

```bash
npm start
```

## Quality check

```bash
npm run check
```

## Current capabilities

- Rotating and swipeable pizza selector
- Explicit size selection and add-to-order action
- Persistent cart with quantity controls
- Delivery and collection flows
- Validated demo checkout
- Keyboard-accessible modal focus management
- Responsive layouts and reduced-motion support

## Replacing the temporary pizza images

Pizza images are loaded from `assets/images/pizzas/`. When final photography is available, export transparent WebP files using the filenames defined in the `IMG` map in `index.html`. Keep the subject centred and use matching lighting and camera angle across all pizzas.

## Production integration

The checkout and account screens are intentionally demonstrations. A production release still requires a server-side order API, payment provider, authentication, menu management, analytics consent and real business links/details.
