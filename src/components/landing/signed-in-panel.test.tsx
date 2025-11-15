import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { Session } from 'next-auth';
import { SignedInPanel } from './signed-in-panel';

const signOutMock = mock(async () => {});

mock.module('next-auth/react', () => ({
    signOut: signOutMock,
}));

const session: Session = {
    expires: new Date().toISOString(),
    user: { email: 'user@example.com', name: 'Key Storm' },
};

describe('SignedInPanel', () => {
    beforeEach(() => {
        signOutMock.mockReset();
    });

    it('renders greeting and triggers onStart when start button clicked', () => {
        const onStart = mock(() => {});

        render(<SignedInPanel onStart={onStart} session={session} />);

        expect(screen.getAllByText(/welcome back, key storm/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/you are signed in as user@example.com/i).length).toBeGreaterThan(0);

        const startButtons = screen.getAllByRole('button', { name: /go to personalized setup/i });
        fireEvent.click(startButtons[startButtons.length - 1]);
        expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('signs out with redirect when clicking sign-out button', async () => {
        render(<SignedInPanel onStart={() => {}} session={session} />);

        const signOutButtons = screen.getAllByRole('button', { name: /sign out/i });
        await fireEvent.click(signOutButtons[signOutButtons.length - 1]);
        expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: '/landing' });
    });
});

