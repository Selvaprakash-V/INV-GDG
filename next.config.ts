import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

// The Jotform AI agent (chatbot) is the only third-party origin the app loads.
const JOTFORM = 'https://cdn.jotfor.ms https://*.jotfor.ms https://*.jotform.com';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} ${JOTFORM}`,
  `style-src 'self' 'unsafe-inline' ${JOTFORM}`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  `connect-src 'self' ${JOTFORM} ${isDev ? 'ws:' : ''}`,
  `frame-src ${JOTFORM}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
]
  .join('; ')
  .replace(/\s+/g, ' ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
];

const nextConfig: NextConfig = {
  output: 'standalone', // small self-contained server for Docker / Cloud Run
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  transpilePackages: ['framer-motion'],
  experimental: {
    // Tree-shake icon/chart barrels so pages only ship what they use.
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'framer-motion'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
