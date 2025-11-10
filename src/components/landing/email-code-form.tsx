import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Props for email/code authentication form
 */
type EmailCodeFormProps = {
    /** Callback when user proceeds to start page */
    onStart: () => void;

    /** Current authentication status from NextAuth */
    status: 'authenticated' | 'unauthenticated' | 'loading';
};

/**
 * Current step in the email-based authentication flow
 */
type Step = 'email' | 'code';

/**
 * EmailCodeForm - Passwordless authentication form using email OTP
 *
 * Implements a two-step flow:
 * 1. User enters email, system sends 6-digit code
 * 2. User enters code to verify and authenticate
 *
 * @param props - Component props
 * @returns Rendered authentication form
 */
export const EmailCodeForm = ({ onStart, status }: EmailCodeFormProps) => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<Step>('email');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const isLoadingSession = status === 'loading';

    /**
     * Validates email format using regex
     */
    const isEmailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);

    /**
     * Clears session storage for guest mode
     */
    const resetForGuest = useCallback(() => {
        sessionStorage.removeItem('lessons');
        sessionStorage.removeItem('lettersCompleted');
    }, []);

    /**
     * Sends authentication code to user's email
     * Calls /api/auth/request-code endpoint
     */
    const handleSendCode = useCallback(async () => {
        if (!isEmailValid) {
            setError('Please enter a valid email address.');
            return;
        }
        setSending(true);
        setError(null);
        setInfo(null);
        try {
            const response = await fetch('/api/auth/request-code', {
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            });
            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error ?? 'Unable to send code');
            }
            setStep('code');
            setInfo('We sent a 6-digit code to your email. Enter it below to continue.');
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Unable to send code.');
        } finally {
            setSending(false);
        }
    }, [email, isEmailValid]);

    /**
     * Verifies the OTP code and authenticates user
     * Uses NextAuth signIn with credentials provider
     */
    const handleVerify = useCallback(async () => {
        if (code.trim().length !== 6) {
            setError('Enter the 6-digit code from your email.');
            return;
        }
        setVerifying(true);
        setError(null);
        setInfo(null);
        const result = await signIn('credentials', { code: code.trim(), email: email.trim(), redirect: false });
        setVerifying(false);

        if (result?.error) {
            setError('The code was not valid or has expired. Please try again.');
            return;
        }

        sessionStorage.removeItem('lettersCompleted');
        onStart();
    }, [code, email, onStart]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-semibold text-2xl">Sign in or create an account</h2>
                <p className="mt-2 text-gray-600">We'll email you a one-time code—no password required.</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={sending || verifying || isLoadingSession || step === 'code'}
                    />
                </div>

                {step === 'code' && (
                    <div className="space-y-2">
                        <Label htmlFor="code">Enter your 6-digit code</Label>
                        <Input
                            id="code"
                            value={code}
                            onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="123456"
                            inputMode="numeric"
                            maxLength={6}
                            disabled={verifying || isLoadingSession}
                        />
                    </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {info && <p className="text-indigo-600 text-sm">{info}</p>}
            </div>

            <div className="space-y-3">
                <Button
                    className="w-full"
                    size="lg"
                    onClick={step === 'email' ? handleSendCode : handleVerify}
                    disabled={
                        sending ||
                        verifying ||
                        isLoadingSession ||
                        (step === 'email' ? !isEmailValid : code.length !== 6)
                    }
                >
                    {step === 'email'
                        ? sending
                            ? 'Sending code…'
                            : 'Send sign-in code'
                        : verifying
                          ? 'Verifying…'
                          : 'Verify code'}
                </Button>
                {step === 'code' && (
                    <Button variant="ghost" className="w-full" onClick={handleSendCode} disabled={sending}>
                        Resend code
                    </Button>
                )}
                <Button variant="secondary" className="w-full" asChild onClick={resetForGuest}>
                    <Link href="/start">Continue as guest</Link>
                </Button>
            </div>
        </div>
    );
};
