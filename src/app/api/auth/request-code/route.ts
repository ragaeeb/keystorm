import { createHash } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { deleteLoginCode, saveLoginCode } from '@/lib/redis';

const requestSchema = z.object({ email: z.string().email() });

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const hashCode = (code: string) => createHash('sha256').update(code).digest('hex');

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async (email: string, code: string) => {
    const from = process.env.EMAIL_FROM ?? 'KeyStorm <login@mail.synonymous2.com>';

    if (!resendClient) {
        console.info(`Login code for ${email}: ${code}`);
        return;
    }

    const { error } = await resendClient.emails.send({
        from,
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
