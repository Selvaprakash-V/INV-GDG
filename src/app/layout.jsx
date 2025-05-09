import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'TrackIt - Supermarket Management System',
  description: 'A comprehensive system for supermarkets and customers to track products, expiry dates, and sales.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
