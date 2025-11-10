import { LogIn, LogOut } from 'lucide-react';
import type { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Props for signed-in user panel
 */
type SignedInPanelProps = {
    /** Callback when user proceeds to start page */
    onStart: () => void;
    /** Active NextAuth session */
    session: Session;
};

/**
 * SignedInPanel - Displays welcome message and navigation for authenticated users
 *
 * Shows user's email and name (if available), with options to proceed to
 * personalized lessons or sign out.
 *
 * @param props - Component props
 * @returns Rendered signed-in panel
 */
export const SignedInPanel = ({ onStart, session }: SignedInPanelProps) => {
    /**
     * Handles sign out action and redirects to landing page
     */
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
