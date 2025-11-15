import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import type React from 'react';
import type { SignInResponse } from 'next-auth/react';
import { EmailCodeForm } from './email-code-form';

mock.module('next/link', () => ({
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

const signInMock = mock(async (): Promise<SignInResponse | undefined> => ({ error: undefined, ok: true, status: 200, url: null }));

mock.module('next-auth/react', () => ({
    signIn: signInMock,
}));

describe('EmailCodeForm', () => {
    const originalFetch = globalThis.fetch;
    const storage: Record<string, string> = {};
    const sessionStorageMock: Storage = {
        clear: () => {
            for (const key of Object.keys(storage)) {
                delete storage[key];
            }
        },
        getItem: (key) => storage[key] ?? null,
        key: (index) => Object.keys(storage)[index] ?? null,
        length: 0,
        removeItem: (key) => {
            delete storage[key];
        },
        setItem: (key, value) => {
            storage[key] = value;
        },
    };

    const fetchMock = mock(async () => ({ ok: true, status: 200, statusText: 'OK', json: async () => ({}) } as Response));

    beforeEach(() => {
        Object.defineProperty(globalThis, 'sessionStorage', {
            configurable: true,
            value: sessionStorageMock,
        });
        globalThis.fetch = fetchMock as unknown as typeof fetch;
        fetchMock.mockReset().mockResolvedValue({
            json: async () => ({}),
            ok: true,
            status: 200,
            statusText: 'OK',
        } as Response);
        signInMock.mockReset().mockImplementation(async () => ({ error: null, ok: true, status: 200, url: null }));
    });

    afterEach(() => {
        sessionStorageMock.clear();
        if (originalFetch) {
            globalThis.fetch = originalFetch;
        } else {
            delete (globalThis as any).fetch;
        }
    });

    it('validates email before enabling send button', () => {
        render(<EmailCodeForm onStart={() => {}} status="unauthenticated" />);

        const emailInput = screen.getAllByLabelText(/email address/i)[0];
        const sendButton = screen.getAllByRole('button', { name: /send sign-in code/i })[0] as HTMLButtonElement;

        expect(sendButton.disabled).toBe(true);
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        expect(sendButton.disabled).toBe(false);
    });

    it('advances to code step after requesting code', async () => {
        render(<EmailCodeForm onStart={() => {}} status="unauthenticated" />);

        fireEvent.change(screen.getAllByLabelText(/email address/i)[0], { target: { value: 'user@example.com' } });
        fireEvent.click(screen.getAllByRole('button', { name: /send sign-in code/i })[0]);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/enter your 6-digit code/i).length).toBeGreaterThan(0);
        });

        expect(fetchMock).toHaveBeenCalledWith('/api/auth/request-code', expect.anything());
        expect(screen.getByText(/we sent a 6-digit code/i)).toBeDefined();
    });

    it('verifies code and clears session storage on success', async () => {
        const onStartMock = mock(() => {});
        sessionStorage.setItem('lettersCompleted', 'true');

        render(<EmailCodeForm onStart={onStartMock} status="unauthenticated" />);

        fireEvent.change(screen.getAllByLabelText(/email address/i)[0], { target: { value: 'user@example.com' } });
        fireEvent.click(screen.getAllByRole('button', { name: /send sign-in code/i })[0]);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/enter your 6-digit code/i).length).toBeGreaterThan(0);
        });

        fireEvent.change(screen.getAllByLabelText(/enter your 6-digit code/i)[0], { target: { value: '123456' } });
        const verifyButtons = screen.getAllByRole('button', { name: /verify code/i });
        const verifyButton = verifyButtons[verifyButtons.length - 1] as HTMLButtonElement;
        expect(verifyButton.disabled).toBe(false);
        await act(async () => {
            fireEvent.click(verifyButton);
        });

        await waitFor(() => {
            expect(signInMock).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(sessionStorage.getItem('lettersCompleted')).toBeNull();
        });

        expect(signInMock).toHaveBeenCalledWith('credentials', {
            code: '123456',
            email: 'user@example.com',
            redirect: false,
        });
        expect(sessionStorage.getItem('lettersCompleted')).toBeNull();
    });
});

