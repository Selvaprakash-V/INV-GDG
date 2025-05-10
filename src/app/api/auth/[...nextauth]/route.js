import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { compare } from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log('Authorizing with credentials:', credentials);
          await dbConnect();
          console.log('Database connected');

          // Find user by email
          const user = await User.findOne({ email: credentials.email });
          console.log('User found:', user ? 'Yes' : 'No');

          // Check if user exists
          if (!user) {
            console.log('No user found with this email');
            throw new Error('No user found with this email');
          }

          // Check if the role matches
          if (credentials.role && user.role !== credentials.role) {
            console.log('Role mismatch. User role:', user.role, 'Requested role:', credentials.role);
            throw new Error('Invalid role for this user');
          }

          // Compare passwords using the method we added to the User model
          const isPasswordMatch = await user.comparePassword(credentials.password);
          console.log('Password match:', isPasswordMatch ? 'Yes' : 'No');

          if (!isPasswordMatch) {
            console.log('Password does not match');
            throw new Error('Password does not match');
          }

          console.log('Authentication successful');
          return {
            id: user._id.toString(),
            name: user.fullName,
            email: user.email,
            role: user.role,
            shopName: user.shopName || null,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.shopName = user.shopName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.shopName = token.shopName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-for-development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
