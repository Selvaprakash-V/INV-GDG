import { test, expect } from '@playwright/test';
import { PASSWORD, audit, login, logout, registerViaApi, uniqueEmail } from './helpers.mjs';

test('store admin adds a product, sells it, and the customer sees the purchase', async ({ page, request }, testInfo) => {
  const adminEmail = uniqueEmail('admin');
  const customerEmail = uniqueEmail('buyer');
  const product = `E2E Milk ${Date.now().toString(36)}`;

  // Admin signs up through the real form
  await page.goto('/administratorsignup');
  await page.getByLabel('Shop Name').fill('E2E Mart');
  await page.getByLabel('Full Name').fill('Ravi Admin');
  await page.getByLabel('Email').fill(adminEmail);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByLabel('Confirm Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL(/\/login\?registered=1/);
  await registerViaApi(request, { role: 'Customer', fullName: 'Meena Buyer', email: customerEmail });

  await login(page, adminEmail);
  await expect(page).toHaveURL(/\/admin\/dashboard/);

  // Add a product through the form (including the calendar date picker)
  await page.goto('/admin/add-product');
  await page.getByLabel('Product Name').fill(product);
  await page.getByLabel('Category').click();
  await page.getByRole('option', { name: 'Dairy' }).click();
  await page.getByLabel('Price').fill('45');
  await page.getByLabel('Stock Quantity').fill('12');
  await page.locator('#expiryDate').click();
  await page.getByRole('button', { name: /next month/i }).click();
  await page.getByRole('grid').getByRole('button', { name: /15/ }).first().click();
  await page.getByLabel('Barcode').fill(`E2E-${Date.now()}`);
  await page.getByRole('button', { name: /add product/i }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByText(product).first()).toBeVisible();

  // Record a sale of 2 units
  await page.goto('/admin/record-sale');
  await page.getByLabel('Customer email').fill(customerEmail);
  await page.getByLabel('Add products').fill(product);
  await page.getByRole('button', { name: `Add ${product} to sale` }).click();
  const qty = page.getByRole('spinbutton').first();
  await qty.fill('2');
  await page.getByRole('button', { name: 'Record sale' }).click();
  await expect(page.getByText('Sale recorded')).toBeVisible();
  await audit(page, testInfo, 'sale-receipt');
  await page.goto('/admin/dashboard');
  await expect(page.getByText(product).first()).toBeVisible();
  await audit(page, testInfo, 'admin-dashboard-with-data');

  // An expired product is refused by the server even when the UI is bypassed
  const expired = await page.request.post('/api/products', {
    data: { name: 'Old Curd', category: 'Dairy', price: 10, stock: 5, expiryDate: new Date(Date.now() - 86_400_000).toISOString(), barcode: `OLD-${Date.now()}` },
  });
  expect(expired.status()).toBe(201);
  const { product: old } = await expired.json();
  const sale = await page.request.post('/api/purchases', { data: { customerEmail, items: [{ productId: old.id, quantity: 1 }] } });
  expect(sale.status()).toBe(409);
  expect((await sale.json()).code).toBe('PRODUCT_EXPIRED');

  // The customer sees the purchase
  await logout(page);
  await login(page, customerEmail);
  await expect(page).toHaveURL(/\/customer\/dashboard/);
  await page.getByRole('button', { name: 'Purchase History' }).click();
  await expect(page.getByText(product).first()).toBeVisible();
  await expect(page.getByText('E2E Mart').first()).toBeVisible();
  await audit(page, testInfo, 'customer-history-with-data');
});
