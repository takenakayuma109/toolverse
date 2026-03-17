import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Apple from 'next-auth/providers/apple';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

const hasDB = !!process.env.DATABASE_URL;

// Only include OAuth providers when credentials are configured
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  );
}

// Only include credentials provider when DB is available
if (hasDB) {
  providers.push(
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
        };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: hasDB ? PrismaAdapter(prisma) : undefined,
  session: { strategy: 'jwt' },

  providers,

  callbacks: {
    async signIn({ user, account, profile }) {
      // Log OAuth sign-in attempts for debugging
      if (account?.provider) {
        console.log(`[auth] OAuth signIn attempt: provider=${account.provider}, email=${user?.email ?? profile?.email ?? 'unknown'}`);
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'USER';
      }
      // On initial OAuth sign-in, persist the provider
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, account }) {
      console.log(`[auth] signIn event: user=${user?.id}, provider=${account?.provider}`);
    },
    async createUser({ user }) {
      console.log(`[auth] createUser event: id=${user?.id}, email=${user?.email}`);
    },
  },

  pages: {
    signIn: '/auth',
    error: '/auth',  // Redirect auth errors to our custom page instead of NextAuth default
  },

  // Enable debug logging in non-production to surface OAuth issues
  debug: process.env.NODE_ENV !== 'production',

  logger: {
    error(code, ...message) {
      console.error(`[auth][error] ${code}`, ...message);
    },
    warn(code, ...message) {
      console.warn(`[auth][warn] ${code}`, ...message);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[auth][debug] ${code}`, ...message);
      }
    },
  },

  secret: process.env.AUTH_SECRET || 'dev-secret-change-in-production',

  trustHost: true,
});
