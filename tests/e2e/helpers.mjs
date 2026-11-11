import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const LOG_FILE = process.env.E2E_SERVER_LOG || 'test-results/e2e-server.log';
export const PASSWORD = 'Passw0rdE2e';

let seq = 0;
export const uniqueEmail = (prefix) => `${prefix}.${Date.now().toString(36)}${(seq += 1)}@e2e.test`;

/** Emails "sent" by the console notifier, newest last. */
function outbox() {
  return readFileSync(LOG_FILE, 'utf8')
    .split('\n')
    .filter((l) => l.startsWith('{'))
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter((e) => e?.msg === 'notification (console)');
}

/** Waits for an email to `to` whose subject matches, and returns the first link in it. */
export async function emailLink(to, subjectPattern) {
  let link = null;
  await expect
    .poll(
      () => {
        const mail = outbox()
          .filter((m) => m.to === to && subjectPattern.test(m.subject))
          .at(-1);
        link = mail?.body?.match(/https?:\/\/\S+/)?.[0] ?? null;
        return link;
      },
      { timeout: 20_000, message: `email to ${to} matching ${subjectPattern}` }
    )
    .not.toBeNull();
  return link;
}

/** Registers through the API (fast setup for tests that are not about sign-up). */
export async function registerViaApi(request, { role, fullName, email, shopName }) {
  const res = await request.post('/api/register', {
    data: { fullName, email, password: PASSWORD, confirmPassword: PASSWORD, role, ...(shopName ? { shopName } : {}) },
  });
  expect(res.status(), await res.text()).toBe(201);
}

export async function login(page, email, password = PASSWORD) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

export async function logout(page) {
  await page.context().clearCookies();
}

// WCAG 2.1 A/AA automated checks. Serious and critical violations fail the build;
// moderate/minor ones are attached to the report for follow-up.
const BLOCKING = new Set(['serious', 'critical']);

export async function audit(page, testInfo, label) {
  // Let entrance animations (framer-motion) settle so contrast is measured on final colours.
  await page.waitForTimeout(800);
  if (process.env.E2E_SCREENSHOTS) await page.screenshot({ path: `test-results/screens/${label}.png`, fullPage: true });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Third-party Jotform chat widget: not our markup (its voice button has no accessible name; reported to the owner).
    .exclude('#form-agent-helper')
    .exclude('iframe[src*="jotform"]')
    .analyze();
  const summary = results.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(' ')) }));
  await testInfo.attach(`axe-${label}.json`, { body: JSON.stringify(summary, null, 2), contentType: 'application/json' });
  const blocking = summary.filter((v) => BLOCKING.has(v.impact));
  expect(blocking, `${label}: ${JSON.stringify(blocking, null, 2)}`).toEqual([]);
}

