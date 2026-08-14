import { test, expect, devices } from '@playwright/test';

const BASE_URL = process.env.SMOKE_URL || 'http://127.0.0.1:3000';

test.describe('smoke: home page loads', () => {
  test('desktop', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'tests/screenshots/desktop.png', fullPage: true });

    console.log('DESKTOP_CONSOLE_ERRORS:', JSON.stringify(consoleErrors));
    await context.close();
  });

  test('iPhone SE', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone SE'] });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'tests/screenshots/iphone-se.png', fullPage: true });

    console.log('IPHONE_SE_CONSOLE_ERRORS:', JSON.stringify(consoleErrors));
    await context.close();
  });
});
