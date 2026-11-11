import Link from 'next/link';

const LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

/** Shared footer for public pages (was copy-pasted into five pages with two different brand names). */
export default function SiteFooter() {
  return (
    <footer className="bg-white py-6 border-t border-gray-200">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
        <p className="font-medium">© {new Date().getFullYear()} TrackIt. All rights reserved.</p>
        <nav aria-label="Legal">
          <ul className="flex gap-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-purple-700 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
