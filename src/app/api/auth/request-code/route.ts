import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { deleteLoginCode, saveLoginCode } from '@/lib/redis';

const redis = Redis.fromEnv();
const REQUEST_WINDOW = 10 * 60; // 10 minutes
const MAX_REQUESTS = 3;

const requestSchema = z.object({ email: z.email() });

import { randomInt } from 'node:crypto';

const generateCode = () => randomInt(100000, 1000000).toString();

const hashCode = (code: string) => createHash('sha256').update(code).digest('hex');

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async (email: string, code: string) => {
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

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        const email = parsed.data.email.trim().toLowerCase();
        // Basic per-email limit: 3 requests / 10 minutes
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
