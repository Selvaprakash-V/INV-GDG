import { test, expect } from '@playwright/test';
import { audit, login, registerViaApi, uniqueEmail } from './helpers.mjs';

const PUBLIC_PAGES = ['/home', '/about', '/contact', '/role', '/login', '/customersignup', '/administratorsignup', '/forgot-password', '/privacy', '/terms'];

for (const path of PUBLIC_PAGES) {
  test(`a11y ${path}`, async ({ page }, testInfo) => {
    await page.goto(path);
    await audit(page, testInfo, path.slice(1));
  });
}

test('a11y signed-in pages (admin, customer, account)', async ({ page, request }, testInfo) => {
  const admin = uniqueEmail('a11yadmin');
  const customer = uniqueEmail('a11ycust');
  await registerViaApi(request, { role: 'Administrator', fullName: 'A11y Admin', email: admin, shopName: 'A11y Shop' });
  await registerViaApi(request, { role: 'Customer', fullName: 'A11y Customer', email: customer });

  await login(page, admin);
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await audit(page, testInfo, 'admin-dashboard');
  await page.goto('/admin/add-product');
  await audit(page, testInfo, 'add-product');
  await page.goto('/admin/record-sale');
  await audit(page, testInfo, 'record-sale');
  await page.goto('/account');
  await audit(page, testInfo, 'account');

  await page.context().clearCookies();
  await login(page, customer);
  await expect(page).toHaveURL(/\/customer\/dashboard/);
  await audit(page, testInfo, 'customer-dashboard');
});
