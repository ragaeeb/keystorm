import { createHash, timingSafeEqual } from 'node:crypto';
import { Redis } from '@upstash/redis';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { deleteLoginCode, getLoginCode } from '@/lib/redis';

const credentialsSchema = z.object({ code: z.string().regex(/^\d{6}$/), email: z.string().email() });

const hashCode = (code: string) => createHash('sha256').update(code).digest('hex');

// Initialize Redis client for rate limiting
const redis = Redis.fromEnv();

// Rate limiting constants
const RATE_LIMIT_WINDOW = 5 * 60; // 5 minutes in seconds
const MAX_ATTEMPTS = 5;

export const authOptions: NextAuthOptions = {
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
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

                // Rate limiting check
                const rlKey = `auth:otp:attempts:${email}`;
                try {
                    const attempts = await redis.incr(rlKey);
                    if (attempts === 1) {
                        await redis.expire(rlKey, RATE_LIMIT_WINDOW);
                    }
                    if (attempts > MAX_ATTEMPTS) {
                        console.warn(`Rate limit exceeded for email: ${email}`);
                        return null;
                    }
                } catch (error) {
                    console.error('Rate limiting error:', error);
                    // Continue without rate limiting on Redis errors
                }

                const codeHash = hashCode(parsed.data.code);
                const storedCode = await getLoginCode(email);

                if (!storedCode) {
                    return null;
                }

                if (Date.now() > storedCode.expiresAt) {
                    await deleteLoginCode(email);
                    return null;
                }

                // Timing-safe hash comparison
                try {
                    const storedBuffer = Buffer.from(storedCode.codeHash, 'hex');
                    const providedBuffer = Buffer.from(codeHash, 'hex');

                    if (
                        storedBuffer.length !== providedBuffer.length ||
                        !timingSafeEqual(storedBuffer, providedBuffer)
                    ) {
                        return null;
                    }
                } catch (error) {
                    console.error('Hash comparison error:', error);
                    return null;
                }

                // Success - clean up stored code and reset rate limit
                await deleteLoginCode(email);
                try {
                    await redis.del(rlKey);
                } catch (error) {
                    console.error('Failed to clear rate limit:', error);
                }

                return { email, id: email };
            },
            credentials: { code: { label: 'Code', type: 'text' }, email: { label: 'Email', type: 'email' } },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt' },
};

export const auth = () => getServerSession(authOptions);

export { signIn, signOut } from 'next-auth/react';
