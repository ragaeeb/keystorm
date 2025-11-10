import { createHash, randomInt } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { deleteLoginCode, saveLoginCode } from '@/lib/redis';

const redis = Redis.fromEnv();

/** 10 minute rate limit window expressed in seconds. */
const REQUEST_WINDOW = 10 * 60;

/** Maximum number of allowed requests per window for a single email. */
const MAX_REQUESTS = 3;

const requestSchema = z.object({ email: z.email() });

/**
 * Generates a random 6-digit one-time code.
 *
 * @returns String representation of a random number between 100000-999999
 */
const generateCode = (): string => randomInt(100000, 1000000).toString();

/**
 * Creates SHA-256 hash of a login code for secure storage.
 *
 * @param code - Plain text 6-digit code
 * @returns Hex-encoded hash string
 */
const hashCode = (code: string): string => createHash('sha256').update(code).digest('hex');

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Sends the login code via email or logs it when Resend is not configured.
 *
 * @param email - Recipient email address
 * @param code - Generated one-time code
 */
const sendEmail = async (email: string, code: string): Promise<void> => {
    if (!resendClient) {
        console.info(`Login code for ${email}: ${code}`);
        return;
    }

    const { error } = await resendClient.emails.send({
        from: process.env.EMAIL_FROM!,
        subject: 'Your KeyStorm sign-in code',
        text: `Your one-time code is ${code}. It expires in 10 minutes.`,
        to: email,
    });

    if (error) {
        throw error;
    }
};

/**
 * Handles POST requests for generating and sending login codes.
 *
 * @param request - Incoming Next.js request containing the user email
 * @returns JSON response indicating success or failure status
 */
export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        const email = parsed.data.email.trim().toLowerCase();
        const rlKey = `auth:otp:requests:${email}`;
        try {
            const n = await redis.incr(rlKey);
            if (n === 1) {
                await redis.expire(rlKey, REQUEST_WINDOW);
            }
            if (n > MAX_REQUESTS) {
                return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
            }
        } catch (e) {
            console.warn('OTP request rate-limit error', e);
        }

        const code = generateCode();
        const codeHash = hashCode(code);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const ttlSeconds = Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
        await deleteLoginCode(email);
        await saveLoginCode(email, codeHash, expiresAt.getTime(), ttlSeconds);

        await sendEmail(email, code);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Failed to create login code', error);
        return NextResponse.json({ error: 'Unable to send code' }, { status: 500 });
    }
};
