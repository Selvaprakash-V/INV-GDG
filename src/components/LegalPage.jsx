import Link from 'next/link';
import SiteFooter from './SiteFooter';

/** Operator details come from env so the pages never ship with someone else's name. */
export function legalDetails() {
  return {
    operator: process.env.LEGAL_ENTITY_NAME || 'the TrackIt team',
    contactEmail: process.env.SUPPORT_EMAIL || 'support@trackit.local',
    lastUpdated: process.env.LEGAL_LAST_UPDATED || '11 November 2026',
  };
}

/** Readable long-form layout shared by the privacy policy and terms. */
export default function LegalPage({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/home" aria-label="TrackIt home" className="text-2xl font-extrabold tracking-wide">
            <span className="text-purple-700">TRAC</span>
            <span className="text-pink-700">KIT</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-10">
        <article className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6 sm:p-10 text-gray-800 leading-relaxed space-y-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-purple-700 [&_a]:underline">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">Last updated: {lastUpdated}</p>
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
