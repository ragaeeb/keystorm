import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { db } from '@/lib/db';
import { loginCodes } from '@/lib/schema';

const requestSchema = z.object({ email: z.string().email() });

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const hashCode = (code: string) => createHash('sha256').update(code).digest('hex');

const sendEmail = async (email: string, code: string) => {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.EMAIL_FROM ?? 'no-reply@keystorm.app';
    const port = Number.parseInt(process.env.SMTP_PORT ?? '587', 10);

    if (!host || !user || !password) {
        console.info(`Login code for ${email}: ${code}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        auth: { pass: password, user },
        host,
        port,
        secure: port === 465,
    });

    await transporter.sendMail({
        from,
        subject: 'Your KeyStorm sign-in code',
        text: `Your one-time code is ${code}. It expires in 10 minutes.`,
        to: email,
    });
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
        const expiresAt = Date.now() + 10 * 60 * 1000;

        await db.delete(loginCodes).where(eq(loginCodes.email, email));
        await db.insert(loginCodes).values({ codeHash, email, expiresAt });

        await sendEmail(email, code);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Failed to create login code', error);
        return NextResponse.json({ error: 'Unable to send code' }, { status: 500 });
    }
};
