import { readFile, writeFile } from 'node:fs/promises';
import { readPizzeriaConfig } from './lib/config.mjs';
import { deriveBrandTokens } from './lib/colors.mjs';

const root = new URL('../', import.meta.url);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function buildStructuredData(config) {
  const { brand, contact } = config;
  if (!contact.phone && !contact.email && !contact.address) return '';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: brand.name,
    servesCuisine: 'Pizza',
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.address ? { address: { '@type': 'PostalAddress', streetAddress: contact.address } } : {}),
    ...(contact.openingHours ? { openingHours: contact.openingHours } : {}),
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

async function buildHtml(config) {
  const template = await readFile(new URL('index.template.html', root), 'utf8');

  const title = `${config.brand.name} | Artisan Pizza & Online Ordering`;
  const description = `${config.brand.tagline} Choose your favourite and build your order at ${config.brand.name}.`;
  const firstFlavor = config.flavors[config.seo.ogImageFlavorIndex ?? 0] ?? config.flavors[0];
  const ogImage = `assets/images/pizzas/${firstFlavor.image}`;
  const canonicalUrl = config.seo.canonicalUrl ?? '';

  const replacements = {
    TITLE: escapeHtml(title),
    META_DESCRIPTION: escapeHtml(description),
    ROBOTS: escapeHtml(config.seo.robots),
    BRAND_NAME: escapeHtml(config.brand.name),
    OG_IMAGE: escapeHtml(ogImage),
    OG_IMAGE_ALT: escapeHtml(`${firstFlavor.name} pizza from ${config.brand.name}`),
    CANONICAL_URL: escapeHtml(canonicalUrl),
    CANONICAL_LINK: canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">` : '',
    STRUCTURED_DATA: buildStructuredData(config),
  };

  let html = template;
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  html = `<!-- GERADO AUTOMATICAMENTE por "npm run build" a partir de index.template.html + config/pizzeria.json. Nao edite este arquivo direto: suas mudancas serao substituidas no proximo build. -->\n${html}`;

  await writeFile(new URL('index.html', root), html, 'utf8');
  return { title, description };
}

async function buildTokensCss(config) {
  const brand = deriveBrandTokens(config.brand.color);

  const css = `/* GERADO AUTOMATICAMENTE por "npm run build" a partir de config/pizzeria.json (campo brand.color).
   Nao edite este arquivo direto: suas mudancas serao substituidas no proximo build.
   Para mudar as cores da marca, edite config/pizzeria.json e rode "npm run build" de novo. */
:root{
  /* neutros do tema escuro (fixos, nao dependem da marca) */
  --bg:      #1e1e1e;
  --bg-2:    #161514;
  --panel:   oklch(0.22 0.012 55);
  --panel-2: oklch(0.18 0.012 55);
  --border:  oklch(0.42 0.02 55 / .45);
  --text:    oklch(0.96 0.008 85);
  --muted:   oklch(0.66 0.02 60);

  /* vermelho de erro em formularios (fixo, independente da marca) */
  --error:      oklch(0.67 0.20 25);
  --error-text: oklch(0.76 0.15 28);

  /* cor da marca (derivada de config.brand.color = "${config.brand.color}") */
  --accent:        ${brand.accent};
  --accent-hi:     ${brand.accentHi};
  --ember:         ${brand.ember};
  --cta-grad-from: ${brand.ctaGradFrom};
  --cta-grad-to:   ${brand.ctaGradTo};
}
`;

  await writeFile(new URL('css/tokens.css', root), css, 'utf8');
}

async function buildSiteConfigJs(config) {
  const js = `// GERADO AUTOMATICAMENTE por "npm run build" a partir de config/pizzeria.json.
// Nao edite este arquivo direto: suas mudancas serao substituidas no proximo build.
// Para mudar sabores, tamanhos, entrega ou redes sociais, edite config/pizzeria.json.

export const FLAVORS = ${JSON.stringify(
    config.flavors.map((f) => ({ name: f.name, ing: f.ingredients, tags: f.tags })),
    null,
    2
  )};

export const SIZES = ${JSON.stringify(
    config.sizes.map((s) => ({ k: s.key, slices: s.slices, price: s.price })),
    null,
    2
  )};

export const SOCIAL_LINKS = Object.freeze(${JSON.stringify(config.social, null, 2)});

export const DELIVERY_CONFIG = Object.freeze(${JSON.stringify(config.delivery, null, 2)});

export function calculateDeliveryFee(distanceKm) {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance) || distance < 0) throw new RangeError('Distance must be a non-negative number.');
  const extraDistance = Math.max(0, distance - DELIVERY_CONFIG.standardRadiusKm);
  return Math.round((DELIVERY_CONFIG.baseFee + extraDistance * DELIVERY_CONFIG.extraFeePerKm) * 100) / 100;
}
`;

  await writeFile(new URL('js/site-config.js', root), js, 'utf8');
}

async function main() {
  const config = await readPizzeriaConfig();
  await buildTokensCss(config);
  await buildSiteConfigJs(config);
  const { title } = await buildHtml(config);
  console.log(`Build ok: "${title}"`);
  console.log('  -> index.html');
  console.log('  -> css/tokens.css');
  console.log('  -> js/site-config.js');
}

main().catch((error) => {
  console.error('Build failed:', error.message);
  process.exit(1);
});
