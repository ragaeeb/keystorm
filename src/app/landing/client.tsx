'use client';

import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';
import { memo, useCallback } from 'react';
import { EmailCodeForm } from '@/components/landing/email-code-form';
import { SignedInPanel } from '@/components/landing/signed-in-panel';
import { Button } from '@/components/ui/button';

/**
 * AuthPanel - Conditional authentication panel
 *
 * Shows either SignedInPanel (for authenticated users) or
 * EmailCodeForm (for unauthenticated users).
 *
 * @param props - Component props
 * @returns Rendered authentication panel
 */
export const AuthPanel = memo(() => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const onStart = useCallback(() => {
        router.push('/start');
    }, [router]);

    if (session) {
        return <SignedInPanel onStart={onStart} session={session} />;
    }

    return <EmailCodeForm onStart={onStart} status={status} />;
});

export function DefaultPracticeButton() {
    const router = useRouter();

    const handleGuestStart = useCallback(() => {
        sessionStorage.removeItem('lessons');
        sessionStorage.removeItem('lettersCompleted');
        router.push('/start');
    }, [router]);

    return (
        <Button variant="outline" size="lg" onClick={handleGuestStart}>
            Continue with default practice
        </Button>
    );
}
