import './globals.css';
import { Providers } from './providers';
import NavigationLoader from '@/components/NavigationLoader';

export const metadata = {
  title: 'TrackIt - Supermarket Management System',
  description: 'A comprehensive system for supermarkets and customers to track products, expiry dates, and sales.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-purple-100 selection:text-purple-900">
        <NavigationLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
