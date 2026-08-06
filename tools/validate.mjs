import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const errors = [];
const required = [
  '<!DOCTYPE html>',
  'name="viewport"',
  'name="description"',
  'id="main"',
  'id="checkoutForm"',
  'aria-live="polite"',
  '<title>Fedrizzi Pizza | Artisan Pizza &amp; Online Ordering</title>',
  'name="robots"',
  'property="og:title"',
  'property="og:url"',
  'name="twitter:card"',
  'href="assets/icons/favicon.svg"',
  'href="site.webmanifest"',
  'href="css/main.css"',
  'href="css/responsive.css"',
  'type="module" src="js/app.js"'
];

for (const marker of required) {
  if (!html.includes(marker)) errors.push(`Missing required marker: ${marker}`);
}

if (/<style>|<script>([\s\S]*?)<\/script>/.test(html)) {
  errors.push('Unexpected inline CSS or application JavaScript found in index.html.');
}

if (/href\s*=\s*["']#["']/i.test(html)) errors.push('Dead href="#" navigation remains in index.html.');
if (/href\s*=\s*["']\s*["']/i.test(html)) errors.push('Empty href navigation remains in index.html.');
if (/javascript\s*:\s*void\s*\(\s*0\s*\)/i.test(html)) errors.push('javascript:void(0) navigation remains in index.html.');

if ((html.match(/<h1\b/g) || []).length !== 1) errors.push('The document must contain exactly one H1.');
if (!/<img id="pizzaWheel"[^>]*src="assets\/images\/pizzas\/FULL_PIZZA\.webp"[^>]*alt=""[^>]*aria-hidden="true"/.test(html)) {
  errors.push('The master pizza image must remain decorative and use FULL_PIZZA.webp.');
}
if (/<svg id="pizzaSvg"|wedgeClip|class="slice"/.test(html)) {
  errors.push('Legacy multi-slice pizza rendering remains in index.html.');
}

const modules = ['app.js', 'pizza-wheel.js', 'cart.js', 'modal.js', 'checkout.js', 'site-config.js', 'information.js'];
for (const module of modules) {
  const moduleUrl = new URL(`../js/${module}`, import.meta.url);
  try { await readFile(moduleUrl, 'utf8'); }
  catch { errors.push(`Missing JavaScript module: js/${module}`); continue; }
  const result = spawnSync(process.execPath, ['--check', fileURLToPath(moduleUrl)], { encoding: 'utf8' });
  if (result.status !== 0) errors.push(`JavaScript syntax error in js/${module}: ${result.stderr.trim()}`);
}

for (const stylesheet of ['main.css', 'responsive.css']) {
  try { await readFile(new URL(`../css/${stylesheet}`, import.meta.url), 'utf8'); }
  catch { errors.push(`Missing stylesheet: css/${stylesheet}`); }
}

for (const asset of ['../assets/icons/favicon.svg', '../site.webmanifest', '../config/metadata.json']) {
  try { await readFile(new URL(asset, import.meta.url), 'utf8'); }
  catch { errors.push(`Missing SEO asset: ${asset.replace('../', '')}`); }
}

try { JSON.parse(await readFile(new URL('../site.webmanifest', import.meta.url), 'utf8')); }
catch { errors.push('site.webmanifest is not valid JSON.'); }

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Validation passed: document structure, stylesheets and JavaScript modules are valid.');
