import Link from 'next/link';
import LegalPage, { legalDetails } from '@/components/LegalPage';

export const metadata = { title: 'Terms of use | TrackIt' };

// Plain-language pilot terms. Review with your adviser before launch (see docs/RUNBOOK.md).
export default function TermsPage() {
  const { operator, contactEmail, lastUpdated } = legalDetails();
  return (
    <LegalPage title="Terms of use" lastUpdated={lastUpdated}>
      <p>
        These terms apply when you use TrackIt, operated by {operator}. By creating an account you agree to them. If you do not agree, please do not use
        TrackIt.
      </p>

      <h2>Pilot service</h2>
      <p>
        TrackIt is currently offered as a pilot. Features may change, and the service may occasionally be unavailable while we improve it. We will try to
        give notice of significant changes.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give accurate details and keep your password secret. You are responsible for activity on your account.</li>
        <li>Tell us promptly at {contactEmail} if you think someone else has accessed your account.</li>
        <li>You must be 18 or older to create an account.</li>
      </ul>

      <h2>Store administrators</h2>
      <ul>
        <li>You are responsible for the accuracy of your products, prices, stock and expiry dates, and for the sales you record.</li>
        <li>
          Expiry alerts, forecasts and recommendations are aids, not guarantees. Always check products yourself before sale; TrackIt blocks recording
          sales of items past their entered expiry date, but cannot know about items entered incorrectly.
        </li>
        <li>Only record sales to customers who have agreed to have their purchases linked to their TrackIt account.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>Do not misuse TrackIt: no attempts to access other accounts or stores, overload or disrupt the service, or use it for anything unlawful.</p>

      <h2>Your data</h2>
      <p>
        You own the data you put into TrackIt. We use it only to provide the service, as described in our <Link href="/privacy">privacy policy</Link>. You
        can download it or delete your account at any time from your <Link href="/account">Account page</Link>.
      </p>

      <h2>Ending use</h2>
      <p>
        You can stop using TrackIt and delete your account at any time. We may suspend accounts that break these terms, and will tell you why unless the law
        prevents it.
      </p>

      <h2>Liability</h2>
      <p>
        We provide TrackIt with reasonable care and skill, but during the pilot it is offered as is. To the extent the law allows, we are not liable for
        indirect losses, such as lost profits or stock, arising from use of the service.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms; the date above shows the latest version. Questions: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
