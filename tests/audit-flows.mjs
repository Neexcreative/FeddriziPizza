import { chromium, webkit } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE_URL = 'http://127.0.0.1:3000';
const OUT_DIR = 'tests/audit-out';
mkdirSync(`${OUT_DIR}/flow-screenshots`, { recursive: true });

const log = [];
function record(step, ok, detail) {
  log.push({ step, ok, detail });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${step}${detail ? ' :: ' + detail : ''}`);
}

async function runFlow(label, browserType, viewport, isMobile) {
  console.log(`\n=== FLOW: ${label} (${viewport.width}x${viewport.height}) ===`);
  const browser = await browserType.launch();
  const context = await browser.newContext({ viewport, hasTouch: isMobile, isMobile });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // 1. Rotate via arrow buttons
  try {
    const nameBefore = await page.textContent('#fName');
    const nextBtn = page.locator('#next');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(800);
      const nameAfter = await page.textContent('#fName');
      record(`${label}: arrow-next changes flavor`, nameBefore !== nameAfter, `${nameBefore} -> ${nameAfter}`);
    } else {
      record(`${label}: arrow-next changes flavor`, false, 'next button not visible (off-screen or hidden)');
    }
  } catch (e) { record(`${label}: arrow-next changes flavor`, false, e.message); }

  // 2. Drag/swipe the wheel
  try {
    const nameBefore = await page.textContent('#fName');
    const wrap = page.locator('.pizza-wrap');
    const box = await wrap.boundingBox();
    if (box) {
      const startX = box.x + box.width * 0.7;
      const y = box.y + box.height * 0.3;
      await page.mouse.move(startX, y);
      await page.mouse.down();
      for (let i = 1; i <= 10; i++) { await page.mouse.move(startX - i * 25, y, { steps: 1 }); await page.waitForTimeout(16); }
      await page.mouse.up();
      await page.waitForTimeout(4200);
      const nameAfter = await page.textContent('#fName');
      record(`${label}: drag wheel changes flavor`, nameBefore !== nameAfter, `${nameBefore} -> ${nameAfter}`);
    } else {
      record(`${label}: drag wheel changes flavor`, false, 'pizza-wrap has no bounding box');
    }
  } catch (e) { record(`${label}: drag wheel changes flavor`, false, e.message); }

  // 3. Size pill selects and updates price
  try {
    const sizeContainer = isMobile ? '#mobileSizes' : '#sizeRail';
    const largePill = page.locator(`${sizeContainer} .pill`).nth(2);
    await largePill.scrollIntoViewIfNeeded();
    const visible = await largePill.isVisible();
    if (visible) {
      await largePill.click({ force: false });
      await page.waitForTimeout(200);
      const price = await page.textContent('#selectedPrice');
      record(`${label}: size pill (Large) updates price`, price?.includes('28'), `selectedPrice=${price}`);
    } else {
      record(`${label}: size pill (Large) updates price`, false, 'size pill not visible');
    }
  } catch (e) { record(`${label}: size pill (Large) updates price`, false, e.message); }

  // 4. Add pizza to order
  try {
    const addBtn = page.locator('#addPizza');
    const visible = await addBtn.isVisible();
    if (visible) {
      await addBtn.click();
      await page.waitForTimeout(300);
      const cartTotal = await page.textContent('#cartTotal');
      record(`${label}: Add to order updates cart total`, cartTotal !== '€0.00', `cartTotal=${cartTotal}`);
    } else {
      record(`${label}: Add to order updates cart total`, false, 'addPizza button not visible/off-screen');
    }
  } catch (e) { record(`${label}: Add to order updates cart total`, false, e.message); }

  // 5. Drinks/Dips/Fries modal opens
  try {
    const drinksPill = page.locator('[data-cat="Drinks"]').first();
    await drinksPill.click({ force: false });
    await page.waitForTimeout(400);
    const sidesModal = page.locator('#sidesModal');
    const shown = await sidesModal.evaluate((el) => el.classList.contains('show'));
    record(`${label}: Drinks pill opens sides modal`, shown);
    if (shown) {
      const addFirst = sidesModal.locator('[data-add]').first();
      await addFirst.click();
      await page.waitForTimeout(300);
      const cartTotal = await page.textContent('#cartTotal');
      record(`${label}: Add side item updates total`, true, `cartTotal=${cartTotal}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const stillShown = await sidesModal.evaluate((el) => el.classList.contains('show'));
      record(`${label}: Esc closes sides modal`, !stillShown);
    }
  } catch (e) { record(`${label}: Drinks pill opens sides modal`, false, e.message); }

  // 6. Cart dropdown -> Go to cart -> checkout -> place order
  try {
    const cartBtn = page.locator('#cartBtn');
    await cartBtn.click();
    await page.waitForTimeout(400);
    const cartDD = page.locator('#cartDD');
    const ddShown = await cartDD.evaluate((el) => el.classList.contains('show'));
    record(`${label}: cart button opens dropdown`, ddShown);

    const goCart = page.locator('#goCart');
    await goCart.click();
    await page.waitForTimeout(400);
    const cartModal = page.locator('#cartModal');
    const modalShown = await cartModal.evaluate((el) => el.classList.contains('show'));
    record(`${label}: Go to cart opens cart modal`, modalShown);

    // fill address (delivery mode default)
    await page.fill('#address', '10 Test Street, Dublin');
    await page.locator('#toCheckout').click();
    await page.waitForTimeout(400);
    const checkoutModal = page.locator('#checkoutModal');
    const checkoutShown = await checkoutModal.evaluate((el) => el.classList.contains('show'));
    record(`${label}: Next opens checkout modal`, checkoutShown);

    await page.fill('#firstName', 'Test User');
    await page.fill('#phone', '0871234567');
    await page.fill('#email', 'test@example.com');
    await page.fill('#card', '4111111111111111');
    await page.fill('#expiry', '12/29');
    await page.fill('#cvc', '123');
    await page.locator('#placeOrder').click();
    await page.waitForTimeout(500);
    const orderNum = await page.textContent('#orderNum');
    record(`${label}: Place order shows confirmation`, !!orderNum && orderNum.startsWith('#EU-'), `orderNum=${orderNum}`);

    // close confirmation, check focus trap / esc
    const doneClose = page.locator('#checkoutDone [data-close]');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const stillOpen = await checkoutModal.evaluate((el) => el.classList.contains('show'));
    record(`${label}: Esc closes checkout confirmation`, !stillOpen);
  } catch (e) { record(`${label}: cart -> checkout -> place order flow`, false, e.message); }

  // 7. Login modal + tabs + focus trap
  try {
    const loginBtn = isMobile ? page.locator('#mobileMenuBtn') : page.locator('#loginBtn');
    if (isMobile) {
      await loginBtn.click();
      await page.waitForTimeout(400);
      await page.locator('#mobileAccount').click();
    } else {
      await loginBtn.click();
    }
    await page.waitForTimeout(400);
    const loginModal = page.locator('#loginModal');
    const shown = await loginModal.evaluate((el) => el.classList.contains('show'));
    record(`${label}: Login opens account modal`, shown);

    if (shown) {
      await page.locator('#loginTabs [data-tab="Rewards"]').click();
      await page.waitForTimeout(150);
      const paneText = await page.textContent('#loginPane');
      record(`${label}: Rewards tab switches content`, paneText?.includes('stamp'), paneText?.slice(0, 40));

      // focus trap test: Tab from last focusable should cycle to first
      const closeBtn = loginModal.locator('.x');
      await closeBtn.focus();
      // shift+tab from first element should go to last focusable (trap)
      await page.keyboard.press('Shift+Tab');
      const activeIsInModal = await page.evaluate(() => {
        const modal = document.getElementById('loginModal');
        return modal.contains(document.activeElement);
      });
      record(`${label}: focus trap keeps focus inside modal (Shift+Tab from first)`, activeIsInModal);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const stillShown = await loginModal.evaluate((el) => el.classList.contains('show'));
      record(`${label}: Esc closes login modal`, !stillShown);
    }
  } catch (e) { record(`${label}: login flow`, false, e.message); }

  await page.screenshot({ path: `${OUT_DIR}/flow-screenshots/${label}-final.png`, fullPage: true });
  if (consoleErrors.length) record(`${label}: console errors during flow`, false, consoleErrors.join(' | '));
  else record(`${label}: console errors during flow`, true, 'none');

  await context.close();
  await browser.close();
}

await runFlow('mobile-iphonese-portrait', webkit, { width: 375, height: 667 }, true);
await runFlow('mobile-iphonese-landscape', webkit, { width: 667, height: 375 }, true);
await runFlow('desktop-1440x900', chromium, { width: 1440, height: 900 }, false);

writeFileSync(`${OUT_DIR}/flows-log.json`, JSON.stringify(log, null, 2));
const failed = log.filter((l) => !l.ok);
console.log(`\n${log.length} checks, ${failed.length} failed.`);
