import Link from 'next/link';
import LegalPage, { legalDetails } from '@/components/LegalPage';

export const metadata = { title: 'Privacy policy | TrackIt' };

// Describes what this codebase actually stores and sends. Review with your adviser
// before launch and whenever data handling changes (see docs/RUNBOOK.md).
export default function PrivacyPage() {
  const { operator, contactEmail, lastUpdated } = legalDetails();
  return (
    <LegalPage title="Privacy policy" lastUpdated={lastUpdated}>
      <p>
        TrackIt is operated by {operator}. This policy explains what information TrackIt stores, why, who it is shared with, and the choices you have.
        Questions: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address, account type (customer or store administrator), store name for administrators, and
          your password in hashed form (we never store or see the password itself).
        </li>
        <li>
          <strong>Store data</strong> (administrators): products, prices, stock levels, barcodes and expiry dates.
        </li>
        <li>
          <strong>Purchase records:</strong> when a store records a sale to you, the items, quantities, prices, expiry dates, total, payment method and date.
        </li>
        <li>
          <strong>Settings:</strong> alert preferences and budgets you choose.
        </li>
        <li>
          <strong>Messages</strong> you send through the contact form.
        </li>
        <li>
          <strong>Technical data:</strong> server logs with your IP address, request times and errors, used to keep the service secure (for example, to
          limit repeated sign-in attempts) and to fix problems.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To provide the service: sign-in, inventory, recording sales, purchase history, analytics and expiry reminders.</li>
        <li>To send service emails: account confirmation, password reset, expiry and low-stock alerts. You can turn alerts off in your settings.</li>
        <li>To protect accounts and the service from abuse.</li>
      </ul>
      <p>We do not sell your information and we do not use it for advertising.</p>

      <h2>Who we share it with</h2>
      <ul>
        <li>
          <strong>The store you buy from</strong> sees the purchases it recorded for you. Stores cannot see your purchases at other stores.
        </li>
        <li>
          <strong>Service providers</strong> who run parts of TrackIt for us: application hosting, the database host, our email delivery provider and, if
          enabled, an error-monitoring service. They process data only to provide their service to us.
        </li>
        <li>
          <strong>Chat assistant:</strong> the help chat on our pages is provided by a third party (Jotform). Anything you type there is handled by that
          provider under its own privacy policy.
        </li>
        <li>Authorities, when the law requires it.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        TrackIt uses only the cookies needed to keep you signed in and protect forms from forgery. We do not use analytics or advertising cookies. The
        third-party chat assistant may set its own cookies.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Account details and settings: until you delete your account.</li>
        <li>
          Purchase records: kept as the store&apos;s sales records. If you delete your account, they are no longer linked to your name or email.
        </li>
        <li>Password-reset and confirmation links expire within 48 hours and are then deleted.</li>
        <li>Server logs: kept for the retention period of our hosting provider.</li>
      </ul>

      <h2>Your choices and rights</h2>
      <ul>
        <li>
          <strong>Download your data</strong> at any time from your <Link href="/account">Account page</Link>.
        </li>
        <li>
          <strong>Delete your account</strong> from the same page. Store administrators deleting an account also remove their products.
        </li>
        <li>
          <strong>Correct your details</strong> or ask any privacy question by emailing <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </li>
      </ul>

      <h2>Security</h2>
      <p>
        Data is sent over encrypted connections. Passwords are hashed, sign-in attempts are rate-limited, each store can only access its own data, and
        reset links work once. No system is perfectly secure; if we learn of a breach affecting you, we will tell you.
      </p>

      <h2>Children</h2>
      <p>TrackIt is not intended for children under 18.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date above and, for significant changes, tell you by email or in the app.</p>
    </LegalPage>
  );
}
