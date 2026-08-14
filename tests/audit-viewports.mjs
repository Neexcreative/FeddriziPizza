import { chromium, webkit } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE_URL = 'http://127.0.0.1:3000';
const OUT_DIR = 'tests/audit-out';
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(`${OUT_DIR}/screenshots`, { recursive: true });

const viewports = [
  { name: 'iphone-se-portrait', width: 375, height: 667, engine: 'webkit', mobile: true },
  { name: 'iphone-se-landscape', width: 667, height: 375, engine: 'webkit', mobile: true },
  { name: 'iphone15pro-portrait', width: 393, height: 852, engine: 'webkit', mobile: true },
  { name: 'iphone15pro-landscape', width: 852, height: 393, engine: 'webkit', mobile: true },
  { name: 'pixel7-portrait', width: 412, height: 915, engine: 'chromium', mobile: true },
  { name: 'pixel7-landscape', width: 915, height: 412, engine: 'chromium', mobile: true },
  { name: 'ipad-mini-portrait', width: 768, height: 1024, engine: 'webkit', mobile: true },
  { name: 'ipad-mini-landscape', width: 1024, height: 768, engine: 'webkit', mobile: true },
  { name: 'ipad-pro-portrait', width: 1024, height: 1366, engine: 'webkit', mobile: true },
  { name: 'ipad-pro-landscape', width: 1366, height: 1024, engine: 'webkit', mobile: true },
  { name: 'desktop-1280x800', width: 1280, height: 800, engine: 'chromium', mobile: false },
  { name: 'desktop-1440x900', width: 1440, height: 900, engine: 'chromium', mobile: false },
  { name: 'desktop-1920x1080', width: 1920, height: 1080, engine: 'chromium', mobile: false },
];

const browsers = {};
async function getBrowser(engine) {
  if (!browsers[engine]) {
    browsers[engine] = engine === 'webkit' ? await webkit.launch() : await chromium.launch();
  }
  return browsers[engine];
}

const results = [];

for (const vp of viewports) {
  const browser = await getBrowser(vp.engine);
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    hasTouch: vp.mobile,
    isMobile: vp.mobile,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const overflowingEls = [];
    if (docWidth > winWidth + 2) {
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > winWidth + 2 || r.left < -2) {
          overflowingEls.push({ tag: el.tagName, id: el.id, cls: (el.className || '').toString().slice(0, 60), right: Math.round(r.right), left: Math.round(r.left) });
        }
      });
    }
    return { docWidth, winWidth, hasHorizontalOverflow: docWidth > winWidth + 2, overflowingEls: overflowingEls.slice(0, 15) };
  });

  // basic overlap check: order-cta vs arrows vs mobile categories vs pizza hint (mobile zone)
  const overlapCheck = await page.evaluate(() => {
    const ids = ['addPizza', 'prev', 'next', 'fName', 'fDesc'];
    const rects = {};
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const r = el.getBoundingClientRect();
        rects[id] = { top: Math.round(r.top), left: Math.round(r.left), right: Math.round(r.right), bottom: Math.round(r.bottom), visible: r.width > 0 && r.height > 0 };
      }
    });
    function intersects(a, b) {
      return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
    }
    const overlaps = [];
    if (rects.addPizza && rects.prev && rects.addPizza.visible && rects.prev.visible && intersects(rects.addPizza, rects.prev)) overlaps.push('addPizza/prev');
    if (rects.addPizza && rects.next && rects.addPizza.visible && rects.next.visible && intersects(rects.addPizza, rects.next)) overlaps.push('addPizza/next');
    return { rects, overlaps };
  });

  await page.screenshot({ path: `${OUT_DIR}/screenshots/${vp.name}.png`, fullPage: true });

  let axeViolations = [];
  try {
    const axeResults = await new AxeBuilder({ page }).analyze();
    axeViolations = axeResults.violations.map((v) => ({
      id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length,
      targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
    }));
  } catch (e) {
    axeViolations = [{ id: 'axe-error', impact: 'n/a', help: e.message, nodes: 0, targets: [] }];
  }

  results.push({
    viewport: vp.name, width: vp.width, height: vp.height, engine: vp.engine,
    consoleErrors, pageErrors, overflow, overlapCheck, axeViolations,
  });

  console.log(`[${vp.name}] overflow=${overflow.hasHorizontalOverflow} consoleErrors=${consoleErrors.length} pageErrors=${pageErrors.length} axeViolations=${axeViolations.length} overlaps=${overlapCheck.overlaps.length}`);

  await context.close();
}

for (const engine of Object.keys(browsers)) await browsers[engine].close();

writeFileSync(`${OUT_DIR}/results.json`, JSON.stringify(results, null, 2));
console.log('\nDone. Results written to tests/audit-out/results.json');
