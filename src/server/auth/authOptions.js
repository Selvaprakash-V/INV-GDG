import CredentialsProvider from 'next-auth/providers/credentials';
import { AUTH, RATE_LIMITS } from '../config/constants';
import { connectDb } from '../db/connection';
import { getContainer } from '../container';
import { loginSchema } from '../validation/schemas';
import { clientIp } from '../core/http';

export const AUTH_ERRORS = Object.freeze({
  INVALID: 'INVALID_CREDENTIALS',
  RATE_LIMITED: 'RATE_LIMITED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
});

/**
 * Lives outside the route file (Next.js route modules may only export handlers —
 * exporting this from route.js is what broke `next build`).
 */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse({ email: credentials?.email, password: credentials?.password });
        if (!parsed.success) throw new Error(AUTH_ERRORS.INVALID);
        const { email, password } = parsed.data;

        const c = await getContainer();
        const ip = clientIp(req?.headers);
        const [perAccount, perIp] = await Promise.all([
          c.rateLimiter.consume('login', email, RATE_LIMITS.LOGIN),
          c.rateLimiter.consume('login-ip', ip, RATE_LIMITS.LOGIN_IP),
        ]);
        if (!perAccount.allowed || !perIp.allowed) {
          c.logger.warn('login rate limited', { email, ip });
          throw new Error(AUTH_ERRORS.RATE_LIMITED);
        }

        await connectDb();
        const user = await c.userService.authenticate(email, password);
        if (!user) {
          c.logger.info('login failed', { email, ip });
          throw new Error(AUTH_ERRORS.INVALID); // same message whether the email exists or not
        }
        // Only revealed after a correct password, so it cannot be used to probe for accounts.
        if (c.env.REQUIRE_EMAIL_VERIFICATION && !user.emailVerified) {
          throw new Error(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
        }
        await c.rateLimiter.reset('login', email, RATE_LIMITS.LOGIN);
        c.logger.info('login succeeded', { userId: user.id, role: user.role });
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.shopName = user.shopName;
        // Sign-in time. Survives token refreshes (unlike iat), so sessions older than
        // the last password change can be rejected (AccountService.assertSessionActive).
        token.authAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.shopName = token.shopName;
      }
      return session;
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: AUTH.SESSION_MAX_AGE_SECONDS },
  // No fallback: next-auth refuses to run in production without a secret.
  secret: process.env.NEXTAUTH_SECRET,
};
