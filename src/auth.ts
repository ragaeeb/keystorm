import { createHash } from 'node:crypto';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db, ensureDatabase } from '@/lib/db';
import { loginCodes, users } from '@/lib/schema';

type AdapterUser = { email: string; emailVerified: Date | null; id: string; image: string | null; name: string | null };

const credentialsSchema = z.object({ code: z.string().regex(/^\d{6}$/), email: z.string().email() });

const hashCode = (code: string) => createHash('sha256').update(code).digest('hex');

const rawAdapter = DrizzleAdapter(db);

const adapter = new Proxy(rawAdapter, {
    get(target, property, receiver) {
        const value = Reflect.get(target, property, receiver);
        if (typeof value !== 'function') {
            return value;
        }
        return async (...args: unknown[]) => {
            await ensureDatabase();
            return value.apply(target, args as never);
        };
    },
});

export const authOptions: NextAuthOptions = {
    adapter: adapter as any,
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

                await ensureDatabase();
                const [storedCode] = await db.select().from(loginCodes).where(eq(loginCodes.email, email)).limit(1);

                if (!storedCode) {
                    return null;
                }

                if (storedCode.expiresAt <= Date.now()) {
                    await db.delete(loginCodes).where(eq(loginCodes.email, email));
                    return null;
                }

                if (storedCode.codeHash !== codeHash) {
                    return null;
                }

                await db.delete(loginCodes).where(eq(loginCodes.email, email));

                const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

                if (existingUser) {
                    return existingUser as AdapterUser;
                }

                const [createdUser] = await db
                    .insert(users)
                    .values({ email, emailVerified: new Date(), name: email.split('@')[0] ?? null })
                    .returning();

                return createdUser as AdapterUser;
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

export { auth } from 'next-auth';
export { signIn, signOut } from 'next-auth/react';
