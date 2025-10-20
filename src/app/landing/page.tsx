'use client';

import { Keyboard, LogIn, LogOut, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 'email' | 'code';

type AuthPanelProps = { onStart: () => void };

type SignedInPanelProps = { onStart: () => void; session: Session };

type EmailCodeFormProps = { onStart: () => void; status: 'authenticated' | 'unauthenticated' | 'loading' };

const SignedInPanel = ({ onStart, session }: SignedInPanelProps) => {
    const handleSignOut = useCallback(async () => {
        await signOut({ callbackUrl: '/landing' });
    }, []);

    return (
        <div className="flex h-full flex-col justify-between gap-6">
            <div>
                <h2 className="font-semibold text-2xl">
                    Welcome back{session.user?.name ? `, ${session.user.name}` : ''}!
                </h2>
                <p className="mt-2 text-gray-600">
                    You are signed in as {session.user?.email}. You can head straight to personalized lessons or explore
                    practice activities.
                </p>
            </div>
            <div className="mt-auto space-y-3">
                <Button className="w-full" size="lg" onClick={onStart}>
                    <LogIn className="mr-2 h-4 w-4" /> Go to personalized setup
                </Button>
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                </Button>
            </div>
        </div>
    );
};

const EmailCodeForm = ({ onStart, status }: EmailCodeFormProps) => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<Step>('email');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const isLoadingSession = status === 'loading';
    const isEmailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);

    const resetForGuest = useCallback(() => {
        sessionStorage.removeItem('lessons');
        sessionStorage.removeItem('lettersCompleted');
    }, []);

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
                <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                        resetForGuest();
                        router.push('/start');
                    }}
                >
                    Continue as guest
                </Button>
            </div>
        </div>
    );
};

const AuthPanel = ({ onStart }: AuthPanelProps) => {
    const { data: session, status } = useSession();

    if (session) {
        return <SignedInPanel onStart={onStart} session={session} />;
    }

    return <EmailCodeForm onStart={onStart} status={status} />;
};

export default function LandingPage() {
    const router = useRouter();

    const handleExploreLessons = useCallback(() => {
        router.push('/start');
    }, [router]);

    const handleGuestStart = useCallback(() => {
        sessionStorage.removeItem('lessons');
        sessionStorage.removeItem('lettersCompleted');
        router.push('/start');
    }, [router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto w-full max-w-5xl"
            >
                <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mb-6 text-center"
                        >
                            <Keyboard className="mx-auto h-20 w-20 text-indigo-600" />
                            <h1 className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-bold text-5xl text-transparent">
                                KeyStorm
                            </h1>
                            <p className="mt-3 text-gray-600 text-lg">
                                Master touch typing with personalized, themed lessons
                            </p>
                        </motion.div>

                        <div className="mb-10 grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardContent className="pt-6">
                                    <Target className="mx-auto mb-3 h-10 w-10 text-indigo-600" />
                                    <h3 className="mb-2 font-semibold">Progressive Learning</h3>
                                    <p className="text-gray-600 text-sm">
                                        From letters to paragraphs, at your own pace
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <Zap className="mx-auto mb-3 h-10 w-10 text-purple-600" />
                                    <h3 className="mb-2 font-semibold">Real-time Feedback</h3>
                                    <p className="text-gray-600 text-sm">Visual cues and stats to track progress</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <Keyboard className="mx-auto mb-3 h-10 w-10 text-pink-600" />
                                    <h3 className="mb-2 font-semibold">Custom Themes</h3>
                                    <p className="text-gray-600 text-sm">Learn with content that interests you</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex flex-col gap-3 text-center">
                            <Button
                                size="lg"
                                onClick={handleExploreLessons}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-lg"
                            >
                                Explore Lessons
                            </Button>
                            <Button variant="outline" size="lg" onClick={handleGuestStart}>
                                Continue with default practice
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
                        <AuthPanel onStart={handleExploreLessons} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
