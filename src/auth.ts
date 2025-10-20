import { createHash } from 'node:crypto';
import type { NextAuthOptions } from 'next-auth';
import NextAuth, { getServerSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { deleteLoginCode, getLoginCode } from '@/lib/redis';

const credentialsSchema = z.object({ code: z.string().regex(/^\d{6}$/), email: z.string().email() });

const hashCode = (code: string) => createHash('sha256').update(code).digest('hex');

export const authOptions: NextAuthOptions = {
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.email = user.email;
                token.name = user.name ?? null;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                session.user.email = token.email ?? session.user.email;
                session.user.name = token.name ?? session.user.name;
            }
            return session;
        },
    },
    pages: { signIn: '/landing' },
    providers: [
        Credentials({
            authorize: async (credentials) => {
                const parsed = credentialsSchema.safeParse(credentials);
                if (!parsed.success) {
                    return null;
                }

                const email = parsed.data.email.toLowerCase();
                const codeHash = hashCode(parsed.data.code);

                const storedCode = await getLoginCode(email);

                if (!storedCode) {
                    return null;
                }

                if (storedCode.expiresAt <= Date.now()) {
                    await deleteLoginCode(email);
                    return null;
                }

                if (storedCode.codeHash !== codeHash) {
                    return null;
                }

                await deleteLoginCode(email);

                const name = email.split('@')[0] ?? email;

                return { email, id: email, name };
            },
            credentials: { code: { label: 'One-time code', type: 'text' }, email: { label: 'Email', type: 'email' } },
            name: 'Email Login',
        }),
    ],
    secret: process.env.AUTH_SECRET,
    session: { strategy: 'jwt' },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export const auth = () => getServerSession(authOptions);

export { signIn, signOut } from 'next-auth/react';
