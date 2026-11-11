import { test, expect } from '@playwright/test';
import { PASSWORD, emailLink, login, logout, uniqueEmail } from './helpers.mjs';

const NEW_PASSWORD = 'Brand1NewPass';

test('customer signs up, confirms email, resets password and deletes the account', async ({ page }) => {
  const email = uniqueEmail('cust');

  // Sign up through the real form
  await page.goto('/customersignup');
  await page.getByLabel('Full Name').fill('Asha Customer');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByLabel('Confirm Password').fill(PASSWORD);
  await expect(page.getByRole('link', { name: 'Privacy policy' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL(/\/login\?registered=1/);
  await expect(page.getByText('We sent a confirmation link')).toBeVisible();

  // Confirm the email from the "sent" message
  await page.goto(await emailLink(email, /Confirm your email/));
  await expect(page.getByText('Your email is confirmed')).toBeVisible();
  await expect(page).toHaveURL(/\/verify-email$/); // token stripped from the address bar

  // Sign in lands on the customer dashboard
  await login(page, email);
  await expect(page).toHaveURL(/\/customer\/dashboard/);
  await expect(page.getByRole('button', { name: 'Purchase History' })).toBeVisible();

  // Forgot password -> email link -> new password
  await logout(page);
  await page.goto('/login');
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByText(/a reset link is on its way/)).toBeVisible();

  await page.goto(await emailLink(email, /Reset your TrackIt password/));
  await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel('Confirm new password').fill(NEW_PASSWORD);
  await page.getByRole('button', { name: 'Set new password' }).click();
  await expect(page).toHaveURL(/\/login\?reset=1/);

  // Old password no longer works, new one does
  await login(page, email, PASSWORD);
  await expect(page.getByText('Invalid email or password.')).toBeVisible();
  await login(page, email, NEW_PASSWORD);
  await expect(page).toHaveURL(/\/customer\/dashboard/);

  // Account page: email confirmed, data export downloads valid JSON
  await page.goto('/account');
  await expect(page.getByText('Email confirmed')).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download my data' }).click()]);
  const exported = JSON.parse(await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString('utf8')));
  expect(exported.account.email).toBe(email);
  expect(exported.purchases).toEqual([]);

  // Delete the account
  await page.getByRole('button', { name: 'Delete my account' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Your password').fill(NEW_PASSWORD);
  await dialog.getByLabel('Type DELETE to confirm').fill('DELETE');
  await dialog.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page).toHaveURL(/\/login\?deleted=1/);
  await expect(page.getByText('Your account has been deleted.')).toBeVisible();

  await login(page, email, NEW_PASSWORD);
  await expect(page.getByText('Invalid email or password.')).toBeVisible();
});

test('protected pages redirect anonymous visitors to sign in', async ({ page }) => {
  for (const path of ['/admin/dashboard', '/customer/dashboard', '/account']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  }
});
