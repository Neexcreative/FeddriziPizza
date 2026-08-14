import { chromium, webkit } from '@playwright/test';
import { mkdirSync } from 'node:fs';

mkdirSync('tests/audit-out', { recursive: true });

const targets = [
  { name: 'iphone-se-landscape', width: 667, height: 375, engine: 'webkit' },
  { name: 'iphone15pro-landscape', width: 852, height: 393, engine: 'webkit' },
  { name: 'pixel7-landscape', width: 915, height: 412, engine: 'chromium' },
];

for (const t of targets) {
  const browserType = t.engine === 'webkit' ? webkit : chromium;
  const browser = await browserType.launch();
  const context = await browser.newContext({ viewport: { width: t.width, height: t.height }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const rects = await page.evaluate(() => {
    const ids = ['next', 'prev', 'addPizza'];
    const out = {};
    ids.forEach((id) => {
      const el = document.getElementById(id);
      const r = el.getBoundingClientRect();
      out[id] = { top: Math.round(r.top), left: Math.round(r.left), right: Math.round(r.right), bottom: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) };
    });
    return { viewportH: window.innerHeight, viewportW: window.innerWidth, docScrollH: document.documentElement.scrollHeight, rects: out };
  });
  console.log(`\n=== ${t.name} (${t.width}x${t.height}) ===`);
  console.log(JSON.stringify(rects, null, 1));

  function inBounds(r) {
    return r.top >= 0 && r.left >= 0 && r.bottom <= rects.viewportH && r.right <= rects.viewportW;
  }
  const nextOk = inBounds(rects.rects.next);
  const prevOk = inBounds(rects.rects.prev);
  const addOk = inBounds(rects.rects.addPizza);
  console.log('next in-bounds:', nextOk, '| prev in-bounds:', prevOk, '| addPizza in-bounds:', addOk);

  // actually click them to prove clickability
  let clickOk = { next: false, add: false };
  try {
    const nameBefore = await page.textContent('#fName');
    await page.locator('#next').click({ timeout: 5000 });
    await page.waitForTimeout(700);
    const nameAfter = await page.textContent('#fName');
    clickOk.next = nameBefore !== nameAfter;
    console.log('CLICK #next changed flavor:', clickOk.next, nameBefore, '->', nameAfter);
  } catch (e) { console.log('CLICK #next FAILED:', e.message.split('\n')[0]); }

  try {
    const cartBefore = await page.textContent('#cartTotal');
    await page.locator('#addPizza').click({ timeout: 5000 });
    await page.waitForTimeout(400);
    const cartAfter = await page.textContent('#cartTotal');
    clickOk.add = cartBefore !== cartAfter;
    console.log('CLICK #addPizza changed cart total:', clickOk.add, cartBefore, '->', cartAfter);
  } catch (e) { console.log('CLICK #addPizza FAILED:', e.message.split('\n')[0]); }

  console.log('consoleErrors:', consoleErrors);
  await page.screenshot({ path: `tests/audit-out/screenshots/${t.name}-fixed.png`, fullPage: true });
  await context.close();
  await browser.close();
}
